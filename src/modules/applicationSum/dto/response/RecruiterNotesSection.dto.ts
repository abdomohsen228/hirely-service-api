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
import { NoteDto } from './Note.dto';

export class RecruiterNotesSectionDto {
  @ApiProperty({ description: 'Recruiter Notes' })
  notes ?: NoteDto[];

  
}
