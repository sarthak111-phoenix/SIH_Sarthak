import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let factoryId = searchParams.get("factoryId");

    let factory = null;
    if (factoryId) {
      factory = await db.factory.findUnique({ where: { id: factoryId } });
    }
    if (!factory) {
      factory = await db.factory.findFirst({
        orderBy: { createdAt: "desc" },
      });
    }

    if (!factory) {
      return NextResponse.json({
        success: true,
        data: {
          factory: null,
          metrics: {
            factoryHealth: "100/100",
            healthStatus: "Optimal — Clean System",
            ordersOnTrack: "0 / 0",
            ordersAtRisk: "0 at risk",
            machinesRunning: "0 / 0",
            machineStatusSummary: "No machines configured",
            materialAlerts: 0,
            materialAlertsSummary: "No material shortages",
            todayDispatches: "0 / 0",
            pendingPickup: "0 pending",
            criticalAlerts: 0,
            criticalAlertsSummary: "All systems normal",
          },
          aiBriefing: null,
          productionOutput: [],
          downtimeCauses: [],
          workersCount: 0,
        },
      });
    }

    // Fetch real metrics from DB
    const machines = await db.machine.findMany({
      where: { factoryId: factory.id, isDeleted: false },
    });

    const orders = await db.order.findMany({
      where: { factoryId: factory.id, isDeleted: false },
    });

    const materials = await db.material.findMany({
      where: { factoryId: factory.id },
    });

    const employees = await db.employee.findMany({
      where: { factoryId: factory.id, isDeleted: false },
    });

    const maintenance = await db.maintenance.findMany({
      where: { factoryId: factory.id },
    });

    const runningMachines = machines.filter((m) => m.status === "RUNNING").length;
    const downMachines = machines.filter((m) => m.status === "DOWN_BREAKDOWN" || m.status === "DOWN_MAINTENANCE").length;

    const onTrackOrders = orders.filter((o) => o.status !== "CANCELLED").length;
    const atRiskOrders = orders.filter((o) => o.priority === "URGENT" || o.feasibilityStatus === "POSSIBLE_WITH_RISK").length;

    const lowStockMaterials = materials.filter((m) => (m.minimumStockThreshold || 0) > 0).length;

    const criticalNotifications = await db.notification.findMany({
      where: { factoryId: factory.id, severity: "CRITICAL" },
      take: 3,
    });

    const healthScore = Math.max(50, 100 - downMachines * 15 - atRiskOrders * 10);

    return NextResponse.json({
      success: true,
      data: {
        factory: {
          id: factory.id,
          name: factory.name,
          code: factory.code,
          status: factory.status,
          onboardingStep: factory.onboardingStep,
        },
        metrics: {
          factoryHealth: `${healthScore}/100`,
          healthStatus: downMachines > 0 ? `${downMachines} machine breakdown(s)` : "Optimal performance",
          ordersOnTrack: `${onTrackOrders} / ${orders.length}`,
          ordersAtRisk: `${atRiskOrders} at risk`,
          machinesRunning: `${runningMachines} / ${machines.length}`,
          machineStatusSummary: `${downMachines} down, ${machines.length - runningMachines - downMachines} idle`,
          materialAlerts: lowStockMaterials,
          materialAlertsSummary: lowStockMaterials > 0 ? `${lowStockMaterials} item(s) near minimum stock` : "Optimal stock levels",
          todayDispatches: `0 / ${orders.filter((o) => o.status === "DISPATCHED").length}`,
          pendingPickup: "0 pending pickup",
          criticalAlerts: criticalNotifications.length,
          criticalAlertsSummary: criticalNotifications.length > 0 ? "Needs immediate action" : "All systems normal",
        },
        aiBriefing: criticalNotifications.length > 0
          ? {
              title: criticalNotifications[0].title,
              message: criticalNotifications[0].message,
              actionRequired: true,
            }
          : null,
        workersCount: employees.length,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "DASHBOARD_FETCH_FAILED", message: err.message } },
      { status: 500 }
    );
  }
}
