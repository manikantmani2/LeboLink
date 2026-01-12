import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BookingStatus = 'requested' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
export type BookingDocument = Booking & Document & { createdAt: Date; updatedAt: Date };

@Schema({ timestamps: true })
export class Booking {
  @Prop({ required: true })
  customerId!: string;

  @Prop({ required: true })
  workerId!: string;

  @Prop()
  jobId?: string;

  @Prop()
  serviceName?: string;

  @Prop()
  customerName?: string;

  @Prop()
  customerPhone?: string;

  @Prop({ type: Number, default: 499 })
  amount?: number;

  @Prop({ default: 'INR' })
  currency?: string;

  @Prop({ enum: ['card', 'upi', 'cod'], required: false })
  paymentMethod?: 'card' | 'upi' | 'cod';

  @Prop({ enum: ['pending', 'processing', 'paid', 'cod_pending', 'failed'], default: 'pending' })
  paymentStatus?: 'pending' | 'processing' | 'paid' | 'cod_pending' | 'failed';

  @Prop()
  paymentId?: string;

  @Prop({ type: Object })
  location?: {
    type: 'home' | 'office' | 'friend' | 'other';
    address: string;
    coordinates?: [number, number];
  };

  @Prop({ type: Object })
  receiver?: {
    name: string;
    phone: string;
    relation?: string;
  };

  @Prop({
    enum: ['requested', 'accepted', 'in-progress', 'completed', 'cancelled'],
    default: 'requested',
  })
  status!: BookingStatus;

  @Prop({ type: Number })
  etaMinutes?: number;

  @Prop()
  trackingNote?: string;

  @Prop({
    type: [
      {
        status: String,
        at: Date,
        note: String,
        etaMinutes: Number,
      },
    ],
    default: [],
  })
  statusHistory!: { status: BookingStatus; at: Date; note?: string; etaMinutes?: number }[];
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
// Indexes to optimize common queries
BookingSchema.index({ customerId: 1, createdAt: -1 });
BookingSchema.index({ workerId: 1, createdAt: -1 });
BookingSchema.index({ status: 1, createdAt: -1 });
BookingSchema.index({ workerId: 1, status: 1 });
