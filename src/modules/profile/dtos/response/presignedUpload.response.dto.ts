import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PresignedUploadResponseDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  uploadUrl: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  key: string;
}
