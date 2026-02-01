import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const url = request.nextUrl;
    const hostname = request.headers.get("host") || "";

    // Get the subdomain (e.g., "business" from "business.localhost:3000")
    const domain = hostname.split(":")[0];
    let subdomain = "";

    // Localhost logic
    if (domain.includes("localhost")) {
        const parts = domain.split(".");
        if (parts.length > 1 && parts[0] !== "www") {
            subdomain = parts[0];
        }
    } else {
        // Production logic
        const parts = domain.split(".");
        if (parts.length > 2) {
            subdomain = parts[0];
        }
    }

    // Rewrite logic for "business" subdomain
    if (subdomain === "business") {
        // Rewrite request to the /business path
        return NextResponse.rewrite(new URL(`/business${url.pathname}`, request.url));
    }

    // Regular flow
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - file extensions (svg, png, etc.)
         */
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
