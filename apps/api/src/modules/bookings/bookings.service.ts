import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking, BookingDocument, BookingStatus } from './booking.schema';
import { CreateBookingDto } from './dto/create-booking.dto';

const STEPS: BookingStatus[] = ['requested', 'accepted', 'in-progress', 'completed'];

@Injectable()
export class BookingsService {
  constructor(@InjectModel(Booking.name) private readonly bookingModel: Model<BookingDocument>) {}

  async create(dto: CreateBookingDto) {
    const now = new Date();
    const defaultCoords: [number, number] = [77.209, 28.6139];
    const coords: [number, number] =
      typeof dto.locationLng === 'number' && typeof dto.locationLat === 'number'
        ? [dto.locationLng, dto.locationLat]
        : defaultCoords;
    const amount = dto.amount ?? 499;
    const booking = new this.bookingModel({
      customerId: dto.customerId,
      workerId: dto.workerId,
      jobId: dto.jobId,
      serviceName: dto.serviceName,
      customerName: dto.customerName,
      customerPhone: dto.customerPhone,
      amount,
      currency: 'INR',
      paymentStatus: 'pending',
      location: {
        type: dto.locationType,
        address: dto.locationAddress,
        coordinates: coords,
      },
      receiver: dto.receiverName || dto.receiverPhone || dto.receiverRelation
        ? {
            name: dto.receiverName ?? dto.customerName ?? 'Receiver',
            phone: dto.receiverPhone ?? dto.customerPhone ?? '',
            relation: dto.receiverRelation,
          }
        : undefined,
      status: 'requested',
      etaMinutes: 25,
      trackingNote: 'We are finding the best worker for you',
      statusHistory: [{ status: 'requested', at: now, note: 'Booking created', etaMinutes: 25 }],
    });

    await booking.save();
    return this.toResponse(booking);
  }

  async findById(id: string) {
    const doc = await this.bookingModel.findById(id);
    if (!doc) throw new NotFoundException('Booking not found');
    const updated = await this.autoAdvance(doc);
    return this.toResponse(updated);
  }

  async getAvailableJobs(workerId?: string) {
    const query: any = { status: 'requested' };
    if (workerId) {
      query.workerId = { $ne: workerId };
    }
    const jobs = await this.bookingModel.find(query).limit(10).sort({ createdAt: -1 });
    return {
      jobs: jobs.map((job) => ({
        id: job._id?.toString?.() ?? '',
        bookingId: job._id?.toString?.() ?? '',
        title: job.serviceName || 'Job',
        distanceKm: Math.round(Math.random() * 5 * 10) / 10,
        when: 'Today',
        price: `₹${job.amount || 400}`,
        rating: 4.5 + Math.random() * 0.5,
        status: job.status,
      })),
    };
  }

  async getWorkerJobs(workerId?: string) {
    const query: any = { workerId };
    const jobs = await this.bookingModel.find(query).sort({ createdAt: -1 });

    let totalEarnings = 0;
    let completedCount = 0;

    const formattedJobs = jobs.map((job) => {
      if (job.status === 'completed') {
        totalEarnings += job.amount ?? 400;
        completedCount++;
      }
      return {
        id: job._id?.toString?.() ?? '',
        title: job.serviceName || 'Job',
        customer: job.customerName || 'Customer',
        price: `₹${job.amount || 400}`,
        status: job.status,
        scheduledTime: 'Today, 2:30 PM',
        address: job.location?.address || 'Location TBD',
        phone: job.customerPhone || 'N/A',
      };
    });

    return {
      jobs: formattedJobs,
      totalEarnings,
      completedJobs: completedCount,
    };
  }

  async getCustomerBookings(customerId: string) {
    const bookings = await this.bookingModel.find({ customerId }).sort({ createdAt: -1 });

    let totalSpent = 0;
    let activeCount = 0;
    let completedCount = 0;

    const formattedBookings = bookings.map((booking) => {
      const isActive = booking.status !== 'completed' && booking.status !== 'cancelled';
      
      if (booking.status === 'completed') {
        totalSpent += booking.amount ?? 0;
        completedCount++;
      }
      if (isActive) {
        activeCount++;
      }

      return {
        id: booking._id?.toString?.() ?? '',
        serviceName: booking.serviceName || 'Service',
        workerName: 'Worker Name', // TODO: Join with worker collection
        status: booking.status,
        amount: booking.amount || 0,
        createdAt: booking.createdAt.toISOString(),
        address: booking.location?.address,
        phone: booking.customerPhone,
        etaMinutes: booking.etaMinutes,
        paymentStatus: booking.paymentStatus,
        rating: undefined, // TODO: Join with reviews collection
      };
    });

    return {
      bookings: formattedBookings,
      totalSpent,
      activeCount,
      completedCount,
    };
  }

