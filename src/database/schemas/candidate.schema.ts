import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';
import { profileStatus } from '../enums/user-profileStatus.enum';
import { ExperienceLevel } from '../enums/experienceYears.enum';
import { User } from './user.schema';

export type CandidateDocument = HydratedDocument<Candidate>;

@Schema({ _id: true })
export class EducationEntry {
  _id?: Types.ObjectId;

  @Prop() institution?: string;

  @Prop() degree?: string;

  @Prop() fieldOfStudy?: string;

  @Prop() startDate?: Date;

  @Prop() endDate?: Date;

  @Prop() description?: string;
}
export const EducationEntrySchema = SchemaFactory.createForClass(EducationEntry);

@Schema({ _id: true })
export class ExperienceEntry {
  _id?: Types.ObjectId;

  @Prop({ required: true })
  jobTitle: string;

  @Prop({ required: true })
  companyName: string;

  @Prop() location?: string;

  @Prop() startDate?: Date;

  @Prop() endDate?: Date;

  @Prop() description?: string;

  @Prop({ default: false })
  isCurrent?: boolean;
}
export const ExperienceEntrySchema = SchemaFactory.createForClass(ExperienceEntry);

@Schema({ _id: false })
export class EqualEmployment {
  @Prop() gender?: string;

  @Prop() raceOrEthnicity?: string;

  @Prop() veteranStatus?: string;

  @Prop() disabilityStatus?: string;
}
export const EqualEmploymentSchema = SchemaFactory.createForClass(EqualEmployment);

@Schema({ timestamps: true })
export class Candidate extends Document {
  /** Owning auth account (one candidate profile per user). Sparse for legacy rows before this field existed. */
  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    unique: true,
    sparse: true,
  })
  user?: Types.ObjectId;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true, lowercase: true })
  username: string;

  @Prop({ required: true, unique: true })
  mobileNumber: string;

  @Prop({ required: true })
  country: string;

  /** @deprecated Prefer `educations` list; kept for older records */
  @Prop()
  education?: string;

  @Prop({ type: [EducationEntrySchema], default: [] })
  educations: EducationEntry[];

  @Prop({ type: [ExperienceEntrySchema], default: [] })
  experiences: ExperienceEntry[];

  @Prop({ type: EqualEmploymentSchema })
  equalEmployment?: EqualEmployment;

  @Prop({
    type: String,
    enum: ExperienceLevel,
    default: ExperienceLevel.JUNIOR,
  })
  experienceLevel: ExperienceLevel;

  @Prop({ type: [String], default: [] })
  skills: string[];

  @Prop({ required: false, min: 0 })
  yearsOfExperience: number;

  @Prop({ maxlength: 1000 })
  profileSummary: string;

  @Prop()
  profilePictureUrl: string;

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

  // profile pic

  // introduction graph
}

export const CandidateSchema = SchemaFactory.createForClass(Candidate);
