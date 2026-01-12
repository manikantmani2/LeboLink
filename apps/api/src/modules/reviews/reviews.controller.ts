import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller({ path: 'v1/reviews' })
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  create(@Body() dto: CreateReviewDto, @Query('customerId') customerId: string) {
    return this.reviewsService.create(dto, customerId);
  }

  @Get('booking/:bookingId')
  getByBooking(@Param('bookingId') bookingId: string) {
    return this.reviewsService.getByBooking(bookingId);
  }

  @Get('worker/:workerId')
  getWorkerReviews(@Param('workerId') workerId: string) {
    return this.reviewsService.getWorkerReviews(workerId);
  }
}
