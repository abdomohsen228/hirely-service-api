import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class SaveInterviewAnswerRequestDto {
  @ApiProperty({ description: 'Interview question id' })
  @IsMongoId()
  questionId: string;

  @ApiProperty({
    description: 'S3 key returned by the upload-url endpoint',
    example: 'interviews/answers/userId/interviewId/questionId/file.webm',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  videoKey: string;

  @ApiProperty({ example: 48, minimum: 0 })
  @IsNumber()
  @Min(0)
  responseDuration: number;

  @ApiPropertyOptional({ example: 'Candidate transcript text' })
  @IsOptional()
  @IsString()
  @MaxLength(20000)
  transcription?: string;
}
