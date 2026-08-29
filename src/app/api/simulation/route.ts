import { NextRequest, NextResponse } from "next/server";
import { runWhatIfSimulation, applySimulationToLiveSchedule } from "@/services/simulation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, factoryId, scenarioType, downMachineId, urgentOrder, materialDelayDays, scenarioTasks } = body;

    if (!factoryId) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_FACTORY_ID", message: "factoryId required." } },
        { status: 400 }
      );
    }

    if (action === "APPLY_SCENARIO") {
      const applyResult = await applySimulationToLiveSchedule(factoryId, scenarioTasks || []);
      return NextResponse.json({
        success: true,
        data: applyResult,
        metadata: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID() },
      });
    }

    // Default: Run non-destructive simulation preview
    const result = await runWhatIfSimulation({
      factoryId,
      scenarioType: scenarioType || "MACHINE_BREAKDOWN",
      downMachineId,
      urgentOrder,
      materialDelayDays,
    });

    return NextResponse.json({
      success: true,
      data: result,
      metadata: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID() },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "SIMULATION_FAILED", message: err.message } },
      { status: 500 }
    );
  }
}
