import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { LoginRequestDto } from './dtos/loginRequest.dto';
import { UserDataDto } from './dtos/UserDataResponse.dto';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from 'src/database/schemas/user.schema';
import { JwtPayload } from 'src/decorators/jwtPayload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,

    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  public async login(loginDto: LoginRequestDto): Promise<UserDataDto> {
    const { email, password } = loginDto;

    const userObject = await this.userModel
      .findOne({ email })
      .select('+hashedPassword');
    if (!userObject) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      userObject.hashedPassword,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokenPayload = {
      id: userObject.id,
      email: userObject.email,
      role: userObject.role,
      tokenVersion: userObject.tokenVersion,
    };

    const token = this.generateAccessToken(tokenPayload);

    return UserDataDto.userDateResponse(token, userObject);
  }
  public async logout(email: string): Promise<string> {
    const userObject = await this.userModel.findOne({ email });
    if (!userObject) {
      throw new UnauthorizedException('Invalid credentials');
    }
    userObject.tokenVersion += 1;
    await userObject.save({ validateBeforeSave: false });
    return 'Logout successful';
  }

  private generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload);
  }
}
