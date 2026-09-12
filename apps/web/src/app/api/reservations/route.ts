import { NextRequest } from "next/server";
import { proxyToApi } from "../_lib/proxy";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    return proxyToApi("/reservations", {
        cookie: request.headers.get("cookie"),
    });
}
