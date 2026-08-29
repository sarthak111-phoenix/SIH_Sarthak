import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    // Disable foreign key constraints temporarily for SQLite wipe
    await db.$executeRawUnsafe("PRAGMA foreign_keys = OFF;");

    await db.auditLog.deleteMany({});
    await db.notification.deleteMany({});
    await db.factoryKnowledge.deleteMany({});
    await db.jobProfitability.deleteMany({});
    await db.maintenance.deleteMany({});
    await db.rework.deleteMany({});
    await db.waste.deleteMany({});
    await db.machineDowntime.deleteMany({});
    await db.productionStage.deleteMany({});
    await db.productionJob.deleteMany({});
    await db.orderItem.deleteMany({});
    await db.order.deleteMany({});
    await db.customer.deleteMany({});
    await db.process.deleteMany({});
    await db.product.deleteMany({});
    await db.supplier.deleteMany({});
    await db.inventory.deleteMany({});
    await db.material.deleteMany({});
    await db.employee.deleteMany({});
    await db.machineCapability.deleteMany({});
    await db.machine.deleteMany({});
    await db.user.deleteMany({});
    await db.role.deleteMany({});
    await db.factory.deleteMany({});

    await db.$executeRawUnsafe("PRAGMA foreign_keys = ON;");

    return NextResponse.json({
      success: true,
      message: "All database accounts and dummy data have been completely wiped. The system is ready for fresh onboarding.",
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Database Wipe Error:", err);
    try {
      await db.$executeRawUnsafe("PRAGMA foreign_keys = ON;");
    } catch (e) {}

    return NextResponse.json(
      { success: false, error: { code: "RESET_FAILED", message: err.message } },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
