export interface JobMatchJobInput {
  job_id: string;
  description: string;
  required_skills: string[];
}

export interface JobMatchRequest {
  cv_url: string;
  jobs: JobMatchJobInput[];
}

export interface JobMatchRecommendation {
  job_id: string;
  match_score: number;
  matched_skills: string[];
}

export interface JobMatchResponse {
  recommendations: JobMatchRecommendation[];
}

export interface JobMatchCallContext {
  trigger: 'create_job' | 'candidate_cv_upload' | 'candidate_signup';
  candidateId: string;
  jobIds: string[];
}
