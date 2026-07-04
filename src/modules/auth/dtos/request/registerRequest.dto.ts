import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsNotEmpty, IsString, Matches, Min, MinLength } from 'class-validator';

export class RegisterRequestDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'MyStr0ng!Pass2025',
    description:
      'User password. Must contain at least 8 characters, including uppercase, lowercase, a number, and a special character.',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 8 characters long.',
  })
  password: string;

  @ApiProperty({
    example: '2003-05-10',
    description: 'User date of birth (ISO format)',
  })
  @IsNotEmpty()
  @IsDateString()
  dateOfBirth: string;
}
