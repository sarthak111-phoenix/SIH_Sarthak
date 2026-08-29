import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/lib/db";
import { searchFactoryKnowledge, createKnowledgeEntry } from "../../src/services/memory";

describe("Phase 6 — Searchable Factory Memory & Knowledge Base", () => {
  let factory1Id: string;
  let factory2Id: string;

  beforeEach(async () => {
    const f1 = await db.factory.create({ data: { name: "Memory Factory 1", code: `MEM1_${Date.now()}` } });
    const f2 = await db.factory.create({ data: { name: "Memory Factory 2", code: `MEM2_${Date.now()}` } });
    factory1Id = f1.id;
    factory2Id = f2.id;

    await createKnowledgeEntry({
      factoryId: factory1Id,
      title: "Die-Cutter Maintenance Guide",
      category: "TROUBLESHOOTING",
      content: "If blade is dull, replace with Grade A carbide blade.",
      tags: ["die-cutter", "blade"],
      userId: "usr_1",
    });

    await createKnowledgeEntry({
      factoryId: factory2Id,
      title: "Secret Recipe SOP",
      category: "PROCESS_SPEC",
      content: "Confidential factory 2 formula.",
      tags: ["secret"],
      userId: "usr_2",
    });
  });

  it("should search knowledge by keyword and respect multi-tenant isolation", async () => {
    const f1Results = await searchFactoryKnowledge(factory1Id, "blade");
    expect(f1Results.length).toBe(1);
    expect(f1Results[0].title).toBe("Die-Cutter Maintenance Guide");

    // Tenant isolation: Factory 1 cannot see Factory 2 knowledge entries
    const f1SecretResults = await searchFactoryKnowledge(factory1Id, "Secret");
    expect(f1SecretResults.length).toBe(0);
  });
});
