export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  location: string;
  role: "admin" | "user";
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: AuthUser["role"];
}
