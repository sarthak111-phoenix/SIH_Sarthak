import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/lib/db";
import { getMachineAnalytics, logMachineDowntime } from "../../src/services/machine-intelligence";

describe("Phase 5 — Machine Output & Downtime Analytics", () => {
  let factoryId: string;
  let machineId: string;

  beforeEach(async () => {
    const f = await db.factory.create({
      data: { name: "Mach Factory", code: `MCH_${Date.now()}` },
    });
    factoryId = f.id;

    const m = await db.machine.create({
      data: {
        factoryId,
        name: "Offset Printer X",
        code: "OP-X",
        type: "Offset",
        status: "RUNNING",
        hourlyRate: 1500,
        energyConsumptionKw: 18,
        idealOutputRatePerHour: 3000,
      },
    });
    machineId = m.id;
  });

  it("should log breakdown downtime and calculate downtime breakdown by category", async () => {
    await logMachineDowntime({
      factoryId,
      machineId,
      reasonCategory: "BREAKDOWN",
      description: "Hydraulic motor overheat",
      durationMinutes: 120,
    });

    const analytics = await getMachineAnalytics(factoryId);
    expect(analytics.length).toBe(1);

    const mRes = analytics[0];
    expect(mRes.downtimeMinutesTotal).toBe(120);
    expect(mRes.downtimeByCategory.BREAKDOWN).toBe(120);
    expect(mRes.status).toBe("DOWN_BREAKDOWN");
  });
});
