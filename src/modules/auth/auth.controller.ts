import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequestDto } from './dtos/request/loginRequest.dto';
import { UserDataDto } from './dtos/response/userDataResponse.dto';
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
import { RegisterRequestDto } from './dtos/request/registerRequest.dto';
import { ChooseRoleRequestDto } from './dtos/request/chooseRoleRequest.dto';
import { CompleteCandidateRegistrationRequestDto } from './dtos/request/completeCandidateRegistrationRequest.dto';
import { CompleteCandidateRegistrationResponseDto } from './dtos/response/completeCandidateRegistrationResponse.dto';
import { CompleteHrRegistrationRequestDto } from './dtos/request/completeHrRegistrationRequest.dto';
import { CompleteHrRegistrationResponseDto } from './dtos/response/completeHrRegistrationResponse.dto';
@ApiTags('App Authentication')
@ApiBearerAuth()
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

  @Post('/signup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully registered',
    type: UserDataDto,
  })
  @ApiBody({ type: RegisterRequestDto })
  public async signup(
    @Body() registerRequestDtoPayload: RegisterRequestDto,
  ): Promise<UserDataDto> {
    return this.authServices.register(registerRequestDtoPayload);
  }

  @Patch('/choose-role')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'chose user role' })
  @ApiBearerAuth('access-token')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Role successfully saved',
    type: UserDataDto,
  })
  public async chooseRole(
    @CurrentUser() userPayload: JwtPayload,
    @Body() chooseRoleDto: ChooseRoleRequestDto,
  ): Promise<UserDataDto> {
    return this.authServices.chooseRole(userPayload.id, chooseRoleDto);
  }

  @Post('complete-registration/candidate')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete candidate registration data' })
  @ApiBearerAuth('access-token')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Candidate data successfully saved',
    type: CompleteCandidateRegistrationResponseDto,
  })
  public async completeCandidateData(
    @CurrentUser() userPayload: JwtPayload,
    @Body() dto: CompleteCandidateRegistrationRequestDto,
  ): Promise<CompleteCandidateRegistrationResponseDto> {
    return this.authServices.completeCandidateData(userPayload.id, dto);
  }

  @Post('complete-registration/hr')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete Hr registration data' })
  @ApiBearerAuth('access-token')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Hr data successfully saved',
    type: CompleteHrRegistrationResponseDto,
  })
  public async completeHrData(
    @CurrentUser() userPayload: JwtPayload,
    @Body() dto: CompleteHrRegistrationRequestDto,
  ): Promise<CompleteHrRegistrationResponseDto> {
    return this.authServices.completeHrData(userPayload.id, dto);
  }

  @Post('/logout')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Logout user and invalidate token' })
  @ApiBearerAuth('access-token')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully logged out and token invalidated',
    type: String,
  })
  public async logout(@CurrentUser() userPayload: JwtPayload): Promise<string> {
    return this.authServices.logout(userPayload.email);
  }
}
