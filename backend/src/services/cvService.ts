import fs from "fs/promises";
import pdfParse from "pdf-parse";

export const parsePdfCv = async (filePath: string) => {
  const buffer = await fs.readFile(filePath);
  const parsed = await pdfParse(buffer);
  return parsed.text.replace(/\s+/g, " ").trim();
};
