import { Response } from "express";
import { Application } from "../models/Application";
import { Job } from "../models/Job";
import { ScreeningResult } from "../models/ScreeningResult";
import { IUser } from "../models/User";
import { analyzeCandidatesWithGemini } from "../services/geminiService";
import { AuthenticatedRequest } from "../types/express";
import { buildCandidatePayload } from "../utils/scoreCandidates";

export const analyzeCandidates = async (req: AuthenticatedRequest, res: Response) => {
  const { jobId, topCount = 10 } = req.body;
  const job = await Job.findById(jobId);

  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  if (job.recruiter.toString() !== req.user?.id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const applications = await Application.find({ job: jobId }).populate("applicant");
  if (!applications.length) {
    return res.status(400).json({ message: "No applicants to analyze" });
  }

  const candidatePayload = buildCandidatePayload(job, applications as Array<typeof applications[number] & { applicant: IUser }>);
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
    topCount
  );

  const rankedCandidates = geminiResult.ranked
    .sort((a, b) => a.rank - b.rank)
    .slice(0, topCount)
    .map((candidate, index, array) => {
      const matchedPayload = candidatePayload.find((item) => item.name === candidate.name)
        || candidatePayload.find((item) => item.email.toLowerCase().includes(candidate.name.toLowerCase()));

      if (!matchedPayload) {
        throw new Error(`Unable to match Gemini result for ${candidate.name}`);
      }

      const nextCandidate = array[index + 1];
      const whyBetterThanNext = nextCandidate
        ? `${candidate.name} is ranked above ${nextCandidate.name} due to stronger alignment on required skills, weighted score, and overall fit.`
        : "Top-ranked candidate with the strongest overall profile for this shortlist.";

      const skillGapSuggestions = matchedPayload.skills.length
        ? job.requiredSkills.filter((skill) => !matchedPayload.skills.map((item) => item.toLowerCase()).includes(skill.toLowerCase()))
        : job.requiredSkills;

      return {
        applicationId: matchedPayload.applicationId,
        applicantId: matchedPayload.applicantId,
        name: candidate.name,
        rank: candidate.rank,
        score: candidate.score,
        strengths: candidate.strengths,
        gaps: candidate.gaps,
        recommendation: candidate.recommendation,
        whyBetterThanNext,
        skillGapSuggestions,
        topSkills: matchedPayload.skills.slice(0, 5),
        weightedScore: matchedPayload.computed.weightedScore
      };
    });

  await Promise.all(
    candidatePayload.map((candidate) =>
      Application.findByIdAndUpdate(candidate.applicationId, {
        $set: {
          status: rankedCandidates.some((item) => item.applicationId === candidate.applicationId) ? "shortlisted" : "screened",
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
      topCount,
      rankedCandidates,
      aiModel: geminiResult.model
    },
    { upsert: true, new: true }
  );

  return res.json(savedResult);
};

export const getScreeningResult = async (req: AuthenticatedRequest, res: Response) => {
  const result = await ScreeningResult.findOne({ job: req.params.jobId });

  if (!result) {
    return res.status(404).json({ message: "No screening result found for this job" });
  }

  return res.json(result);
};
