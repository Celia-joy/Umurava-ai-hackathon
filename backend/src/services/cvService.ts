import fs from "fs/promises";
import path from "path";
import pdfParse from "pdf-parse";
import { IExtractedCandidateData } from "../models/Application";
import { normalizeCandidateData } from "../utils/normalizeCandidateData";

const parsePdfCv = async (filePath: string) => {
  const buffer = await fs.readFile(filePath);
  const parsed = await pdfParse(buffer);
  return parsed.text.replace(/\s+/g, " ").trim();
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

  const records = rows.map((row) => {
    const values = parseCsvLine(row);

    return headers.reduce<Record<string, string>>((record, header, index) => {
      record[header] = values[index] || "";
      return record;
    }, {});
  });

  const primaryRecord = records[0] || {};
  const rawText = records
    .map((record) => Object.entries(record).map(([key, value]) => `${key}: ${value}`).join(" | "))
    .join(" ");

  return {
    rawText,
    extractedData: normalizeCandidateData({
      rawText,
      skills: (primaryRecord.skills || primaryRecord.skillset || "")
        .split(/[|;/]/)
        .map((item) => item.trim())
        .filter(Boolean),
      experience: primaryRecord.experience || primaryRecord["work experience"] || "",
      education: primaryRecord.education || primaryRecord.degree || "",
      summary: primaryRecord.summary || primaryRecord.profile || ""
    })
  };
};

export const parseCvDocument = async (
  filePath: string,
  originalName: string
): Promise<{ cvText: string; cvFileType: "pdf" | "csv"; extractedData: IExtractedCandidateData }> => {
  const extension = path.extname(originalName).toLowerCase();

  if (extension === ".csv") {
    const parsed = await parseCsvCv(filePath);
    return {
      cvText: parsed.rawText,
      cvFileType: "csv",
      extractedData: parsed.extractedData
    };
  }

  const cvText = await parsePdfCv(filePath);
  return {
    cvText,
    cvFileType: "pdf",
    extractedData: normalizeCandidateData({ rawText: cvText })
  };
};
