import { createHash } from "node:crypto";

export type SafeError = {
  code: string;
  message: string;
};

type ErrorLike = {
  code?: unknown;
  safeMessage?: unknown;
  message?: unknown;
};

const UNKNOWN_SAFE_ERROR: SafeError = {
  code: "UNKNOWN_ERROR",
  message: "Something went wrong. Please try again later.",
};

export function hashLineUuid(lineuuid: string): string {
  return createHash("sha256").update(lineuuid).digest("hex");
}

export function toSafeError(error: unknown): SafeError {
  const candidate = error as ErrorLike;

  if (
    candidate &&
    typeof candidate.code === "string" &&
    typeof candidate.safeMessage === "string"
  ) {
    return {
      code: candidate.code,
      message: candidate.safeMessage,
    };
  }

  return UNKNOWN_SAFE_ERROR;
}
