export type UserRole = "recruiter" | "applicant";

export interface UserProfile {
  name: string;
  skills: string[];
  experience: string;
  education: string;
}

export interface User {
  _id: string;
  email: string;
  role: UserRole;
  profile?: UserProfile;
}

export interface Job {
  _id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  experienceLevel: string;
  education: string;
  eligibility: string;
  jobType: string;
  createdAt: string;
}

export interface Application {
  _id: string;
  job: Job;
  applicant?: User;
  cvFileUrl: string;
  status: string;
  aiBreakdown?: {
    weightedScore: number;
    skillScore: number;
    experienceScore: number;
    educationScore: number;
    relevanceScore: number;
  };
}

export interface RankedCandidate {
  applicationId: string;
  applicantId: string;
  name: string;
  rank: number;
  score: number;
  strengths: string[];
  gaps: string[];
  recommendation: string;
  whyBetterThanNext: string;
  skillGapSuggestions: string[];
  topSkills: string[];
  weightedScore: number;
}

export interface ScreeningResult {
  _id: string;
  job: string;
  topCount: number;
  rankedCandidates: RankedCandidate[];
  model: string;
}
