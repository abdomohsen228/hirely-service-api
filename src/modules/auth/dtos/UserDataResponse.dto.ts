import { ApiProperty } from '@nestjs/swagger';
import { UserDocument } from 'src/database/schemas/user.schema';

export class UserDataDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ example: '65f1a2b3c4d5e6f789012345' })
  id: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  static userDateResponse(token: string, user: UserDocument): UserDataDto {
    const userDataDto = new UserDataDto();

    userDataDto.accessToken = token;
    userDataDto.id = user.id;
    userDataDto.email = user.email;

    return userDataDto;
  }
}
