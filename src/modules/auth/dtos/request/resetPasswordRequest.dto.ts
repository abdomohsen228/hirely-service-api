import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordRequestDto {
  @ApiProperty({
    description: 'Password reset token from the email link',
  })
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    example: 'StrongP@ssw0rd',
    description: 'New password',
  })
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;
}
