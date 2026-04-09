import { Response } from "express";
import { Application } from "../models/Application";
import { Job } from "../models/Job";
import { User } from "../models/User";
import { createEmptyTalentProfile } from "../models/talentProfile";
import { getParserVersion, parseCvDocument } from "../services/cvService";
import { AuthenticatedRequest } from "../types/express";
import { mergeTalentProfiles, normalizeTalentProfile } from "../utils/normalizeCandidateData";
import { AppError } from "../utils/errors";
import { applicantProfileSchema, applyToJobSchema } from "../validation/schemas";

const parseProfileField = (value: unknown) => {
  if (!value) {
    return undefined;
  }

  if (typeof value === "string") {
    return JSON.parse(value);
  }

  return value;
};

export const applyToJob = async (req: AuthenticatedRequest, res: Response) => {
  const applicantId = req.user?.id;
  const file = req.file;
  const payload = applyToJobSchema.parse({
    ...req.body,
    talentProfile: parseProfileField(req.body.talentProfile)
  });

  if (!file && !payload.talentProfile) {
    throw new AppError("Provide either structured talent profile data or a CV upload", 400);
  }

  const job = await Job.findById(payload.jobId);
  if (!job) {
    throw new AppError("Job not found", 404);
  }

  const applicant = await User.findById(applicantId).select("-password");
  if (!applicant) {
    throw new AppError("Applicant not found", 404);
  }

  const existingApplication = await Application.findOne({ applicant: applicantId, job: payload.jobId });
  if (existingApplication) {
    throw new AppError("You have already applied to this job", 409);
  }

  const parsedDocument = file
    ? await parseCvDocument(file.path, file.originalname)
    : {
        cvText: "",
        cvFileType: "pdf" as const,
        talentProfile: createEmptyTalentProfile(),
        parseConfidence: 0
      };

  const normalizedStructuredProfile = payload.talentProfile
    ? normalizeTalentProfile(payload.talentProfile)
    : createEmptyTalentProfile();
  const normalizedUserProfile = normalizeTalentProfile(applicant.profile);
  const mergedTalentProfile = mergeTalentProfiles(
    normalizedUserProfile,
    normalizedStructuredProfile,
    parsedDocument.talentProfile,
    {
      basicInfo: {
        ...createEmptyTalentProfile().basicInfo,
        email: applicant.email
      }
    }
  );

  const application = await Application.create({
    applicant: applicantId,
    job: payload.jobId,
    cvFileName: file?.filename || "structured-profile-only",
    cvFileUrl: file ? `/uploads/${file.filename}` : "",
    cvFileType: parsedDocument.cvFileType,
    cvText: parsedDocument.cvText,
    talentProfile: mergedTalentProfile,
    normalizedProfile: mergedTalentProfile,
    extractedData: {
      rawText: parsedDocument.cvText,
      parseConfidence: parsedDocument.parseConfidence,
      parserVersion: getParserVersion()
    }
  });

  return res.status(201).json(await Application.findById(application._id).populate("job"));
};

export const getApplicationsForJob = async (req: AuthenticatedRequest, res: Response) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) {
    throw new AppError("Job not found", 404);
  }

  if (job.recruiter.toString() !== req.user?.id) {
    throw new AppError("Forbidden", 403);
  }

  const applications = await Application.find({ job: req.params.jobId })
    .populate("applicant", "-password")
    .sort({ createdAt: -1 });

  return res.json(applications);
};

export const getApplicantApplications = async (req: AuthenticatedRequest, res: Response) => {
  const applications = await Application.find({ applicant: req.user?.id })
    .populate("job")
    .sort({ createdAt: -1 });

  return res.json(applications);
};

export const updateApplicantProfile = async (req: AuthenticatedRequest, res: Response) => {
  const profile = applicantProfileSchema.parse(req.body);
  const normalizedProfile = normalizeTalentProfile(profile);

  const user = await User.findByIdAndUpdate(
    req.user?.id,
    { $set: { profile: normalizedProfile } },
    { new: true }
  ).select("-password");

  return res.json(user);
};
