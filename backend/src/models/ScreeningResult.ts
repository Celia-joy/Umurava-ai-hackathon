import mongoose, { Document, Schema } from "mongoose";

export interface IRankedCandidate {
  applicationId: string;
  applicantId: string;
  name: string;
  rank: number;
  score: number;
  strengths: string[];
  gaps: string[];
  recommendation: string;
  whyBetterThanNext?: string;
  skillGapSuggestions: string[];
  topSkills: string[];
  weightedScore: number;
}

export interface IScreeningResult extends Document {
  job: mongoose.Types.ObjectId;
  recruiter: mongoose.Types.ObjectId;
  topCount: number;
  rankedCandidates: IRankedCandidate[];
  aiModel: string;
}

const rankedCandidateSchema = new Schema<IRankedCandidate>(
  {
    applicationId: { type: String, required: true },
    applicantId: { type: String, required: true },
    name: { type: String, required: true },
    rank: { type: Number, required: true },
    score: { type: Number, required: true },
    strengths: { type: [String], default: [] },
    gaps: { type: [String], default: [] },
    recommendation: { type: String, default: "" },
    whyBetterThanNext: { type: String, default: "" },
    skillGapSuggestions: { type: [String], default: [] },
    topSkills: { type: [String], default: [] },
    weightedScore: { type: Number, required: true }
  },
  { _id: false }
);

const screeningResultSchema = new Schema<IScreeningResult>(
  {
    job: { type: Schema.Types.ObjectId, ref: "Job", required: true, unique: true },
    recruiter: { type: Schema.Types.ObjectId, ref: "User", required: true },
    topCount: { type: Number, required: true },
    rankedCandidates: { type: [rankedCandidateSchema], default: [] },
    aiModel: { type: String, default: "gemini-1.5-flash" }
  },
  { timestamps: true }
);

export const ScreeningResult = mongoose.model<IScreeningResult>("ScreeningResult", screeningResultSchema);
