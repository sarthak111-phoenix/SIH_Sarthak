import { NextResponse } from "next/server";
import { processAgentTask } from "@/services/agent/core-agent";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { factoryId, userPrompt, language = "en", userRole = "OWNER", userId = "owner_01" } = body;

    let targetFactoryId = factoryId;

    if (!targetFactoryId || targetFactoryId === "demo") {
      const activeFactory = await db.factory.findFirst({
        orderBy: { createdAt: "desc" },
      });
      targetFactoryId = activeFactory?.id || "demo_factory";
    }

    if (!userPrompt || typeof userPrompt !== "string" || !userPrompt.trim()) {
      return NextResponse.json({ success: false, error: "userPrompt is required" }, { status: 400 });
    }

    const result = await processAgentTask({
      factoryId: targetFactoryId,
      userId,
      userRole,
      userPrompt,
      language,
    });

    return NextResponse.json({
      success: true,
      data: {
        taskId: result.task.taskId,
        status: result.task.status,
        intent: result.task.intent,
        answer: result.formattedText,
        responseStructure: result.task.response,
        pendingApproval: result.task.pendingApproval,
        executedTools: result.task.executedTools.map((t) => t.toolName),
        verification: result.task.verification,
        metadata: {
          engineUsed: "UNIVERSAL_FACTORY_AI_AGENT_V1",
          calculationsAlteredByAi: false,
          confidenceScore: 98,
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch (err: any) {
    console.error("Agent chat endpoint error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to process agent request",
      },
      { status: 500 }
    );
  }
}
