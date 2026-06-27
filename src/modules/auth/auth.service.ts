import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'crypto';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { LoginRequestDto } from './dtos/request/loginRequest.dto';
import { UserDataDto } from './dtos/response/userDataResponse.dto';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from 'src/database/schemas/user.schema';
import { JwtPayload } from 'src/decorators/jwtPayload.interface';
import { RegisterRequestDto } from './dtos/request/registerRequest.dto';
import { ChooseRoleRequestDto } from './dtos/request/chooseRoleRequest.dto';
import { UserRole } from 'src/database/enums/userRole.enum';
import { CompleteCandidateRegistrationRequestDto } from './dtos/request/completeCandidateRegistrationRequest.dto';
import {
  Candidate,
  CandidateDocument,
} from 'src/database/schemas/candidate.schema';
import { CompleteCandidateRegistrationResponseDto } from './dtos/response/completeCandidateRegistrationResponse.dto';
import { Hr, HrDocument } from 'src/database/schemas/hr.schema';
import { CompleteHrRegistrationRequestDto } from './dtos/request/completeHrRegistrationRequest.dto';
import { CompleteHrRegistrationResponseDto } from './dtos/response/completeHrRegistrationResponse.dto';
import { AuthProvider } from 'src/database/enums/authProvider.enum';
import { GoogleAuthResponseDto } from './dtos/response/googleAuthResponse.dto';
import { PictureCVStatus } from 'src/database/enums/pictureCVstatus.enum';
import {
  UserJobScore,
  UserJobScoreDocument,
} from 'src/database/schemas/user_job_score.schema';
import { AiMatchingService } from '../ai-matching/ai-matching.service';
import { ForgotPasswordRequestDto } from './dtos/request/forgotPasswordRequest.dto';
import { ResetPasswordRequestDto } from './dtos/request/resetPasswordRequest.dto';
import { MessageResponseDto } from './dtos/response/messageResponse.dto';
import { EmailService } from '../email/email.service';
import { forwardRef, Inject } from '@nestjs/common';


