import { NextRequest, NextResponse } from "next/server";
import { getMachineAnalytics, logMachineDowntime } from "@/services/machine-intelligence";

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
    const data = await getMachineAnalytics(factoryId);
    return NextResponse.json({
      success: true,
      data,
      metadata: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID() },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "MACHINE_ANALYTICS_FAILED", message: err.message } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { factoryId, machineId, reasonCategory, description, durationMinutes } = body;

    if (!factoryId || !machineId || !reasonCategory) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_FIELDS", message: "factoryId, machineId, reasonCategory are required." } },
        { status: 400 }
      );
    }

    const dt = await logMachineDowntime({
      factoryId,
      machineId,
      reasonCategory,
      description,
      durationMinutes: durationMinutes || 30,
    });

    return NextResponse.json({
      success: true,
      data: dt,
      metadata: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID() },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "DOWNTIME_LOG_FAILED", message: err.message } },
      { status: 500 }
    );
  }
}
