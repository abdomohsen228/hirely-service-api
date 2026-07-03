import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { PictureCVStatus } from 'src/database/enums/pictureCVstatus.enum';
import { ExperienceLevel } from 'src/database/enums/experienceYears.enum';
import { profileStatus } from 'src/database/enums/user-profileStatus.enum';
import { EducationEntryResponseDto } from './educationEntry.response.dto';
import { ExperienceEntryResponseDto } from './experienceEntry.response.dto';
import { EqualEmploymentDataResponseDto } from './equalEmploymentData.response.dto';

export class ProfileResponseDto {
  @ApiProperty({ description: 'Candidate document id' })
  @IsMongoId()
  id: string;

  @ApiProperty({ description: 'Auth User id (owner of this profile)' })
  @IsMongoId()
  userId: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  profilePictureUrl?: string;

  @ApiPropertyOptional({ enum: PictureCVStatus })
  @IsOptional()
  @IsEnum(PictureCVStatus)
  profilePictureStatus?: PictureCVStatus;

  // @ApiPropertyOptional()
  // @IsOptional()
  // @IsString()
  // cvUrl?: string;

  @ApiPropertyOptional({ enum: PictureCVStatus })
  @IsOptional()
  @IsEnum(PictureCVStatus)
  cvStatus?: PictureCVStatus;

  @ApiProperty()
  @IsString()
  fullName: string;

  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsString()
  mobileNumber: string;

  @ApiProperty()
  @IsString()
  country: string;

  // @ApiPropertyOptional()
  // @IsOptional()
  // @IsString()
  // education?: string;

  @ApiProperty({ type: [EducationEntryResponseDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EducationEntryResponseDto)
  educations: EducationEntryResponseDto[];

  @ApiProperty({ type: [ExperienceEntryResponseDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExperienceEntryResponseDto)
  experiences: ExperienceEntryResponseDto[];

  @ApiPropertyOptional({ type: EqualEmploymentDataResponseDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => EqualEmploymentDataResponseDto)
  equalEmployment?: EqualEmploymentDataResponseDto;

  @ApiProperty({ enum: ExperienceLevel })
  @IsEnum(ExperienceLevel)
  experienceLevel: ExperienceLevel;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  yearsOfExperience?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  profileSummary?: string;

  // @ApiPropertyOptional()
  // @IsOptional()
  // @IsString()
  // @MaxLength(1000)
  // bio?: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  languages: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currentJobTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  cvFileUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  portfolioUrl?: string;

  @ApiProperty({ enum: profileStatus })
  @IsEnum(profileStatus)
  profileStatus: profileStatus;

  @ApiProperty()
  @IsDateString()
  createdAt: string;

  @ApiProperty()
  @IsDateString()
  updatedAt: string;
}
