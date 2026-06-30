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

export class ArchitecturalAlignmentSectionDto {
  @ApiProperty({ example: 80 })
  @IsNotEmpty()
  score: number;

  @ApiProperty({ example: 'Candidate demonestrates in....' })
  @IsString()
  @IsNotEmpty()
  summary: string;

  @ApiProperty({ example: ['System Design','Front-End'] })
  @IsNotEmpty()
  matchingSkills?: string[];

  
}
