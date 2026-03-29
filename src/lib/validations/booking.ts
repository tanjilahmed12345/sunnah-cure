import { z } from "zod/v4";

export const hijamaBookingSchema = z.object({
  type: z.enum(["wet", "dry", "not_sure"]),
  numberOfCups: z.coerce.number().min(1, "Number of cups is required"),
  bodyParts: z.array(z.string()).min(1, "Select at least one body part"),
  medicalConditions: z.array(z.string()).optional(),
  medicalConditionOther: z.string().optional(),
  additionalNotes: z.string().optional(),
});

export type HijamaBookingFormData = z.infer<typeof hijamaBookingSchema>;

export const ruqyahBookingSchema = z.object({
  isSelf: z.boolean(),
  patientName: z.string().optional(),
  patientAge: z.coerce.number().optional(),
  patientGender: z.string().optional(),
  problemDescription: z.string().min(1, "Problem description is required"),
  symptoms: z.array(z.string()),
  additionalNotes: z.string().optional(),
});

export type RuqyahBookingFormData = z.infer<typeof ruqyahBookingSchema>;

export const counselingBookingSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
  additionalNotes: z.string().optional(),
});

export type CounselingBookingFormData = z.infer<typeof counselingBookingSchema>;
