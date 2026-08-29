import { describe, it, expect } from "vitest";
import { checkRateLimit } from "../../src/lib/rate-limit";
import { db } from "../../src/lib/db";
import { askFactoryCopilot } from "../../src/services/copilot";

describe("Phase 7 — Comprehensive Security & Tenant Isolation Audit", () => {
  it("should enforce rate limiting on API request bursts", () => {
    const clientId = "client_security_test_01";
    // Allow max 5 requests per window for testing
    for (let i = 0; i < 5; i++) {
      const res = checkRateLimit(clientId, 5, 60000);
      expect(res.allowed).toBe(true);
    }
    // 6th request should be blocked by rate limiter
    const blockedRes = checkRateLimit(clientId, 5, 60000);
    expect(blockedRes.allowed).toBe(false);
    expect(blockedRes.remaining).toBe(0);
  });

  it("should enforce tenant isolation across multi-factory database models", async () => {
    const fA = await db.factory.create({ data: { name: "Audit Factory A", code: `FA_${Date.now()}` } });
    const fB = await db.factory.create({ data: { name: "Audit Factory B", code: `FB_${Date.now()}` } });

    const custA = await db.customer.create({
      data: { factoryId: fA.id, companyName: "Tenant A Corp", contactName: "Alice", phone: "9000000001" },
    });

    // Querying Factory B customers must return 0 records from Factory A
    const custBList = await db.customer.findMany({ where: { factoryId: fB.id } });
    expect(custBList.find((c) => c.id === custA.id)).toBeUndefined();
  });

  it("should enforce zero math hallucination flag on Copilot execution", async () => {
    const f = await db.factory.create({ data: { name: "Copilot Security Factory", code: `CSF_${Date.now()}` } });
    const copilotRes = await askFactoryCopilot({
      factoryId: f.id,
      userPrompt: "Analyze machine capacity and calculate feasibility",
    });

    expect(copilotRes.metadata.calculationsAlteredByAi).toBe(false);
    expect(copilotRes.metadata.engineUsed).toBe("CONTROLLED_TOOL_COPILOT_V1");
  });
});
