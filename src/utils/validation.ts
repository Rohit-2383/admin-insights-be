import { ApiError } from "../middlewares/error.middleware";

export type UnknownRecord = Record<string, unknown>;

export const assertRecord = (
  value: unknown,
  message = "Payload is invalid.",
): UnknownRecord => {
  if (typeof value !== "object" || value === null) {
    throw new ApiError(400, message);
  }

  return value as UnknownRecord;
};

const normalizeString = (
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

export const getString = (
  payload: UnknownRecord,
  key: string,
  fieldName: string,
  minimumLength = 1,
): string => normalizeString(payload[key], fieldName, minimumLength);

export const getOptionalString = (
  payload: UnknownRecord,
  key: string,
  fieldName: string,
  minimumLength = 1,
): string | undefined => {
  if (!(key in payload) || payload[key] === undefined || payload[key] === null) {
    return undefined;
  }

  return normalizeString(payload[key], fieldName, minimumLength);
};

export const getEmail = (
  payload: UnknownRecord,
  key: string,
  fieldName = "Email",
): string => {
  const email = getString(payload, key, fieldName);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    throw new ApiError(400, `${fieldName} must be a valid email address.`);
  }

  return email.toLowerCase();
};

export const getNumber = (
  payload: UnknownRecord,
  key: string,
  fieldName: string,
  options?: { integer?: boolean; minimum?: number },
): number => {
  const rawValue = payload[key];
  const parsedValue =
    typeof rawValue === "number"
      ? rawValue
      : typeof rawValue === "string" && rawValue.trim() !== ""
        ? Number(rawValue)
        : Number.NaN;

  if (!Number.isFinite(parsedValue)) {
    throw new ApiError(400, `${fieldName} must be a valid number.`);
  }

  if (options?.integer && !Number.isInteger(parsedValue)) {
    throw new ApiError(400, `${fieldName} must be an integer.`);
  }

  if (
    options?.minimum !== undefined &&
    parsedValue < options.minimum
  ) {
    throw new ApiError(
      400,
      `${fieldName} must be greater than or equal to ${options.minimum}.`,
    );
  }

  return parsedValue;
};

export const getBoolean = (
  payload: UnknownRecord,
  key: string,
  fieldName: string,
): boolean => {
  const value = payload[key];

  if (typeof value !== "boolean") {
    throw new ApiError(400, `${fieldName} must be a boolean.`);
  }

  return value;
};

export const getEnumValue = <T extends string>(
  payload: UnknownRecord,
  key: string,
  fieldName: string,
  values: readonly T[],
): T => {
  const value = getString(payload, key, fieldName);

  if (!values.includes(value as T)) {
    throw new ApiError(400, `${fieldName} is invalid.`);
  }

  return value as T;
};
