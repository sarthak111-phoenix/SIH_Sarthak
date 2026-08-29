import { db } from "@/lib/db";

// In-memory idempotency cache to prevent duplicate offline sync mutations
const processedSyncKeys = new Set<string>();

export type WorkerActionInput = {
  idempotencyKey: string;
  factoryId: string;
  operatorId?: string;
  actionType: "START_STAGE" | "COMPLETE_STAGE" | "LOG_WASTE";
  jobId: string;
  stageId?: string;
  producedQuantity?: number;
  wasteQuantity?: number;
  wasteReason?: string;
  materialId?: string;
};

export async function processWorkerAction(input: WorkerActionInput) {
  const { idempotencyKey, factoryId, actionType, jobId, stageId, producedQuantity, wasteQuantity, wasteReason, materialId, operatorId } = input;

  // Idempotency Check
  if (processedSyncKeys.has(idempotencyKey)) {
    return {
      success: true,
      duplicateIgnored: true,
      message: `Action with idempotencyKey ${idempotencyKey} already processed.`,
    };
  }

  const job = await db.productionJob.findFirst({
    where: { id: jobId, factoryId },
  });

  if (!job) {
    throw new Error(`ProductionJob ${jobId} not found or tenant access denied.`);
  }

  let resultData: any = {};

  if (actionType === "START_STAGE" && stageId) {
    resultData = await db.productionStage.update({
      where: { id: stageId },
      data: {
        status: "IN_PROGRESS",
        startedAt: new Date(),
        operatorId,
      },
    });

    await db.productionJob.update({
      where: { id: jobId },
      data: { status: "IN_PROGRESS", actualStartTime: new Date() },
    });
  } else if (actionType === "COMPLETE_STAGE" && stageId) {
    resultData = await db.productionStage.update({
      where: { id: stageId },
      data: {
        status: "PASSED",
        completedAt: new Date(),
      },
    });

    if (producedQuantity) {
      await db.productionJob.update({
        where: { id: jobId },
        data: {
          producedQuantity: { increment: producedQuantity },
        },
      });
    }
  } else if (actionType === "LOG_WASTE" && wasteQuantity && materialId) {
    // Find employee record for reporter
    const employee = await db.employee.findFirst({ where: { factoryId } });
    if (employee) {
      resultData = await db.waste.create({
        data: {
          factoryId,
          jobId,
          materialId,
          quantity: wasteQuantity,
          reason: wasteReason || "Floor operator scrap log",
          reportedBy: employee.id,
        },
      });
    }
  }

  // Mark idempotency key as processed
  processedSyncKeys.add(idempotencyKey);

  return {
    success: true,
    duplicateIgnored: false,
    data: resultData,
  };
}

export function isKeyProcessed(key: string): boolean {
  return processedSyncKeys.has(key);
}
