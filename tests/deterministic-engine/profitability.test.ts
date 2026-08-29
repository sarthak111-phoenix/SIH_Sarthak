import { describe, it, expect } from "vitest";
import { calculateJobProfitability } from "../../src/deterministic-engine/profitability";

describe("Phase 3 — Deterministic Engine: Job Profitability & Cost Breakdown", () => {
  it("should calculate expected profit, worst-case minimum profit, and best-case maximum profit", () => {
    const res = calculateJobProfitability({
      revenue: 100000,
      materialCost: 30000,
      laborCost: 10000,
      machineCost: 15000,
      energyCost: 5000,
      setupCost: 2000,
      wasteCost: 3000,
      finishingCost: 4000,
      transportCost: 1000,
      providedInputs: [
        "materialCost",
        "laborCost",
        "machineCost",
        "energyCost",
        "setupCost",
        "wasteCost",
        "finishingCost",
        "transportCost",
      ],
    });

    const expectedTotalCost = 30000 + 10000 + 15000 + 5000 + 2000 + 3000 + 4000 + 1000; // 70,000
    expect(res.totalCost).toBe(70000);
    expect(res.expectedProfit).toBe(30000);
    expect(res.profitMarginPercentage).toBe(30.0);
    expect(res.minimumProfit).toBeLessThan(res.expectedProfit);
    expect(res.maximumProfit).toBeGreaterThan(res.expectedProfit);
    expect(res.confidenceScore).toBe(100);
    expect(res.missingCostInputs.length).toBe(0);
  });
});
