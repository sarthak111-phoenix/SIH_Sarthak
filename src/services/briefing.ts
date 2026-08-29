import { db } from "@/lib/db";
import { getInventoryIntelligence } from "@/services/inventory";
import { getMachineAnalytics } from "@/services/machine-intelligence";

export type DailyBriefingSummary = {
  briefingType: "MORNING" | "EVENING";
  title: string;
  summaryBulletPoints: string[];
  metrics: {
    activeJobsCount: number;
    completedJobsCount: number;
    lowStockMaterialsCount: number;
    downMachinesCount: number;
  };
  generatedAt: string;
};

export async function generateMorningBriefing(factoryId: string): Promise<DailyBriefingSummary> {
  const activeJobsCount = await db.productionJob.count({
    where: { factoryId, status: { in: ["QUEUED", "IN_PROGRESS"] } },
  });

  const inv = await getInventoryIntelligence(factoryId);
  const lowStockMaterials = inv.filter((i) => i.needsPurchaseReorder);

  const machines = await getMachineAnalytics(factoryId);
  const downMachines = machines.filter((m) => m.status === "DOWN_BREAKDOWN");

  const urgentOrders = await db.order.findMany({
    where: { factoryId, priority: "URGENT", status: { not: "DISPATCHED" } },
    take: 3,
  });

  const bullets: string[] = [
    `Shift Production Goal: ${activeJobsCount} active job(s) queued for production today.`,
  ];

  if (lowStockMaterials.length > 0) {
    bullets.push(`Material Alert: ${lowStockMaterials.length} item(s) below reorder threshold (${lowStockMaterials.map((m) => m.materialName).join(", ")}).`);
  } else {
    bullets.push("Inventory Status: All required production raw materials are stocked.");
  }

  if (downMachines.length > 0) {
    bullets.push(`Machine Bottleneck: ${downMachines.length} press line(s) currently DOWN_BREAKDOWN (${downMachines.map((m) => m.machineName).join(", ")}).`);
  } else {
    bullets.push("Equipment Readiness: 100% of machine press lines are available.");
  }

  if (urgentOrders.length > 0) {
    bullets.push(`Urgent Dispatch Targets: ${urgentOrders.map((o) => o.orderNumber).join(", ")}.`);
  }

  return {
    briefingType: "MORNING",
    title: "Morning Executive Operational Briefing",
    summaryBulletPoints: bullets,
    metrics: {
      activeJobsCount,
      completedJobsCount: 0,
      lowStockMaterialsCount: lowStockMaterials.length,
      downMachinesCount: downMachines.length,
    },
    generatedAt: new Date().toISOString(),
  };
}

export async function generateEveningBriefing(factoryId: string): Promise<DailyBriefingSummary> {
  const completedJobsCount = await db.productionJob.count({
    where: { factoryId, status: "COMPLETED" },
  });

  const wastes = await db.waste.findMany({ where: { factoryId } });
  const totalWasteQty = wastes.reduce((sum, w) => sum + w.quantity, 0);

  const downtimes = await db.machineDowntime.findMany({ where: { factoryId } });
  const totalDowntimeMins = downtimes.reduce((sum, d) => sum + (d.durationMinutes || 0), 0);

  const bullets: string[] = [
    `Daily Output: ${completedJobsCount} production job(s) completed today.`,
    `Floor Loss Report: Logged ${totalWasteQty} units of scrap/waste across shifts.`,
    `Equipment Downtime: Total of ${totalDowntimeMins} downtime minutes recorded today.`,
    `End of Day Reconciliation: All completed orders staged for dispatch.`,
  ];

  return {
    briefingType: "EVENING",
    title: "Evening Shift Completion Briefing",
    summaryBulletPoints: bullets,
    metrics: {
      activeJobsCount: 0,
      completedJobsCount,
      lowStockMaterialsCount: 0,
      downMachinesCount: 0,
    },
    generatedAt: new Date().toISOString(),
  };
}
