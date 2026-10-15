import { loadActiveDataset } from "@/lib/cs-portal/content-repository";
import { groupPortalProducts } from "@/lib/cs-portal/product-groups";
import { NextResponse } from "next/server";
import { loadAppConfig } from "@/lib/app-config";
import { requireLineSession, UnauthorizedError } from "@/lib/auth-session";
import {
  getPortalProducts,
  PortalProductsUnavailableError,
} from "@/lib/cs-portal/products";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}
export async function GET(request: Request): Promise<NextResponse> {
  try {
    const config = loadAppConfig();
    const session = requireLineSession({ config, headers: request.headers });
    if ([...new URL(request.url).searchParams.keys()].length)
      return json(
        {
          code: "INVALID_QUERY",
          message: "This endpoint does not accept query parameters.",
        },
        400,
      );
    const lineuuid = session.lineuuid;
    const result = await getPortalProducts(config, lineuuid);

    if (!result.products.length) return json({ ...result, productGroups: [] });
    const { dataset } = await loadActiveDataset();
    return json({
      ...result,
      productGroups: groupPortalProducts(result.products, dataset),
    });
  } catch (error) {
    if (error instanceof UnauthorizedError)
      return json(
        { code: "UNAUTHORIZED", message: "LINE session is required." },
        401,
      );
    if (error instanceof PortalProductsUnavailableError)
      return json(
        { code: "SONY_PRODUCTS_UNAVAILABLE", message: error.message },
        502,
      );
    return json(
      {
        code: "PRODUCTS_UNAVAILABLE",
        message: "Unable to load Portal products.",
      },
      500,
    );
  }
}
