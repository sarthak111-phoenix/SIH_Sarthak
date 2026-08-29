import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  // Search by orderNumber or customer portalAccessCode
  const order = await db.order.findFirst({
    where: {
      OR: [
        { orderNumber: code },
        { customer: { portalAccessCode: code } },
      ],
      isDeleted: false,
    },
    include: {
      customer: {
        select: { companyName: true }, // Filter out sensitive customer details
      },
      items: {
        include: {
          product: {
            select: { name: true, category: true },
          },
        },
      },
      jobs: {
        select: {
          status: true,
          producedQuantity: true,
          plannedStartTime: true,
          plannedEndTime: true,
          stages: {
            select: {
              stageName: true,
              status: true,
              completedAt: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json(
      { success: false, error: { code: "NOT_FOUND", message: "Order or tracking code not found." } },
      { status: 404 }
    );
  }

  // Pure customer read-only view (no financial cost or profit data exposed!)
  return NextResponse.json({
    success: true,
    data: {
      orderNumber: order.orderNumber,
      companyName: order.customer.companyName,
      productName: order.items[0]?.product?.name || "Custom Printing Product",
      quantity: order.items[0]?.quantity || 1000,
      orderStatus: order.status,
      targetDeadline: order.targetDeadline,
      estimatedCompletion: order.estimatedCompletion || order.targetDeadline,
      stages: order.jobs[0]?.stages || [
        { stageName: "RECEIVED", status: "PASSED", completedAt: order.createdAt },
        { stageName: "DESIGN_APPROVED", status: "PASSED", completedAt: order.createdAt },
        { stageName: "PRINTING", status: "IN_PROGRESS", completedAt: null },
        { stageName: "CUTTING", status: "PENDING", completedAt: null },
        { stageName: "PACKING", status: "PENDING", completedAt: null },
        { stageName: "DISPATCHED", status: "PENDING", completedAt: null },
      ],
    },
    metadata: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID() },
  });
}
