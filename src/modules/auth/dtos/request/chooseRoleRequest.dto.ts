import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { UserRole } from 'src/database/enums/userRole.enum';

export class ChooseRoleRequestDto {
  @ApiProperty({ example: UserRole.CANDIDATE })
  @IsEnum(UserRole)
  role: UserRole;
}
