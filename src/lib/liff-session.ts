"use client";

type LiffSessionClient = {
  init(input: { liffId: string }): Promise<void>;
  isInClient(): boolean;
  getIDToken(): string | null;
  getProfile?(): Promise<LineProfile>;
  openWindow?(input: { url: string; external?: boolean }): void;
};

export type LineProfile = {
  userId?: string;
  displayName?: string;
  pictureUrl?: string;
};

export type LineSessionResult = {
  /** Profile data is optional; the signed server session is the auth source. */
  profile?: LineProfile;
};

type CreateLineSessionInput = {
  liffId?: string;
  liff: LiffSessionClient;
  fetchImpl?: typeof fetch;
};

const liffInitPromises = new Map<string, Promise<LiffSessionClient>>();

export async function getCurrentLiffClient(
  liffId: string | undefined = process.env.NEXT_PUBLIC_LIFF_ID,
): Promise<LiffSessionClient> {
  if (!liffId) {
    throw new Error("LINE LIFF is not configured.");
  }

  const existing = liffInitPromises.get(liffId);

  if (existing) {
    return existing;
  }

  const initPromise = import("@line/liff")
    .then((module) => module.default)
    .then(async (liff) => {
      await liff.init({ liffId });
      return liff;
    })
    .catch((error) => {
      liffInitPromises.delete(liffId);
      throw error;
    });

  liffInitPromises.set(liffId, initPromise);
  return initPromise;
}

export async function createLineSessionFromCurrentLiff(
  liffId: string | undefined = process.env.NEXT_PUBLIC_LIFF_ID,
): Promise<LineSessionResult> {
  return createLineSessionFromLiff({
    liffId,
    liff: await getCurrentLiffClient(liffId),
  });
}

type GetLineProfileInput = {
  liffId?: string;
  liff: LiffSessionClient;
};

export async function getLineProfileFromLiff({
  liffId,
  liff,
}: GetLineProfileInput): Promise<LineProfile | null> {
  if (!liffId) {
    return null;
  }

  if (!liff.isInClient() || !liff.getProfile) {
    return null;
  }

  return liff.getProfile();
}

export async function getLineProfileFromCurrentLiff(
  liffId: string | undefined = process.env.NEXT_PUBLIC_LIFF_ID,
): Promise<LineProfile | null> {
  if (!liffId) {
    return null;
  }

  try {
    const liff = await getCurrentLiffClient(liffId);
    return getLineProfileFromLiff({ liffId, liff });
  } catch {
    return null;
  }
}

export async function createLineSessionFromLiff({
  liffId,
  liff,
  fetchImpl = fetch,
}: CreateLineSessionInput): Promise<LineSessionResult> {
  if (!liffId) {
    throw new Error("LINE LIFF is not configured.");
  }

  if (!liff.isInClient()) {
    throw new Error("Open this badge page from LINE Mini App.");
  }

  const idToken = liff.getIDToken();

  if (!idToken) {
    throw new Error("Missing LINE ID token.");
  }

  let profile: LineProfile | undefined;

  if (liff.getProfile) {
    try {
      profile = await liff.getProfile();
    } catch {
      // Profile is presentation data. A verified ID token must still create
      // the server session when LINE profile access is temporarily unavailable.
      profile = undefined;
    }
  }

  const response = await fetchImpl("/api/line-session", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    throw new Error("LINE session could not be verified.");
  }

  return { profile };
}
