import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ExperienceLevel } from 'src/database/enums/experienceYears.enum';

/** One education row inside `PATCH /profile` — replaces entire `educations` when the array is sent. */
export class ProfileEducationItemRequestDto {
  @ApiPropertyOptional({
    description: 'Existing Mongo subdocument id; omit to create a new id on save',
  })
  @IsOptional()
  @IsMongoId()
  id?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  institution: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  degree?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fieldOfStudy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}

/** One experience row — replaces entire `experiences` when the array is sent. */
export class ProfileExperienceItemRequestDto {
  @ApiPropertyOptional({
    description: 'Existing Mongo subdocument id; omit to create a new id on save',
  })
  @IsOptional()
  @IsMongoId()
  id?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  jobTitle: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;
}

export class ProfileEqualEmploymentRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  raceOrEthnicity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  veteranStatus?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  disabilityStatus?: string;
}

/**
 * Single body for `PATCH /profile`. Only fields present are applied.
 * Arrays (`skills`, `educations`, `experiences`) replace the stored lists when provided.
 */
export class UpdateProfileRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ description: 'Stored as profileSummary' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  profileSummary?: string;

  @ApiPropertyOptional({ enum: ExperienceLevel })
  @IsOptional()
  @IsEnum(ExperienceLevel)
  experienceLevel?: ExperienceLevel;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  yearsOfExperience?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currentJobTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  portfolioUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mobileNumber?: string;

  @ApiPropertyOptional({ type: [String], description: 'Replaces full skills list when sent' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiPropertyOptional({
    type: [ProfileEducationItemRequestDto],
    description: 'Replaces full educations list when sent (embedded subdocuments)',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProfileEducationItemRequestDto)
  educations?: ProfileEducationItemRequestDto[];

  @ApiPropertyOptional({
    type: [ProfileExperienceItemRequestDto],
    description: 'Replaces full experiences list when sent (embedded subdocuments)',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProfileExperienceItemRequestDto)
  experiences?: ProfileExperienceItemRequestDto[];

  @ApiPropertyOptional({ type: ProfileEqualEmploymentRequestDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProfileEqualEmploymentRequestDto)
  equalEmployment?: ProfileEqualEmploymentRequestDto;
}
