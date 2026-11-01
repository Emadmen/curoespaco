import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "cora_admin_session";

/**
 * Fast first line of defence for the admin area: requests without a session
 * cookie never reach admin pages/APIs. The session itself is validated against
 * the database in every admin page, server action and route handler
 * (see lib/auth.ts → requireAdmin / getCurrentAdmin).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  if (!request.cookies.get(SESSION_COOKIE)?.value) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
