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

import { ApplicationStatus } from 'src/database/enums/applicationStatus.enum';

export class ProfileSectionDto {
  @ApiProperty({ description: 'profile picture url' })
  @IsString()
  pfpURL?: string;

  @ApiProperty({ example: 'Ziyad' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 8 })
  @IsNotEmpty()
  YearsOfexperience: number;

  @ApiProperty({ example: 'Senior Backend Engineer' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  location: string;

  @ApiProperty({ example: ApplicationStatus.IN_REVIEW })
  @IsNotEmpty()
  status: ApplicationStatus;

  
  @ApiProperty({ example: 'mziyad154@gmail.com' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  email: string;

  @ApiProperty({ example: 'Senior Backend Engineer' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;


  
}
