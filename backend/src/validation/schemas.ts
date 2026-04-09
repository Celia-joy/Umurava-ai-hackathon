import { z } from "zod";

const stringField = (max: number) => z.string().trim().max(max).default("");
const requiredStringField = (min: number, max: number) => z.string().trim().min(min).max(max);

export const talentProfileSchema = z.object({
  basicInfo: z.object({
    firstName: stringField(80),
    lastName: stringField(80),
    email: z.string().trim().email().or(z.literal("")).default(""),
    headline: stringField(160),
    bio: stringField(3000),
    location: stringField(160)
  }).default({
    firstName: "",
    lastName: "",
    email: "",
    headline: "",
    bio: "",
    location: ""
  }),
  skills: z.array(
    z.object({
      name: stringField(80),
      level: stringField(40),
      yearsOfExperience: z.coerce.number().min(0).max(60).default(0)
    })
  ).max(80).default([]),
  languages: z.array(
    z.object({
      name: stringField(80),
      proficiency: stringField(40)
    })
  ).max(30).default([]),
  experience: z.array(
    z.object({
      company: stringField(160),
      role: stringField(160),
      startDate: stringField(40),
      endDate: stringField(40),
      description: stringField(3000),
      technologies: z.array(stringField(80)).max(40).default([]),
      isCurrent: z.boolean().default(false)
    })
  ).max(40).default([]),
  education: z.array(
    z.object({
      institution: stringField(160),
      degree: stringField(160),
      fieldOfStudy: stringField(160),
      startYear: z.coerce.number().int().min(1900).max(2200).nullable().default(null),
      endYear: z.coerce.number().int().min(1900).max(2200).nullable().default(null)
    })
  ).max(20).default([]),
  certifications: z.array(
    z.object({
      name: stringField(160),
      issuer: stringField(160),
      issueDate: stringField(40),
      expirationDate: stringField(40),
      credentialId: stringField(120)
    })
  ).max(30).default([]),
  projects: z.array(
    z.object({
      name: stringField(160),
      description: stringField(3000),
      technologies: z.array(stringField(80)).max(40).default([]),
      role: stringField(160),
      url: stringField(500)
    })
  ).max(40).default([]),
  availability: z.object({
    status: stringField(80),
    startDate: stringField(40),
    notes: stringField(500)
  }).default({
    status: "",
    startDate: "",
    notes: ""
  }),
  socialLinks: z.array(
    z.object({
      platform: stringField(80),
      url: stringField(500)
    })
  ).max(20).default([])
});

export const registerSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6).max(128),
  role: z.enum(["recruiter", "applicant"]),
  profile: talentProfileSchema.optional()
}).superRefine((value, ctx) => {
  if (value.role === "applicant") {
    const firstName = value.profile?.basicInfo.firstName?.trim();
    const lastName = value.profile?.basicInfo.lastName?.trim();

    if (!firstName || !lastName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["profile", "basicInfo"],
        message: "Applicant basic info requires firstName and lastName"
      });
    }
  }
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1)
});

export const updateProfileSchema = z.object({
  profile: talentProfileSchema
});

export const applicantProfileSchema = talentProfileSchema;

export const createJobSchema = z.object({
  title: requiredStringField(3, 160),
  description: requiredStringField(20, 5000),
  requiredSkills: z.array(requiredStringField(1, 60)).min(1).max(30),
  preferredCertifications: z.array(stringField(120)).max(20).default([]),
  projectKeywords: z.array(stringField(120)).max(20).default([]),
  availabilityRequirement: stringField(160),
  experienceLevel: requiredStringField(2, 160),
  education: requiredStringField(2, 200),
  eligibility: requiredStringField(2, 500),
  jobType: requiredStringField(2, 80)
});

export const analyzeCandidatesSchema = z.object({
  jobId: z.string().trim().min(1),
  topCount: z.coerce.number().int().min(1).max(100).default(10)
});

export const applyToJobSchema = z.object({
  jobId: z.string().trim().min(1),
  talentProfile: talentProfileSchema.optional()
});
