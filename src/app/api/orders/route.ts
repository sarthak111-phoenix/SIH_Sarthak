import { NextRequest, NextResponse } from "next/server";
import { createOrder, getOrdersByFactory, getOrCreateCustomer } from "@/services/orders";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const factoryId = searchParams.get("factoryId");
  const status = searchParams.get("status") || "ALL";

  if (!factoryId) {
    return NextResponse.json(
      { success: false, error: { code: "MISSING_FACTORY_ID", message: "factoryId parameter required." } },
      { status: 400 }
    );
  }

  const orders = await getOrdersByFactory(factoryId, status);
  return NextResponse.json({
    success: true,
    data: orders,
    metadata: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), factoryId },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { factoryId, customerName, customerPhone, productId, quantity, unitPrice, targetDeadline, priority, notes, specifications } = body;

    if (!factoryId || !customerName || !productId || !quantity || !targetDeadline) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_FIELDS", message: "factoryId, customerName, productId, quantity, and targetDeadline are required." } },
        { status: 400 }
      );
    }

    // Get or create customer record
    const customer = await getOrCreateCustomer(factoryId, customerName, customerPhone || "+91 99999 00000");

    const order = await createOrder({
      factoryId,
      customerId: customer.id,
      productId,
      quantity: Number(quantity),
      unitPrice: Number(unitPrice || 10),
      targetDeadline: new Date(targetDeadline),
      priority: priority || "NORMAL",
      intakeChannel: "MANUAL_FORM",
      notes,
      specifications,
    });

    return NextResponse.json({
      success: true,
      data: order,
      metadata: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), factoryId },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "ORDER_CREATE_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}
