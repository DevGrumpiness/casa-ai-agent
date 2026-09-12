import { NextRequest, NextResponse } from "next/server";
import { proxyToApi } from "../../_lib/proxy";

const LOGIN_RATE_LIMIT_WINDOW_MS = 60_000;
const LOGIN_RATE_LIMIT_ATTEMPTS = 5;
const RATE_LIMIT_MESSAGE = "Zu viele Versuche. Bitte später erneut versuchen.";

const failedLoginAttempts = new Map<string, number[]>();

function getClientIp(request: NextRequest): string {
    return request.headers.get("x-real-ip") ?? "unknown";
}

function recentFailedAttempts(clientIp: string): number[] {
    const now = Date.now();
    const recent = (failedLoginAttempts.get(clientIp) ?? []).filter(
        (timestamp) => now - timestamp < LOGIN_RATE_LIMIT_WINDOW_MS
    );

    failedLoginAttempts.set(clientIp, recent);

    return recent;
}

function isRateLimited(clientIp: string): boolean {
    return recentFailedAttempts(clientIp).length >= LOGIN_RATE_LIMIT_ATTEMPTS;
}

function registerFailedLogin(clientIp: string): void {
    recentFailedAttempts(clientIp).push(Date.now());
}

function clearFailedLogins(clientIp: string): void {
    failedLoginAttempts.delete(clientIp);
}

export async function POST(request: NextRequest) {
    const clientIp = getClientIp(request);

    if (isRateLimited(clientIp)) {
        return NextResponse.json({ detail: RATE_LIMIT_MESSAGE }, { status: 429 });
    }

    const body = await request.text();

    const response = await proxyToApi("/auth/login", {
        method: "POST",
        body,
        headers: process.env.BFF_PROXY_SECRET
            ? { "x-bff-secret": process.env.BFF_PROXY_SECRET }
            : undefined,
    });

    if (response.status === 401) {
        registerFailedLogin(clientIp);
    } else if (response.status === 200) {
        clearFailedLogins(clientIp);
    }

    return response;
}
