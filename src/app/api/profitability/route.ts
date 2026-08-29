import { NextRequest, NextResponse } from "next/server";
import { getFactoryJobProfitability } from "@/services/job-profitability";

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
    const data = await getFactoryJobProfitability(factoryId);
    return NextResponse.json({
      success: true,
      data,
      metadata: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID() },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "PROFITABILITY_ANALYTICS_FAILED", message: err.message } },
      { status: 500 }
    );
  }
}
