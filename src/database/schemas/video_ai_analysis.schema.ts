import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VideoAiAnalysisDocument = VideoAiAnalysis & Document;

@Schema({ timestamps: true })
export class VideoAiAnalysis extends Document {
  @Prop({ required: true })
  applicationId: Types.ObjectId;

  @Prop({ required: true })
  candidateId: Types.ObjectId;

  @Prop({ type: [Object] })
  videos: Array<{
    video_url: string;
    videoS3Key: string;
    transcription: string;
    body_language: {
      scores: {
        eye_contact_score: number;
        expression_stability: number;
        head_movement_score: number;
        confidence_score: number;
        dominant_emotion: string;
        overall_body_score: number;
      };
    };
    audio: {
      english_level: string;
      english_level_score: number;
      speech_score: number;
      audio_score: number;
      nlp_score: number;
      words_per_minute: number;
      filler_ratio: number;
      grammar_error_rate: number;
    };
    overall_interview_score: number;
  }>;

  @Prop()
  conclusion?: string;

  @Prop()
  overallInterviewScore?: number;

  @Prop({ type: Object })
  identityVerification?: {
    is_same_person: boolean;
    confidence: string;
    pairwise_similarity: number[];
    flagged_videos: string[];
  };

  @Prop()
  warning?: string;

  @Prop({ type: Object })
  feedback?: {
    candidate_id: string;
    generated_at: Date;
    videos_analyzed: number;
    generated_by: string;
    llm_provider_used: string;
    overall: {
      score: number;
      tier: string;
      tier_label: string;
    };
    strengths: Array<{
      metric: string;
      score: number;
      explanation: string;
    }>;
    weaknesses: Array<{
      metric: string;
      score: number;
      severity: string;
      explanation: string;
      improvement_tip: string;
    }>;
    summary: string;
  };

  @Prop()
  feedbackError?: string;
}

export const VideoAiAnalysisSchema =
  SchemaFactory.createForClass(VideoAiAnalysis);

