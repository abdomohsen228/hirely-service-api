import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, discriminatorKey: 'role' })
export class User extends Document {
  @Prop({ required: true })
  role: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  hashedPassword: string;

  @Prop({ default: 0 })
  tokenVersion: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
