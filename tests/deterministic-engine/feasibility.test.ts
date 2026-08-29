import { describe, it, expect } from "vitest";
import { evaluateOrderFeasibility } from "../../src/deterministic-engine/feasibility";

describe("Phase 3 — Deterministic Engine: Feasibility Classification & 14 Parameters", () => {
  const now = new Date("2026-08-23T12:00:00Z");

  it("should classify order as SAFE when all 14 parameters satisfy thresholds", () => {
    const result = evaluateOrderFeasibility(
      {
        orderQuantity: 1000,
        unitPrice: 20.0,
        targetDeadline: new Date("2026-08-28T12:00:00Z"), // 120 hrs ahead
        currentStock: 10000,
        reservedStock: 0,
        damagedStock: 0,
        requiredMaterialPerUnit: 1.0,
        materialCostPerUnit: 5.0,
        availableMachineHours: 100,
        unitProductionTimeSeconds: 3.6, // 1 hr production
        setupTimeMinutes: 30, // 0.5 hr setup -> Total 1.5 hrs
        machineHourlyRate: 1000,
        energyKw: 10,
        operatorHourlyRate: 200,
        finishingCapacityAvailable: true,
      },
      now
    );

    expect(result.classification).toBe("SAFE");
    expect(result.parameters.materialAvailable).toBe(true);
    expect(result.parameters.usableStock).toBe(10000);
    expect(result.parameters.deadlineMarginHours).toBeGreaterThan(50);
    expect(result.options.optionA).toBeDefined();
    expect(result.options.optionB).toBeDefined();
    expect(result.options.optionC).toBeDefined();
  });

  it("should classify order as NOT_RECOMMENDED if material stock is insufficient", () => {
    const result = evaluateOrderFeasibility(
      {
        orderQuantity: 5000,
        unitPrice: 20.0,
        targetDeadline: new Date("2026-08-28T12:00:00Z"),
        currentStock: 100, // Stock is only 100! Required ~5125
        reservedStock: 0,
        damagedStock: 0,
        requiredMaterialPerUnit: 1.0,
        materialCostPerUnit: 5.0,
        availableMachineHours: 100,
        unitProductionTimeSeconds: 2.0,
        setupTimeMinutes: 30,
        machineHourlyRate: 1000,
        energyKw: 10,
        operatorHourlyRate: 200,
        finishingCapacityAvailable: true,
      },
      now
    );

    expect(result.classification).toBe("NOT_RECOMMENDED");
    expect(result.parameters.materialAvailable).toBe(false);
    expect(result.reasons.some((r) => r.includes("Material shortage"))).toBe(true);
  });

  it("should classify order as NOT_RECOMMENDED if target deadline margin is negative", () => {
    const result = evaluateOrderFeasibility(
      {
        orderQuantity: 100000,
        unitPrice: 20.0,
        targetDeadline: new Date("2026-08-23T14:00:00Z"), // Only 2 hrs remaining!
        currentStock: 200000,
        reservedStock: 0,
        damagedStock: 0,
        requiredMaterialPerUnit: 1.0,
        materialCostPerUnit: 5.0,
        availableMachineHours: 100,
        unitProductionTimeSeconds: 5.0, // ~138 hrs production required
        setupTimeMinutes: 30,
        machineHourlyRate: 1000,
        energyKw: 10,
        operatorHourlyRate: 200,
        finishingCapacityAvailable: true,
      },
      now
    );

    expect(result.classification).toBe("NOT_RECOMMENDED");
    expect(result.parameters.deadlineMarginHours).toBeLessThan(0);
    expect(result.reasons.some((r) => r.includes("Deadline impossible"))).toBe(true);
  });

  it("should classify order as POSSIBLE_WITH_RISK if deadline safety buffer is tight (< 12 hrs)", () => {
    // 5 hrs production required, deadline in 10 hrs -> Deadline margin = 5 hrs (< 12 hrs buffer)
    const result = evaluateOrderFeasibility(
      {
        orderQuantity: 3600,
        unitPrice: 20.0,
        targetDeadline: new Date("2026-08-23T22:00:00Z"), // 10 hrs away
        currentStock: 50000,
        reservedStock: 0,
        damagedStock: 0,
        requiredMaterialPerUnit: 1.0,
        materialCostPerUnit: 5.0,
        availableMachineHours: 50,
        unitProductionTimeSeconds: 5.0, // 5 hrs
        setupTimeMinutes: 0,
        machineHourlyRate: 1000,
        energyKw: 10,
        operatorHourlyRate: 200,
        finishingCapacityAvailable: true,
      },
      now
    );

    expect(result.classification).toBe("POSSIBLE_WITH_RISK");
    expect(result.reasons.some((r) => r.includes("Tight deadline margin"))).toBe(true);
  });

  it("should generate Options A, B, and C with mathematical profit calculations", () => {
    const result = evaluateOrderFeasibility(
      {
        orderQuantity: 2000,
        unitPrice: 30.0, // Revenue = 60,000
        targetDeadline: new Date("2026-08-30T12:00:00Z"),
        currentStock: 10000,
        reservedStock: 0,
        damagedStock: 0,
        requiredMaterialPerUnit: 1.0,
        materialCostPerUnit: 8.0,
        availableMachineHours: 100,
        unitProductionTimeSeconds: 3.6,
        setupTimeMinutes: 30,
        machineHourlyRate: 1200,
        energyKw: 15,
        operatorHourlyRate: 250,
        finishingCapacityAvailable: true,
      },
      now
    );

    const { optionA, optionB, optionC } = result.options;

    expect(optionA.optionKey).toBe("OPTION_A");
    expect(optionB.optionKey).toBe("OPTION_B");
    expect(optionC.optionKey).toBe("OPTION_C");

    // Option B should have faster completion date than Option A
    expect(new Date(optionB.estimatedCompletionDate).getTime()).toBeLessThan(
      new Date(optionA.estimatedCompletionDate).getTime()
    );
  });
});