  async updateStatus(id: string, status: BookingStatus, note?: string, etaMinutes?: number) {
    const doc = await this.bookingModel.findById(id);
    if (!doc) throw new NotFoundException('Booking not found');
    doc.status = status;
    doc.etaMinutes = etaMinutes ?? doc.etaMinutes;
    doc.trackingNote = note ?? doc.trackingNote;
    doc.statusHistory.push({ status, at: new Date(), note, etaMinutes });
    await doc.save();
    return this.toResponse(doc);
  }

  async track(id: string) {
    const doc = await this.bookingModel.findById(id);
    if (!doc) throw new NotFoundException('Booking not found');
    const booking = await this.autoAdvance(doc);
    const { workerLocation, customerLocation } = this.computeMapPositions(booking);
    return {
      booking: this.toResponse(booking),
      progress: {
        steps: STEPS,
        currentStep: this.statusToStep(booking.status),
        etaMinutes: booking.etaMinutes,
        note: booking.trackingNote,
      },
      map: {
        workerLocation,
        customerLocation,
      },
    };
  }

  private statusToStep(status: BookingStatus) {
    const idx = STEPS.indexOf(status);
    return idx >= 0 ? idx : 0;
  }

  private async autoAdvance(doc: BookingDocument) {
    if (doc.status === 'completed' || doc.status === 'cancelled') return doc;
    const elapsedMinutes = (Date.now() - doc.createdAt.getTime()) / 60000;
    let next: BookingStatus = doc.status;
    let note = doc.trackingNote;
    let eta = doc.etaMinutes ?? 20;

    if (elapsedMinutes >= 8) {
      next = 'completed';
      eta = 0;
      note = 'Work completed';
    } else if (elapsedMinutes >= 4) {
      next = 'in-progress';
      eta = Math.max(5, Math.ceil(15 - elapsedMinutes * 2));
      note = 'Worker en-route';
    } else if (elapsedMinutes >= 2) {
      next = 'accepted';
      eta = Math.max(10, Math.ceil(25 - elapsedMinutes * 3));
      note = 'Worker assigned';
    }

    if (next !== doc.status) {
      doc.status = next;
      doc.etaMinutes = eta;
      doc.trackingNote = note;
      doc.statusHistory.push({ status: next, at: new Date(), note, etaMinutes: eta });
      await doc.save();
    }

    return doc;
  }

  private computeMapPositions(doc: BookingDocument) {
    const customerCoords = doc.location?.coordinates;
    const customerLocation = customerCoords
      ? { lat: customerCoords[1], lng: customerCoords[0] }
      : { lat: 28.6139, lng: 77.209 };

    // Simulate worker en-route from a nearby point
    const start = { lat: customerLocation.lat + 0.02, lng: customerLocation.lng - 0.02 };
    const end = customerLocation;

    const elapsedMinutes = (Date.now() - doc.createdAt.getTime()) / 60000;
    const progress = Math.min(1, Math.max(0, elapsedMinutes / 8)); // reach in ~8 minutes

    const workerLocation = {
      lat: start.lat + (end.lat - start.lat) * progress,
      lng: start.lng + (end.lng - start.lng) * progress,
    };

    return { workerLocation, customerLocation };
  }

  private toResponse(doc: BookingDocument) {
    const obj = doc.toObject({ versionKey: false });
    return {
      id: obj._id?.toString?.() ?? '',
      jobId: obj.jobId,
      workerId: obj.workerId,
      customerId: obj.customerId,
      customerName: obj.customerName,
      customerPhone: obj.customerPhone,
      serviceName: obj.serviceName,
      status: obj.status,
      amount: obj.amount,
      currency: obj.currency,
      paymentStatus: obj.paymentStatus,
      paymentMethod: obj.paymentMethod,
      paymentId: obj.paymentId,
      location: obj.location,
      receiver: obj.receiver,
      etaMinutes: obj.etaMinutes,
      trackingNote: obj.trackingNote,
      statusHistory: obj.statusHistory,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    };
  }
}
