import type { Timestamps } from "./common";
import type { ServiceType } from "./service";
import type { User } from "./user";
import type { DoctorProfile } from "./doctor";

export type AppointmentStatus =
  | "pending"
  | "approved"
  | "completed"
  | "cancelled"
  | "rejected";

export type AppointmentMode = "online" | "offline";

export type PaymentStatus = "paid" | "unpaid" | "pending";

export interface HijamaData {
  type: "wet" | "dry" | "not_sure";
  numberOfCups?: number;
  bodyParts: string[];
  additionalNotes?: string;
}

export interface RuqyahData {
  isSelf: boolean;
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
  problemDescription: string;
  symptoms: string[];
  additionalNotes?: string;
}

export interface CounselingData {
  reason: string;
  additionalNotes?: string;
}

export type ServiceSpecificData = HijamaData | RuqyahData | CounselingData;

export interface Appointment extends Timestamps {
  id: string;
  patientId: string;
  patient?: User;
  doctorId?: string;
  doctor?: DoctorProfile;
  serviceType: ServiceType;
  serviceName: string;
  status: AppointmentStatus;
  mode: AppointmentMode;
  scheduledDate?: string;
  scheduledTime?: string;
  paymentStatus: PaymentStatus;
  paymentAmount?: number;
  serviceData?: ServiceSpecificData;
  adminNotes?: string;
  rejectionReason?: string;
}

export interface CreateAppointmentRequest {
  serviceType: ServiceType;
  mode: AppointmentMode;
  serviceData?: ServiceSpecificData;
}
