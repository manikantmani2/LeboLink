import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import Stripe from 'stripe';
import { Payment, PaymentDocument, PaymentMethod, PaymentStatus } from './payment.schema';
import { Booking, BookingDocument } from '../bookings/booking.schema';

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(PaymentsService.name);
  private readonly flatFeeAmount: number;
  private readonly currency: string;

  constructor(
    @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(Booking.name) private readonly bookingModel: Model<BookingDocument>,
    configService: ConfigService,
  ) {
      const secretKey = configService.get<string>('STRIPE_SECRET_KEY') || 'sk_test_dummy_key_for_development';
      this.stripe = new Stripe(secretKey, { apiVersion: '2024-06-20' });
    this.flatFeeAmount = configService.get<number>('BOOKING_FLAT_FEE') ?? 499;
    this.currency = (configService.get<string>('BOOKING_CURRENCY') ?? 'INR').toUpperCase();
  }

  async createPaymentIntent(bookingId: string, method: PaymentMethod = 'card') {
    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) throw new BadRequestException('Booking not found');

    const amount = booking.amount ?? this.flatFeeAmount;
    const currency = booking.currency ?? this.currency;

    if (method === 'cod') {
      const payment = await this.paymentModel.create({
        bookingId: new Types.ObjectId(bookingId),
        amount,
        currency,
        method: 'cod',
        status: 'cod_pending',
      });
      booking.paymentStatus = 'cod_pending';
      booking.paymentMethod = 'cod';
      booking.paymentId = payment._id.toString();
      await booking.save();
      return {
        paymentId: payment._id.toString(),
        status: payment.status,
        amount,
        currency,
      };
    }

    const payment = await this.paymentModel.create({
      bookingId: new Types.ObjectId(bookingId),
      amount,
      currency,
      method,
      status: 'requires_payment',
    });

    const intent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      metadata: {
        bookingId,
        paymentId: payment._id.toString(),
      },
      automatic_payment_methods: { enabled: true },
    });

    payment.providerPaymentIntentId = intent.id;
    payment.status = 'processing';
    await payment.save();

    booking.paymentStatus = 'processing';
    booking.paymentMethod = method;
    booking.paymentId = payment._id.toString();
    await booking.save();

    return {
      paymentId: payment._id.toString(),
      clientSecret: intent.client_secret,
      amount,
      currency,
      status: payment.status,
    };
  }

  async handleStripeEvent(event: Stripe.Event) {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handleIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await this.handleIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        break;
    }
    return { received: true };
  }

  private async handleIntentSucceeded(intent: Stripe.PaymentIntent) {
    const anyIntent = intent as any;
    const payment = await this.paymentModel.findOne({ providerPaymentIntentId: intent.id });
    if (!payment) {
      this.logger.warn(`Payment not found for intent ${intent.id}`);
      return;
    }
    payment.status = 'succeeded';
    payment.receiptUrl = anyIntent?.charges?.data?.[0]?.receipt_url;
    await payment.save();

    const booking = await this.bookingModel.findById(payment.bookingId);
    if (booking) {
      booking.paymentStatus = 'paid';
      booking.status = booking.status === 'requested' ? 'accepted' : booking.status;
      await booking.save();
    }
  }

  private async handleIntentFailed(intent: Stripe.PaymentIntent) {
    const payment = await this.paymentModel.findOne({ providerPaymentIntentId: intent.id });
    if (!payment) return;
    payment.status = 'failed';
    payment.errorCode = intent.last_payment_error?.code ?? undefined;
    payment.errorMessage = intent.last_payment_error?.message ?? undefined;
    await payment.save();

    const booking = await this.bookingModel.findById(payment.bookingId);
    if (booking) {
      booking.paymentStatus = 'failed';
      await booking.save();
    }
  }
}
