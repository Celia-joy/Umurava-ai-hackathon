import mongoose, { Document, Schema } from "mongoose";

export interface IRankedCandidate {
  applicationId: string;
  applicantId: string;
  name: string;
  rank: number;
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  gaps: string[];
  recommendation: string;
  whySelected: string;
  whyNotSelected: string;
  whyBetterThanNext?: string;
  fairnessNotes: string;
  skillGapSuggestions: string[];
  topSkills: string[];
  weightedScore: number;
}

export interface IInsightsSummary {
  applicantCount: number;
  shortlistedCount: number;
  averageScore: number;
  averageWeightedScore: number;
  mostRequestedSkills: string[];
}

export interface IScreeningResult extends Document {
  job: mongoose.Types.ObjectId;
  recruiter: mongoose.Types.ObjectId;
  topCount: number;
  rankedCandidates: IRankedCandidate[];
  aiModel: string;
  fairnessSummary: string;
  insights: IInsightsSummary;
}

const rankedCandidateSchema = new Schema<IRankedCandidate>(
  {
    applicationId: { type: String, required: true },
    applicantId: { type: String, required: true },
    name: { type: String, required: true },
    rank: { type: Number, required: true },
    score: { type: Number, required: true },
    matchedSkills: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
    strengths: { type: [String], default: [] },
    gaps: { type: [String], default: [] },
    recommendation: { type: String, default: "" },
    whySelected: { type: String, default: "" },
    whyNotSelected: { type: String, default: "" },
    whyBetterThanNext: { type: String, default: "" },
    fairnessNotes: { type: String, default: "" },
    skillGapSuggestions: { type: [String], default: [] },
    topSkills: { type: [String], default: [] },
    weightedScore: { type: Number, required: true }
  },
  { _id: false }
);

const insightsSchema = new Schema<IInsightsSummary>(
  {
    applicantCount: { type: Number, default: 0 },
    shortlistedCount: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    averageWeightedScore: { type: Number, default: 0 },
    mostRequestedSkills: { type: [String], default: [] }
  },
  { _id: false }
);

const screeningResultSchema = new Schema<IScreeningResult>(
  {
    job: { type: Schema.Types.ObjectId, ref: "Job", required: true, unique: true },
    recruiter: { type: Schema.Types.ObjectId, ref: "User", required: true },
    topCount: { type: Number, required: true },
    rankedCandidates: { type: [rankedCandidateSchema], default: [] },
    aiModel: { type: String, default: "gemini-2.0-flash" },
    fairnessSummary: { type: String, default: "" },
    insights: { type: insightsSchema, default: () => ({}) }
  },
  { timestamps: true }
);

export const ScreeningResult = mongoose.model<IScreeningResult>("ScreeningResult", screeningResultSchema);
