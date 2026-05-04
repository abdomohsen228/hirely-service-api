import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ImageUploadDto {
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  contentType: string;
}
