import mongoose, { Document, Schema } from "mongoose";

export interface IRankedCandidate {
  applicationId: string;
  applicantId: string;
  name: string;
  headline: string;
  rank: number;
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  gaps: string[];
  recommendation: string;
  whySelected: string;
  whyNotSelected: string;
  comparisonInsight: string;
  whyBetterThanNext?: string;
  fairnessNotes: string;
  skillGapSuggestions: string[];
  topSkills: string[];
  weightedScore: number;
  componentScores: {
    skillsMatch: number;
    experience: number;
    projects: number;
    education: number;
    certifications: number;
    availability: number;
  };
}

export interface IInsightsSummary {
  applicantCount: number;
  shortlistedCount: number;
  averageScore: number;
  averageWeightedScore: number;
  mostRequestedSkills: string[];
  topSkillsDistribution: Array<{
    skill: string;
    count: number;
  }>;
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
    headline: { type: String, default: "" },
    rank: { type: Number, required: true },
    score: { type: Number, required: true },
    matchedSkills: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
    strengths: { type: [String], default: [] },
    gaps: { type: [String], default: [] },
    recommendation: { type: String, default: "" },
    whySelected: { type: String, default: "" },
    whyNotSelected: { type: String, default: "" },
    comparisonInsight: { type: String, default: "" },
    whyBetterThanNext: { type: String, default: "" },
    fairnessNotes: { type: String, default: "" },
    skillGapSuggestions: { type: [String], default: [] },
    topSkills: { type: [String], default: [] },
    weightedScore: { type: Number, required: true },
    componentScores: {
      type: new Schema(
        {
          skillsMatch: { type: Number, default: 0 },
          experience: { type: Number, default: 0 },
          projects: { type: Number, default: 0 },
          education: { type: Number, default: 0 },
          certifications: { type: Number, default: 0 },
          availability: { type: Number, default: 0 }
        },
        { _id: false }
      ),
      default: () => ({})
    }
  },
  { _id: false }
);

const insightsSchema = new Schema<IInsightsSummary>(
  {
    applicantCount: { type: Number, default: 0 },
    shortlistedCount: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    averageWeightedScore: { type: Number, default: 0 },
    mostRequestedSkills: { type: [String], default: [] },
    topSkillsDistribution: {
      type: [
        new Schema(
          {
            skill: { type: String, default: "" },
            count: { type: Number, default: 0 }
          },
          { _id: false }
        )
      ],
      default: []
    }
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
