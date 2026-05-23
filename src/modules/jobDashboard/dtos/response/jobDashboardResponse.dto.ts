import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DashboardDataDto } from './dashboardData.dto';

export class JobDashboardResponseDto {
  @ApiProperty()
  jobId: string;

  @ApiProperty()
  totalApplications: number;

  @ApiProperty()
  applicationsToday: number;

  @ApiProperty()
  shortlistedCandidates: number;

  @ApiProperty({ example: 75, description: '0–100 average match score' })
  averageMatchScore: number;

  @ApiProperty({ type: [DashboardDataDto]})
    dashboardData: DashboardDataDto[];


}