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
import { ValidateNested } from 'class-validator';
import { NoteDto } from './Note.dto';

export class RecruiterNotesSectionDto {
  @ApiProperty({ description: 'Recruiter Notes' })
  @ValidateNested({ each: true })
  @Type(() => NoteDto)
  notes ?: NoteDto[];

  
}
