import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface ProxyOptions {
    method?: string;
    body?: string;
    cookie?: string | null;
    headers?: Record<string, string>;
}

export async function proxyToApi(
    path: string,
    options: ProxyOptions = {}
): Promise<NextResponse> {
    const backendResponse = await fetch(`${API_BASE_URL}${path}`, {
        method: options.method ?? "GET",
        body: options.body,
        headers: {
            "content-type": "application/json",
            ...(options.cookie ? { cookie: options.cookie } : {}),
            ...options.headers,
        },
        cache: "no-store",
    });

    const responseBody = await backendResponse.text();

    const response = new NextResponse(responseBody, {
        status: backendResponse.status,
        headers: {
            "content-type":
                backendResponse.headers.get("content-type") ?? "application/json",
        },
    });

    for (const setCookie of backendResponse.headers.getSetCookie()) {
        response.headers.append("set-cookie", setCookie);
    }

    return response;
}
