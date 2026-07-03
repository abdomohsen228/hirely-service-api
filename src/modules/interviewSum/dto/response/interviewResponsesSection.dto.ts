import { ApiProperty } from '@nestjs/swagger';

export class InterviewResponsesSectionDto {
  @ApiProperty()
  question: string;

  @ApiProperty()
  transcription: string;

  @ApiProperty()
  order:number;

  @ApiProperty()
  responseURL:string;

  @ApiProperty()
  responseDuration:string;

  @ApiProperty()
  responseCount:number;
}