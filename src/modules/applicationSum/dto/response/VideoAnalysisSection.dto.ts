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
  IsDate,
  isNumber
} from 'class-validator';

export class VideoAnalysisSectionDto {
  @ApiProperty({ description:'The url used to display video'})
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  videoURL: string;

  @ApiProperty({ example: 'Tell us about urself', description:'Question displayed for the candidate to answer' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  question: string;

  @ApiProperty({ example: 1, description:'The order of the question displayed' })
  @IsNumber()
  order: number;

  @ApiProperty({ example: 'My name is Ziyad ....', description:'The textual version of the recorded answer' })
  @IsString()
  @IsNotEmpty()
  transcription: string;

  @ApiProperty({ example: 'native', description:'The extracted english level from candidate recorded answer' })
  @IsNumber()
  @IsNotEmpty()
  englishLevel: string;

  @ApiProperty({ example: 80, description:'The extracted communication score from candidate recorded answer' })
  @IsNumber()
  @IsNotEmpty()
  communication: number;

  @ApiProperty({ example: 80, description:'The extracted body language from candidate recorded answer' })
  @IsNumber()
  @IsNotEmpty()
  bodyLanguage: number;

  @ApiProperty({ example: 80, description:'The extracted confidence score from candidate recorded answer' })
  @IsNumber()
  @IsNotEmpty()
  confidence: number;

  
}
