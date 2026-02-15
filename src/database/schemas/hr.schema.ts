import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { profileStatus } from '../enums/user-profileStatus.enum';
import { CompanyIndustry } from '../enums/companyIndustry.enum';
import { CompanySize } from '../enums/companySize.enum';

export type HrDocument = Hr & Document;

@Schema({ timestamps: true })
export class Hr extends Document {
  @Prop({ required: true })
  fName: string;
  
  @Prop({ required: true })
  lName: string;

  @Prop({ required: true })
  fullName: string;  

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  hashedPassword: string;

  @Prop( { required: true , unique: true })
  phoneNumber: string;

  @Prop({ required: true })
  companyName: string;

  @Prop()
  companyWebsite: string;

  @Prop({
    type: String,
    enum: CompanySize,
    default: CompanySize.MEDIUM,
  })
  companySize: CompanySize;

  @Prop({
    type: String,
    enum: CompanyIndustry,
    default: CompanyIndustry.TECHNOLOGY,
  })
  companyIndustry: CompanyIndustry;

  @Prop()
  jobTitle: string;

  @Prop({
    type: String,
    enum: profileStatus,
    default: profileStatus.ACTIVE,
  })
  accountStatus: profileStatus;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop()
  lastLogin: Date;  // why
}

export const HrSchema = SchemaFactory.createForClass(Hr);
