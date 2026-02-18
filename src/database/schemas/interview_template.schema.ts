import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InterviewTemplateDocument = InterviewTemplate & Document;

@Schema({ timestamps: true })
export class InterviewTemplate extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  roleType: string;

  @Prop({ default: 0 })
  version: number;

  @Prop({ required: true })
  createdBy: Types.ObjectId; // HR's ID
}