import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/lib/db";
import { runWhatIfSimulation, applySimulationToLiveSchedule } from "../../src/services/simulation";

describe("Phase 4 — What-If Simulator & Non-Destructive Scenarios", () => {
  let factoryId: string;

  beforeEach(async () => {
    const f = await db.factory.create({
      data: { name: "Sim Factory", code: `SIM_${Date.now()}` },
    });
    factoryId = f.id;

    const cust = await db.customer.create({
      data: { factoryId, companyName: "Sim Corp", contactName: "Alice", phone: "9998887776" },
    });

    const prod = await db.product.create({
      data: { factoryId, name: "Sim Box", code: "SB1", category: "Packaging", unitPrice: 15 },
    });

    await db.process.create({
      data: { factoryId, productId: prod.id, sequenceOrder: 1, name: "Printing", setupTimeMinutes: 20, unitProductionTimeSeconds: 1.5 },
    });

    const mach = await db.machine.create({
      data: { factoryId, name: "Press A", code: "PA1", type: "Offset", hourlyRate: 1000, energyConsumptionKw: 10, idealOutputRatePerHour: 2000 },
    });

    await db.order.create({
      data: {
        factoryId,
        customerId: cust.id,
        orderNumber: "ORD-SIM-01",
        status: "RECEIVED",
        totalAmount: 50000,
        targetDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        items: {
          create: { productId: prod.id, quantity: 2000, unitPrice: 15, totalPrice: 30000, specifications: "{}" },
        },
      },
    });
  });

  it("should calculate scenario impact non-destructively", async () => {
    const simResult = await runWhatIfSimulation({
      factoryId,
      scenarioType: "MATERIAL_DELAY",
      materialDelayDays: 3,
    });

    expect(simResult.scenarioType).toBe("MATERIAL_DELAY");
    expect(simResult.baseline).toBeDefined();
    expect(simResult.simulation).toBeDefined();
    expect(simResult.impact).toBeDefined();

    // Verify DB ProductionJob table is unaffected by simulation preview
    const jobsCount = await db.productionJob.count({ where: { factoryId } });
    expect(jobsCount).toBe(0);
  });

  it("should apply simulated scenario tasks to DB only when explicitly invoked", async () => {
    const simResult = await runWhatIfSimulation({
      factoryId,
      scenarioType: "MACHINE_BREAKDOWN",
    });

    const applyRes = await applySimulationToLiveSchedule(factoryId, simResult.scheduledTasksPreview);
    expect(applyRes.success).toBe(true);

    const jobsCount = await db.productionJob.count({ where: { factoryId } });
    expect(jobsCount).toBeGreaterThan(0);
  });
});
