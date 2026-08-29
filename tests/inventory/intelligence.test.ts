import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/lib/db";
import { getInventoryIntelligence } from "../../src/services/inventory";

describe("Phase 5 — Inventory Intelligence & Shortage Date Predictor", () => {
  let factoryId: string;

  beforeEach(async () => {
    const f = await db.factory.create({
      data: { name: "Inv Factory", code: `INV_${Date.now()}` },
    });
    factoryId = f.id;

    const mat = await db.material.create({
      data: {
        factoryId,
        name: "Kraft Paper 250GSM",
        code: "KP-250",
        category: "Paper",
        unitOfMeasure: "kg",
        costPerUnit: 45.0,
        minimumStockThreshold: 1000,
        reorderQuantity: 5000,
      },
    });

    await db.inventory.create({
      data: {
        factoryId,
        materialId: mat.id,
        currentStock: 500, // Stock is below 1000 threshold!
        reservedStock: 100,
        damagedStock: 50,
      },
    });
  });

  it("should calculate usable stock correctly and trigger purchase reorder alert", async () => {
    const intelligence = await getInventoryIntelligence(factoryId);
    expect(intelligence.length).toBe(1);

    const item = intelligence[0];
    // Usable stock = 500 - 100 - 50 = 350
    expect(item.usableStock).toBe(350);
    expect(item.needsPurchaseReorder).toBe(true);
    expect(item.status).toBe("LOW_STOCK");
    expect(item.predictedShortageDays).toBeLessThanOrEqual(7);
  });
});
