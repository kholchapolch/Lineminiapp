import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import type { AppConfig } from "@/lib/app-config";

export const LINE_SESSION_COOKIE = "sony_line_session";

export type LineSession = {
  lineuuid: string;
  expiresAt: number;
};

export class UnauthorizedError extends Error {
  code = "UNAUTHORIZED";
  safeMessage = "LINE session is required.";

  constructor(message = "LINE session is required.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

type LineVerifyResponse = {
  sub?: unknown;
  aud?: unknown;
  exp?: unknown;
};

const LOCAL_SESSION_SECRET = "local-sony-badge-session-secret";
const SESSION_TTL_SECONDS = 60 * 60;

export function resolveAuthorizedLineUuid({
  config,
  headers,
  providedLineUuid,
  allowDemoLineUuid = false,
}: {
  config: AppConfig;
  headers: Headers;
  providedLineUuid?: string | null;
  allowDemoLineUuid?: boolean;
}): string {
  if (allowDemoLineUuid && config.appEnv === "local" && providedLineUuid?.trim()) {
    return providedLineUuid.trim();
  }

  const session = readLineSession(headers, getSessionSecret(config));

  if (session) {
    return session.lineuuid;
  }

  throw new UnauthorizedError();
}

export async function verifyLineIdToken({
  config,
  idToken,
}: {
  config: AppConfig;
  idToken: string;
}): Promise<string> {
  if (!config.lineChannelId) {
    throw new UnauthorizedError("LINE channel configuration is missing.");
  }

  const body = new URLSearchParams({
    id_token: idToken,
    client_id: config.lineChannelId,
  });

  const response = await fetch(config.lineVerifyIdTokenUrl, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      accept: "application/json",
    },
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new UnauthorizedError("LINE ID token verification failed.");
  }

  const payload = await response.json() as LineVerifyResponse;

  if (payload.aud !== config.lineChannelId || typeof payload.sub !== "string") {
    throw new UnauthorizedError("LINE ID token payload is invalid.");
  }

  if (typeof payload.exp === "number" && payload.exp * 1000 < Date.now()) {
    throw new UnauthorizedError("LINE ID token is expired.");
  }

  return payload.sub;
}

export function createLineSessionCookie({
  config,
  lineuuid,
  now = Date.now(),
}: {
  config: AppConfig;
  lineuuid: string;
  now?: number;
}): string {
  const expiresAt = now + SESSION_TTL_SECONDS * 1000;
  const payload = Buffer.from(JSON.stringify({ lineuuid, expiresAt }), "utf8").toString("base64url");
  const signature = sign(payload, getSessionSecret(config));

  return [
    `${LINE_SESSION_COOKIE}=${payload}.${signature}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${SESSION_TTL_SECONDS}`,
    config.appEnv === "local" ? "" : "Secure",
  ].filter(Boolean).join("; ");
}

function readLineSession(headers: Headers, secret: string): LineSession | null {
  const value = readCookie(headers.get("cookie"), LINE_SESSION_COOKIE);

  if (!value) {
    return null;
  }

  const [payload, signature] = value.split(".");

  if (!payload || !signature || !verifySignature(payload, signature, secret)) {
    return null;
  }

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as LineSession;

    if (!session.lineuuid || session.expiresAt < Date.now()) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

function readCookie(cookieHeader: string | null, name: string): string | null {
  const cookies = (cookieHeader ?? "").split(";").map((entry) => entry.trim());
  const prefix = `${name}=`;
  const match = cookies.find((entry) => entry.startsWith(prefix));
  return match ? match.slice(prefix.length) : null;
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expected = sign(payload, secret);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}

function getSessionSecret(config: AppConfig): string {
  return config.appSessionSecret ?? LOCAL_SESSION_SECRET;
}
