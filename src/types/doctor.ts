import type { User, RegisterRequest } from "./user";
import type { Timestamps } from "./common";

export type DoctorApprovalStatus = "pending" | "approved" | "rejected";

export type Specialization =
  | "hijama_therapy"
  | "ruqyah_therapy"
  | "islamic_counseling"
  | "general_wellness";

export interface DoctorProfile extends Timestamps {
  id: string;
  userId: string;
  user: User;
  specialization: Specialization;
  qualifications: string;
  experienceYears: number;
  bio: string;
  approvalStatus: DoctorApprovalStatus;
  certificateUrls: string[];
}

export interface DoctorRegisterRequest extends RegisterRequest {
  specialization: Specialization;
  qualifications: string;
  experienceYears: number;
  bio: string;
}
