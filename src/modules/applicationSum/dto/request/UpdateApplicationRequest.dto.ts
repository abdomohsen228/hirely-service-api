import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  Max,
  IsDate
} from 'class-validator';
import { ApplicationStatus } from 'src/database/enums/applicationStatus.enum';

export class UpdateApplicationRequestDto {
  @ApiProperty({ description: 'Applied Candidate Information Section' })
  @IsNotEmpty()
  status: ApplicationStatus;
  
}
