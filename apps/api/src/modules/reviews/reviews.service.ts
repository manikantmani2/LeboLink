import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewDocument } from './review.schema';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(@InjectModel(Review.name) private readonly reviewModel: Model<ReviewDocument>) {}

  async create(dto: CreateReviewDto, customerId: string) {
    // TODO: Fetch booking to get workerId
    const review = new this.reviewModel({
      ...dto,
      customerId,
      workerId: 'worker-id-placeholder', // TODO: Get from booking
    });
    await review.save();
    return { success: true, message: 'Review submitted successfully' };
  }

  async getByBooking(bookingId: string) {
    const review = await this.reviewModel.findOne({ bookingId });
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async getWorkerReviews(workerId: string) {
    const reviews = await this.reviewModel.find({ workerId }).sort({ createdAt: -1 });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    
    return {
      reviews: reviews.map((r) => ({
        id: r._id?.toString?.() ?? '',
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
      })),
      averageRating: avgRating,
      totalReviews: reviews.length,
    };
  }
}
