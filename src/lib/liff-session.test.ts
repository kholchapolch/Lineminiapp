import { describe, expect, it, vi } from "vitest";
import { createLineSessionFromLiff, getLineProfileFromLiff } from "@/lib/liff-session";

function liffClient({
  inClient = true,
  idToken = "line-id-token",
  profile = { userId: "line-user-001", displayName: "Real LINE User", pictureUrl: "https://example.com/line.png" },
}: {
  inClient?: boolean;
  idToken?: string | null;
  profile?: { userId?: string; displayName?: string; pictureUrl?: string };
} = {}) {
  return {
    init: vi.fn(),
    isInClient: vi.fn(() => inClient),
    getIDToken: vi.fn(() => idToken),
    getProfile: vi.fn(async () => profile),
  };
}

describe("createLineSessionFromLiff", () => {
  it("posts the LINE ID token to create a server-verified session", async () => {
    const fetchImpl = vi.fn(async () => Response.json({ ok: true }));

    const result = await createLineSessionFromLiff({
      liffId: "liff-id",
      liff: liffClient(),
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledWith("/api/line-session", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ idToken: "line-id-token" }),
    });
    expect(result.profile).toEqual({
      userId: "line-user-001",
      displayName: "Real LINE User",
      pictureUrl: "https://example.com/line.png",
    });
  });

  it("rejects use outside the LINE client", async () => {
    await expect(
      createLineSessionFromLiff({
        liffId: "liff-id",
        liff: liffClient({ inClient: false }),
        fetchImpl: vi.fn(),
      }),
    ).rejects.toThrow(/LINE Mini App/);
  });

  it("rejects missing LINE ID token", async () => {
    await expect(
      createLineSessionFromLiff({
        liffId: "liff-id",
        liff: liffClient({ idToken: null }),
        fetchImpl: vi.fn(),
      }),
    ).rejects.toThrow(/Missing LINE ID token/);
  });

  it("rejects failed server-side LINE verification", async () => {
    await expect(
      createLineSessionFromLiff({
        liffId: "liff-id",
        liff: liffClient(),
        fetchImpl: vi.fn(async () => Response.json({ code: "UNAUTHORIZED" }, { status: 401 })),
      }),
    ).rejects.toThrow(/could not be verified/);
  });
});

describe("getLineProfileFromLiff", () => {
  it("returns the LINE profile when opened inside the LINE client", async () => {
    await expect(
      getLineProfileFromLiff({
        liffId: "liff-id",
        liff: liffClient(),
      }),
    ).resolves.toEqual({
      userId: "line-user-001",
      displayName: "Real LINE User",
      pictureUrl: "https://example.com/line.png",
    });
  });

  it("returns null outside the LINE client or without LIFF config", async () => {
    await expect(
      getLineProfileFromLiff({
        liffId: "liff-id",
        liff: liffClient({ inClient: false }),
      }),
    ).resolves.toBeNull();

    await expect(
      getLineProfileFromLiff({
        liff: liffClient(),
      }),
    ).resolves.toBeNull();
  });
});
