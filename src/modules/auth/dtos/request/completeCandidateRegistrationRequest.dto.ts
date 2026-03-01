import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsString,
  IsArray,
  IsUrl,
  Matches,
  IsNumber,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ExperienceLevel } from 'src/database/enums/experienceYears.enum';

export class CompleteCandidateRegistrationRequestDto {
  @ApiProperty({ example: 'Abdo' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: '+201012345678' })
  @IsString()
  @Matches(/^[0-9+]+$/, { message: 'Invalid mobile number format' })
  mobileNumber: string;

  @ApiProperty({ example: 'Egypt' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ example: 'Cairo University', required: false })
  @IsOptional()
  @IsString()
  education?: string;

  @ApiProperty({ enum: ExperienceLevel })
  @IsEnum(ExperienceLevel)
  experienceLevel: ExperienceLevel;

  @ApiProperty({ example: 3, description: 'Years of experience' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  yearsOfExperience: number;

  @ApiProperty({
    example: 'Passionate backend engineer with 3 years experience...',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  profileSummary?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Profile picture file',
  })
  profilePicture?: any;
  @ApiProperty({
    example: ['Node.js', 'NestJS'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @Type(() => String)
  skills?: string[];

  @ApiProperty({
    example: ['English', 'Arabic'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @Type(() => String)
  languages?: string[];

  @ApiProperty({ example: 'Backend Developer', required: false })
  @IsOptional()
  @IsString()
  currentJobTitle?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Upload CV file',
  })
  cvFile?: any;

  @ApiProperty({
    example: 'https://portfolio.com',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  portfolioUrl?: string;
}
