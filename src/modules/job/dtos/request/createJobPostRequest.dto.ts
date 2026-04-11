import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ExperienceLevel } from 'src/database/enums/experienceYears.enum';
import { JobType } from 'src/database/enums/jobType.enum';

export class CreateJobPostRequestDto {
  @ApiProperty({ example: 'Senior Backend Engineer' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'Engineering' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  department: string;

  @ApiProperty({ enum: JobType, example: JobType.FULL_TIME })
  @IsEnum(JobType)
  jobType: JobType;

  @ApiProperty({ example: 'Remote — MENA' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  location: string;

  @ApiProperty({ enum: ExperienceLevel, example: ExperienceLevel.MID_LEVEL })
  @IsEnum(ExperienceLevel)
  experienceLevel: ExperienceLevel;

  @ApiProperty({ example: 8000 })
  @IsNumber()
  @Min(0)
  compensationMin: number;

  @ApiProperty({ example: 12000 })
  @IsNumber()
  @Min(0)
  compensationMax: number;

  @ApiProperty({
    example: 'You will own backend services for our hiring platform.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  roleContext: string;

  @ApiProperty({
    example:
      'Design APIs, review code, mentor juniors, and improve reliability.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(8000)
  coreResponsibilities: string;

  @ApiProperty({
    example: ['NestJS', 'MongoDB', 'TypeScript'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  skills: string[];

  @ApiProperty({
    example: ['fintech', 'remote', 'backend'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  keywords: string[];

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/jobs/brief.pdf',
    description: 'URL or storage key for an attached job document',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  documentAttachment?: string;
}
