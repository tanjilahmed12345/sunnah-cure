import type { Payment } from "@/types";

export const mockPayments: Payment[] = [
  {
    id: "pay-1",
    appointmentId: "apt-3",
    patientId: "user-2",
    amountBDT: 2000,
    method: "bkash",
    status: "completed",
    transactionId: "TXN-BK-20250315-001",
    paidAt: "2025-03-15T14:45:00Z",
    createdAt: "2025-03-15T14:40:00Z",
    updatedAt: "2025-03-15T14:45:00Z",
  },
];
