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
  @IsOptional()
  @MaxLength(200)
  location?: string;

  @ApiProperty({ enum: ExperienceLevel, example: ExperienceLevel.MID_LEVEL })
  @IsEnum(ExperienceLevel)
  @IsOptional()
  experienceLevel?: ExperienceLevel;

  @ApiProperty({
    example: 'You will own backend services for our hiring platform.',
  })
  @IsString()
  @MaxLength(5000)
  @IsOptional()
  roleContext?: string;

  @ApiProperty({
    example:
      'Design APIs, review code, mentor juniors, and improve reliability.',
  })
  @IsString()
  @MaxLength(8000)
  @IsOptional()
  coreResponsibilities?: string;

  @ApiProperty({
    example: ['NestJS', 'MongoDB', 'TypeScript'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  @IsOptional()
  skills?: string[];

  @ApiProperty({
    example: ['fintech', 'remote', 'backend'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  @IsOptional()
  keywords?: string[];

  @ApiPropertyOptional({
    example: [
      'Describe a time you owned a production incident end-to-end.',
      'How do you approach API versioning with mobile clients?',
    ],
    type: [String],
    description:
      'Questions HR expects interviewers to ask candidates for this role',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(1000, { each: true })
  interviewerQuestions?: string[];

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/jobs/brief.pdf',
    description: 'URL or storage key for an attached job document',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @IsOptional()
  documentAttachment?: string;

  @ApiPropertyOptional({
    description: 'for when the job post should go live',
  })
  // @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiPropertyOptional({
    description: 'for when the job post should expire',
  })
  // @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @ApiPropertyOptional({
    example: 30,
    description: 'Number of weeks the job sprint should be active ',
  })
  // @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(12)
  sprintDuration: number;
}
