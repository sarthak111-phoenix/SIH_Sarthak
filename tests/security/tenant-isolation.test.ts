import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/lib/db";
import { createFactory, getFactoryOperationalSummary } from "../../src/services/factory";
import { addMachine, getMachinesByFactory, softDeleteMachine } from "../../src/services/machines";
import { addMaterial, getMaterialsByFactory } from "../../src/services/materials";
import { addSupplier, getSuppliersByFactory } from "../../src/services/suppliers";
import { addEmployee, getEmployeesByFactory } from "../../src/services/employees";

describe("Phase 1 — Multi-Tenant Isolation & Core Foundation Security", () => {
  let factoryAId: string;
  let factoryBId: string;

  beforeEach(async () => {
    // Clean up test data in correct relational child-first order
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

    // 1. Create Factory A
    const factoryA = await createFactory({
      name: "Alpha Printing Press",
      code: "FACT-ALPHA",
    });
    factoryAId = factoryA.id;

    // 2. Create Factory B
    const factoryB = await createFactory({
      name: "Beta Packaging Factory",
      code: "FACT-BETA",
    });
    factoryBId = factoryB.id;
  });

  it("should create factories with default ONBOARDING status", async () => {
    const factoryA = await db.factory.findUnique({ where: { id: factoryAId } });
    expect(factoryA?.status).toBe("ONBOARDING");
    expect(factoryA?.code).toBe("FACT-ALPHA");
  });

  it("MANDATORY TENANT ISOLATION TEST: Querying Factory A MUST return 0 records from Factory B", async () => {
    // Populate Factory A records
    await addMachine({
      factoryId: factoryAId,
      name: "Heidelberg Speedmaster A",
      code: "M-ALPHA-1",
      type: "OFFSET",
      hourlyRate: 2000,
      energyConsumptionKw: 20,
      idealOutputRatePerHour: 8000,
    });
    await addMaterial({
      factoryId: factoryAId,
      name: "Coated Art Paper A",
      code: "MAT-ALPHA-1",
      category: "PAPER",
      unitOfMeasure: "SHEETS",
      costPerUnit: 3.5,
      minimumStockThreshold: 1000,
      reorderQuantity: 5000,
    });

    // Populate Factory B records
    await addMachine({
      factoryId: factoryBId,
      name: "Komori Lithrone B",
      code: "M-BETA-1",
      type: "OFFSET",
      hourlyRate: 2500,
      energyConsumptionKw: 25,
      idealOutputRatePerHour: 10000,
    });
    await addMaterial({
      factoryId: factoryBId,
      name: "Kraft Board B",
      code: "MAT-BETA-1",
      category: "BOARD",
      unitOfMeasure: "KG",
      costPerUnit: 60,
      minimumStockThreshold: 500,
      reorderQuantity: 2000,
    });

    // Execute scoped queries for Factory A
    const factoryAMachines = await getMachinesByFactory(factoryAId);
    const factoryAMaterials = await getMaterialsByFactory(factoryAId);
    const factoryASummary = await getFactoryOperationalSummary(factoryAId);

    // Assert absolute multi-tenant isolation
    expect(factoryAMachines.length).toBe(1);
    expect(factoryAMachines[0].name).toBe("Heidelberg Speedmaster A");
    expect(factoryAMachines.some((m) => m.factoryId === factoryBId)).toBe(false);

    expect(factoryAMaterials.length).toBe(1);
    expect(factoryAMaterials[0].name).toBe("Coated Art Paper A");

    expect(factoryASummary.counts.machines).toBe(1);
    expect(factoryASummary.counts.materials).toBe(1);

    // Verify Factory B query returns only Factory B data
    const factoryBMachines = await getMachinesByFactory(factoryBId);
    expect(factoryBMachines.length).toBe(1);
    expect(factoryBMachines[0].name).toBe("Komori Lithrone B");
    expect(factoryBMachines.some((m) => m.factoryId === factoryAId)).toBe(false);
  });

  it("should support CRUD operations with soft delete scoping", async () => {
    const machine = await addMachine({
      factoryId: factoryAId,
      name: "Cutter Machine 1",
      code: "CUT-01",
      type: "CUTTER",
      hourlyRate: 900,
      energyConsumptionKw: 10,
      idealOutputRatePerHour: 4000,
    });

    // Verify machine exists
    let activeMachines = await getMachinesByFactory(factoryAId);
    expect(activeMachines.length).toBe(1);

    // Soft delete machine
    await softDeleteMachine(factoryAId, machine.id);

    // Verify machine is excluded from operational queries
    activeMachines = await getMachinesByFactory(factoryAId);
    expect(activeMachines.length).toBe(0);

    // Verify raw DB record retains soft delete flag
    const deletedRecord = await db.machine.findUnique({ where: { id: machine.id } });
    expect(deletedRecord?.isDeleted).toBe(true);
  });

  it("should prevent cross-tenant soft deletion attempts", async () => {
    const machineB = await addMachine({
      factoryId: factoryBId,
      name: "Beta Binder",
      code: "BIND-01",
      type: "BINDER",
      hourlyRate: 1100,
      energyConsumptionKw: 12,
      idealOutputRatePerHour: 2500,
    });

    // Factory A attempts to soft delete Factory B's machine
    await softDeleteMachine(factoryAId, machineB.id);

    // Verify Machine B was NOT deleted because tenant ID did not match
    const machineBStatus = await db.machine.findUnique({ where: { id: machineB.id } });
    expect(machineBStatus?.isDeleted).toBe(false);
  });
});
