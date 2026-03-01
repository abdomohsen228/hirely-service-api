import { ApiProperty } from '@nestjs/swagger';

import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Matches,
  IsEnum,
} from 'class-validator';
import { CompanyIndustry } from 'src/database/enums/companyIndustry.enum';
import { CompanySize } from 'src/database/enums/companySize.enum';

export class CompleteHrRegistrationRequestDto {
  @ApiProperty({ example: 'Ahmed Salah' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: '+201012345678' })
  @IsString()
  @Matches(/^[0-9+]+$/, { message: 'Invalid phone number format' })
  phoneNumber: string;

  @ApiProperty({ example: 'TechCorp' })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty({ example: 'https://techcorp.com', required: false })
  @IsOptional()
  @IsUrl()
  companyWebsite?: string;

  @ApiProperty({
    example: 'Leading technology solutions provider...',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  companySummary?: string;

  @ApiProperty({ enum: ['SMALL', 'MEDIUM', 'LARGE'], required: false })
  @IsOptional()
  @ApiProperty({ enum: CompanySize })
  @IsEnum(CompanySize)
  companySize?: CompanySize;

  @ApiProperty({
    enum: ['TECHNOLOGY', 'HEALTHCARE', 'FINANCE'],
    required: false,
  })
  @IsOptional()
  @ApiProperty({ enum: CompanyIndustry })
  @IsEnum(CompanyIndustry)
  companyIndustry?: CompanyIndustry;

  @ApiProperty({ example: 'HR Manager', required: false })
  @IsOptional()
  @IsString()
  jobTitle?: string;
}
