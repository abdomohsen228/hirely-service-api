import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import { UserRole } from '../enums/userRole.enum';
import { PictureCVStatus } from '../enums/pictureCVstatus.enum';
import { AuthProvider } from '../enums/authProvider.enum';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({
    required: false,
    enum: UserRole,
    default: UserRole.CANDIDATE,
  })
  role: UserRole;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({})
  hashedPassword: string;

  @Prop({ required: true })
  dateOfBirth: Date;

  @Prop({ default: false })
  isProfileCompleted: boolean;

  @Prop({ default: 0 })
  tokenVersion: number;

  @Prop({
    type: String,
    enum: AuthProvider,
    default: AuthProvider.LOCAL,
  })
  provider: AuthProvider;

  @Prop()
  googleId: string;

  @Prop()
  profilePictureUrl: string;

  @Prop()
  cvUrl: string;

  @Prop({
    type: String,
    enum: PictureCVStatus,
    default: PictureCVStatus.PENDING,
  })
  profilePictureStatus: PictureCVStatus;

  @Prop({
    type: String,
    enum: PictureCVStatus,
    default: PictureCVStatus.PENDING,
  })
  cvStatus: PictureCVStatus;

  @Prop()
  rejectionReason: string;

  @Prop({ select: false })
  passwordResetTokenHash?: string;

  @Prop({ select: false })
  passwordResetExpiresAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
