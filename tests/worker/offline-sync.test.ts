import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/lib/db";
import { processWorkerAction, isKeyProcessed } from "../../src/services/worker";

describe("Phase 4 — Worker Mobile Terminal & Idempotent Offline Sync", () => {
  let factoryId: string;
  let jobId: string;
  let stageId: string;

  beforeEach(async () => {
    const f = await db.factory.create({
      data: { name: "Worker Factory", code: `WRK_${Date.now()}` },
    });
    factoryId = f.id;

    const cust = await db.customer.create({
      data: { factoryId, companyName: "Worker Corp", contactName: "Bob", phone: "9991112223" },
    });

    const ord = await db.order.create({
      data: {
        factoryId,
        customerId: cust.id,
        orderNumber: "ORD-WRK-01",
        status: "IN_PRODUCTION",
        totalAmount: 10000,
        targetDeadline: new Date(),
      },
    });

    const job = await db.productionJob.create({
      data: {
        factoryId,
        orderId: ord.id,
        status: "QUEUED",
      },
    });
    jobId = job.id;

    const stage = await db.productionStage.create({
      data: {
        jobId: job.id,
        stageName: "PRINTING",
        status: "PENDING",
      },
    });
    stageId = stage.id;
  });

  it("should process 1-tap START_STAGE worker action and update DB stage status to IN_PROGRESS", async () => {
    const res = await processWorkerAction({
      idempotencyKey: `idempotent_test_key_1_${Date.now()}`,
      factoryId,
      actionType: "START_STAGE",
      jobId,
      stageId,
    });

    expect(res.success).toBe(true);
    expect(res.duplicateIgnored).toBe(false);

    const updatedStage = await db.productionStage.findUnique({ where: { id: stageId } });
    expect(updatedStage?.status).toBe("IN_PROGRESS");
  });

  it("should ignore duplicate sync requests with the same idempotency key", async () => {
    const key = `duplicate_test_key_${Date.now()}`;

    const res1 = await processWorkerAction({
      idempotencyKey: key,
      factoryId,
      actionType: "COMPLETE_STAGE",
      jobId,
      stageId,
      producedQuantity: 500,
    });

    expect(res1.success).toBe(true);
    expect(res1.duplicateIgnored).toBe(false);

    // Second sync with identical key
    const res2 = await processWorkerAction({
      idempotencyKey: key,
      factoryId,
      actionType: "COMPLETE_STAGE",
      jobId,
      stageId,
      producedQuantity: 500,
    });

    expect(res2.success).toBe(true);
    expect(res2.duplicateIgnored).toBe(true);
  });
});
