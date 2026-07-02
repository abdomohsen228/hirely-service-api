import { ApiProperty } from '@nestjs/swagger';

export class performanceSectionDto {
  @ApiProperty()
  overall_performance: number;

  @ApiProperty()
  conclusion:string;
}