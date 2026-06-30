import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateInterviewUploadUrlRequestDto {
  @ApiProperty({ example: 'answer-1.webm' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fileName: string;

  @ApiProperty({ example: 'video/webm' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  contentType: string;
}
