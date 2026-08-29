import { NextRequest, NextResponse } from "next/server";
import { evaluateAndSaveOrderFeasibility } from "@/services/feasibility";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { searchParams } = new URL(req.url);
  const factoryId = searchParams.get("factoryId");
  const { id: orderId } = await params;

  if (!factoryId) {
    return NextResponse.json(
      { success: false, error: { code: "MISSING_FACTORY_ID", message: "factoryId parameter required." } },
      { status: 400 }
    );
  }

  try {
    const result = await evaluateAndSaveOrderFeasibility(orderId, factoryId);
    return NextResponse.json({
      success: true,
      data: result,
      metadata: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID() },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "FEASIBILITY_EVALUATION_FAILED", message: err.message } },
      { status: 500 }
    );
  }
}
