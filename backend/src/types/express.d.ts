import { Request } from "express";

export type UserRole = "recruiter" | "applicant";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}
