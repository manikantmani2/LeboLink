import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @IsString()
  @IsNotEmpty()
  workerId!: string;

  @IsString()
  @IsOptional()
  jobId?: string;

  @IsString()
  @IsOptional()
  serviceName?: string;

  @IsString()
  @IsOptional()
  customerName?: string;

  @IsString()
  @IsOptional()
  customerPhone?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  amount?: number;

  @IsString()
  @IsIn(['home', 'office', 'friend', 'other'])
  locationType!: 'home' | 'office' | 'friend' | 'other';

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  locationAddress!: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  locationLat?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  locationLng?: number;

  @IsString()
  @IsOptional()
  receiverName?: string;

  @IsString()
  @IsOptional()
  receiverPhone?: string;

  @IsString()
  @IsOptional()
  receiverRelation?: string;
}
