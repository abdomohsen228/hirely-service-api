import { ApiProperty } from '@nestjs/swagger';
import { JobPostResponseDto } from './jobPostResponse.dto';

export class RecommendedJobItemResponseDto {
  @ApiProperty({ type: JobPostResponseDto })
  job: JobPostResponseDto;

  @ApiProperty({ description: 'Match score percentage (0-100)' })
  score: number;

  @ApiProperty({ type: [String], description: 'List of skills that matched' })
  matchedSkills: string[];
}
