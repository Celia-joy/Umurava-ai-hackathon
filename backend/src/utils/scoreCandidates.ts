import { IApplication } from "../models/Application";
import { IJob } from "../models/Job";
import { IUser } from "../models/User";

export interface CandidatePayload {
  applicationId: string;
  applicantId: string;
  name: string;
  email: string;
  headline: string;
  talentProfile: IApplication["normalizedProfile"];
  summary: string;
  computed: {
    weightedScore: number;
    skillsMatch: number;
    experience: number;
    projects: number;
    education: number;
    certifications: number;
    availability: number;
  };
  matchedSkills: string[];
  missingSkills: string[];
}

const normalizeToken = (value: string) => value.toLowerCase().replace(/[^a-z0-9+#./]+/g, " ").trim();
const tokenize = (value: string) => normalizeToken(value).split(/\s+/).filter(Boolean);
const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean)));

const scoreOverlap = (required: string[], actual: string[]) => {
  const requiredSet = new Set(required.map(normalizeToken).filter(Boolean));
  const actualSet = new Set(actual.map(normalizeToken).filter(Boolean));

  if (!requiredSet.size) {
    return 100;
  }

  let matches = 0;
  requiredSet.forEach((value) => {
    if (actualSet.has(value)) {
      matches += 1;
    }
  });

  return Math.round((matches / requiredSet.size) * 100);
};

const scoreTextSimilarity = (source: string, target: string) => {
  const sourceTokens = new Set(tokenize(source));
  const targetTokens = new Set(tokenize(target));

  if (!sourceTokens.size) {
    return 100;
  }

  let matches = 0;
  sourceTokens.forEach((token) => {
    if (targetTokens.has(token)) {
      matches += 1;
    }
  });

  return Math.round((matches / sourceTokens.size) * 100);
};

const inferExperienceYears = (application: IApplication) =>
  application.normalizedProfile.skills.reduce(
    (maxYears, skill) => Math.max(maxYears, skill.yearsOfExperience || 0),
    0
  );

const getProfileText = (application: IApplication) => {
  const profile = application.normalizedProfile;
  return [
    profile.basicInfo.headline,
    profile.basicInfo.bio,
    profile.experience.map((item) => `${item.role} ${item.company} ${item.description} ${item.technologies.join(" ")}`).join(" "),
    profile.projects.map((item) => `${item.name} ${item.role} ${item.description} ${item.technologies.join(" ")}`).join(" "),
    profile.education.map((item) => `${item.degree} ${item.fieldOfStudy} ${item.institution}`).join(" "),
    profile.certifications.map((item) => `${item.name} ${item.issuer}`).join(" "),
    application.cvText
  ].join(" ");
};

const parseTargetYears = (value: string) => {
  const matches = value.match(/\d+/g) || [];
  if (!matches.length) {
    return 0;
  }

  return Math.max(...matches.map(Number));
};

const computeAvailabilityScore = (candidateAvailability: string, jobRequirement: string) => {
  if (!jobRequirement.trim()) {
    return candidateAvailability.trim() ? 90 : 70;
  }

  const normalizedCandidate = normalizeToken(candidateAvailability);
  const normalizedJob = normalizeToken(jobRequirement);

  if (!normalizedCandidate) {
    return 50;
  }

  if (normalizedCandidate.includes("immediate") && normalizedJob.includes("immediate")) {
    return 100;
  }

  return scoreTextSimilarity(jobRequirement, candidateAvailability);
};

export const buildCandidatePayload = (
  job: IJob,
  applications: Array<IApplication & { applicant: IUser }>
): CandidatePayload[] => {
  return applications.map((application) => {
    const profile = application.normalizedProfile;
    const skillNames = unique(profile.skills.map((item) => item.name));
    const matchedSkills = job.requiredSkills.filter((skill) =>
      skillNames.map(normalizeToken).includes(normalizeToken(skill))
    );
    const missingSkills = job.requiredSkills.filter((skill) =>
      !skillNames.map(normalizeToken).includes(normalizeToken(skill))
    );
    const profileText = getProfileText(application);
    const experienceYears = inferExperienceYears(application);
    const targetYears = parseTargetYears(job.experienceLevel);

    const skillsMatch = scoreOverlap(job.requiredSkills, skillNames);
    const experienceScore = targetYears
      ? Math.min(100, Math.round((Math.min(experienceYears, targetYears) / targetYears) * 100))
      : scoreTextSimilarity(job.experienceLevel, profileText);
    const projectKeywords = unique([...job.projectKeywords, ...job.requiredSkills]);
    const projectScore = scoreOverlap(
      projectKeywords,
      unique(profile.projects.flatMap((project) => [...project.technologies, project.name, project.description]))
    );
    const educationScore = scoreTextSimilarity(job.education, profile.education.map((item) => `${item.degree} ${item.fieldOfStudy}`).join(" "));
    const certificationScore = job.preferredCertifications.length
      ? scoreOverlap(job.preferredCertifications, profile.certifications.map((item) => item.name))
      : Math.min(100, profile.certifications.length * 25);
    const availabilityScore = computeAvailabilityScore(profile.availability.status, job.availabilityRequirement);
    const weightedScore = Math.round(
      skillsMatch * 0.4
      + experienceScore * 0.25
      + projectScore * 0.15
      + educationScore * 0.1
      + certificationScore * 0.05
      + availabilityScore * 0.05
    );

    const fullName = [profile.basicInfo.firstName, profile.basicInfo.lastName].filter(Boolean).join(" ")
      || application.applicant.email.split("@")[0];

    return {
      applicationId: application._id.toString(),
      applicantId: application.applicant._id.toString(),
      name: fullName,
      email: profile.basicInfo.email || application.applicant.email,
      headline: profile.basicInfo.headline,
      talentProfile: profile,
      summary: profileText.slice(0, 2000),
      matchedSkills,
      missingSkills,
      computed: {
        weightedScore,
        skillsMatch,
        experience: experienceScore,
        projects: projectScore,
        education: educationScore,
        certifications: certificationScore,
        availability: availabilityScore
      }
    };
  });
};

export const buildSkillsDistribution = (candidates: CandidatePayload[]) => {
  const counts = new Map<string, number>();

  candidates.forEach((candidate) => {
    candidate.talentProfile.skills.forEach((skill) => {
      counts.set(skill.name, (counts.get(skill.name) || 0) + 1);
    });
  });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([skill, count]) => ({ skill, count }));
};
