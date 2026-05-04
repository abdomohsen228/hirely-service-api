import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { CompanyIndustry } from 'src/database/enums/companyIndustry.enum';
import { CompanySize } from 'src/database/enums/companySize.enum';
import { PictureCVStatus } from 'src/database/enums/pictureCVstatus.enum';
import { profileStatus } from 'src/database/enums/user-profileStatus.enum';

export class HrProfileResponseDto {
  @ApiProperty({ description: 'HR document id' })
  @IsMongoId()
  id: string;

  @ApiProperty({ description: 'Auth user id' })
  @IsMongoId()
  userId: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsBoolean()
  isProfileCompleted: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  profilePictureUrl?: string;

  @ApiPropertyOptional({ enum: PictureCVStatus })
  @IsOptional()
  @IsEnum(PictureCVStatus)
  profilePictureStatus?: PictureCVStatus;

  @ApiProperty()
  @IsString()
  fullName: string;

  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsString()
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  companyName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyWebsite?: string;

  @ApiPropertyOptional({ maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  companySummary?: string;

  @ApiPropertyOptional({ enum: CompanySize })
  @IsOptional()
  @IsEnum(CompanySize)
  companySize?: CompanySize;

  @ApiPropertyOptional({ enum: CompanyIndustry })
  @IsOptional()
  @IsEnum(CompanyIndustry)
  companyIndustry?: CompanyIndustry;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @ApiProperty({ enum: profileStatus })
  @IsEnum(profileStatus)
  accountStatus: profileStatus;

  @ApiProperty()
  @IsBoolean()
  emailVerified: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  lastLogin?: string;

  @ApiProperty()
  @IsDateString()
  createdAt: string;

  @ApiProperty()
  @IsDateString()
  updatedAt: string;
}
