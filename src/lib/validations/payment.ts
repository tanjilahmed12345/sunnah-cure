import { z } from "zod/v4";

export const mobilePaymentSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^01[3-9]\d{8}$/, "Invalid phone number"),
  pin: z.string().min(4, "PIN must be at least 4 digits").max(6),
});

export const paypalPaymentSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const cardPaymentSchema = z.object({
  cardNumber: z.string().min(16, "Invalid card number").max(19),
  expiry: z.string().regex(/^\d{2}\/\d{2}$/, "Format: MM/YY"),
  cvv: z.string().min(3, "Invalid CVV").max(4),
});

export type MobilePaymentData = z.infer<typeof mobilePaymentSchema>;
export type PaypalPaymentData = z.infer<typeof paypalPaymentSchema>;
export type CardPaymentData = z.infer<typeof cardPaymentSchema>;
