import { NextRequest, NextResponse } from "next/server";
import { run20kBrochureDemoScenario } from "@/services/demo-scenario";

export async function POST(req: NextRequest) {
  try {
    const demoResult = await run20kBrochureDemoScenario();
    return NextResponse.json({
      success: true,
      data: demoResult,
      metadata: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID() },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "DEMO_SCENARIO_FAILED", message: err.message } },
      { status: 500 }
    );
  }
}
