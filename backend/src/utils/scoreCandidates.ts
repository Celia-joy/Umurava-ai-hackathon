import { IApplication } from "../models/Application";
import { IJob } from "../models/Job";
import { IUser } from "../models/User";

export interface CandidatePayload {
  applicationId: string;
  applicantId: string;
  name: string;
  email: string;
  skills: string[];
  experience: string;
  education: string;
  cvText: string;
  computed: {
    weightedScore: number;
    skillScore: number;
    experienceScore: number;
    educationScore: number;
    relevanceScore: number;
  };
}

const normalizeList = (value: string[]) => value.map((item) => item.toLowerCase().trim()).filter(Boolean);

const scoreOverlap = (required: string[], actual: string[]) => {
  const requiredSet = new Set(normalizeList(required));
  const actualSet = new Set(normalizeList(actual));

  if (requiredSet.size === 0) {
    return 100;
  }

  let matches = 0;
  requiredSet.forEach((skill) => {
    if (actualSet.has(skill)) {
      matches += 1;
    }
  });

  return Math.round((matches / requiredSet.size) * 100);
};

const scoreTextSimilarity = (source: string, target: string) => {
  const sourceTokens = new Set(source.toLowerCase().split(/\W+/).filter(Boolean));
  const targetTokens = new Set(target.toLowerCase().split(/\W+/).filter(Boolean));

  if (sourceTokens.size === 0) {
    return 50;
  }

  let matches = 0;
  sourceTokens.forEach((token) => {
    if (targetTokens.has(token)) {
      matches += 1;
    }
  });

  return Math.min(100, Math.round((matches / sourceTokens.size) * 100));
};

export const buildCandidatePayload = (
  job: IJob,
  applications: Array<IApplication & { applicant: IUser }>
): CandidatePayload[] => {
  return applications.map((application) => {
    const profile = application.applicant.profile;
    const skills = profile?.skills || [];
    const experience = profile?.experience || "";
    const education = profile?.education || "";

    const skillScore = scoreOverlap(job.requiredSkills, skills);
    const experienceScore = scoreTextSimilarity(job.experienceLevel, `${experience} ${application.cvText}`);
    const educationScore = scoreTextSimilarity(job.education, `${education} ${application.cvText}`);
    const relevanceScore = scoreTextSimilarity(
      `${job.title} ${job.description} ${job.eligibility}`,
      `${skills.join(" ")} ${experience} ${education} ${application.cvText}`
    );
    const weightedScore = Math.round(
      skillScore * 0.4 + experienceScore * 0.3 + educationScore * 0.2 + relevanceScore * 0.1
    );

    return {
      applicationId: application._id.toString(),
      applicantId: application.applicant._id.toString(),
      name: profile?.name || application.applicant.email.split("@")[0],
      email: application.applicant.email,
      skills,
      experience,
      education,
      cvText: application.cvText,
      computed: {
        weightedScore,
        skillScore,
        experienceScore,
        educationScore,
        relevanceScore
      }
    };
  });
};
