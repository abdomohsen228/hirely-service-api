import { ApiProperty } from '@nestjs/swagger';
import { CoreCompetenciesSectionDto } from './coreCompetenciesSection.dto';
import { HeaderSectionDto } from './headerSection.dto';
import { InterviewResponsesSectionDto } from './interviewResponsesSection.dto';
import { performanceSectionDto } from './performanceSection.dto';

export class InterviewSumResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  headerSection: HeaderSectionDto;

  @ApiProperty()
  performanceSection: performanceSectionDto;

  @ApiProperty()
  coreCompetenciesSection: CoreCompetenciesSectionDto;

  @ApiProperty()
  InterviewResponsesSection: InterviewResponsesSectionDto[];

}
