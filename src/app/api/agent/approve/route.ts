import { NextResponse } from "next/server";
import { approveAndExecuteAgentTask, rejectAgentTask } from "@/services/agent/task-center";
import { UserRole } from "@/services/agent/permissions";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { taskId, action = "APPROVE", userId = "owner_01", userRole = "OWNER" } = body;

    if (!taskId) {
      return NextResponse.json({ success: false, error: "taskId is required" }, { status: 400 });
    }

    if (action === "REJECT") {
      const rejectedTask = rejectAgentTask(taskId, userId);
      return NextResponse.json({
        success: true,
        actionPerformed: "REJECTED",
        task: rejectedTask,
      });
    }

    const approvedTask = await approveAndExecuteAgentTask(taskId, userId, userRole as UserRole);
    return NextResponse.json({
      success: true,
      actionPerformed: "APPROVED_AND_EXECUTED",
      task: approvedTask,
    });
  } catch (err: any) {
    console.error("Agent approval route error:", err);
    const isAccessDenied = err.message?.includes("Access Denied") || err.message?.includes("not authorized");
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to process agent approval request",
      },
      { status: isAccessDenied ? 403 : 500 }
    );
  }
}
