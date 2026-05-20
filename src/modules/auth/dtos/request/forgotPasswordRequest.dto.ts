import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordRequestDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address associated with the account',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
