export type UserRole = "recruiter" | "applicant";

export interface BasicInfo {
  firstName: string;
  lastName: string;
  email: string;
  headline: string;
  bio: string;
  location: string;
}

export interface SkillProfileItem {
  name: string;
  level: string;
  yearsOfExperience: number;
}

export interface LanguageProfileItem {
  name: string;
  proficiency: string;
}

export interface ExperienceProfileItem {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  technologies: string[];
  isCurrent: boolean;
}

export interface EducationProfileItem {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number | null;
  endYear: number | null;
}

export interface CertificationProfileItem {
  name: string;
  issuer: string;
  issueDate: string;
  expirationDate: string;
  credentialId: string;
}

export interface ProjectProfileItem {
  name: string;
  description: string;
  technologies: string[];
  role: string;
  url: string;
}

export interface AvailabilityProfile {
  status: string;
  startDate: string;
  notes: string;
}

export interface SocialLinkProfileItem {
  platform: string;
  url: string;
}

export interface TalentProfile {
  basicInfo: BasicInfo;
  skills: SkillProfileItem[];
  languages: LanguageProfileItem[];
  experience: ExperienceProfileItem[];
  education: EducationProfileItem[];
  certifications: CertificationProfileItem[];
  projects: ProjectProfileItem[];
  availability: AvailabilityProfile;
  socialLinks: SocialLinkProfileItem[];
}

export const emptyTalentProfile = (): TalentProfile => ({
  basicInfo: {
    firstName: "",
    lastName: "",
    email: "",
    headline: "",
    bio: "",
    location: ""
  },
  skills: [],
  languages: [],
  experience: [],
  education: [],
  certifications: [],
  projects: [],
  availability: {
    status: "",
    startDate: "",
    notes: ""
  },
  socialLinks: []
});

export interface User {
  _id: string;
  email: string;
  role: UserRole;
  profile?: TalentProfile;
}

export interface Job {
  _id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  preferredCertifications: string[];
  projectKeywords: string[];
  availabilityRequirement: string;
  experienceLevel: string;
  education: string;
  eligibility: string;
  jobType: string;
  createdAt: string;
}

export interface Application {
  _id: string;
  job: Job | string | null;
  applicant?: User;
  cvFileUrl: string;
  cvFileType?: "pdf" | "csv";
  talentProfile: TalentProfile;
  normalizedProfile: TalentProfile;
  extractedData?: {
    rawText: string;
    parseConfidence: number;
    parserVersion: string;
  };
  status: string;
  aiBreakdown?: {
    weightedScore: number;
    skillsMatch: number;
    experience: number;
    projects: number;
    education: number;
    certifications: number;
    availability: number;
  };
}

export interface RankedCandidate {
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
  whyBetterThanNext: string;
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

export interface ScreeningResult {
  _id: string;
  job: string;
  topCount: number;
  rankedCandidates: RankedCandidate[];
  aiModel: string;
  fairnessSummary: string;
  insights: {
    applicantCount: number;
    shortlistedCount: number;
    averageScore: number;
    averageWeightedScore: number;
    mostRequestedSkills: string[];
    topSkillsDistribution: Array<{
      skill: string;
      count: number;
    }>;
  };
}
