import { ApiProperty } from '@nestjs/swagger';

export class MessageResponseDto {
  @ApiProperty({ example: 'If an account exists, a reset link has been sent.' })
  message: string;

  static of(message: string): MessageResponseDto {
    return { message };
  }
}
