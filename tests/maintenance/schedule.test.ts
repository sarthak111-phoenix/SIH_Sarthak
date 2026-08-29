import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/lib/db";
import { scheduleMaintenance, completeMaintenance, getFactoryMaintenanceTasks } from "../../src/services/maintenance";

describe("Phase 6 — Maintenance & Equipment Rehabilitation", () => {
  let factoryId: string;
  let machineId: string;

  beforeEach(async () => {
    const f = await db.factory.create({ data: { name: "Maint Factory", code: `MNT_${Date.now()}` } });
    factoryId = f.id;

    const m = await db.machine.create({
      data: {
        factoryId,
        name: "Printing Press 300",
        code: "PP-300",
        type: "Flexo",
        status: "RUNNING",
        hourlyRate: 2000,
        energyConsumptionKw: 25,
        idealOutputRatePerHour: 4000,
      },
    });
    machineId = m.id;
  });

  it("should schedule maintenance, update machine status, and complete maintenance task", async () => {
    const maint = await scheduleMaintenance({
      factoryId,
      machineId,
      type: "PREVENTIVE",
      scheduledDate: new Date(),
      cost: 15000,
      notes: "Annual roller replacement",
    });

    expect(maint.id).toBeDefined();

    // Verify machine status updated to DOWN_MAINTENANCE
    const updatedMach = await db.machine.findUnique({ where: { id: machineId } });
    expect(updatedMach?.status).toBe("DOWN_MAINTENANCE");

    // Complete maintenance
    await completeMaintenance(maint.id, factoryId);

    // Verify machine status reset to IDLE
    const resetMach = await db.machine.findUnique({ where: { id: machineId } });
    expect(resetMach?.status).toBe("IDLE");
  });
});
