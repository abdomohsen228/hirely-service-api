import { ApiProperty } from '@nestjs/swagger';
import { JobApplicationResponseDto } from './jobApplicationResponse.dto';
import { JobPostResponseDto } from './jobPostResponse.dto';

export class MyJobApplicationItemResponseDto {
  @ApiProperty({ type: JobApplicationResponseDto })
  application: JobApplicationResponseDto;

  @ApiProperty({ type: JobPostResponseDto, nullable: true })
  job: JobPostResponseDto | null;
}
