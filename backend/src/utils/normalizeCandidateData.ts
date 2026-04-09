import { createEmptyTalentProfile, ITalentProfile } from "../models/talentProfile";

const skillAliases: Record<string, string> = {
  js: "JavaScript",
  javascript: "JavaScript",
  ts: "TypeScript",
  typescript: "TypeScript",
  nodejs: "Node.js",
  "node js": "Node.js",
  node: "Node.js",
  expressjs: "Express",
  reactjs: "React",
  nextjs: "Next.js",
  "next js": "Next.js",
  mongodb: "MongoDB",
  mongo: "MongoDB",
  postgresql: "PostgreSQL",
  postgres: "PostgreSQL",
  sql: "SQL",
  html5: "HTML",
  css3: "CSS",
  tailwindcss: "Tailwind CSS",
  aws: "AWS",
  gcp: "GCP",
  uiux: "UI/UX",
  ui: "UI/UX",
  ux: "UI/UX"
};

const languageAliases: Record<string, string> = {
  english: "English",
  french: "French",
  kinyarwanda: "Kinyarwanda",
  swahili: "Swahili"
};

const titleCase = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

export const normalizeWhitespace = (value: string) => value.replace(/\s+/g, " ").trim();

const normalizeSkillName = (value: string) => {
  const normalized = normalizeWhitespace(value).toLowerCase().replace(/[^\w.+#/-]+/g, " ");
  return skillAliases[normalized] || titleCase(normalized);
};

const normalizeLanguageName = (value: string) => {
  const normalized = normalizeWhitespace(value).toLowerCase();
  return languageAliases[normalized] || titleCase(normalized);
};

const normalizeUrl = (value: string) => {
  const trimmed = normalizeWhitespace(value);
  if (!trimmed) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
};

const dedupeBy = <T>(items: T[], getKey: (item: T) => string) => {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = getKey(item);
    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

const combineTalentProfiles = (...profiles: Array<Partial<ITalentProfile> | undefined>): ITalentProfile => {
  const base = createEmptyTalentProfile();

  for (const profile of profiles) {
    if (!profile) {
      continue;
    }

    base.basicInfo = {
      ...base.basicInfo,
      ...profile.basicInfo,
      firstName: profile.basicInfo?.firstName || base.basicInfo.firstName,
      lastName: profile.basicInfo?.lastName || base.basicInfo.lastName,
      email: profile.basicInfo?.email || base.basicInfo.email,
      headline: profile.basicInfo?.headline || base.basicInfo.headline,
      bio: profile.basicInfo?.bio || base.basicInfo.bio,
      location: profile.basicInfo?.location || base.basicInfo.location
    };

    base.skills = [...base.skills, ...(profile.skills || [])];
    base.languages = [...base.languages, ...(profile.languages || [])];
    base.experience = [...base.experience, ...(profile.experience || [])];
    base.education = [...base.education, ...(profile.education || [])];
    base.certifications = [...base.certifications, ...(profile.certifications || [])];
    base.projects = [...base.projects, ...(profile.projects || [])];
    base.socialLinks = [...base.socialLinks, ...(profile.socialLinks || [])];
    base.availability = {
      ...base.availability,
      ...profile.availability,
      status: profile.availability?.status || base.availability.status,
      startDate: profile.availability?.startDate || base.availability.startDate,
      notes: profile.availability?.notes || base.availability.notes
    };
  }

  return base;
};

export const normalizeTalentProfile = (profile: Partial<ITalentProfile> | undefined): ITalentProfile => {
  const base = combineTalentProfiles(createEmptyTalentProfile(), profile);

  const normalized: ITalentProfile = {
    basicInfo: {
      firstName: titleCase(normalizeWhitespace(base.basicInfo.firstName)),
      lastName: titleCase(normalizeWhitespace(base.basicInfo.lastName)),
      email: normalizeWhitespace(base.basicInfo.email).toLowerCase(),
      headline: normalizeWhitespace(base.basicInfo.headline),
      bio: normalizeWhitespace(base.basicInfo.bio),
      location: normalizeWhitespace(base.basicInfo.location)
    },
    skills: dedupeBy(
      base.skills
        .map((item) => ({
          name: normalizeSkillName(item.name),
          level: normalizeWhitespace(item.level),
          yearsOfExperience: Number.isFinite(item.yearsOfExperience) ? Math.max(0, item.yearsOfExperience) : 0
        }))
        .filter((item) => item.name),
      (item) => item.name.toLowerCase()
    ),
    languages: dedupeBy(
      base.languages
        .map((item) => ({
          name: normalizeLanguageName(item.name),
          proficiency: normalizeWhitespace(item.proficiency)
        }))
        .filter((item) => item.name),
      (item) => item.name.toLowerCase()
    ),
    experience: dedupeBy(
      base.experience
        .map((item) => ({
          company: normalizeWhitespace(item.company),
          role: normalizeWhitespace(item.role),
          startDate: normalizeWhitespace(item.startDate),
          endDate: normalizeWhitespace(item.endDate),
          description: normalizeWhitespace(item.description),
          technologies: dedupeBy(
            (item.technologies || []).map((technology) => normalizeSkillName(technology)).filter(Boolean),
            (technology) => technology.toLowerCase()
          ),
          isCurrent: Boolean(item.isCurrent)
        }))
        .filter((item) => item.company || item.role || item.description),
      (item) => `${item.company.toLowerCase()}::${item.role.toLowerCase()}::${item.startDate}`
    ),
    education: dedupeBy(
      base.education
        .map((item) => ({
          institution: normalizeWhitespace(item.institution),
          degree: normalizeWhitespace(item.degree),
          fieldOfStudy: normalizeWhitespace(item.fieldOfStudy),
          startYear: item.startYear ?? null,
          endYear: item.endYear ?? null
        }))
        .filter((item) => item.institution || item.degree || item.fieldOfStudy),
      (item) => `${item.institution.toLowerCase()}::${item.degree.toLowerCase()}::${item.endYear || ""}`
    ),
    certifications: dedupeBy(
      base.certifications
        .map((item) => ({
          name: normalizeWhitespace(item.name),
          issuer: normalizeWhitespace(item.issuer),
          issueDate: normalizeWhitespace(item.issueDate),
          expirationDate: normalizeWhitespace(item.expirationDate),
          credentialId: normalizeWhitespace(item.credentialId)
        }))
        .filter((item) => item.name || item.issuer),
      (item) => `${item.name.toLowerCase()}::${item.issuer.toLowerCase()}`
    ),
    projects: dedupeBy(
      base.projects
        .map((item) => ({
          name: normalizeWhitespace(item.name),
          description: normalizeWhitespace(item.description),
          technologies: dedupeBy(
            (item.technologies || []).map((technology) => normalizeSkillName(technology)).filter(Boolean),
            (technology) => technology.toLowerCase()
          ),
          role: normalizeWhitespace(item.role),
          url: normalizeUrl(item.url)
        }))
        .filter((item) => item.name || item.description),
      (item) => `${item.name.toLowerCase()}::${item.role.toLowerCase()}`
    ),
    availability: {
      status: normalizeWhitespace(base.availability.status),
      startDate: normalizeWhitespace(base.availability.startDate),
      notes: normalizeWhitespace(base.availability.notes)
    },
    socialLinks: dedupeBy(
      base.socialLinks
        .map((item) => ({
          platform: titleCase(normalizeWhitespace(item.platform)),
          url: normalizeUrl(item.url)
        }))
        .filter((item) => item.platform || item.url),
      (item) => `${item.platform.toLowerCase()}::${item.url.toLowerCase()}`
    )
  };

  return normalized;
};

export const mergeTalentProfiles = (...profiles: Array<Partial<ITalentProfile> | undefined>): ITalentProfile =>
  normalizeTalentProfile(combineTalentProfiles(...profiles));
