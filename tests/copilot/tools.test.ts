import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/lib/db";
import { askFactoryCopilot } from "../../src/services/copilot";
import { createKnowledgeEntry } from "../../src/services/memory";

describe("Phase 6 — Controlled-Tool Factory Copilot", () => {
  let factoryId: string;

  beforeEach(async () => {
    const f = await db.factory.create({
      data: { name: "Copilot Factory", code: `COP_${Date.now()}` },
    });
    factoryId = f.id;

    await createKnowledgeEntry({
      factoryId,
      title: "Offset Press Roller Calibration SOP",
      category: "MACHINE_SOP",
      content: "Calibrate roller pressure every 50,000 prints using gauge micrometer.",
      tags: ["sop", "calibration"],
    });
  });

  it("should execute search_factory_sop tool and return mandatory zero-hallucination metadata", async () => {
    const res = await askFactoryCopilot({
      factoryId,
      userPrompt: "How to calibrate offset press roller SOP?",
    });

    expect(res.answer).toBeDefined();
    expect(res.toolsUsed).toContain("search_factory_sop");
    expect(res.metadata.calculationsAlteredByAi).toBe(false);
    expect(res.metadata.engineUsed).toBe("CONTROLLED_TOOL_COPILOT_V1");
  });

  it("should execute check_inventory_stock tool when querying stock levels", async () => {
    const res = await askFactoryCopilot({
      factoryId,
      userPrompt: "What is our current material inventory stock?",
    });

    expect(res.toolsUsed).toContain("check_inventory_stock");
    expect(res.metadata.calculationsAlteredByAi).toBe(false);
  });
});
