import { NextResponse } from "next/server";
import { getMyProductData } from "@/lib/my-product/get-my-product-data";
import { toSafeError } from "@/lib/safe-logging";

type MyProductRouteContext = {
  params: { productId: string };
};

export async function GET(
  request: Request,
  { params }: MyProductRouteContext,
): Promise<NextResponse> {
  try {
    const lineuuid = new URL(request.url).searchParams.get("lineuuid") ?? "";
    const data = await getMyProductData(params.productId, lineuuid);

    if (!data) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Product badge not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(toSafeError(error), { status: 500 });
  }
}
