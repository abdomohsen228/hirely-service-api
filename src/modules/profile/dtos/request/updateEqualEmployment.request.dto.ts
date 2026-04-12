import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateEqualEmploymentRequestDto {
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
