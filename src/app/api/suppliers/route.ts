import { NextRequest, NextResponse } from "next/server";
import { getSupplierIntelligence } from "@/services/supplier-intelligence";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const factoryId = searchParams.get("factoryId");

  if (!factoryId) {
    return NextResponse.json(
      { success: false, error: { code: "MISSING_FACTORY_ID", message: "factoryId parameter required." } },
      { status: 400 }
    );
  }

  try {
    const data = await getSupplierIntelligence(factoryId);
    return NextResponse.json({
      success: true,
      data,
      metadata: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID() },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "SUPPLIER_INTELLIGENCE_FAILED", message: err.message } },
      { status: 500 }
    );
  }
}
