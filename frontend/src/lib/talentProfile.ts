import { TalentProfile, emptyTalentProfile } from "./types";

export const createBlankProfile = () => emptyTalentProfile();

export const csvToList = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export const listToCsv = (values: string[]) => values.join(", ");

export const normalizeProfileForSubmit = (profile: TalentProfile): TalentProfile => ({
  ...profile,
  basicInfo: {
    ...profile.basicInfo,
    firstName: profile.basicInfo.firstName.trim(),
    lastName: profile.basicInfo.lastName.trim(),
    email: profile.basicInfo.email.trim(),
    headline: profile.basicInfo.headline.trim(),
    bio: profile.basicInfo.bio.trim(),
    location: profile.basicInfo.location.trim()
  },
  skills: profile.skills
    .map((item) => ({
      ...item,
      name: item.name.trim(),
      level: item.level.trim(),
      yearsOfExperience: Number(item.yearsOfExperience) || 0
    }))
    .filter((item) => item.name),
  languages: profile.languages
    .map((item) => ({
      ...item,
      name: item.name.trim(),
      proficiency: item.proficiency.trim()
    }))
    .filter((item) => item.name),
  experience: profile.experience
    .map((item) => ({
      ...item,
      company: item.company.trim(),
      role: item.role.trim(),
      startDate: item.startDate.trim(),
      endDate: item.endDate.trim(),
      description: item.description.trim(),
      technologies: item.technologies.map((technology) => technology.trim()).filter(Boolean)
    }))
    .filter((item) => item.company || item.role || item.description),
  education: profile.education
    .map((item) => ({
      ...item,
      institution: item.institution.trim(),
      degree: item.degree.trim(),
      fieldOfStudy: item.fieldOfStudy.trim(),
      startYear: item.startYear ? Number(item.startYear) : null,
      endYear: item.endYear ? Number(item.endYear) : null
    }))
    .filter((item) => item.institution || item.degree || item.fieldOfStudy),
  certifications: profile.certifications
    .map((item) => ({
      ...item,
      name: item.name.trim(),
      issuer: item.issuer.trim(),
      issueDate: item.issueDate.trim(),
      expirationDate: item.expirationDate.trim(),
      credentialId: item.credentialId.trim()
    }))
    .filter((item) => item.name || item.issuer),
  projects: profile.projects
    .map((item) => ({
      ...item,
      name: item.name.trim(),
      description: item.description.trim(),
      technologies: item.technologies.map((technology) => technology.trim()).filter(Boolean),
      role: item.role.trim(),
      url: item.url.trim()
    }))
    .filter((item) => item.name || item.description),
  availability: {
    ...profile.availability,
    status: profile.availability.status.trim(),
    startDate: profile.availability.startDate.trim(),
    notes: profile.availability.notes.trim()
  },
  socialLinks: profile.socialLinks
    .map((item) => ({
      ...item,
      platform: item.platform.trim(),
      url: item.url.trim()
    }))
    .filter((item) => item.platform || item.url)
});
