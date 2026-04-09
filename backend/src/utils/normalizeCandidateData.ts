import { IExtractedCandidateData } from "../models/Application";

const knownSkills = [
  "javascript", "typescript", "react", "next.js", "node.js", "express", "mongodb", "sql",
  "python", "java", "c#", "docker", "kubernetes", "aws", "git", "figma", "tailwind",
  "redux", "graphql", "rest", "machine learning", "data analysis", "ui/ux", "css", "html"
];

const normalizeWhitespace = (value: string) => value.replace(/\s+/g, " ").trim();

const titleCase = (value: string) => value
  .split(" ")
  .filter(Boolean)
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join(" ");

const extractSection = (text: string, labels: string[]) => {
  const lowerText = text.toLowerCase();

  for (const label of labels) {
    const index = lowerText.indexOf(label);
    if (index === -1) {
      continue;
    }

    const section = text.slice(index + label.length);
    const stopIndex = section.search(/\b(summary|skills|experience|education|projects|certifications|employment|work history)\b/i);
    return normalizeWhitespace(stopIndex === -1 ? section.slice(0, 280) : section.slice(0, stopIndex));
  }

  return "";
};

const inferSkills = (text: string) => {
  const lowerText = text.toLowerCase();

  return knownSkills
    .filter((skill) => lowerText.includes(skill))
    .map((skill) => titleCase(skill))
    .slice(0, 12);
};

export const normalizeCandidateData = (payload: Partial<IExtractedCandidateData> & { rawText?: string }): IExtractedCandidateData => {
  const rawText = normalizeWhitespace(payload.rawText || "");
  const skills = Array.from(
    new Set((payload.skills || []).map((item) => titleCase(normalizeWhitespace(item))).filter(Boolean))
  );
  const experience = normalizeWhitespace(
    payload.experience || extractSection(rawText, ["experience", "work history", "employment"])
  );
  const education = normalizeWhitespace(
    payload.education || extractSection(rawText, ["education", "academic background", "qualifications"])
  );
  const summary = normalizeWhitespace(
    payload.summary || rawText.slice(0, 500)
  );

  return {
    skills: skills.length ? skills : inferSkills(rawText),
    experience,
    education,
    summary
  };
};
