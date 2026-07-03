import { ApiProperty } from '@nestjs/swagger';

export class InterviewAnswerResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  interviewId: string;

  @ApiProperty()
  questionId: string;

  @ApiProperty()
  videoKey: string;

  @ApiProperty()
  transcription: string;

  @ApiProperty()
  responseDuration: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
