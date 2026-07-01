export interface VideoAnalysisRequest {
  video_urls: string[];
  videoS3Keys: string[];
  user_id: string;
  whisper_model?: string;
}

export interface VideoAnalysisResponse {
  user_id: string;
  videos: VideoAnalysisResult[];
  conclusion: string;
  overall_interview_score: number;
  identity_verification: {
    is_same_person: boolean;
    confidence: string;
    pairwise_similarity: number[];
    flagged_videos: string[];
  };
  warning: string | null;
  feedback: {
    candidate_id: string;
    generated_at: string;
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
  feedback_error: string | null;
}

export interface VideoAnalysisResult {
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
}
