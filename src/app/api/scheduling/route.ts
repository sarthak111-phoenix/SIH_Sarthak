import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { scheduleProductionJobs } from "@/deterministic-engine/scheduling";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const factoryId = searchParams.get("factoryId");

  if (!factoryId) {
    return NextResponse.json(
      { success: false, error: { code: "MISSING_FACTORY_ID", message: "factoryId parameter required." } },
      { status: 400 }
    );
  }

  const jobs = await db.productionJob.findMany({
    where: { factoryId },
    include: {
      order: { include: { customer: true } },
      machine: true,
      stages: true,
    },
    orderBy: { plannedStartTime: "asc" },
  });

  return NextResponse.json({
    success: true,
    data: jobs,
    metadata: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID() },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { factoryId } = body;

    if (!factoryId) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_FACTORY_ID", message: "factoryId required." } },
        { status: 400 }
      );
    }

    const orders = await db.order.findMany({
      where: { factoryId, status: { in: ["RECEIVED", "DESIGN_APPROVED", "IN_PRODUCTION"] }, isDeleted: false },
      include: { items: { include: { product: { include: { processes: true } } } } },
    });

    const machines = await db.machine.findMany({
      where: { factoryId, isDeleted: false },
    });

    const scheduleInputs = orders.map((o) => ({
      orderId: o.id,
      orderNumber: o.orderNumber,
      productId: o.items[0]?.productId || "p1",
      quantity: o.items[0]?.quantity || 1000,
      priority: (o.priority as any) || "NORMAL",
      targetDeadline: new Date(o.targetDeadline),
      processes: o.items[0]?.product?.processes.map((p) => ({
        processId: p.id,
        sequenceOrder: p.sequenceOrder,
        name: p.name,
        setupTimeMinutes: p.setupTimeMinutes,
        unitProductionTimeSeconds: p.unitProductionTimeSeconds,
      })) || [
        { processId: "pr1", sequenceOrder: 1, name: "Printing", setupTimeMinutes: 30, unitProductionTimeSeconds: 2 },
      ],
    }));

    const resources = machines.map((m) => ({
      machineId: m.id,
      machineName: m.name,
      status: m.status,
      hourlyRate: m.hourlyRate,
      nextAvailableTime: new Date(),
    }));

    const scheduleResult = scheduleProductionJobs(scheduleInputs, resources);

    return NextResponse.json({
      success: true,
      data: scheduleResult,
      metadata: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID() },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "SCHEDULING_FAILED", message: err.message } },
      { status: 500 }
    );
  }
}
