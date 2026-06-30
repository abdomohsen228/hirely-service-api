import { ApiProperty } from '@nestjs/swagger';

export class InterviewUploadUrlResponseDto {
  @ApiProperty()
  uploadUrl: string;

  @ApiProperty()
  key: string;
}
