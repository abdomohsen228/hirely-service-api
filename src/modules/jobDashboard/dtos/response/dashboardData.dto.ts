import { ApiProperty } from "@nestjs/swagger";
import { CandidateDataDto } from "./candidateData.dto";
import { JobApplicationStatusDataDto } from "./jobApplicationStatusData.dto";
import { MatchScoreDataDto } from "./matchScoreData.dto";
import { Type } from "class-transformer";
import { VisualIndicatorsDataDto } from "./visualIndicatorsData.dto";

export class DashboardDataDto {
  @ApiProperty({ example: '12345', description: 'Unique identifier for the application' })
  applicationId: string;
  
  @ApiProperty({
    type: CandidateDataDto,
  })
  @Type(() => CandidateDataDto)
  candidate: CandidateDataDto;

  @ApiProperty({
    type: MatchScoreDataDto,
  })
  @Type(() => MatchScoreDataDto)
  match: MatchScoreDataDto;

  @ApiProperty({
    type: VisualIndicatorsDataDto,
  })
  @Type(() => VisualIndicatorsDataDto)
  indicators: VisualIndicatorsDataDto;

  @ApiProperty({
    type: JobApplicationStatusDataDto,
  })
  @Type(() => JobApplicationStatusDataDto)
  application: JobApplicationStatusDataDto;
}