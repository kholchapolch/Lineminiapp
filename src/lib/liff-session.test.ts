import { describe, expect, it, vi } from "vitest";
import { createLineSessionFromLiff } from "@/lib/liff-session";

function liffClient({
  inClient = true,
  idToken = "line-id-token",
}: {
  inClient?: boolean;
  idToken?: string | null;
} = {}) {
  return {
    init: vi.fn(),
    isInClient: vi.fn(() => inClient),
    getIDToken: vi.fn(() => idToken),
  };
}

describe("createLineSessionFromLiff", () => {
  it("posts the LINE ID token to create a server-verified session", async () => {
    const fetchImpl = vi.fn(async () => Response.json({ ok: true }));

    await createLineSessionFromLiff({
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
