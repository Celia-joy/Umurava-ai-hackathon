import { Schema } from "mongoose";

export interface IBasicInfo {
  firstName: string;
  lastName: string;
  email: string;
  headline: string;
  bio: string;
  location: string;
}

export interface ISkillProfileItem {
  name: string;
  level: string;
  yearsOfExperience: number;
}

export interface ILanguageProfileItem {
  name: string;
  proficiency: string;
}

export interface IExperienceProfileItem {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  technologies: string[];
  isCurrent: boolean;
}

export interface IEducationProfileItem {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number | null;
  endYear: number | null;
}

export interface ICertificationProfileItem {
  name: string;
  issuer: string;
  issueDate: string;
  expirationDate: string;
  credentialId: string;
}

export interface IProjectProfileItem {
  name: string;
  description: string;
  technologies: string[];
  role: string;
  url: string;
}

export interface IAvailabilityProfile {
  status: string;
  startDate: string;
  notes: string;
}

export interface ISocialLinkProfileItem {
  platform: string;
  url: string;
}

export interface ITalentProfile {
  basicInfo: IBasicInfo;
  skills: ISkillProfileItem[];
  languages: ILanguageProfileItem[];
  experience: IExperienceProfileItem[];
  education: IEducationProfileItem[];
  certifications: ICertificationProfileItem[];
  projects: IProjectProfileItem[];
  availability: IAvailabilityProfile;
  socialLinks: ISocialLinkProfileItem[];
}

export const createEmptyTalentProfile = (): ITalentProfile => ({
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

const basicInfoSchema = new Schema<IBasicInfo>(
  {
    firstName: { type: String, trim: true, default: "" },
    lastName: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, lowercase: true, default: "" },
    headline: { type: String, trim: true, default: "" },
    bio: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" }
  },
  { _id: false }
);

const skillProfileItemSchema = new Schema<ISkillProfileItem>(
  {
    name: { type: String, trim: true, default: "" },
    level: { type: String, trim: true, default: "" },
    yearsOfExperience: { type: Number, min: 0, default: 0 }
  },
  { _id: false }
);

const languageProfileItemSchema = new Schema<ILanguageProfileItem>(
  {
    name: { type: String, trim: true, default: "" },
    proficiency: { type: String, trim: true, default: "" }
  },
  { _id: false }
);

const experienceProfileItemSchema = new Schema<IExperienceProfileItem>(
  {
    company: { type: String, trim: true, default: "" },
    role: { type: String, trim: true, default: "" },
    startDate: { type: String, trim: true, default: "" },
    endDate: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    technologies: { type: [String], default: [] },
    isCurrent: { type: Boolean, default: false }
  },
  { _id: false }
);

const educationProfileItemSchema = new Schema<IEducationProfileItem>(
  {
    institution: { type: String, trim: true, default: "" },
    degree: { type: String, trim: true, default: "" },
    fieldOfStudy: { type: String, trim: true, default: "" },
    startYear: { type: Number, min: 1900, default: null },
    endYear: { type: Number, min: 1900, default: null }
  },
  { _id: false }
);

const certificationProfileItemSchema = new Schema<ICertificationProfileItem>(
  {
    name: { type: String, trim: true, default: "" },
    issuer: { type: String, trim: true, default: "" },
    issueDate: { type: String, trim: true, default: "" },
    expirationDate: { type: String, trim: true, default: "" },
    credentialId: { type: String, trim: true, default: "" }
  },
  { _id: false }
);

const projectProfileItemSchema = new Schema<IProjectProfileItem>(
  {
    name: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    technologies: { type: [String], default: [] },
    role: { type: String, trim: true, default: "" },
    url: { type: String, trim: true, default: "" }
  },
  { _id: false }
);

const availabilityProfileSchema = new Schema<IAvailabilityProfile>(
  {
    status: { type: String, trim: true, default: "" },
    startDate: { type: String, trim: true, default: "" },
    notes: { type: String, trim: true, default: "" }
  },
  { _id: false }
);

const socialLinkProfileItemSchema = new Schema<ISocialLinkProfileItem>(
  {
    platform: { type: String, trim: true, default: "" },
    url: { type: String, trim: true, default: "" }
  },
  { _id: false }
);

export const talentProfileSchema = new Schema<ITalentProfile>(
  {
    basicInfo: { type: basicInfoSchema, default: () => createEmptyTalentProfile().basicInfo },
    skills: { type: [skillProfileItemSchema], default: [] },
    languages: { type: [languageProfileItemSchema], default: [] },
    experience: { type: [experienceProfileItemSchema], default: [] },
    education: { type: [educationProfileItemSchema], default: [] },
    certifications: { type: [certificationProfileItemSchema], default: [] },
    projects: { type: [projectProfileItemSchema], default: [] },
    availability: { type: availabilityProfileSchema, default: () => createEmptyTalentProfile().availability },
    socialLinks: { type: [socialLinkProfileItemSchema], default: [] }
  },
  { _id: false }
);
