import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTop3AttentionItems, aggregateNotifications } from "@/services/notifications";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const factoryId = searchParams.get("factoryId");

  if (!factoryId) {
    return NextResponse.json(
      { success: false, error: { code: "MISSING_FACTORY_ID", message: "factoryId is required." } },
      { status: 400 }
    );
  }

  const factory = await db.factory.findUnique({ where: { id: factoryId } });
  if (!factory) {
    return NextResponse.json(
      { success: false, error: { code: "NOT_FOUND", message: "Factory not found." } },
      { status: 404 }
    );
  }

  const [activeOrders, totalOrders, machineCount, downMachinesCount, attentionCards, notifications] = await Promise.all([
    db.order.count({ where: { factoryId, status: { in: ["RECEIVED", "DESIGN_APPROVED", "IN_PRODUCTION"] }, isDeleted: false } }),
    db.order.count({ where: { factoryId, isDeleted: false } }),
    db.machine.count({ where: { factoryId, isDeleted: false } }),
    db.machine.count({ where: { factoryId, status: { in: ["DOWN_BREAKDOWN", "DOWN_MAINTENANCE"] }, isDeleted: false } }),
    getTop3AttentionItems(factoryId),
    aggregateNotifications(factoryId),
  ]);

  const recentOrders = await db.order.findMany({
    where: { factoryId, isDeleted: false },
    include: { customer: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return NextResponse.json({
    success: true,
    data: {
      factory: {
        id: factory.id,
        name: factory.name,
        code: factory.code,
        status: factory.status,
      },
      healthScan: {
        activeOrders,
        totalOrders,
        totalMachines: machineCount,
        downMachines: downMachinesCount,
        operatingCapacityPercentage: machineCount > 0 ? Math.round(((machineCount - downMachinesCount) / machineCount) * 100) : 100,
      },
      top3Attention: attentionCards,
      notificationsSummary: notifications,
      recentOrders,
    },
    metadata: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), factoryId },
  });
}
