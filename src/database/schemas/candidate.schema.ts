import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  Document,
  HydratedDocument,
  Schema as MongooseSchema,
  Types,
} from 'mongoose';
import { profileStatus } from '../enums/user-profileStatus.enum';
import { ExperienceLevel } from '../enums/experienceYears.enum';
import { User } from './user.schema';

/** Type for one embedded education row  */
export type CandidateEducationEmbedded = {
  _id?: Types.ObjectId;
  institution?: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: Date;
  endDate?: Date;
  description?: string;
};

/** Type for one embedded experience row  */
export type CandidateExperienceEmbedded = {
  _id?: Types.ObjectId;
  jobTitle: string;
  companyName: string;
  location?: string;
  startDate?: Date;
  endDate?: Date;
  description?: string;
  isCurrent?: boolean;
};

/** Embedded equal-employment object on Candidate */
export type CandidateEqualEmploymentEmbedded = {
  gender?: string;
  raceOrEthnicity?: string;
  veteranStatus?: string;
  disabilityStatus?: string;
};

const educationEmbeddedSchema = new MongooseSchema(
  {
    institution: { type: String },
    degree: { type: String },
    fieldOfStudy: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    description: { type: String },
  },
  { _id: true },
);

const experienceEmbeddedSchema = new MongooseSchema(
  {
    jobTitle: { type: String, required: true },
    companyName: { type: String, required: true },
    location: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    description: { type: String },
    isCurrent: { type: Boolean, default: false },
  },
  { _id: true },
);

const equalEmploymentEmbeddedSchema = new MongooseSchema(
  {
    gender: { type: String },
    raceOrEthnicity: { type: String },
    veteranStatus: { type: String },
    disabilityStatus: { type: String },
  },
  { _id: false },
);

export type CandidateWithUser = Candidate & User;

export type CandidateDocument = HydratedDocument<Candidate>;

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

  @Prop({ type: [educationEmbeddedSchema], default: [] })
  educations: CandidateEducationEmbedded[];

  @Prop({ type: [experienceEmbeddedSchema], default: [] })
  experiences: CandidateExperienceEmbedded[];

  @Prop({ type: equalEmploymentEmbeddedSchema })
  equalEmployment?: CandidateEqualEmploymentEmbedded;

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
  linkedInUrl: string;

  @Prop()
  githubUrl: string;

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
