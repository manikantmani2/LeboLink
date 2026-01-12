import mongoose from 'mongoose';
import { config } from 'dotenv';
import * as path from 'path';

try {
  config({ path: path.resolve(process.cwd(), '.env') });
} catch {}

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lebolink';

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('[seed] connected');

  // Define lightweight schemas for direct manipulation
  const User = mongoose.model('User', new mongoose.Schema({
    phone: { type: String, unique: true },
    role: { type: String, enum: ['worker','customer','admin'] },
    name: String,
    skills: [String],
    kyc: { idType: String, idNumber: String, documentUrl: String, status: String },
    location: { type: { type: String }, coordinates: [Number] },
  }, { timestamps: true }));

  const Booking = mongoose.model('Booking', new mongoose.Schema({
    customerId: String,
    workerId: String,
    jobId: String,
    serviceName: String,
    customerName: String,
    customerPhone: String,
    amount: Number,
    currency: String,
    paymentMethod: String,
    paymentStatus: String,
    location: Object,
    receiver: Object,
    status: String,
    etaMinutes: Number,
    trackingNote: String,
    statusHistory: [{ status: String, at: Date, note: String, etaMinutes: Number }],
  }, { timestamps: true }));

  const Review = mongoose.model('Review', new mongoose.Schema({
    bookingId: String,
    customerId: String,
    workerId: String,
    rating: Number,
    comment: String,
  }, { timestamps: true }));

  // Clear basic collections
  await Promise.all([
    mongoose.connection.collection('bookings').deleteMany({}),
    mongoose.connection.collection('users').deleteMany({}),
    mongoose.connection.collection('reviews').deleteMany({}),
  ]);

  // Seed workers
  const workers = await User.insertMany([
    { phone: '9999990001', role: 'worker', name: 'Amit Sharma', skills: ['electrician'], kyc: { status: 'verified' } },
    { phone: '9999990002', role: 'worker', name: 'Priya Verma', skills: ['cleaner'], kyc: { status: 'verified' } },
    { phone: '9999990003', role: 'worker', name: 'Rahul Singh', skills: ['plumber'], kyc: { status: 'verified' } },
  ]);

  const customers = await User.insertMany([
    { phone: '9876543210', role: 'customer', name: 'Rakesh Kumar' },
    { phone: '9876500000', role: 'customer', name: 'Neha Gupta' },
  ]);

  // Create bookings
  const b1 = await Booking.create({
    customerId: customers[0]._id.toString(),
    workerId: workers[0]._id.toString(),
    serviceName: 'Electrical Wiring',
    customerName: customers[0].name,
    customerPhone: customers[0].phone,
    amount: 500,
    currency: 'INR',
    status: 'accepted',
    etaMinutes: 25,
    trackingNote: 'Worker assigned',
    statusHistory: [{ status: 'requested', at: new Date(), note: 'Booking created', etaMinutes: 25 }, { status: 'accepted', at: new Date(), note: 'Worker accepted' }],
  });

  const b2 = await Booking.create({
    customerId: customers[1]._id.toString(),
    workerId: workers[2]._id.toString(),
    serviceName: 'Plumbing Repair',
    customerName: customers[1].name,
    customerPhone: customers[1].phone,
    amount: 400,
    currency: 'INR',
    status: 'completed',
    etaMinutes: 20,
    trackingNote: 'Job completed',
    statusHistory: [{ status: 'requested', at: new Date(), note: 'Booking created' }, { status: 'accepted', at: new Date() }, { status: 'completed', at: new Date() }],
  });

  await Review.create({ bookingId: b2._id.toString(), customerId: customers[1]._id.toString(), workerId: workers[2]._id.toString(), rating: 5, comment: 'Great service!' });

  console.log('[seed] users:', (await User.countDocuments()), 'bookings:', (await Booking.countDocuments()), 'reviews:', (await Review.countDocuments()));

  await mongoose.disconnect();
  console.log('[seed] done');
}

run().catch((e) => { console.error(e); process.exit(1); });
