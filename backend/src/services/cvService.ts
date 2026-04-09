import fs from "fs/promises";
import path from "path";
import pdfParse from "pdf-parse";
import { createEmptyTalentProfile, ITalentProfile } from "../models/talentProfile";
import { normalizeTalentProfile, normalizeWhitespace } from "../utils/normalizeCandidateData";

const parserVersion = "talent-profile-v2";

const knownSkills = [
  "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Express", "MongoDB", "PostgreSQL", "SQL",
  "Python", "Java", "Docker", "Kubernetes", "AWS", "GCP", "Git", "Figma", "Tailwind CSS", "Redux",
  "GraphQL", "REST", "Machine Learning", "Data Analysis", "HTML", "CSS"
];

const knownLanguages = ["English", "French", "Kinyarwanda", "Swahili"];

const splitLines = (text: string) =>
  text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

const extractEmail = (text: string) => text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "";

const extractUrl = (line: string) => line.match(/https?:\/\/\S+/i)?.[0] || "";

const extractSection = (text: string, labels: string[]) => {
  const lines = splitLines(text);
  const lowerLabels = labels.map((label) => label.toLowerCase());
  const startIndex = lines.findIndex((line) => lowerLabels.some((label) => line.toLowerCase().startsWith(label)));

  if (startIndex === -1) {
    return "";
  }

  const content: string[] = [];
  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    const lowerLine = line.toLowerCase();
    if (lowerLine.length < 40 && /^(summary|profile|skills|experience|work experience|projects|education|certifications|languages|availability|links)/i.test(lowerLine)) {
      break;
    }
    content.push(line);
  }

  return normalizeWhitespace(content.join(" "));
};

const inferSkills = (text: string) => {
  const lowerText = text.toLowerCase();

  return knownSkills
    .filter((skill) => lowerText.includes(skill.toLowerCase()))
    .map((skill) => ({
      name: skill,
      level: "",
      yearsOfExperience: 0
    }));
};

const inferLanguages = (text: string) => {
  const lowerText = text.toLowerCase();

  return knownLanguages
    .filter((language) => lowerText.includes(language.toLowerCase()))
    .map((language) => ({
      name: language,
      proficiency: ""
    }));
};

const inferExperienceItems = (text: string) => {
  const section = extractSection(text, ["experience", "work experience", "employment", "work history"]);
  if (!section) {
    return [];
  }

  return [
    {
      company: "",
      role: "",
      startDate: "",
      endDate: "",
      description: section.slice(0, 3000),
      technologies: inferSkills(section).map((item) => item.name),
      isCurrent: /present|current/i.test(section)
    }
  ];
};

const inferProjectItems = (text: string) => {
  const section = extractSection(text, ["projects", "selected projects", "portfolio"]);
  if (!section) {
    return [];
  }

  return [
    {
      name: "Highlighted Project",
      description: section.slice(0, 3000),
      technologies: inferSkills(section).map((item) => item.name),
      role: "",
      url: extractUrl(section)
    }
  ];
};

const inferEducationItems = (text: string) => {
  const section = extractSection(text, ["education", "academic background", "qualifications"]);
  if (!section) {
    return [];
  }

  const yearMatches = section.match(/\b(19|20)\d{2}\b/g) || [];
  return [
    {
      institution: "",
      degree: "",
      fieldOfStudy: "",
      startYear: yearMatches[0] ? Number(yearMatches[0]) : null,
      endYear: yearMatches[1] ? Number(yearMatches[1]) : null
    }
  ];
};

const inferCertificationItems = (text: string) => {
  const section = extractSection(text, ["certifications", "certificates", "licenses"]);
  if (!section) {
    return [];
  }

  return section
    .split(/(?:\s+[•|-]\s+|\s{2,})/)
    .map((entry) => normalizeWhitespace(entry))
    .filter(Boolean)
    .slice(0, 8)
    .map((entry) => ({
      name: entry,
      issuer: "",
      issueDate: "",
      expirationDate: "",
      credentialId: ""
    }));
};

const inferAvailability = (text: string) => {
  const section = extractSection(text, ["availability", "notice period"]);
  if (!section) {
    return {
      status: "",
      startDate: "",
      notes: ""
    };
  }

  return {
    status: /immediate|available now/i.test(section) ? "Immediate" : "",
    startDate: "",
    notes: section
  };
};

const parsePdfCv = async (filePath: string) => {
  const buffer = await fs.readFile(filePath);
  const parsed = await pdfParse(buffer);
  return parsed.text.replace(/\u0000/g, "").trim();
};

