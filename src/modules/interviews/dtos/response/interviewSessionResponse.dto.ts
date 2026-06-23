import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CandidateInterviewStatus } from 'src/database/enums/candidateInterviewStatus.enum';

export class InterviewQuestionItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  order: number;

  @ApiProperty()
  question: string;

  @ApiProperty()
  answerDuration: number;

  @ApiProperty()
  preparationDuration: number;
 
  @ApiProperty({ enum: ['practice', 'question'] })
  type: 'practice' | 'question';

  @ApiProperty()
  requiresSubmission: boolean;

  @ApiProperty()
  isAnswered: boolean;

  @ApiPropertyOptional({ nullable: true })
  answerVideoKey: string | null;

  @ApiPropertyOptional({ nullable: true })
  responseDuration: number | null;
}

export class InterviewSessionResponseDto {
  @ApiPropertyOptional({ nullable: true })
  interviewId: string | null;

  @ApiProperty()
  applicationId: string;

  @ApiProperty()
  jobId: string;

  @ApiProperty({ enum: CandidateInterviewStatus })
  status: CandidateInterviewStatus;

  @ApiProperty()
  currentStep: number;

  @ApiProperty()
  totalSteps: number;

  @ApiProperty()
  answeredCount: number;

  @ApiProperty()
  canStart: boolean;

  @ApiProperty()
  canSubmit: boolean;

  @ApiPropertyOptional({ nullable: true })
  interviewStartDate: Date | null;

  @ApiPropertyOptional({ nullable: true })
  interviewEndDate: Date | null;

  @ApiProperty({ type: [InterviewQuestionItemResponseDto] })
  questions: InterviewQuestionItemResponseDto[];
}
