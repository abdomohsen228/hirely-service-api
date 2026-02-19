import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequestDto } from './dtos/loginRequest.dto';
import { UserDataDto } from './dtos/UserDataResponse.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from './guards/auth.guards';
import { CurrentUser } from 'src/decorators/currentPayload';
import { JwtPayload } from 'src/decorators/jwtPayload.interface';
@ApiTags('App Authentication')
@Controller('/auth')
export class AuthController {
  constructor(private readonly authServices: AuthService) {}
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user and generate JWT token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully logged in and JWT token generated',
    type: UserDataDto,
  })
  @ApiBody({ type: LoginRequestDto })
  public async login(
    @Body() loginRequestDtoPayload: LoginRequestDto,
  ): Promise<UserDataDto> {
    return this.authServices.login(loginRequestDtoPayload);
  }
  @Post('/logout')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user and invalidate token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully logged out and token invalidated',
    type: String,
  })
  public async logout(@CurrentUser() userPayload: JwtPayload): Promise<string> {
    return this.authServices.logout(userPayload.email);
  }
}
