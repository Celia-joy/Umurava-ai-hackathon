import { Response } from "express";
import { Application, IApplication } from "../models/Application";
import { Job } from "../models/Job";
import { ScreeningResult } from "../models/ScreeningResult";
import { IUser } from "../models/User";
import { analyzeCandidatesWithGemini } from "../services/geminiService";
import { AuthenticatedRequest } from "../types/express";
import { buildCandidatePayload, buildSkillsDistribution } from "../utils/scoreCandidates";
import { AppError } from "../utils/errors";

const normalizeValue = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const average = (values: number[]) => values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;

export const analyzeCandidates = async (req: AuthenticatedRequest, res: Response) => {

  // let us use try catch block for error handling
  try {
    const { jobId, topCount = 10 } = req.body;
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

    const validApplications = applications.filter((application) =>
      Boolean(application.applicant && typeof application.applicant === "object" && "email" in application.applicant)
    ) as unknown as Array<IApplicationWithApplicant>;

    if (!validApplications.length) {
      throw new AppError("No valid applicant profiles are available for analysis", 400);
    }

    const candidatePayload = buildCandidatePayload(job, validApplications);
    const shortlistSize = Math.min(Number(topCount), candidatePayload.length);
    const geminiResult = await analyzeCandidatesWithGemini(
      {
        title: job.title,
        description: job.description,
        requiredSkills: job.requiredSkills,
        preferredCertifications: job.preferredCertifications,
        projectKeywords: job.projectKeywords,
        availabilityRequirement: job.availabilityRequirement,
        experienceLevel: job.experienceLevel,
        education: job.education,
        eligibility: job.eligibility,
        jobType: job.jobType
      },
      candidatePayload
    );

    const rankedCandidates = geminiResult.ranked
      .sort((a, b) => a.rank - b.rank)
      .map((candidate, index, array) => {
        const matchedPayload = candidate.applicationId
          ? candidatePayload.find((item) => item.applicationId === candidate.applicationId)
          : candidatePayload.find((item) => normalizeValue(item.name) === normalizeValue(candidate.name));

        if (!matchedPayload) {
          throw new AppError(`Unable to match Gemini result for ${candidate.name}`, 500);
        }

        const nextCandidate = array[index + 1];
        const comparisonInsight = candidate.comparisonInsight
          || (nextCandidate
            ? `${candidate.name} ranks above ${nextCandidate.name} because the weighted scoring and profile evidence show stronger role alignment.`
            : `${candidate.name} leads the shortlist based on the strongest overall evidence.`);

        return {
          applicationId: matchedPayload.applicationId,
          applicantId: matchedPayload.applicantId,
          name: matchedPayload.name,
          headline: matchedPayload.headline,
          rank: index + 1,
          score: candidate.score,
          matchedSkills: matchedPayload.matchedSkills,
          missingSkills: matchedPayload.missingSkills,
          strengths: candidate.strengths,
          gaps: candidate.gaps,
          recommendation: candidate.recommendation,
          whySelected: candidate.strengths.join(" "),
          whyNotSelected: candidate.gaps.join(" ") || "No critical gaps were highlighted beyond normal trade-offs.",
          comparisonInsight,
          whyBetterThanNext: comparisonInsight,
          fairnessNotes: "Ranking is based on job-related evidence from skills, experience, projects, education, certifications, and availability only.",
          skillGapSuggestions: matchedPayload.missingSkills.length ? matchedPayload.missingSkills : job.requiredSkills.slice(0, 3),
          topSkills: matchedPayload.talentProfile.skills.map((item) => item.name).slice(0, 5),
          weightedScore: matchedPayload.computed.weightedScore,
          componentScores: matchedPayload.computed
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
        fairnessSummary: "The ranking combines deterministic weights with Gemini explanations, and the AI is instructed to evaluate candidates fairly using job-relevant evidence only.",
        insights: {
          applicantCount: candidatePayload.length,
          shortlistedCount: shortlistSize,
          averageScore: average(rankedCandidates.map((candidate) => candidate.score)),
          averageWeightedScore: average(candidatePayload.map((candidate) => candidate.computed.weightedScore)),
          mostRequestedSkills: job.requiredSkills.slice(0, 6),
          topSkillsDistribution: buildSkillsDistribution(candidatePayload)
        }
      },
      { upsert: true, new: true }
    );

    return res.json(savedResult);

  } catch (err) {
    console.error(err);
    throw new AppError("Failed to analyze candidates", 500);
  }
};

export const getScreeningResult = async (req: AuthenticatedRequest, res: Response) => {
  try {
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

  } catch (err) {
    console.error(err);
    throw new AppError("Failed to fetch screening result", 500);
  }

};

type IApplicationWithApplicant = IApplication & { applicant: IUser };
