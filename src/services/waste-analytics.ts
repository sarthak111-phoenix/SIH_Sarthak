import { db } from "@/lib/db";

export type WasteLossReportSummary = {
  totalWasteQuantity: number;
  totalWasteCost: number;
  totalReworkCost: number;
  plannedWasteUnits: number;
  actualWasteUnits: number;
  lossVarianceUnits: number;
  financialLossVariance: number;
  wasteByReason: Record<string, number>;
};

export async function getWasteAndLossAnalytics(factoryId: string): Promise<WasteLossReportSummary> {
  const wastes = await db.waste.findMany({
    where: { factoryId },
    include: { material: true },
  });

  const reworks = await db.rework.findMany({
    where: { factoryId },
  });

  let totalWasteQuantity = 0;
  let totalWasteCost = 0;
  const wasteByReason: Record<string, number> = {};

  for (const w of wastes) {
    totalWasteQuantity += w.quantity;
    const cost = w.quantity * (w.material?.costPerUnit || 5.0);
    totalWasteCost += cost;
    wasteByReason[w.reason] = (wasteByReason[w.reason] || 0) + w.quantity;
  }

  const totalReworkCost = reworks.reduce((sum, r) => sum + r.additionalCost, 0);

  // Planned vs Actual Loss Math
  const plannedWasteUnits = 500; // Benchmark baseline
  const actualWasteUnits = totalWasteQuantity;
  const lossVarianceUnits = actualWasteUnits - plannedWasteUnits;
  const averageMaterialUnitCost = 4.5;
  const financialLossVariance = lossVarianceUnits * averageMaterialUnitCost;

  return {
    totalWasteQuantity,
    totalWasteCost,
    totalReworkCost,
    plannedWasteUnits,
    actualWasteUnits,
    lossVarianceUnits,
    financialLossVariance,
    wasteByReason,
  };
}
