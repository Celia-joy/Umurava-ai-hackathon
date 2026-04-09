import { z } from "zod";

const profileSchema = z.object({
  name: z.string().trim().min(2).max(120),
  skills: z.array(z.string().trim().min(1).max(60)).max(50).default([]),
  experience: z.string().trim().max(4000).default(""),
  education: z.string().trim().max(2000).default("")
});

export const registerSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6).max(128),
  role: z.enum(["recruiter", "applicant"]),
  profile: profileSchema.partial().optional()
}).superRefine((value, ctx) => {
  if (value.role === "applicant" && (!value.profile || !value.profile.name)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["profile", "name"],
      message: "Applicant profile name is required"
    });
  }
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1)
});

export const updateProfileSchema = z.object({
  profile: profileSchema
});

export const applicantProfileSchema = profileSchema;

export const createJobSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(20).max(5000),
  requiredSkills: z.array(z.string().trim().min(1).max(60)).min(1).max(30),
  experienceLevel: z.string().trim().min(2).max(160),
  education: z.string().trim().min(2).max(200),
  eligibility: z.string().trim().min(2).max(500),
  jobType: z.string().trim().min(2).max(80)
});

export const analyzeCandidatesSchema = z.object({
  jobId: z.string().trim().min(1),
  topCount: z.coerce.number().int().min(1).max(100).default(10)
});

export const applyToJobSchema = z.object({
  jobId: z.string().trim().min(1)
});
