import { NextRequest, NextResponse } from "next/server";
import { confirmAndCommitOrderDraft, getOrCreateCustomer } from "@/services/orders";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { draftId, factoryId, companyName, productId, quantity, unitPrice, targetDeadline, priority } = body;

    if (!draftId || !factoryId || !companyName || !productId || !quantity || !targetDeadline) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_CONFIRM_FIELDS", message: "draftId, factoryId, companyName, productId, quantity, targetDeadline are required." } },
        { status: 400 }
      );
    }

    const customer = await getOrCreateCustomer(factoryId, companyName, "+91 98765 00000");

    const order = await confirmAndCommitOrderDraft(draftId, factoryId, {
      customerId: customer.id,
      productId,
      quantity: Number(quantity),
      unitPrice: Number(unitPrice || 15),
      targetDeadline,
      priority: priority || "NORMAL",
    });

    return NextResponse.json({
      success: true,
      data: order,
      metadata: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID() },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "CONFIRM_FAILED", message: err.message } },
      { status: 500 }
    );
  }
}
