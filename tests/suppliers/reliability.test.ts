import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/lib/db";
import { getSupplierIntelligence } from "../../src/services/supplier-intelligence";

describe("Phase 5 — Supplier Intelligence & Reliability Board", () => {
  let factoryId: string;

  beforeEach(async () => {
    const f = await db.factory.create({
      data: { name: "Supplier Factory", code: `SUP_${Date.now()}` },
    });
    factoryId = f.id;

    await db.supplier.create({
      data: {
        factoryId,
        name: "Apex Paper Mills",
        code: "APM-01",
        contactPerson: "David Miller",
        email: "david@apex.com",
        phone: "9876543210",
        averageLeadTimeDays: 4,
        reliabilityScore: 94.0,
      },
    });
  });

  it("should calculate supplier weighted score and assign grade EXCELLENT", async () => {
    const suppliers = await getSupplierIntelligence(factoryId);

    expect(suppliers.length).toBe(1);
    const s = suppliers[0];

    expect(s.name).toBe("Apex Paper Mills");
    expect(s.reliabilityScore).toBeGreaterThanOrEqual(90);
    expect(s.grade).toBe("EXCELLENT");
  });
});
