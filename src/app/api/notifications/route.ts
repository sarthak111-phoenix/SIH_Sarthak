import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { aggregateNotifications } from "@/services/notifications";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const factoryId = searchParams.get("factoryId");

  if (!factoryId) {
    return NextResponse.json(
      { success: false, error: { code: "MISSING_FACTORY_ID", message: "factoryId required." } },
      { status: 400 }
    );
  }

  try {
    const data = await aggregateNotifications(factoryId);
    return NextResponse.json({
      success: true,
      data,
      metadata: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID() },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "NOTIFICATIONS_FETCH_FAILED", message: err.message } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { notificationId, factoryId } = body;

    if (!notificationId || !factoryId) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_FIELDS", message: "notificationId and factoryId required." } },
        { status: 400 }
      );
    }

    await db.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "NOTIFICATION_MARK_READ_FAILED", message: err.message } },
      { status: 500 }
    );
  }
}
