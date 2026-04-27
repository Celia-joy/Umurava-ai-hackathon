
export interface IJob {
  _id?: string;
  title: string;
  description: string;
  requiredSkills: string[];
  preferredSkills?: string[];
  experienceYears: number;           // minimum years required
  educationLevel: 'high_school' | 'bachelor' | 'master' | 'phd' | 'any';
  location?: string;
  remote?: boolean;
  salaryRange?: { min: number; max: number; currency: string };
  status: 'open' | 'closed' | 'draft';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUmuravaProfile {
  umuravaId?: string;              
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  skills: string[];                 
  experienceYears: number;
  workHistory: Array<{
    company: string;
    role: string;
    startDate: string;            
    endDate?: string;            
    description?: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    graduationYear: number;
  }>;
  certifications?: string[];
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  summary?: string;
}

export interface IApplicant extends IUmuravaProfile {
  _id?: string;
  jobId: string;                    
  source: 'umurava' | 'csv' | 'pdf' | 'manual';
  rawFileRef?: string;              
  createdAt?: Date;
}


export interface ICandidateScore {
  applicantId: string;
  fullName: string;
  email: string;
  rank: number;                     
  matchScore: number;               
  scoreBreakdown: {
    skills: number;                 
    experience: number;             
    education: number;              
    relevance: number;              
  };
  strengths: string[];              
  gaps: string[];                  
  recommendation: 'strong_yes' | 'yes' | 'maybe' | 'no';
  reasoning: string;               
}

export interface IScreeningResult {
  _id?: string;
  jobId: string;
  triggeredAt: Date;
  completedAt?: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
  totalApplicants: number;
  shortlistSize: number;            
  shortlist: ICandidateScore[];
  geminiModel: string;              
  promptVersion: string;            
  error?: string;
}


export interface TriggerScreeningRequest {
  jobId: string;
  shortlistSize?: 10 | 20;         
}

export interface FileUploadApplicantRequest {
  jobId: string;
 
}