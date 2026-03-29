import type { Timestamps } from "./common";

export interface AssessmentStep1 {
  prayerFrequency: "5_times" | "sometimes" | "rarely" | "never";
  quranFrequency: "daily" | "weekly" | "rarely" | "never";
  spiritualPractices: string[];
  confidentialNotes?: string;
}

export interface AssessmentStep2 {
  physicalSymptoms: string[];
  elaboration?: string;
}

export interface AssessmentStep3 {
  emotionalSymptoms: string[];
  emotionalDetails?: string;
  previousDiagnosis?: string;
}

export interface AssessmentStep4 {
  spiritualSymptoms: string[];
  unusualBehavior?: string;
  familyHistory?: string;
  preferredMode: "online" | "offline";
  contactTime?: string;
  additionalNotes?: string;
}

export interface AssessmentFormData {
  step1: AssessmentStep1;
  step2: AssessmentStep2;
  step3: AssessmentStep3;
  step4: AssessmentStep4;
}

export interface Assessment extends Timestamps {
  id: string;
  patientId: string;
  patientName: string;
  formData: AssessmentFormData;
  status: "pending" | "reviewed" | "assigned";
  assignedDoctorId?: string;
  assignedDoctorName?: string;
  adminNotes?: string;
}
