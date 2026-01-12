import { Body, Controller, Headers, HttpCode, Post, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentsService } from './payments.service';
import Stripe from 'stripe';
import { Request } from 'express';

@Controller({ path: 'v1/payments' })
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService, private readonly config: ConfigService) {}

  @Post('intent')
  async createIntent(@Body('bookingId') bookingId: string, @Body('method') method: 'card' | 'upi' | 'cod' = 'card') {
    if (!bookingId) {
      throw new Error('bookingId is required');
    }
    return this.paymentsService.createPaymentIntent(bookingId, method);
  }

  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(@Req() req: Request, @Headers('stripe-signature') signature: string) {
    const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    let event: Stripe.Event;

    if (webhookSecret) {
      const stripe = new Stripe(this.config.get<string>('STRIPE_SECRET_KEY', ''), { apiVersion: '2024-06-20' });
      const rawBody = (req as any).rawBody || req.body;
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } else {
      event = req.body as Stripe.Event;
    }

    return this.paymentsService.handleStripeEvent(event);
  }
}
