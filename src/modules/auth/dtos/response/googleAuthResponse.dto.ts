import { User } from 'src/database/schemas/user.schema';

export class GoogleAuthResponseDto {
  token: string;
  user: User;
  isProfileCompleted: boolean;
  isNewUser: boolean;
}
