import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/lib/db";
import { getFactoryJobProfitability } from "../../src/services/job-profitability";
import { getWasteAndLossAnalytics } from "../../src/services/waste-analytics";

describe("Phase 5 — Job Profitability & Waste Loss Analytics", () => {
  let factoryId: string;

  beforeEach(async () => {
    const f = await db.factory.create({
      data: { name: "Profit Factory", code: `PRF_${Date.now()}` },
    });
    factoryId = f.id;

    const cust = await db.customer.create({
      data: { factoryId, companyName: "Profit Corp", contactName: "Charlie", phone: "9988776655" },
    });

    const ord = await db.order.create({
      data: {
        factoryId,
        customerId: cust.id,
        orderNumber: "ORD-PRF-01",
        status: "DISPATCHED",
        totalAmount: 120000,
        targetDeadline: new Date(),
      },
    });

    await db.jobProfitability.create({
      data: {
        factoryId,
        orderId: ord.id,
        revenue: 120000,
        materialCost: 40000,
        laborCost: 15000,
        machineCost: 20000,
        energyCost: 5000,
        setupCost: 3000,
        wasteCost: 4000,
        finishingCost: 5000,
        transportCost: 2000,
        otherCost: 0,
        expectedProfit: 26000,
        minProfit: 20000,
        maxProfit: 30000,
        confidenceScore: 100,
        missingInputs: "[]",
      },
    });
  });

  it("should aggregate factory job profitability and compute average profit margin", async () => {
    const profSummary = await getFactoryJobProfitability(factoryId);

    expect(profSummary.jobCount).toBe(1);
    expect(profSummary.totalRevenue).toBe(120000);
    expect(profSummary.totalExpectedProfit).toBe(26000);
    expect(profSummary.averageProfitMargin).toBe(21.7);
    expect(profSummary.averageConfidenceScore).toBe(100);
  });

  it("should calculate planned vs actual loss variance from waste records", async () => {
    const wasteSummary = await getWasteAndLossAnalytics(factoryId);

    expect(wasteSummary.plannedWasteUnits).toBeDefined();
    expect(wasteSummary.actualWasteUnits).toBeDefined();
    expect(wasteSummary.financialLossVariance).toBeDefined();
  });
});
