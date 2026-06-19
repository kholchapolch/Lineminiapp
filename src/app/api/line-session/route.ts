import { NextResponse } from "next/server";
import { createLineSessionCookie, verifyLineIdToken } from "@/lib/auth-session";
import { loadAppConfig } from "@/lib/app-config";
import { toSafeError } from "@/lib/safe-logging";

type LineSessionRequest = {
  idToken?: unknown;
};

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const config = loadAppConfig();
    const body = await request.json() as LineSessionRequest;

    if (typeof body.idToken !== "string" || !body.idToken.trim()) {
      return NextResponse.json(
        { code: "MISSING_ID_TOKEN", message: "LINE ID token is required." },
        { status: 400 },
      );
    }

    const lineuuid = await verifyLineIdToken({ config, idToken: body.idToken.trim() });
    const response = NextResponse.json({ ok: true });
    response.headers.append("set-cookie", createLineSessionCookie({ config, lineuuid }));
    return response;
  } catch (error) {
    const safeError = toSafeError(error);
    return NextResponse.json(safeError, { status: safeError.code === "UNAUTHORIZED" ? 401 : 500 });
  }
}
