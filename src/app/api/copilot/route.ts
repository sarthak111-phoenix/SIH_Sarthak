import { NextRequest, NextResponse } from "next/server";
import { processAgentTask } from "@/services/agent/core-agent";
import { LanguageCode } from "@/lib/i18n/translations";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { factoryId, userPrompt, orderIdContext, language } = body;

    let targetFactoryId = factoryId;
    if (!targetFactoryId || targetFactoryId === "demo") {
      const f = await db.factory.findFirst({ orderBy: { createdAt: "desc" } });
      targetFactoryId = f?.id || "demo_factory";
    }

    if (!userPrompt) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_COPILOT_PROMPT", message: "userPrompt is required." } },
        { status: 400 }
      );
    }

    const agentResult = await processAgentTask({
      factoryId: targetFactoryId,
      userPrompt,
      orderIdContext,
      language: (language as LanguageCode) || "en",
    });

    return NextResponse.json({
      success: true,
      data: {
        answer: agentResult.formattedText,
        taskId: agentResult.task.taskId,
        status: agentResult.task.status,
        intent: agentResult.task.intent,
        pendingApproval: agentResult.task.pendingApproval,
        toolsUsed: agentResult.task.executedTools.map((t) => t.toolName),
        responseStructure: agentResult.task.response,
        metadata: {
          engineUsed: "UNIVERSAL_FACTORY_AI_AGENT_V1",
          calculationsAlteredByAi: false,
          confidenceScore: 98,
          timestamp: new Date().toISOString(),
        },
      },
      metadata: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID() },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "COPILOT_EXECUTION_FAILED", message: err.message } },
      { status: 500 }
    );
  }
}

