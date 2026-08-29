import { db } from "@/lib/db";
import { calculateUsableStock } from "@/deterministic-engine/inventory";

export type InventoryItemSummary = {
  materialId: string;
  materialName: string;
  materialCode: string;
  category: string;
  unitOfMeasure: string;
  costPerUnit: number;
  currentStock: number;
  reservedStock: number;
  damagedStock: number;
  usableStock: number;
  minimumStockThreshold: number;
  reorderQuantity: number;
  status: "OK" | "LOW_STOCK" | "CRITICAL_SHORTAGE";
  dailyConsumptionRate: number;
  predictedShortageDays: number | null;
  predictedShortageDate: Date | null;
  needsPurchaseReorder: boolean;
};

export async function getInventoryIntelligence(factoryId: string): Promise<InventoryItemSummary[]> {
  const materials = await db.material.findMany({
    where: { factoryId, isDeleted: false },
    include: { inventory: true },
  });

  const results: InventoryItemSummary[] = [];

  for (const mat of materials) {
    const inv = mat.inventory;
    const currentStock = inv?.currentStock || 0;
    const reservedStock = inv?.reservedStock || 0;
    const damagedStock = inv?.damagedStock || 0;

    const usableStock = calculateUsableStock({ currentStock, reservedStock, damagedStock });

    // Estimate daily consumption rate from active production jobs requiring this material
    // Default 100 units/day if active jobs exist
    const activeJobsCount = await db.productionJob.count({
      where: { factoryId, status: { in: ["QUEUED", "IN_PROGRESS"] } },
    });
    const dailyConsumptionRate = activeJobsCount > 0 ? activeJobsCount * 150 : 50;

    let predictedShortageDays: number | null = null;
    let predictedShortageDate: Date | null = null;

    if (dailyConsumptionRate > 0) {
      predictedShortageDays = Math.max(0, Math.floor(usableStock / dailyConsumptionRate));
      predictedShortageDate = new Date(Date.now() + predictedShortageDays * 24 * 60 * 60 * 1000);
    }

    let status: "OK" | "LOW_STOCK" | "CRITICAL_SHORTAGE" = "OK";
    const needsPurchaseReorder = usableStock <= mat.minimumStockThreshold;

    if (usableStock <= 0) {
      status = "CRITICAL_SHORTAGE";
    } else if (needsPurchaseReorder) {
      status = "LOW_STOCK";
    }

    results.push({
      materialId: mat.id,
      materialName: mat.name,
      materialCode: mat.code,
      category: mat.category,
      unitOfMeasure: mat.unitOfMeasure,
      costPerUnit: mat.costPerUnit,
      currentStock,
      reservedStock,
      damagedStock,
      usableStock,
      minimumStockThreshold: mat.minimumStockThreshold,
      reorderQuantity: mat.reorderQuantity,
      status,
      dailyConsumptionRate,
      predictedShortageDays,
      predictedShortageDate,
      needsPurchaseReorder,
    });
  }

  return results;
}
