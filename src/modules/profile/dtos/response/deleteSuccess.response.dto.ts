import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class DeleteSuccessResponseDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  deleted: boolean;
}
