import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class UpdateSkillsRequestDto {
  @ApiProperty({ type: [String], description: 'Replaces the entire skills list' })
  @IsArray()
  @IsString({ each: true })
  skills: string[];
}
