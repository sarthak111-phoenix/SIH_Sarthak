import { NextRequest, NextResponse } from "next/server";

export function enforceTenantIsolation(request: NextRequest, authenticatedFactoryId: string) {
  const requestFactoryId = request.headers.get("x-factory-id");

  if (requestFactoryId && requestFactoryId !== authenticatedFactoryId) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "TENANT_MISMATCH",
          message: "Cross-tenant data access is strictly prohibited.",
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
        },
      },
      { status: 403 }
    );
  }

  const response = NextResponse.next();
  response.headers.set("x-factory-id", authenticatedFactoryId);
  return response;
}
