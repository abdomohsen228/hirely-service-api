import { ApiProperty } from '@nestjs/swagger';
import { MyJobApplicationItemResponseDto } from './myJobApplicationItemResponse.dto';

export class PaginatedMyJobApplicationsResponseDto {
  @ApiProperty({ type: [MyJobApplicationItemResponseDto] })
  items: MyJobApplicationItemResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
