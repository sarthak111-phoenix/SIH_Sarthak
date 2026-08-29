import { describe, it, expect } from "vitest";
import { run20kBrochureDemoScenario } from "../../src/services/demo-scenario";
import { db } from "../../src/lib/db";

describe("Phase 7 — 20,000-Brochure End-to-End Demo Scenario", () => {
  it("should execute complete 20,000-brochure demo scenario with real application logic", async () => {
    const demo = await run20kBrochureDemoScenario();

    expect(demo.success).toBe(true);
    expect(demo.orderNumber).toBe("ORD-20K-BROCHURE");
    expect(demo.classification).toBe("POSSIBLE_WITH_RISK");
    expect(demo.confidenceScore).toBeGreaterThanOrEqual(80);
    expect(demo.allocatedMachine).toBe("Machine 4 - High Speed Flexo");
    expect(demo.jobId).toBeDefined();

    // Verify Audit Log entry created for the decision
    const auditLogs = await db.auditLog.findMany({
      where: { factoryId: demo.factoryId, action: "FEASIBILITY_DECISION_ACCEPTED" },
    });
    expect(auditLogs.length).toBeGreaterThan(0);

    // Verify Notification created in Risk Center
    const notifications = await db.notification.findMany({
      where: { factoryId: demo.factoryId },
    });
    expect(notifications.length).toBeGreaterThan(0);
    expect(notifications[0].title).toContain("Feasibility Accepted");
  });
});
