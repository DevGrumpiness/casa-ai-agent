import { NextRequest } from "next/server";
import { proxyToApi } from "../../_lib/proxy";

export async function POST(request: NextRequest) {
    return proxyToApi("/auth/logout", {
        method: "POST",
        cookie: request.headers.get("cookie"),
    });
}