const PASSWORD_RESET_SUCCESS_MESSAGE =
  'If an account exists with this email, a password reset link has been sent.';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Candidate.name)
    private readonly candidateModel: Model<CandidateDocument>,
    @InjectModel(Hr.name) private readonly hrModel: Model<HrDocument>,
    @InjectModel(UserJobScore.name)
    private readonly userJobScoreModel: Model<UserJobScoreDocument>,
    @Inject(forwardRef(() => AiMatchingService))
    private readonly aiMatchingService: AiMatchingService,
  ) {}

  public async register(
    registerRequestDto: RegisterRequestDto,
  ): Promise<UserDataDto> {
    const { email, password, dateOfBirth } = registerRequestDto;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const userObject = await this.userModel.create({
      email,
      hashedPassword,
      dateOfBirth: new Date(dateOfBirth),
      role: UserRole.CANDIDATE,
      isProfileCompleted: false,
    });
    const tokenPayload = {
      id: userObject.id,
      email: userObject.email,
      role: userObject.role,
      tokenVersion: userObject.tokenVersion,
    };
    const token = this.generateAccessToken(tokenPayload);
    return UserDataDto.userDateResponse(token, userObject);
  }

  public async chooseRole(
    userId: string,
    chooseRoleDto: ChooseRoleRequestDto,
  ): Promise<UserDataDto> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.role = chooseRoleDto.role;
    await user.save();
    return UserDataDto.userDateResponse(null, user);
  }

  public async completeCandidateData(
    userId: string,
    dto: CompleteCandidateRegistrationRequestDto,
  ): Promise<CompleteCandidateRegistrationResponseDto> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    if (user.role !== UserRole.CANDIDATE)
      throw new ForbiddenException('Only candidates allowed');

    const emailPrefix = user.email.split('@')[0];
    const existingCandidate = await this.candidateModel.findOne({
      username: emailPrefix,
    });
    if (existingCandidate) {
      throw new BadRequestException('Data already completed for this user');
    }
    const isPhoneNumberTaken = await this.candidateModel.findOne({
      mobileNumber: dto.mobileNumber,
    });
    if (isPhoneNumberTaken) {
      throw new BadRequestException('Phone number already in use');
    }
    console.log('User profile picture status:', user.profilePictureStatus);
    console.log('User CV status:', user.cvStatus);

    if(process.env.NODE_ENV === 'production')
    {
      if (!dto.profilePictureUrl) {
        console.log("Profile picture URL isn't there");
        await this.waitForFileApproval(userId, false);
      } else {
        await this.waitForFileApproval(userId);
      }
    }
    const candidate = await this.candidateModel.create({
      ...dto,
      username: emailPrefix,
      profilePictureUrl: dto.profilePictureUrl,
      cvFileUrl: dto.cvFileUrl,
    });

    this.aiMatchingService.computeScoresForCandidate(candidate).catch((err) => {
      console.error('AI matching failed for updated CV:', err);
    });

    user.isProfileCompleted = true;
    await candidate.save();
    await user.save();
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    };
    const token = this.generateAccessToken(tokenPayload);

    return CompleteCandidateRegistrationResponseDto.fromEntity(
      candidate,
      token,
    );
  }

  private async waitForFileApproval(userId: string, profile: boolean = true) {
    const timeout = 15000;
    const interval = 1000;
    const start = Date.now();

    while (Date.now() - start < timeout) {
      const user = await this.userModel.findById(userId);

      if (!user) throw new NotFoundException('User not found');

      const { profilePictureStatus, cvStatus } = user;

      if (profilePictureStatus === PictureCVStatus.REJECTED) {
        throw new BadRequestException(
          `Profile picture rejected: ${user.rejectionReason}`,
        );
      }

      if (cvStatus === PictureCVStatus.REJECTED) {
        throw new BadRequestException(`CV rejected: ${user.rejectionReason}`);
      }

      if (
        profilePictureStatus === PictureCVStatus.APPROVED &&
        cvStatus === PictureCVStatus.APPROVED
      ) {
        return user;
      }

      if (!profile && cvStatus === PictureCVStatus.APPROVED) {
        return user;
      }

      await new Promise((res) => setTimeout(res, interval));
    }
    throw new BadRequestException(
      'Files are still under review. Please try again in a few seconds.',
    );
  }

  public async completeHrData(
    userId: string,
    dto: CompleteHrRegistrationRequestDto,
  ): Promise<CompleteHrRegistrationResponseDto> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (user.role !== UserRole.HR)
      throw new ForbiddenException('Only HR users allowed');

    const emailPrefix = user.email.split('@')[0];

    const isPhoneNumberTaken = await this.hrModel.findOne({
      phoneNumber: dto.phoneNumber,
    });
    if (isPhoneNumberTaken) {
      throw new BadRequestException('Phone number already in use');
    }

    const hr = await this.hrModel.create({
      ...dto,
      username: emailPrefix,
      fullName: dto.fullName,
      accountStatus: 'ACTIVE',
    });

    user.isProfileCompleted = true;
    await user.save();
    await hr.save();
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    };
    const token = this.generateAccessToken(tokenPayload);
    return {
      fullName: hr.fullName,
      username: hr.username,
      phoneNumber: hr.phoneNumber,
      companyName: hr.companyName,
      companyWebsite: hr.companyWebsite,
      companySummary: hr.companySummary,
      companySize: hr.companySize,
      companyIndustry: hr.companyIndustry,
      jobTitle: hr.jobTitle,
      accountStatus: hr.accountStatus,
      accessToken: token,
    };
  }

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
  public async googleValidateUser(
    googleUser: any,
  ): Promise<GoogleAuthResponseDto> {
    const { email, googleId } = googleUser;

    let user = await this.userModel.findOne({ email });
    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        user.provider = AuthProvider.GOOGLE;
        await user.save();
      }
      const token = this.generateAccessToken({
        id: user.id,
        email: user.email,
        role: user.role,
        tokenVersion: user.tokenVersion,
      });
      return {
        token,
        user,
        isProfileCompleted: user.isProfileCompleted,
      };
    }
    user = await this.userModel.create({
      email,
      googleId,
      provider: AuthProvider.GOOGLE,
      role: UserRole.CANDIDATE,
      isProfileCompleted: false,
      dateOfBirth: new Date('2000-01-01'),
    });

    const token = this.generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    return {
      token,
      user,
      isProfileCompleted: false,
    };
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

  public async forgotPassword(
    dto: ForgotPasswordRequestDto,
  ): Promise<MessageResponseDto> {
    const user = await this.userModel.findOne({ email: dto.email });

    if (user && user.provider === AuthProvider.LOCAL && user.hashedPassword) {
      const rawToken = randomBytes(32).toString('hex');
      const tokenHash = this.hashResetToken(rawToken);
      const expiryMinutes = Number(
        this.configService.get<string>('PASSWORD_RESET_TOKEN_EXPIRY_MINUTES') ??
          '60',
      );

      user.passwordResetTokenHash = tokenHash;
      user.passwordResetExpiresAt = new Date(
        Date.now() + expiryMinutes * 60 * 1000,
      );
      await user.save({ validateBeforeSave: false });

      const frontendUrl =
        this.configService.get<string>('FRONTEND_URL') ??
        'http://localhost:5173';
      const resetLink = `${frontendUrl}/ResetPassword?token=${rawToken}`;

      await this.emailService.sendPasswordResetEmail(user.email, resetLink);
    }

    return MessageResponseDto.of(PASSWORD_RESET_SUCCESS_MESSAGE);
  }

  public async resetPassword(
    dto: ResetPasswordRequestDto,
  ): Promise<MessageResponseDto> {
    const tokenHash = this.hashResetToken(dto.token);

    const user = await this.userModel
      .findOne({
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: { $gt: new Date() },
      })
      .select('+passwordResetTokenHash +passwordResetExpiresAt');

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    user.hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpiresAt = undefined;
    user.tokenVersion += 1;
    await user.save({ validateBeforeSave: false });

    return MessageResponseDto.of('Password has been reset successfully');
  }

  private hashResetToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload);
  }
}
