import { NextRequest, NextResponse } from "next/server";
import { scheduleMaintenance, completeMaintenance, completeMaintenanceForMachine, getFactoryMaintenanceTasks } from "@/services/maintenance";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let factoryId = searchParams.get("factoryId");

  if (!factoryId || factoryId === "demo") {
    const activeFactory = await db.factory.findFirst({ orderBy: { createdAt: "desc" } });
    factoryId = activeFactory?.id || "demo_factory";
  }

  try {
    const tasks = await getFactoryMaintenanceTasks(factoryId);
    return NextResponse.json({
      success: true,
      data: tasks,
      metadata: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID() },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "MAINTENANCE_FETCH_FAILED", message: err.message } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { action, factoryId, machineId, maintenanceId, type, scheduledDate, cost, notes } = body;

    if (!factoryId || factoryId === "demo") {
      const activeFactory = await db.factory.findFirst({ orderBy: { createdAt: "desc" } });
      factoryId = activeFactory?.id || "demo_factory";
    }

    if (action === "COMPLETE") {
      if (maintenanceId) {
        const res = await completeMaintenance(maintenanceId, factoryId);
        return NextResponse.json({ success: true, data: res });
      } else {
        const res = await completeMaintenanceForMachine(factoryId, machineId || "M-02");
        return NextResponse.json({ success: true, data: res });
      }
    }

    if (!machineId || !type) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_MAINTENANCE_FIELDS", message: "machineId and type required." } },
        { status: 400 }
      );
    }

    const maint = await scheduleMaintenance({
      factoryId,
      machineId,
      type,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : new Date(),
      cost,
      notes,
    });

    return NextResponse.json({
      success: true,
      data: maint,
      metadata: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID() },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "MAINTENANCE_OPERATION_FAILED", message: err.message } },
      { status: 500 }
    );
  }
}
