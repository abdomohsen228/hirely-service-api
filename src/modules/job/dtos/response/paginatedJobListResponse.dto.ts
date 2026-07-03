import { ApiProperty } from '@nestjs/swagger';
import { JobPostResponseDto } from './jobPostResponse.dto';

export class PaginatedJobListResponseDto {
  @ApiProperty({ type: [JobPostResponseDto] })
  items: JobPostResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
