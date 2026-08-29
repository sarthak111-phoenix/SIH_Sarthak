import { NextResponse } from "next/server";
import { listAgentTasks } from "@/services/agent/task-center";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let factoryId = searchParams.get("factoryId");

    if (!factoryId || factoryId === "demo") {
      const f = await db.factory.findFirst({ orderBy: { createdAt: "desc" } });
      factoryId = f?.id || "demo_factory";
    }

    const tasks = listAgentTasks(factoryId);
    return NextResponse.json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
