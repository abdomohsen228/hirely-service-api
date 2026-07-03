import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { profileStatus } from '../enums/user-profileStatus.enum';
import { ExperienceYears } from '../enums/experienceYears.enum';

export type CandidateDocument = Candidate & Document;

@Schema({ timestamps: true })
export class Candidate extends Document {
  @Prop({ required: true })
  fName: string;

  @Prop({ required: true })
  lName: string;

  @Prop({ required: true })
  fullName: string;  

  @Prop({ required: true, unique: true, lowercase: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  hashedPassword: string;

  @Prop({ required: true , unique: true })
  mobileNumber: string;

  @Prop({ required: true })
  country: string;

  @Prop()
  education: string;  // what ?

  @Prop( { type: String, enum: ExperienceYears, default: ExperienceYears.JUNIOR })
  experienceYears: ExperienceYears;

  @Prop({ type: [String], default: [] })
  skills: string[];

  @Prop({ type: [String], default: [] })
  languages: string[];

  @Prop()
  currentJobTitle: string;

  @Prop()
  cvFileUrl: string;

  @Prop()
  portfolioUrl: string;

  @Prop({
    type: String,
    enum: profileStatus,
    default: profileStatus.ACTIVE,
  })
  profileStatus: profileStatus;
}

export const CandidateSchema = SchemaFactory.createForClass(Candidate);
