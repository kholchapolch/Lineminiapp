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
  profile?: LineProfile;
};

type CreateLineSessionInput = {
  liffId?: string;
  liff: LiffSessionClient;
  fetchImpl?: typeof fetch;
};

let liffInitPromise: Promise<LiffSessionClient> | null = null;

export async function getCurrentLiffClient(): Promise<LiffSessionClient> {
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID;

  if (!liffId) {
    throw new Error("LINE LIFF is not configured.");
  }

  if (!liffInitPromise) {
    liffInitPromise = import("@line/liff")
      .then((module) => module.default)
      .then(async (liff) => {
        await liff.init({ liffId });
        return liff;
      })
      .catch((error) => {
        liffInitPromise = null;
        throw error;
      });
  }

  return liffInitPromise;
}

export async function createLineSessionFromCurrentLiff(): Promise<LineSessionResult> {
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID;

  return createLineSessionFromLiff({
    liffId,
    liff: await getCurrentLiffClient(),
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

export async function getLineProfileFromCurrentLiff(): Promise<LineProfile | null> {
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID;

  if (!liffId) {
    return null;
  }

  try {
    const liff = await getCurrentLiffClient();
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

  const profile = liff.getProfile ? await liff.getProfile() : undefined;

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