const parseCsvLine = (line: string) => {
  const values: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (character === "\"") {
      if (insideQuotes && line[index + 1] === "\"") {
        current += "\"";
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (character === "," && !insideQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += character;
  }

  values.push(current.trim());
  return values;
};

const parseCsvCv = async (filePath: string) => {
  const content = await fs.readFile(filePath, "utf8");
  const [headerRow = "", ...rows] = content.split(/\r?\n/).filter(Boolean);
  const headers = parseCsvLine(headerRow).map((header) => header.trim().toLowerCase());
  const primaryRecord = rows.length
    ? headers.reduce<Record<string, string>>((record, header, index) => {
        const values = parseCsvLine(rows[0] || "");
        record[header] = values[index] || "";
        return record;
      }, {})
    : {};

  const rawText = content;
  const profile: ITalentProfile = {
    ...createEmptyTalentProfile(),
    basicInfo: {
      firstName: primaryRecord.firstname || primaryRecord["first name"] || "",
      lastName: primaryRecord.lastname || primaryRecord["last name"] || "",
      email: primaryRecord.email || "",
      headline: primaryRecord.headline || "",
      bio: primaryRecord.bio || primaryRecord.summary || "",
      location: primaryRecord.location || ""
    },
    skills: (primaryRecord.skills || "")
      .split(/[|,;/]/)
      .map((item) => item.trim())
      .filter(Boolean)
      .map((name) => ({ name, level: "", yearsOfExperience: 0 })),
    projects: primaryRecord.projects
      ? [{ name: "Imported Project", description: primaryRecord.projects, technologies: [], role: "", url: "" }]
      : [],
    experience: primaryRecord.experience
      ? [{ company: "", role: "", startDate: "", endDate: "", description: primaryRecord.experience, technologies: [], isCurrent: false }]
      : [],
    education: primaryRecord.education
      ? [{ institution: "", degree: primaryRecord.education, fieldOfStudy: "", startYear: null, endYear: null }]
      : [],
    certifications: (primaryRecord.certifications || "")
      .split(/[|,;/]/)
      .map((item) => item.trim())
      .filter(Boolean)
      .map((name) => ({ name, issuer: "", issueDate: "", expirationDate: "", credentialId: "" })),
    availability: {
      status: primaryRecord.availability || "",
      startDate: primaryRecord["start date"] || "",
      notes: ""
    },
    socialLinks: [
      { platform: "LinkedIn", url: primaryRecord.linkedin || "" },
      { platform: "GitHub", url: primaryRecord.github || "" }
    ].filter((item) => item.url)
  };

  return {
    rawText,
    talentProfile: normalizeTalentProfile(profile),
    parseConfidence: 70
  };
};

const parseTextToTalentProfile = (rawText: string): ITalentProfile => {
  const lines = splitLines(rawText);
  const email = extractEmail(rawText);
  const firstLine = lines[0] || "";
  const nameParts = firstLine.split(/\s+/).filter(Boolean);
  const basicInfo = {
    firstName: nameParts[0] || "",
    lastName: nameParts.slice(1).join(" "),
    email,
    headline: lines[1] && lines[1] !== email ? lines[1] : "",
    bio: extractSection(rawText, ["summary", "profile"]) || lines.slice(0, 8).join(" ").slice(0, 500),
    location: lines.find((line) => /kigali|rwanda|kenya|uganda|remote|hybrid|onsite/i.test(line)) || ""
  };

  return normalizeTalentProfile({
    basicInfo,
    skills: inferSkills(rawText),
    languages: inferLanguages(rawText),
    experience: inferExperienceItems(rawText),
    education: inferEducationItems(rawText),
    certifications: inferCertificationItems(rawText),
    projects: inferProjectItems(rawText),
    availability: inferAvailability(rawText),
    socialLinks: [
      { platform: "LinkedIn", url: rawText.match(/linkedin\.com\/\S+/i)?.[0] || "" },
      { platform: "GitHub", url: rawText.match(/github\.com\/\S+/i)?.[0] || "" }
    ].filter((item) => item.url)
  });
};

export const parseCvDocument = async (
  filePath: string,
  originalName: string
): Promise<{
  cvText: string;
  cvFileType: "pdf" | "csv";
  talentProfile: ITalentProfile;
  parseConfidence: number;
}> => {
  const extension = path.extname(originalName).toLowerCase();

  if (extension === ".csv") {
    const parsed = await parseCsvCv(filePath);
    return {
      cvText: parsed.rawText,
      cvFileType: "csv",
      talentProfile: parsed.talentProfile,
      parseConfidence: parsed.parseConfidence
    };
  }

  const cvText = await parsePdfCv(filePath);
  return {
    cvText,
    cvFileType: "pdf",
    talentProfile: parseTextToTalentProfile(cvText),
    parseConfidence: 62
  };
};

export const getParserVersion = () => parserVersion;
