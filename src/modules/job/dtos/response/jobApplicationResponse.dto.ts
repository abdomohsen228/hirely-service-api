import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationStatus } from 'src/database/enums/applicationStatus.enum';

export class JobApplicationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  jobId: string;

  @ApiProperty()
  candidateId: string;

  @ApiProperty()
  resumeUrl: string;

  @ApiProperty({ enum: ApplicationStatus })
  status: ApplicationStatus;

  @ApiProperty()
  appliedAt: Date;

  @ApiProperty({ example: 2, description: '1-based pipeline stage' })
  currentStage: number;

  @ApiProperty({ example: 5 })
  totalStages: number;

  @ApiProperty({ example: 40, description: '0–100 for progress bar UI' })
  progressPercent: number;

  @ApiPropertyOptional({ nullable: true })
  nextStepTitle?: string | null;

  @ApiPropertyOptional({ nullable: true })
  nextStepAt?: Date | null;

  @ApiPropertyOptional({ nullable: true, example: 84 })
  matchScore?: number | null;

  @ApiPropertyOptional({ nullable: true })
  feedbackSummary?: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
