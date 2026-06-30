import { ApiProperty } from '@nestjs/swagger';

export class InterviewInstructionsResponseDto {
  @ApiProperty()
  title: string;
  
  @ApiProperty()
  instructions: string[];

}
