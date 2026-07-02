import { ApiProperty } from '@nestjs/swagger';

export class CoreCompetenciesSectionDto {
  @ApiProperty()
  communication_skills: number;

  @ApiProperty()
  confidence_level:number;

  @ApiProperty()
  answer_clarity:number;  // speech_score
}