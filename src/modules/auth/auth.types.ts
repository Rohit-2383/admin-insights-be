export const BUSINESS_TYPES = [
  "RETAIL",
  "SERVICE",
  "MANUFACTURING",
  "TECHNOLOGY",
  "HEALTHCARE",
  "FINANCE",
  "EDUCATION",
  "HOSPITALITY",
  "OTHER",
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number];

export type UserRole = "admin" | "user";

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  location: string;
  businessType: BusinessType;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface BusinessTypeOption {
  label: string;
  value: BusinessType;
}
