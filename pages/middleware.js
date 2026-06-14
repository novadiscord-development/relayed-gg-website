import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const AUTH_PAGES = ["/login", "/register"];
const PUBLIC_PAGES = ["/", "/invite"];

function isAuthPage(pathname) {
  return AUTH_PAGES.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function isPublicPage(pathname) {
  return PUBLIC_PAGES.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    if (isAuthPage(pathname) && token) {
      return NextResponse.redirect(new URL("/app", req.url));
    }

    if (pathname.startsWith("/app") && !token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        if (isPublicPage(pathname)) return true;
        if (isAuthPage(pathname)) return true;
        if (pathname.startsWith("/api/auth")) return true;
        if (pathname.startsWith("/app")) return Boolean(token);

        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/app/:path*",
    "/login",
    "/register",
    "/invite/:path*",
  ],
};
