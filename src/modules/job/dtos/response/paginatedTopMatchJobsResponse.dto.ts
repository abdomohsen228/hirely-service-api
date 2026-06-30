import { ApiProperty } from '@nestjs/swagger';
import { RecommendedJobItemResponseDto } from './recommendedJobItemResponse.dto';

export class PaginatedTopMatchJobsResponseDto {
  @ApiProperty({ type: [RecommendedJobItemResponseDto] })
  items: RecommendedJobItemResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
