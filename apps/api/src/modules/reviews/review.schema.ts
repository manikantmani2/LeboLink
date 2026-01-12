import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {
  @Prop({ required: true })
  bookingId!: string;

  @Prop({ required: true })
  customerId!: string;

  @Prop({ required: true })
  workerId!: string;

  @Prop({ required: true, min: 1, max: 5 })
  rating!: number;

  @Prop()
  comment?: string;

  @Prop({ default: Date.now })
  createdAt!: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
