import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/lib/db";
import { createFactory } from "../../src/services/factory";
import { addMaterial } from "../../src/services/materials";
import { addMachine } from "../../src/services/machines";
import { 
  createNotification, 
  aggregateNotifications, 
  getTop3AttentionItems 
} from "../../src/services/notifications";

describe("Phase 2 — Notification Aggregator & Top 3 Attention Engine", () => {
  let factoryId: string;

  beforeEach(async () => {
    await db.orderItem.deleteMany({});
    await db.order.deleteMany({});
    await db.customer.deleteMany({});
    await db.inventory.deleteMany({});
    await db.material.deleteMany({});
    await db.machine.deleteMany({});
    await db.employee.deleteMany({});
    await db.supplier.deleteMany({});
    await db.notification.deleteMany({});
    await db.process.deleteMany({});
    await db.product.deleteMany({});
    await db.auditLog.deleteMany({});
    await db.factoryKnowledge.deleteMany({});
    await db.user.deleteMany({});
    await db.role.deleteMany({});
    await db.factory.deleteMany({});

    const factory = await createFactory({
      name: "Epsilon Paper Products",
      code: "FACT-EPSILON",
    });
    factoryId = factory.id;
  });

  it("should group multiple notifications by groupKey into consolidated summaries", async () => {
    // Insert 5 notifications with the same groupKey
    for (let i = 1; i <= 5; i++) {
      await createNotification({
        factoryId,
        severity: i === 3 ? "CRITICAL" : "IMPORTANT",
        title: `Machine Speed Alarm ${i}`,
        message: `Vibration warning detected on Press ${i}`,
        groupKey: "MACHINE_VIBRATION",
      });
    }

    const summaries = await aggregateNotifications(factoryId);
    expect(summaries.length).toBe(1);
    expect(summaries[0].groupKey).toBe("MACHINE_VIBRATION");
    expect(summaries[0].count).toBe(5);
    expect(summaries[0].highestSeverity).toBe("CRITICAL");
  });

  it("should generate Top 3 Attention Cards sorted by severity", async () => {
    // 1. Create a critical material shortage
    await addMaterial({
      factoryId,
      name: "Art Board 300 GSM",
      code: "MAT-300",
      category: "BOARD",
      unitOfMeasure: "SHEETS",
      costPerUnit: 12.0,
      minimumStockThreshold: 5000,
      reorderQuantity: 20000,
      initialStock: 100, // Usable stock 100 <= 5000 threshold -> CRITICAL alert!
    });

    // 2. Create a down machine
    const machine = await addMachine({
      factoryId,
      name: "Offset Press 1",
      code: "M-OFFSET-1",
      type: "OFFSET",
      hourlyRate: 1800,
      energyConsumptionKw: 15,
      idealOutputRatePerHour: 6000,
    });

    // Set status to DOWN_BREAKDOWN
    await db.machine.update({
      where: { id: machine.id },
      data: { status: "DOWN_BREAKDOWN" },
    });

    const cards = await getTop3AttentionItems(factoryId);

    expect(cards.length).toBeGreaterThanOrEqual(2);
    expect(cards.length).toBeLessThanOrEqual(3);

    // Verify critical cards present
    const problemTexts = cards.map((c) => c.problem);
    expect(problemTexts.some((p) => p.includes("Art Board 300 GSM"))).toBe(true);
    expect(problemTexts.some((p) => p.includes("Offset Press 1"))).toBe(true);

    // Verify severity ordering
    expect(cards[0].severity).toBe("CRITICAL");
  });
});
