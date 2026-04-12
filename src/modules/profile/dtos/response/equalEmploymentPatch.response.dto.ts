import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { EqualEmploymentDataResponseDto } from './equalEmploymentData.response.dto';

export class EqualEmploymentPatchResponseDto {
  @ApiPropertyOptional({ type: EqualEmploymentDataResponseDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => EqualEmploymentDataResponseDto)
  equalEmployment?: EqualEmploymentDataResponseDto;
}
