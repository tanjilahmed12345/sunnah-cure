import type { Timestamps } from "./common";

export type NotificationType =
  | "appointment_confirmed"
  | "appointment_cancelled"
  | "payment_received"
  | "new_message"
  | "doctor_approved"
  | "assessment_ready";

export interface Notification extends Timestamps {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  actionUrl?: string;
}
