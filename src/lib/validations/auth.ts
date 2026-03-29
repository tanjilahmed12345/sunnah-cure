import { z } from "zod/v4";

export const loginSchema = z.object({
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^01[3-9]\d{8}$/, "Please enter a valid Bangladeshi phone number"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

const baseRegisterFields = {
  name: z.string().min(1, "Full name is required").min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^01[3-9]\d{8}$/, "Please enter a valid Bangladeshi phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  address: z.string().min(1, "Address is required"),
  age: z.coerce.number().min(1, "Age is required").max(120, "Please enter a valid age"),
  gender: z.enum(["male", "female"]),
};

export const registerSchema = z
  .object(baseRegisterFields)
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const doctorRegisterSchema = z
  .object({
    ...baseRegisterFields,
    specialization: z.enum([
      "hijama_therapy",
      "ruqyah_therapy",
      "islamic_counseling",
      "general_wellness",
    ]),
    qualifications: z.string().min(1, "Qualifications are required"),
    experienceYears: z.coerce.number().min(0, "Experience is required"),
    bio: z.string().min(10, "Bio must be at least 10 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type DoctorRegisterFormData = z.infer<typeof doctorRegisterSchema>;
