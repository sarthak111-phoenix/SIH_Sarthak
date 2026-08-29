import { NextRequest, NextResponse } from "next/server";
import { generateMorningBriefing, generateEveningBriefing } from "@/services/briefing";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const factoryId = searchParams.get("factoryId");
  const type = searchParams.get("type") || "MORNING";

  if (!factoryId) {
    return NextResponse.json(
      { success: false, error: { code: "MISSING_FACTORY_ID", message: "factoryId parameter required." } },
      { status: 400 }
    );
  }

  try {
    const briefing =
      type === "EVENING"
        ? await generateEveningBriefing(factoryId)
        : await generateMorningBriefing(factoryId);

    return NextResponse.json({
      success: true,
      data: briefing,
      metadata: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID() },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "BRIEFING_GENERATION_FAILED", message: err.message } },
      { status: 500 }
    );
  }
}
