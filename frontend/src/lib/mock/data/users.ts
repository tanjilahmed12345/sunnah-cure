import type { User } from "@/types";

export const mockUsers: User[] = [
  {
    id: "user-1",
    name: "Ahmed Rahman",
    phone: "01712345678",
    role: "PATIENT",
    gender: "male",
    age: 35,
    address: "Dhanmondi, Dhaka",
    avatarUrl: null,
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "user-2",
    name: "Fatima Akter",
    phone: "01898765432",
    role: "PATIENT",
    gender: "female",
    age: 28,
    address: "Mirpur, Dhaka",
    avatarUrl: null,
    createdAt: "2025-02-10T08:30:00Z",
    updatedAt: "2025-02-10T08:30:00Z",
  },
  {
    id: "user-3",
    name: "Karim Uddin",
    phone: "01612345678",
    role: "PATIENT",
    gender: "male",
    age: 45,
    address: "Gulshan, Dhaka",
    avatarUrl: null,
    createdAt: "2025-01-20T14:00:00Z",
    updatedAt: "2025-01-20T14:00:00Z",
  },
  {
    id: "admin-1",
    name: "Admin User",
    phone: "01500000000",
    role: "ADMIN",
    gender: "male",
    age: 40,
    address: "Banani, Dhaka",
    avatarUrl: null,
    createdAt: "2024-12-01T00:00:00Z",
    updatedAt: "2024-12-01T00:00:00Z",
  },
];

export const mockCurrentUser: User = mockUsers[0];
