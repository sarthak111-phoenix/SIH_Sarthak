import { db } from "@/lib/db";
import { evaluateAndSaveOrderFeasibility } from "@/services/feasibility";

export async function run20kBrochureDemoScenario() {
  const code = `DEMO_20K_${Date.now()}`;

  // 1. Initialize Factory
  const factory = await db.factory.create({
    data: {
      name: "Phoenix PrintWorks Demo",
      code,
      status: "ACTIVE",
      onboardingStep: 3,
    },
  });
  const factoryId = factory.id;

  // 2. Create User & Role for Audit Logging
  const role = await db.role.create({
    data: { factoryId, name: "Factory Admin", permissions: '["*"]' },
  });

  const demoUser = await db.user.create({
    data: {
      factoryId,
      name: "Demo Director",
      email: `director_${Date.now()}@phoenixprint.com`,
      passwordHash: "secure_demo_hash",
      roleId: role.id,
    },
  });

  // 3. Create 4 Machines
  const m1 = await db.machine.create({
    data: { factoryId, name: "Offset Press 1", code: "OP-01", type: "Offset", status: "RUNNING", hourlyRate: 1200, energyConsumptionKw: 15, idealOutputRatePerHour: 2000 },
  });
  const m2 = await db.machine.create({
    data: { factoryId, name: "Offset Press 2", code: "OP-02", type: "Offset", status: "RUNNING", hourlyRate: 1200, energyConsumptionKw: 15, idealOutputRatePerHour: 2000 },
  });
  const m3 = await db.machine.create({
    data: { factoryId, name: "Die Cutter 1", code: "DC-01", type: "Cutter", status: "IDLE", hourlyRate: 800, energyConsumptionKw: 10, idealOutputRatePerHour: 3000 },
  });
  const m4 = await db.machine.create({
    data: { factoryId, name: "Machine 4 - High Speed Flexo", code: "M4-FLEXO", type: "Flexo", status: "IDLE", hourlyRate: 1800, energyConsumptionKw: 22, idealOutputRatePerHour: 5000 },
  });

  // 4. Create Materials with Sufficient Raw Material Stock
  const matPaper = await db.material.create({
    data: { factoryId, name: "Art Paper 170GSM", code: "AP-170", category: "Paper", unitOfMeasure: "kg", costPerUnit: 55.0, minimumStockThreshold: 500, reorderQuantity: 2000 },
  });

  await db.inventory.create({
    data: { factoryId, materialId: matPaper.id, currentStock: 25000, reservedStock: 1000, damagedStock: 100 },
  });

  // 5. Create Product with Process Steps
  const brochureProd = await db.product.create({
    data: { factoryId, name: "Premium Tri-Fold Brochure", code: "PROD-BROCHURE-170", category: "Brochures", unitPrice: 8.5 },
  });

  await db.process.create({
    data: { factoryId, productId: brochureProd.id, sequenceOrder: 1, name: "Printing", setupTimeMinutes: 30, unitProductionTimeSeconds: 1.0 },
  });
  await db.process.create({
    data: { factoryId, productId: brochureProd.id, sequenceOrder: 2, name: "Cutting & Folding", setupTimeMinutes: 15, unitProductionTimeSeconds: 0.5 },
  });

  // 6. Create Customer
  const customer = await db.customer.create({
    data: { factoryId, companyName: "Apex Marketing Pvt Ltd", contactName: "Rahul Sharma", phone: "9876543210", email: "rahul@apex.com", portalAccessCode: "APEX-20K-TRACK" },
  });

  // 7. Create 5 Active Orders
  for (let i = 1; i <= 5; i++) {
    await db.order.create({
      data: {
        factoryId,
        customerId: customer.id,
        orderNumber: `ORD-10${i}`,
        status: "IN_PRODUCTION",
        priority: "NORMAL",
        totalAmount: 25000 * i,
        targetDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // 8. Intake Urgent 20,000-Brochure Order Due in 2 Days
  const urgentOrder = await db.order.create({
    data: {
      factoryId,
      customerId: customer.id,
      orderNumber: "ORD-20K-BROCHURE",
      status: "RECEIVED",
      priority: "URGENT",
      totalAmount: 170000,
      targetDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      items: {
        create: {
          productId: brochureProd.id,
          quantity: 20000,
          unitPrice: 8.5,
          totalPrice: 170000,
          specifications: JSON.stringify({ paper: "Art Paper 170GSM", finish: "Gloss Laminate" }),
        },
      },
    },
  });

  // 9. Execute Deterministic 14-Factor Feasibility Analysis
  const feasibility = await evaluateAndSaveOrderFeasibility(urgentOrder.id, factoryId);

  // 10. Select Option A (Machine 4 High Speed Flexo) & Accept Decision
  await db.order.update({
    where: { id: urgentOrder.id },
    data: { status: "CONFIRMED" },
  });

  const job = await db.productionJob.create({
    data: {
      factoryId,
      orderId: urgentOrder.id,
      machineId: m4.id,
      status: "QUEUED",
      plannedStartTime: new Date("2026-08-24T08:00:00Z"),
      plannedEndTime: new Date("2026-08-25T14:00:00Z"),
    },
  });

  // 11. Audit Log & Risk Center Update
  await db.notification.create({
    data: {
      factoryId,
      title: "Urgent 20k Brochure Feasibility Accepted",
      message: `Order ORD-20K-BROCHURE evaluated as ${feasibility.deterministicResult.classification}. Allocated to Machine 4 (High Speed Flexo) for 25 Aug delivery.`,
      severity: "IMPORTANT",
      groupKey: "ORDER_INTAKE",
    },
  });

  await db.auditLog.create({
    data: {
      factoryId,
      userId: demoUser.id,
      action: "FEASIBILITY_DECISION_ACCEPTED",
      details: JSON.stringify({
        orderNumber: urgentOrder.orderNumber,
        classification: feasibility.deterministicResult.classification,
        selectedOption: "Option A",
        allocatedMachine: m4.name,
      }),
    },
  });

  return {
    success: true,
    factoryId,
    orderId: urgentOrder.id,
    orderNumber: urgentOrder.orderNumber,
    classification: feasibility.deterministicResult.classification,
    confidenceScore: feasibility.deterministicResult.confidenceScore,
    optionA: feasibility.deterministicResult.options.optionA,
    allocatedMachine: m4.name,
    jobId: job.id,
    trackingCode: customer.portalAccessCode,
  };
}
