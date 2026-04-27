

import mongoose, { Schema, Document } from 'mongoose';
import { IScreeningResult } from '../types';

export interface IScreeningResultDocument extends Omit<IScreeningResult, '_id'>, Document {}

const ScoreBreakdownSchema = new Schema({
  skills:     { type: Number, required: true },
  experience: { type: Number, required: true },
  education:  { type: Number, required: true },
  relevance:  { type: Number, required: true },
}, { _id: false });

const CandidateScoreSchema = new Schema({
  applicantId:    { type: String, required: true },
  fullName:       { type: String, required: true },
  email:          { type: String, required: true },
  rank:           { type: Number, required: true },
  matchScore:     { type: Number, required: true, min: 0, max: 100 },
  scoreBreakdown: { type: ScoreBreakdownSchema, required: true },
  strengths:      { type: [String], required: true },
  gaps:           { type: [String], required: true },
  recommendation: {
    type: String,
    enum: ['strong_yes', 'yes', 'maybe', 'no'],
    required: true,
  },
  reasoning: { type: String, required: true },
}, { _id: false });

const ScreeningResultSchema = new Schema<IScreeningResultDocument>(
  {
    jobId:           { type: String, required: true, index: true },
    triggeredAt:     { type: Date, required: true },
    completedAt:     { type: Date },
    status:          { type: String, enum: ['pending', 'running', 'completed', 'failed'], default: 'pending' },
    totalApplicants: { type: Number, required: true },
    shortlistSize:   { type: Number, required: true },
    shortlist:       { type: [CandidateScoreSchema], default: [] },
    geminiModel:     { type: String, required: true },
    promptVersion:   { type: String, required: true },
    error:           { type: String },
  },
  { timestamps: true }
);

export const ScreeningResult = mongoose.model<IScreeningResultDocument>(
  'ScreeningResult',
  ScreeningResultSchema
);