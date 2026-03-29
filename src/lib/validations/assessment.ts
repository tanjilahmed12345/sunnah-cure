import { z } from "zod/v4";

export const assessmentStep1Schema = z.object({
  prayerFrequency: z.enum(["5_times", "sometimes", "rarely", "never"]),
  quranFrequency: z.enum(["daily", "weekly", "rarely", "never"]),
  spiritualPractices: z.array(z.string()),
  confidentialNotes: z.string().optional(),
});

export const assessmentStep2Schema = z.object({
  physicalSymptoms: z.array(z.string()),
  elaboration: z.string().optional(),
});

export const assessmentStep3Schema = z.object({
  emotionalSymptoms: z.array(z.string()),
  emotionalDetails: z.string().optional(),
  previousDiagnosis: z.string().optional(),
});

export const assessmentStep4Schema = z.object({
  spiritualSymptoms: z.array(z.string()),
  unusualBehavior: z.string().optional(),
  familyHistory: z.string().optional(),
  preferredMode: z.enum(["online", "offline"]),
  contactTime: z.string().optional(),
  additionalNotes: z.string().optional(),
});

export type AssessmentStep1Data = z.infer<typeof assessmentStep1Schema>;
export type AssessmentStep2Data = z.infer<typeof assessmentStep2Schema>;
export type AssessmentStep3Data = z.infer<typeof assessmentStep3Schema>;
export type AssessmentStep4Data = z.infer<typeof assessmentStep4Schema>;
