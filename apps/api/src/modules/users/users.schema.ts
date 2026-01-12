import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  phone!: string;

  @Prop({ enum: ['worker', 'customer', 'admin'], required: true })
  role!: 'worker' | 'customer' | 'admin';

  @Prop()
  name?: string;

  @Prop()
  email?: string;

  @Prop()
  password?: string;

  @Prop()
  passwordHash?: string;

  @Prop({ type: [String], default: [] })
  skills?: string[];

  @Prop()
  jobCategory?: string;

  @Prop()
  paymentPerHour?: number;

  @Prop()
  preferredLocation?: string;

  @Prop()
  nextAvailableDate?: string;

  @Prop({
    type: {
      idType: String,
      idNumber: String,
      documentUrl: String,
      status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    },
  })
  kyc?: {
    idType?: string;
    idNumber?: string;
    documentUrl?: string;
    status?: 'pending' | 'verified' | 'rejected';
  };

  // GeoJSON location (optional). No defaults to avoid invalid geo docs.
  @Prop({
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
    },
  })
  location?: { type: 'Point'; coordinates: [number, number] };

  @Prop()
  profileImage?: string;

  @Prop({
    type: {
      availability: { type: Boolean, default: true },
      autoAcceptJobs: { type: Boolean, default: false },
      maxJobsPerDay: { type: Number, default: 5 },
      workRadius: { type: Number, default: 10 },
      pushNotifications: { type: Boolean, default: true },
      emailNotifications: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: false },
      bookingAlerts: { type: Boolean, default: true },
      paymentAlerts: { type: Boolean, default: true },
      promotionAlerts: { type: Boolean, default: false },
      soundEnabled: { type: Boolean, default: true },
      vibrationEnabled: { type: Boolean, default: true },
      showPhoneNumber: { type: Boolean, default: false },
      showLastSeen: { type: Boolean, default: true },
      allowReviews: { type: Boolean, default: true },
      language: { type: String, default: 'English' },
      currency: { type: String, default: 'INR' },
    },
  })
  settings?: {
    availability?: boolean;
    autoAcceptJobs?: boolean;
    maxJobsPerDay?: number;
    workRadius?: number;
    pushNotifications?: boolean;
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    bookingAlerts?: boolean;
    paymentAlerts?: boolean;
    promotionAlerts?: boolean;
    soundEnabled?: boolean;
    vibrationEnabled?: boolean;
    showPhoneNumber?: boolean;
    showLastSeen?: boolean;
    allowReviews?: boolean;
    language?: string;
    currency?: string;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);
// Indexes for efficient queries
UserSchema.index({ role: 1 });
UserSchema.index({ name: 1 });
UserSchema.index({ skills: 1 });
UserSchema.index({ location: '2dsphere' });
