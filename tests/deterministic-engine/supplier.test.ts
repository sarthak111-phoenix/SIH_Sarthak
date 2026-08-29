import { describe, it, expect } from "vitest";
import { calculateSupplierReliability } from "../../src/deterministic-engine/supplier";

describe("Phase 3 — Deterministic Engine: Supplier Reliability Scoring", () => {
  it("should calculate weighted supplier reliability score and assign EXCELLENT grade", () => {
    const res = calculateSupplierReliability({
      onTimeDeliveryPercentage: 95,
      rejectionPercentage: 1, // 99% quality
      fulfillmentPercentage: 98,
      promisedLeadTimeDays: 5,
      actualLeadTimeDays: 5, // 0 variance -> 100 lead time score
    });

    // 0.40 * 95 + 0.30 * 99 + 0.20 * 98 + 0.10 * 100 = 38 + 29.7 + 19.6 + 10 = 97.3 -> 97
    expect(res.reliabilityScore).toBe(97);
    expect(res.grade).toBe("EXCELLENT");
  });

  it("should penalize high rejection rates and lead time delays", () => {
    const res = calculateSupplierReliability({
      onTimeDeliveryPercentage: 60,
      rejectionPercentage: 15, // 85% quality
      fulfillmentPercentage: 70,
      promisedLeadTimeDays: 3,
      actualLeadTimeDays: 8, // 5 days variance -> 50 lead time score
    });

    expect(res.reliabilityScore).toBeLessThan(75);
    expect(res.grade).toBe("AVERAGE");
  });
});
