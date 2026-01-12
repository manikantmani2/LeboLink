import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { BookingStatus } from '../booking.schema';

export class UpdateStatusDto {
  @IsString()
  @IsIn(['requested', 'accepted', 'in-progress', 'completed', 'cancelled'])
  status!: BookingStatus;

  @IsOptional()
  @IsNumber()
  etaMinutes?: number;

  @IsOptional()
  @IsString()
  note?: string;
}
