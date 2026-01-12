import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Controller({ path: 'v1/bookings' })
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@Body() dto: CreateBookingDto) {
    return this.bookingsService.create(dto);
  }

  @Get('available')
  getAvailable(@Query('workerId') workerId?: string) {
    return this.bookingsService.getAvailableJobs(workerId);
  }

  @Get('worker-jobs')
  getWorkerJobs(@Query('workerId') workerId?: string) {
    return this.bookingsService.getWorkerJobs(workerId);
  }

  @Get('customer/:customerId')
  getCustomerBookings(@Param('customerId') customerId: string) {
    return this.bookingsService.getCustomerBookings(customerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findById(id);
  }

  @Get(':id/track')
  track(@Param('id') id: string) {
    return this.bookingsService.track(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.bookingsService.updateStatus(id, dto.status, dto.note, dto.etaMinutes);
  }
}
