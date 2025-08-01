import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isAuthRoute = path === "/login" || path === "/register";
  const isProtectedRoute =
    path === "/dashboard" || path.startsWith("/dashboard/");
  const isRootPath = path === "/";

  const token = request.cookies.get("token")?.value;

  let isAuthenticated = false;
  if (token) {
    try {
      await jwtVerify(
        token,
        new TextEncoder().encode(
          process.env.JWT_SECRET || "fallback_secret_please_set_env_variable",
        ),
      );
      isAuthenticated = true;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      isAuthenticated = false;
    }
  }

  if (isRootPath) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/register", "/dashboard", "/dashboard/:path*"],
};
