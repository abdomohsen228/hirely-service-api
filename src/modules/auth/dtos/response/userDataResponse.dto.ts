import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from 'src/database/enums/userRole.enum';
import { UserDocument } from 'src/database/schemas/user.schema';

export class UserDataDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ example: '65f1a2b3c4d5e6f789012345' })
  id: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @ApiProperty({ example: UserRole.CANDIDATE })
  role: string;

  @ApiProperty({ example: false })
  isProfileCompleted: boolean;

  static userDateResponse(token: string, user: UserDocument): UserDataDto {
    const userDataDto = new UserDataDto();

    userDataDto.accessToken = token;
    userDataDto.id = user.id;
    userDataDto.email = user.email;
    userDataDto.role = user.role;
    userDataDto.isProfileCompleted = user.isProfileCompleted;

    return userDataDto;
  }
}
