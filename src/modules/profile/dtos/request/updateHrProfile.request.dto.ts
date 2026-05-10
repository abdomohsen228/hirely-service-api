import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
} from 'class-validator';
import { CompanyIndustry } from 'src/database/enums/companyIndustry.enum';
import { CompanySize } from 'src/database/enums/companySize.enum';

export class UpdateHrProfileRequestDto {
  @ApiPropertyOptional({ example: 'Ahmed Salah' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: '+201012345678' })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9+]+$/, { message: 'Invalid phone number format' })
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'TechCorp' })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({ example: 'https://techcorp.com' })
  @IsOptional()
  @IsUrl()
  companyWebsite?: string;

  @ApiPropertyOptional({ example: 'Leading technology solutions provider...' })
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

  @ApiPropertyOptional({ example: 'HR Manager' })
  @IsOptional()
  @IsString()
  jobTitle?: string;
}
