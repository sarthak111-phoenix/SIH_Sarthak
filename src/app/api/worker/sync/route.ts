import { NextRequest, NextResponse } from "next/server";
import { processWorkerAction } from "@/services/worker";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { idempotencyKey, factoryId, actionType, jobId, stageId, producedQuantity, wasteQuantity, wasteReason, materialId } = body;

    if (!idempotencyKey || !factoryId || !actionType || !jobId) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_WORKER_FIELDS", message: "idempotencyKey, factoryId, actionType, and jobId are required." } },
        { status: 400 }
      );
    }

    const result = await processWorkerAction({
      idempotencyKey,
      factoryId,
      actionType,
      jobId,
      stageId,
      producedQuantity,
      wasteQuantity,
      wasteReason,
      materialId,
    });

    return NextResponse.json({
      success: true,
      data: result,
      metadata: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID() },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "WORKER_SYNC_FAILED", message: err.message } },
      { status: 500 }
    );
  }
}
