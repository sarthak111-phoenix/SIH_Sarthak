import { NextRequest, NextResponse } from "next/server";
import { searchFactoryKnowledge, createKnowledgeEntry } from "@/services/memory";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const factoryId = searchParams.get("factoryId");
  const query = searchParams.get("query") || undefined;
  const category = searchParams.get("category") || undefined;

  if (!factoryId) {
    return NextResponse.json(
      { success: false, error: { code: "MISSING_FACTORY_ID", message: "factoryId parameter required." } },
      { status: 400 }
    );
  }

  try {
    const data = await searchFactoryKnowledge(factoryId, query, category);
    return NextResponse.json({
      success: true,
      data,
      metadata: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID() },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "MEMORY_SEARCH_FAILED", message: err.message } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { factoryId, title, category, content, tags, userId } = body;

    if (!factoryId || !title || !content || !category) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_MEMORY_FIELDS", message: "factoryId, title, content, category are required." } },
        { status: 400 }
      );
    }

    const entry = await createKnowledgeEntry({
      factoryId,
      title,
      category,
      content,
      tags: tags || [],
      userId: userId || "usr_demo",
    });

    return NextResponse.json({
      success: true,
      data: entry,
      metadata: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID() },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "MEMORY_CREATE_FAILED", message: err.message } },
      { status: 500 }
    );
  }
}
