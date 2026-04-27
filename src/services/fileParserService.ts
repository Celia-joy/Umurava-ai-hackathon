import Papa from 'papaparse';
import pdfParse from 'pdf-parse';
import * as XLSX from 'xlsx';
import { IApplicant } from '../types';


export async function parseSpreadsheet(
  buffer: Buffer,
  mimetype: string,
  jobId: string
): Promise<Partial<IApplicant>[]> {
  let rows: Record<string, string>[] = [];

  if (mimetype === 'text/csv' || mimetype === 'application/csv') {
    // Parse CSV
    const text = buffer.toString('utf-8');
    const result = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase(),
    });
    rows = result.data;
  } else {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const raw = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' });
    rows = raw.map(row =>
      Object.fromEntries(Object.entries(row).map(([k, v]) => [k.trim().toLowerCase(), String(v)]))
    );
  }

  return rows
    .filter(row => row.email && row.fullname) // must have at least email and name
    .map(row => ({
      jobId,
      fullName: row.fullname || row['full name'] || row.name || '',
      email: row.email?.toLowerCase().trim() || '',
      phone: row.phone || undefined,
      location: row.location || undefined,
      
      skills: row.skills
        ? row.skills.split(/[|,]/).map(s => s.trim()).filter(Boolean)
        : [],
      experienceYears: parseFloat(row.experienceyears || row['experience years'] || '0') || 0,
      summary: row.summary || undefined,
      certifications: row.certifications
        ? row.certifications.split(/[|,]/).map(s => s.trim()).filter(Boolean)
        : [],
      portfolioUrl: row.portfoliourl || row['portfolio url'] || undefined,
      linkedinUrl: row.linkedinurl || row['linkedin url'] || undefined,
      githubUrl: row.githuburl || row['github url'] || undefined,
      workHistory: [],
      education: [],
      source: 'csv' as const,
    }));
}


export async function parsePdf(
  buffer: Buffer,
  jobId: string,
  fileName: string
): Promise<Partial<IApplicant>> {
  const data = await pdfParse(buffer);
  const text = data.text || '';

  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0].toLowerCase() : '';

  
  const phoneMatch = text.match(/[\+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,3}[)]?[-\s.]?[0-9]{3,4}[-\s.]?[0-9]{3,4}/);
  const phone = phoneMatch ? phoneMatch[0] : undefined;

  const fallbackName = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

  return {
    jobId,
    fullName: fallbackName,
    email,
    phone,
    skills: [],
    experienceYears: 0,
    workHistory: [],
    education: [],

    summary: text.slice(0, 4000),
    source: 'pdf' as const,
    rawFileRef: fileName,
  };
}