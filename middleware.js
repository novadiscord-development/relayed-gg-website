import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

function getPathname(req) {
  return req?.nextUrl?.pathname || new URL(req.url).pathname;
}

function getSearch(req) {
  return req?.nextUrl?.search || new URL(req.url).search;
}

function isAuthPage(pathname) {
  return pathname === "/login" || pathname === "/register";
}

export default withAuth(
  function middleware(req) {
    const pathname = getPathname(req);
    const search = getSearch(req);
    const token = req.nextauth?.token;

    if (isAuthPage(pathname) && token) {
      return NextResponse.redirect(new URL("/app", req.url));
    }

    if (pathname.startsWith("/app") && !token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname + search);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  },
  {
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = getPathname(req);

        if (isAuthPage(pathname)) return true;
        if (pathname.startsWith("/app")) return Boolean(token);

        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/app/:path*", "/login", "/register"],
};
