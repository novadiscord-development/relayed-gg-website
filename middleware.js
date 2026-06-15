import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const { pathname, search } = req.nextUrl;

  const isDesktop =
    req.headers.get("x-relayed-desktop") === "true" ||
    req.headers.get("user-agent")?.includes("RelayedDesktop");

  if (isDesktop && pathname === "/") {
    return NextResponse.redirect(new URL("/app/me", req.url));
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (pathname.startsWith("/app") && !token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/app/:path*"],
};