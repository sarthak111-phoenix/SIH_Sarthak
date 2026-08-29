import { describe, it, expect } from "vitest";
import { calculateMachineCapacity } from "../../src/deterministic-engine/capacity";

describe("Phase 3 — Deterministic Engine: Capacity Calculations", () => {
  it("should calculate effective output rate per hour considering scrap rate and efficiency", () => {
    const res = calculateMachineCapacity({
      idealHourlyOutputRate: 5000,
      availableProductionHours: 24,
      historicalScrapRatePercentage: 4, // 4% scrap -> 96% yield
      efficiencyFactor: 0.9, // 90% OEE efficiency
    });

    // 5000 * 0.96 * 0.90 = 4320 effective units/hr
    expect(res.effectiveOutputRatePerHour).toBe(4320);
    expect(res.grossAvailableHours).toBe(24);
  });

  it("should subtract maintenance and existing jobs to compute net available capacity", () => {
    const res = calculateMachineCapacity({
      idealHourlyOutputRate: 2000,
      availableProductionHours: 48,
      historicalScrapRatePercentage: 0,
      scheduledMaintenanceHours: 4,
      existingJobHours: 20,
    });

    // Net available hours = 48 - 4 - 20 = 24 hrs
    expect(res.netAvailableHours).toBe(24);
    expect(res.totalCapacityUnits).toBe(48000); // 24 * 2000
    expect(res.utilizationPercentage).toBe(50); // (4+20)/48 = 50%
  });
});
