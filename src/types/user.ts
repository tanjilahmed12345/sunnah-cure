import type { Gender, Timestamps } from "./common";

export type UserRole = "PATIENT" | "DOCTOR" | "ADMIN";

export interface User extends Timestamps {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  gender: Gender;
  age: number;
  address: string;
  avatarUrl: string | null;
}

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  phone: string;
  password: string;
  confirmPassword: string;
  address: string;
  age: number;
  gender: Gender;
}

export interface AuthResponse {
  user: User;
  token: string;
}
