import { z } from "zod/v4";

// Step 1: Phone number entry
export const phoneSchema = z.object({
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^01[3-9]\d{8}$/, "Please enter a valid Bangladeshi phone number"),
});

export type PhoneFormData = z.infer<typeof phoneSchema>;

// Step 2: OTP verification
export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only digits"),
});

export type OtpFormData = z.infer<typeof otpSchema>;

// Login = phone + OTP (combined for type)
export const loginSchema = phoneSchema;
export type LoginFormData = PhoneFormData;

// Registration: personal info + phone + OTP
export const registerSchema = z.object({
  name: z.string().min(1, "Full name is required").min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^01[3-9]\d{8}$/, "Please enter a valid Bangladeshi phone number"),
  address: z.string().min(1, "Address is required"),
  age: z.coerce.number().min(1, "Age is required").max(120, "Please enter a valid age"),
  gender: z.enum(["male", "female"]),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

// Admin: add staff form
export const addStaffSchema = z.object({
  name: z.string().min(1, "Full name is required").min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^01[3-9]\d{8}$/, "Please enter a valid Bangladeshi phone number"),
  gender: z.enum(["male", "female"]),
  age: z.coerce.number().min(1, "Age is required").max(120, "Please enter a valid age"),
  address: z.string().optional(),
  designations: z.array(z.enum(["raqi", "hajjam"])).min(1, "Select at least one designation"),
  qualifications: z.string().optional(),
  experienceYears: z.coerce.number().min(0).optional(),
  bio: z.string().optional(),
});

export type AddStaffFormData = z.infer<typeof addStaffSchema>;
