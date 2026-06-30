import { ApiProperty } from '@nestjs/swagger';

export class InterviewTestResponseDto {
  @ApiProperty()
  title: string;
  
  @ApiProperty()
  instructions: string[];

}
