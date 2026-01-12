import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentStatus =
  | 'requires_payment'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'cod_pending'
  | 'cod_collected';

export type PaymentMethod = 'card' | 'upi' | 'cod';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: Types.ObjectId, required: true, ref: 'Booking' })
  bookingId!: Types.ObjectId;

  @Prop({ required: true })
  amount!: number; // in major currency units (e.g. INR)

  @Prop({ required: true, default: 'INR' })
  currency!: string;

  @Prop({ required: true, enum: ['card', 'upi', 'cod'], default: 'card' })
  method!: PaymentMethod;

  @Prop({ required: true, enum: ['requires_payment', 'processing', 'succeeded', 'failed', 'cod_pending', 'cod_collected'], default: 'requires_payment' })
  status!: PaymentStatus;

  @Prop()
  providerPaymentIntentId?: string;

  @Prop()
  receiptUrl?: string;

  @Prop()
  errorCode?: string;

  @Prop()
  errorMessage?: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
// Indexes for payment lookups and analytics
PaymentSchema.index({ bookingId: 1 });
PaymentSchema.index({ status: 1, createdAt: -1 });
