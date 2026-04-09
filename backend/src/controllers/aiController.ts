import { Response } from "express";
import { Application } from "../models/Application";
import { Job } from "../models/Job";
import { ScreeningResult } from "../models/ScreeningResult";
import { IUser } from "../models/User";
import { analyzeCandidatesWithGemini } from "../services/geminiService";
import { AuthenticatedRequest } from "../types/express";
import { buildCandidatePayload } from "../utils/scoreCandidates";
import { AppError } from "../utils/errors";

const normalizeValue = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const average = (values: number[]) => values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;

export const analyzeCandidates = async (req: AuthenticatedRequest, res: Response) => {
  const { jobId, topCount = 10 } = req.body;
  const parsedTopCount = Number(topCount);
  const job = await Job.findById(jobId);

  if (!job) {
    throw new AppError("Job not found", 404);
  }

  if (job.recruiter.toString() !== req.user?.id) {
    throw new AppError("Forbidden", 403);
  }

  const applications = await Application.find({ job: jobId }).populate("applicant");
  if (!applications.length) {
    throw new AppError("No applicants to analyze", 400);
  }

  if (!Number.isFinite(parsedTopCount) || parsedTopCount <= 0) {
    throw new AppError("topCount must be a positive number", 400);
  }

  const candidatePayload = buildCandidatePayload(job, applications as Array<typeof applications[number] & { applicant: IUser }>);
  const shortlistSize = Math.min(Math.floor(parsedTopCount), candidatePayload.length);
  const geminiResult = await analyzeCandidatesWithGemini(
    {
      title: job.title,
      description: job.description,
      requiredSkills: job.requiredSkills,
      experienceLevel: job.experienceLevel,
      education: job.education,
      eligibility: job.eligibility,
      jobType: job.jobType
    },
    candidatePayload,
    shortlistSize
  );

  const rankedCandidates = geminiResult.ranked
    .sort((a, b) => a.rank - b.rank)
    .map((candidate, index, array) => {
      const normalizedCandidateName = normalizeValue(candidate.name);
      const matchedPayload = candidatePayload.find((item) => normalizeValue(item.name) === normalizedCandidateName)
        || candidatePayload.find((item) => normalizeValue(item.email) === normalizedCandidateName)
        || candidatePayload.find((item) => normalizeValue(item.email.split("@")[0]) === normalizedCandidateName)
        || candidatePayload.find((item) => normalizeValue(item.email).includes(normalizedCandidateName));

      if (!matchedPayload) {
        throw new AppError(`Unable to match Gemini result for ${candidate.name}`, 500);
      }

      const nextCandidate = array[index + 1];
      const whyBetterThanNext = nextCandidate
        ? `${candidate.name} is ranked above ${nextCandidate.name} due to stronger alignment on required skills, weighted score, and overall fit.`
        : "Top-ranked candidate with the strongest overall profile for this shortlist.";

      const matchedSkills = job.requiredSkills.filter((skill) => matchedPayload.skills.map((item) => item.toLowerCase()).includes(skill.toLowerCase()));
      const missingSkills = job.requiredSkills.filter((skill) => !matchedPayload.skills.map((item) => item.toLowerCase()).includes(skill.toLowerCase()));
      const skillGapSuggestions = missingSkills.length ? missingSkills : job.requiredSkills.slice(0, 3);
      const whySelected = candidate.whySelected
        || `Selected because ${candidate.name} matched ${matchedSkills.length} required skills and produced a weighted baseline score of ${matchedPayload.computed.weightedScore}.`;
      const isShortlisted = index < shortlistSize;
      const whyNotSelected = candidate.whyNotSelected
        || (isShortlisted
          ? `${candidate.name} still shows gaps in ${missingSkills.length ? missingSkills.slice(0, 3).join(", ") : "role-specific depth"}, but remains inside the shortlist.`
          : `${candidate.name} was not selected because competing candidates showed stronger alignment on required skills, experience, and overall fit.`);
      const fairnessNotes = "This review uses job-related evidence only and explicitly avoids protected-attribute assumptions in the Gemini prompt.";

      return {
        applicationId: matchedPayload.applicationId,
        applicantId: matchedPayload.applicantId,
        name: candidate.name,
        rank: candidate.rank,
        score: candidate.score,
        matchedSkills,
        missingSkills,
        strengths: candidate.strengths,
        gaps: candidate.gaps,
        recommendation: candidate.recommendation,
        whySelected,
        whyNotSelected,
        whyBetterThanNext,
        fairnessNotes,
        skillGapSuggestions,
        topSkills: matchedPayload.skills.slice(0, 5),
        weightedScore: matchedPayload.computed.weightedScore
      };
    });

  await Promise.all(
    candidatePayload.map((candidate) =>
      Application.findByIdAndUpdate(candidate.applicationId, {
        $set: {
          status: rankedCandidates.slice(0, shortlistSize).some((item) => item.applicationId === candidate.applicationId) ? "shortlisted" : "screened",
          aiBreakdown: candidate.computed
        }
      })
    )
  );

  const savedResult = await ScreeningResult.findOneAndUpdate(
    { job: jobId },
    {
      job: jobId,
      recruiter: req.user?.id,
      topCount: shortlistSize,
      rankedCandidates,
      aiModel: geminiResult.model,
      fairnessSummary: "Weighted scoring provides a deterministic baseline, while Gemini compares candidates using job-related evidence and bias-aware instructions.",
      insights: {
        applicantCount: candidatePayload.length,
        shortlistedCount: shortlistSize,
        averageScore: average(rankedCandidates.map((candidate) => candidate.score)),
        averageWeightedScore: average(candidatePayload.map((candidate) => candidate.computed.weightedScore)),
        mostRequestedSkills: job.requiredSkills.slice(0, 6)
      }
    },
    { upsert: true, new: true }
  );

  return res.json(savedResult);
};

export const getScreeningResult = async (req: AuthenticatedRequest, res: Response) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) {
    throw new AppError("Job not found", 404);
  }

  if (job.recruiter.toString() !== req.user?.id) {
    throw new AppError("Forbidden", 403);
  }

  const result = await ScreeningResult.findOne({ job: req.params.jobId });

  if (!result) {
    throw new AppError("No screening result found for this job", 404);
  }

  return res.json(result);
};
