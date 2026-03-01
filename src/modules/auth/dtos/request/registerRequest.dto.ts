import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsNotEmpty } from 'class-validator';

export class RegisterRequestDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'StrongP@ssw0rd',
    description: 'User password',
  })
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: '2003-05-10',
    description: 'User date of birth (ISO format)',
  })
  @IsNotEmpty()
  @IsDateString()
  dateOfBirth: string;
}
