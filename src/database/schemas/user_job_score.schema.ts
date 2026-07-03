import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserJobScoreDocument = UserJobScore & Document;

@Schema({ timestamps: { createdAt: false, updatedAt: true } })
export class UserJobScore extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Candidate' })
  candidateId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Job' })
  jobId: Types.ObjectId;

  @Prop({ required: true, min: 0, max: 100 })
  score: number;

  @Prop({ type: [String], default: [] })
  matchedSkills: string[];

  @Prop()
  updatedAt: Date;
}

export const UserJobScoreSchema = SchemaFactory.createForClass(UserJobScore);

UserJobScoreSchema.index({ candidateId: 1, jobId: 1 }, { unique: true });
UserJobScoreSchema.index({ candidateId: 1, score: -1 });
