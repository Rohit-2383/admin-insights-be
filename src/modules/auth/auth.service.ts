import {
  createHmac,
  randomBytes,
  randomUUID,
  scrypt,
  timingSafeEqual,
} from "crypto";
import { promisify } from "util";
import { env } from "../../config/env";
import { db, initializeDatabase } from "../../lib/db";
import { ApiError } from "../../middlewares/error.middleware";

const scryptAsync = promisify(scrypt);
const PASSWORD_KEY_LENGTH = 64;

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

export interface SignupInput {
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  location: string;
  businessType: BusinessType;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface BusinessTypeOption {
  label: string;
  value: BusinessType;
}

interface UserRecord {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  location: string;
  businessType: BusinessType;
  passwordHash: string;
  passwordSalt: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UserRow {
  id: string;
  first_name: string;
  last_name: string;
  age: number;
  email: string;
  location: string;
  business_type: string;
  password_hash: string;
  password_salt: string;
  created_at: Date;
  updated_at: Date;
}

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  location: string;
  businessType: BusinessType;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null;

const getStringField = (
  value: unknown,
  fieldName: string,
  minimumLength = 1,
): string => {
  if (typeof value !== "string") {
    throw new ApiError(400, `${fieldName} is required.`);
  }

  const trimmedValue = value.trim();

  if (trimmedValue.length < minimumLength) {
    throw new ApiError(
      400,
      `${fieldName} must be at least ${minimumLength} characters long.`,
    );
  }

  return trimmedValue;
};

const normalizeEmail = (value: unknown): string => {
  const email = getStringField(value, "Email");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Email must be a valid email address.");
  }

  return email.toLowerCase();
};

const normalizeAge = (value: unknown): number => {
  const parsedAge =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim() !== ""
        ? Number(value)
        : Number.NaN;

  if (!Number.isInteger(parsedAge) || parsedAge <= 0) {
    throw new ApiError(400, "Age must be a valid positive number.");
  }

  return parsedAge;
};

const toTitleCase = (value: string): string =>
  value
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const normalizeBusinessType = (value: unknown): BusinessType => {
  const rawBusinessType = getStringField(value, "Business type");
  const normalizedBusinessType = rawBusinessType
    .trim()
    .replace(/[\s-]+/g, "_")
    .toUpperCase();

  if (!BUSINESS_TYPES.includes(normalizedBusinessType as BusinessType)) {
    throw new ApiError(400, "Business type is invalid.");
  }

  return normalizedBusinessType as BusinessType;
};

const getPayloadValue = (
  payload: UnknownRecord,
  keys: readonly string[],
): unknown => {
  for (const key of keys) {
    if (key in payload) {
      return payload[key];
    }
  }

  return undefined;
};

const parseSignupPayload = (payload: unknown): SignupInput => {
  if (!isRecord(payload)) {
    throw new ApiError(400, "Signup payload is invalid.");
  }

  return {
    firstName: toTitleCase(
      getStringField(
        getPayloadValue(payload, ["firstName", "firstname"]),
        "First name",
      ),
    ),
    lastName: toTitleCase(
      getStringField(
        getPayloadValue(payload, ["lastName", "lastname"]),
        "Last name",
      ),
    ),
    age: normalizeAge(getPayloadValue(payload, ["age"])),
    email: normalizeEmail(getPayloadValue(payload, ["email"])),
    location: toTitleCase(
      getStringField(
        getPayloadValue(payload, ["location", "locaton"]),
        "Location",
      ),
    ),
    businessType: normalizeBusinessType(
      getPayloadValue(payload, ["businessType", "businesstype"]),
    ),
    password: getStringField(
      getPayloadValue(payload, ["password", "pass", "passwords"]),
      "Password",
      6,
    ),
  };
};

const parseLoginPayload = (payload: unknown): LoginInput => {
  if (!isRecord(payload)) {
    throw new ApiError(400, "Login payload is invalid.");
  }

  return {
    email: normalizeEmail(getPayloadValue(payload, ["email"])),
    password: getStringField(
      getPayloadValue(payload, ["password", "pass", "passwords"]),
      "Password",
      6,
    ),
  };
};

const hashPassword = async (
  password: string,
): Promise<{ hash: string; salt: string }> => {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(
    password,
    salt,
    PASSWORD_KEY_LENGTH,
  )) as Buffer;

