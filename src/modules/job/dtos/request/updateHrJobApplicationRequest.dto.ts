import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApplicationStatus } from 'src/database/enums/applicationStatus.enum';

export class UpdateHrJobApplicationRequestDto {
  @ApiPropertyOptional({ enum: ApplicationStatus })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  currentStage?: number;

  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  totalStages?: number;

  @ApiPropertyOptional({ example: 'Technical Interview' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  nextStepTitle?: string | null;

  @ApiPropertyOptional({
    example: '2026-10-24T14:00:00.000Z',
    description: 'ISO date-time for the next step (e.g. interview slot)',
  })
  @IsOptional()
  @IsDateString()
  nextStepAt?: string | null;

  @ApiPropertyOptional({ minimum: 0, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  matchScore?: number | null;

  @ApiPropertyOptional({ example: 'Strong portfolio alignment.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  feedbackSummary?: string | null;
}
