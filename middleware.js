import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

function isAuthPage(pathname) {
  return pathname === "/login" || pathname === "/register";
}

export async function middleware(req) {
  const { pathname, search } = req.nextUrl;

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (isAuthPage(pathname) && token) {
    return NextResponse.redirect(new URL("/app", req.url));
  }

  if (pathname.startsWith("/app") && !token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/login", "/register"],
};