  return {
    hash: derivedKey.toString("hex"),
    salt,
  };
};

const verifyPassword = async (
  password: string,
  salt: string,
  storedHash: string,
): Promise<boolean> => {
  const derivedKey = (await scryptAsync(
    password,
    salt,
    PASSWORD_KEY_LENGTH,
  )) as Buffer;
  const storedHashBuffer = Buffer.from(storedHash, "hex");

  if (storedHashBuffer.length !== derivedKey.length) {
    return false;
  }

  return timingSafeEqual(derivedKey, storedHashBuffer);
};

const createAuthToken = (user: Pick<UserRecord, "id" | "email">): string => {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + Math.floor(env.authTokenTtlMs / 1000);
  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" }),
  ).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      iat: issuedAt,
      exp: expiresAt,
    }),
  ).toString("base64url");
  const signature = createHmac("sha256", env.authTokenSecret)
    .update(`${header}.${payload}`)
    .digest("base64url");

  return `${header}.${payload}.${signature}`;
};

const mapUserRow = (row: UserRow): UserRecord => ({
  id: row.id,
  firstName: row.first_name,
  lastName: row.last_name,
  age: Number(row.age),
  email: row.email,
  location: row.location,
  businessType: row.business_type as BusinessType,
  passwordHash: row.password_hash,
  passwordSalt: row.password_salt,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

const serializeUser = (user: UserRecord): AuthUser => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  age: user.age,
  email: user.email,
  location: user.location,
  businessType: user.businessType,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const buildAuthResponse = (user: UserRecord): AuthResponse => ({
  user: serializeUser(user),
  token: createAuthToken(user),
});

const findUserByEmail = async (email: string): Promise<UserRecord | null> => {
  await initializeDatabase();

  const result = await db.query(
    `
      SELECT
        id,
        first_name,
        last_name,
        age,
        email,
        location,
        business_type,
        password_hash,
        password_salt,
        created_at,
        updated_at
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    [email],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapUserRow(result.rows[0] as UserRow);
};

const createUser = async (
  signupData: SignupInput,
  passwordData: { hash: string; salt: string },
): Promise<UserRecord> => {
  await initializeDatabase();

  const result = await db.query(
    `
      INSERT INTO users (
        id,
        first_name,
        last_name,
        age,
        email,
        location,
        business_type,
        password_hash,
        password_salt
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING
        id,
        first_name,
        last_name,
        age,
        email,
        location,
        business_type,
        password_hash,
        password_salt,
        created_at,
        updated_at
    `,
    [
      randomUUID(),
      signupData.firstName,
      signupData.lastName,
      signupData.age,
      signupData.email,
      signupData.location,
      signupData.businessType,
      passwordData.hash,
      passwordData.salt,
    ],
  );

  return mapUserRow(result.rows[0] as UserRow);
};

export const getBusinessTypes = (): BusinessTypeOption[] =>
  BUSINESS_TYPES.map((businessType) => ({
    label: toTitleCase(businessType.replace(/_/g, " ")),
    value: businessType,
  }));

export const signup = async (payload: unknown): Promise<AuthResponse> => {
  const signupData = parseSignupPayload(payload);
  const existingUser = await findUserByEmail(signupData.email);

  if (existingUser) {
    throw new ApiError(409, "A user with this email already exists.");
  }

  const passwordData = await hashPassword(signupData.password);

  try {
    const user = await createUser(signupData, passwordData);
    return buildAuthResponse(user);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      throw new ApiError(409, "A user with this email already exists.");
    }

    throw error;
  }
};

export const login = async (payload: unknown): Promise<AuthResponse> => {
  const loginData = parseLoginPayload(payload);
  const user = await findUserByEmail(loginData.email);

  if (!user) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const isPasswordValid = await verifyPassword(
    loginData.password,
    user.passwordSalt,
    user.passwordHash,
  );

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password.");
  }

  return buildAuthResponse(user);
};
