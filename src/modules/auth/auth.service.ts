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

export interface AuthTokenPayload {
  userId: string;
  email: string;
  issuedAt: number;
  expiresAt: number;
}

export interface AuthProfileUpdateInput {
  firstName: string;
  lastName: string;
  email: string;
  location: string;
}

type UnknownRecord = Record<string, unknown>;

const memoryUsersById = new Map<string, UserRecord>();
let useMemoryStore = env.databaseUrl.trim().length === 0;

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

export const verifyAuthToken = (token: string): AuthTokenPayload => {
  const [header, payload, signature] = token.split(".");

  if (!header || !payload || !signature) {
    throw new ApiError(401, "Authentication token is invalid.");
  }

  const expectedSignature = createHmac("sha256", env.authTokenSecret)
    .update(`${header}.${payload}`)
    .digest("base64url");

  const providedSignature = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (
    providedSignature.length !== expectedSignatureBuffer.length ||
    !timingSafeEqual(providedSignature, expectedSignatureBuffer)
  ) {
    throw new ApiError(401, "Authentication token is invalid.");
  }

  try {
    const parsedPayload = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as {
      sub?: string;
      email?: string;
      iat?: number;
      exp?: number;
    };

    if (
      typeof parsedPayload.sub !== "string" ||
      typeof parsedPayload.email !== "string" ||
      typeof parsedPayload.iat !== "number" ||
      typeof parsedPayload.exp !== "number"
    ) {
      throw new ApiError(401, "Authentication token is invalid.");
    }

    if (parsedPayload.exp <= Math.floor(Date.now() / 1000)) {
      throw new ApiError(401, "Authentication token has expired.");
    }

    return {
      userId: parsedPayload.sub,
      email: parsedPayload.email,
      issuedAt: parsedPayload.iat,
      expiresAt: parsedPayload.exp,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(401, "Authentication token is invalid.");
  }
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

const isDatabaseUnavailableError = (error: unknown): boolean => {
  const errorCode =
    typeof error === "object" && error !== null && "code" in error
      ? String(error.code)
      : "";
  const errorMessage =
    error instanceof Error ? error.message.toLowerCase() : "";

  return (
    ["ECONNREFUSED", "ENOTFOUND", "EAI_AGAIN"].includes(errorCode) ||
    errorMessage.includes("database_url is required") ||
    errorMessage.includes("connect econrefused") ||
    errorMessage.includes("failed to connect") ||
    errorMessage.includes("connection terminated")
  );
};

const runWithStore = async <T>(
  databaseAction: () => Promise<T>,
  memoryAction: () => Promise<T> | T,
): Promise<T> => {
  if (useMemoryStore) {
    return await memoryAction();
  }

  try {
    return await databaseAction();
  } catch (error) {
    if (!isDatabaseUnavailableError(error)) {
      throw error;
    }

    useMemoryStore = true;
    return await memoryAction();
  }
};

const findMemoryUserByEmail = (email: string): UserRecord | null => {
  for (const user of memoryUsersById.values()) {
    if (user.email === email) {
      return user;
    }
  }

  return null;
};

const findMemoryUserById = (userId: string): UserRecord | null =>
  memoryUsersById.get(userId) ?? null;

const ensureUniqueMemoryEmail = (
  email: string,
  excludedUserId?: string,
): void => {
  const existingUser = findMemoryUserByEmail(email);

  if (existingUser && existingUser.id !== excludedUserId) {
    throw new ApiError(409, "A user with this email already exists.");
  }
};

const createMemoryUser = (
  signupData: SignupInput,
  passwordData: { hash: string; salt: string },
): UserRecord => {
  ensureUniqueMemoryEmail(signupData.email);

  const user: UserRecord = {
    id: randomUUID(),
    firstName: signupData.firstName,
    lastName: signupData.lastName,
    age: signupData.age,
    email: signupData.email,
    location: signupData.location,
    businessType: signupData.businessType,
    passwordHash: passwordData.hash,
    passwordSalt: passwordData.salt,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  memoryUsersById.set(user.id, user);
  return user;
};

const updateMemoryUserProfile = (
  userId: string,
  profileData: AuthProfileUpdateInput,
): UserRecord | null => {
  const existingUser = findMemoryUserById(userId);

  if (!existingUser) {
    return null;
  }

  ensureUniqueMemoryEmail(profileData.email, userId);

  const updatedUser: UserRecord = {
    ...existingUser,
    ...profileData,
    updatedAt: new Date(),
  };

  memoryUsersById.set(userId, updatedUser);
  return updatedUser;
};

const updateMemoryUserPassword = (
  userId: string,
  passwordData: { hash: string; salt: string },
): UserRecord | null => {
  const existingUser = findMemoryUserById(userId);

  if (!existingUser) {
    return null;
  }

  const updatedUser: UserRecord = {
    ...existingUser,
    passwordHash: passwordData.hash,
    passwordSalt: passwordData.salt,
    updatedAt: new Date(),
  };

  memoryUsersById.set(userId, updatedUser);
  return updatedUser;
};

const deleteMemoryUser = (userId: string): boolean => memoryUsersById.delete(userId);

const findUserByEmail = async (email: string): Promise<UserRecord | null> =>
  runWithStore(async () => {
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
  }, () => findMemoryUserByEmail(email));

const findUserById = async (userId: string): Promise<UserRecord | null> =>
  runWithStore(async () => {
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
        WHERE id = $1
        LIMIT 1
      `,
      [userId],
    );

    if (result.rows.length === 0) {
      return null;
    }

    return mapUserRow(result.rows[0] as UserRow);
  }, () => findMemoryUserById(userId));

const createUser = async (
  signupData: SignupInput,
  passwordData: { hash: string; salt: string },
): Promise<UserRecord> =>
  runWithStore(async () => {
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
  }, () => createMemoryUser(signupData, passwordData));

const updateUserProfileRecord = async (
  userId: string,
  profileData: AuthProfileUpdateInput,
): Promise<UserRecord | null> =>
  runWithStore(async () => {
    await initializeDatabase();

    const result = await db.query(
      `
        UPDATE users
        SET
          first_name = $2,
          last_name = $3,
          email = $4,
          location = $5,
          updated_at = NOW()
        WHERE id = $1
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
        userId,
        profileData.firstName,
        profileData.lastName,
        profileData.email,
        profileData.location,
      ],
    );

    if (result.rows.length === 0) {
      return null;
    }

    return mapUserRow(result.rows[0] as UserRow);
  }, () => updateMemoryUserProfile(userId, profileData));

const updateUserPasswordRecord = async (
  userId: string,
  passwordData: { hash: string; salt: string },
): Promise<UserRecord | null> =>
  runWithStore(async () => {
    await initializeDatabase();

    const result = await db.query(
      `
        UPDATE users
        SET
          password_hash = $2,
          password_salt = $3,
          updated_at = NOW()
        WHERE id = $1
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
      [userId, passwordData.hash, passwordData.salt],
    );

    if (result.rows.length === 0) {
      return null;
    }

    return mapUserRow(result.rows[0] as UserRow);
  }, () => updateMemoryUserPassword(userId, passwordData));

const deleteUserRecord = async (userId: string): Promise<boolean> =>
  runWithStore(async () => {
    await initializeDatabase();

    const result = await db.query(
      `
        DELETE FROM users
        WHERE id = $1
        RETURNING id
      `,
      [userId],
    );

    return result.rows.length > 0;
  }, () => deleteMemoryUser(userId));

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

export const getCurrentUser = async (userId: string): Promise<AuthUser | null> => {
  const user = await findUserById(userId);
  return user ? serializeUser(user) : null;
};

export const updateCurrentUserProfile = async (
  userId: string,
  profileData: AuthProfileUpdateInput,
): Promise<AuthUser> => {
  try {
    const updatedUser = await updateUserProfileRecord(userId, profileData);

    if (!updatedUser) {
      throw new ApiError(404, "User not found.");
    }

    return serializeUser(updatedUser);
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

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  const user = await findUserById(userId);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const isCurrentPasswordValid = await verifyPassword(
    currentPassword,
    user.passwordSalt,
    user.passwordHash,
  );

  if (!isCurrentPasswordValid) {
    throw new ApiError(400, "Current password is incorrect.");
  }

  const nextPasswordData = await hashPassword(newPassword);
  const updatedUser = await updateUserPasswordRecord(userId, nextPasswordData);

  if (!updatedUser) {
    throw new ApiError(404, "User not found.");
  }
};

export const deleteAccount = async (userId: string): Promise<void> => {
  const deleted = await deleteUserRecord(userId);

  if (!deleted) {
    throw new ApiError(404, "User not found.");
  }
};
