import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class SkillsPatchResponseDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  skills: string[];
}
