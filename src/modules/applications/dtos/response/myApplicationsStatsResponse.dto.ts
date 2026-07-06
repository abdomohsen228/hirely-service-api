import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MyApplicationsStatsResponseDto {
  @ApiProperty({ example: 24 })
  totalApplied: number;

  @ApiProperty({
    example: 3,
    description:
      'Applications in INTERVIEW with nextStepAt strictly in the future',
  })
  upcomingInterviews: number;

  @ApiPropertyOptional({
    nullable: true,
    example: 84,
    description: 'Highest matchScore among applications that have one set',
  })
  bestMatchScore: number | null;

  @ApiPropertyOptional({
    nullable: true,
    example: 'Top 5% Candidate',
    description: 'Optional headline when bestMatchScore crosses a threshold',
  })
  matchScoreHeadline: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: 12,
    description: 'Number of active applications',
  })
  activeCount: number;
}
