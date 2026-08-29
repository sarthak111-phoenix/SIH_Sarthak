import { NextRequest, NextResponse } from "next/server";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/copilot",
  "/notifications",
  "/orders",
  "/production",
  "/machines",
  "/maintenance",
  "/inventory",
  "/suppliers",
  "/reports",
  "/profitability",
  "/worker",
  "/memory",
  "/onboarding",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    const authCookie = req.cookies.get("factoryiq_authenticated");
    if (!authCookie || authCookie.value !== "true") {
      const loginUrl = new URL("/signup", req.url);
      loginUrl.searchParams.set("reason", "auth_required");
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/copilot/:path*",
    "/notifications/:path*",
    "/orders/:path*",
    "/production/:path*",
    "/machines/:path*",
    "/maintenance/:path*",
    "/inventory/:path*",
    "/suppliers/:path*",
    "/reports/:path*",
    "/profitability/:path*",
    "/worker/:path*",
    "/memory/:path*",
    "/onboarding/:path*",
  ],
};
