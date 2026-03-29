import type { Timestamps } from "./common";

export type PaymentMethod =
  | "bkash"
  | "nagad"
  | "rocket"
  | "paypal"
  | "stripe"
  | "card";

export type PaymentTransactionStatus =
  | "pending"
  | "completed"
  | "failed"
  | "refunded";

export interface Payment extends Timestamps {
  id: string;
  appointmentId: string;
  patientId: string;
  amountBDT: number;
  method: PaymentMethod;
  status: PaymentTransactionStatus;
  transactionId?: string;
  paidAt?: string;
}

export interface InitiatePaymentRequest {
  appointmentId: string;
  method: PaymentMethod;
  phoneNumber?: string;
  email?: string;
}
