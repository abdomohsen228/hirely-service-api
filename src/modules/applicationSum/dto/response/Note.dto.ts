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
import { Types } from 'mongoose';

export class NoteDto {
  @ApiProperty({ example: 'Excellent but needs more confidence' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'Note ID' })
  @IsOptional()
  id?: Types.ObjectId;

}
