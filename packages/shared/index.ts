export type Role = 'worker' | 'customer' | 'admin';

export interface User {
  id: string;
  phone: string;
  role: Role;
  name?: string;
  location?: { type: 'Point'; coordinates: [number, number] };
}

export interface WorkerProfile {
  userId: string;
  skills: string[];
  experience?: string;
  expectedWage?: { unit: 'hour' | 'day' | 'job'; amount: number };
  availability?: 'daily' | 'weekly';
  radiusKm?: number;
  visible?: boolean;
}

export interface Job {
  id: string;
  title: string;
  skill: string;
  price?: number;
  location: { type: 'Point'; coordinates: [number, number] };
}

export type BookingStatus = 'requested' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';

export interface BookingLocation {
  type: 'home' | 'office' | 'friend' | 'other';
  address: string;
  coordinates?: [number, number];
}

export interface BookingReceiver {
  name: string;
  phone: string;
  relation?: string;
}

export interface BookingStatusEntry {
  status: BookingStatus;
  at: string;
  note?: string;
  etaMinutes?: number;
}

export interface Booking {
  id: string;
  jobId?: string;
  workerId: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  serviceName?: string;
  status: BookingStatus;
  location?: BookingLocation;
  receiver?: BookingReceiver;
  etaMinutes?: number;
  trackingNote?: string;
  statusHistory?: BookingStatusEntry[];
  createdAt?: string;
  updatedAt?: string;
  scheduledAt?: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  status: 'created' | 'captured' | 'failed';
}

export interface Review {
  id: string;
  bookingId: string;
  rating: number; // 1-5
  comment?: string;
}

export interface Notification {
  id: string;
  type: string;
  payload: any;
  createdAt: string;
}
