import { describe, it, expect, beforeAll } from "vitest";
import { processAgentTask } from "@/services/agent/core-agent";
import { parseUserIntent } from "@/services/agent/intent-engine";
import { classifyActionRisk, isApprovalRequired } from "@/services/agent/permissions";

describe("Universal Factory AI Agent Engine", () => {
  it("should classify intent correctly for English and Hinglish queries", () => {
    const res1 = parseUserIntent("Aaj factory mein kya important hai?");
    expect(res1.intent).toBe("DAILY_MANAGEMENT");

    const res2 = parseUserIntent("20,000 brochures ka urgent order aaya hai, accept karna chahiye?");
    expect(res2.intent).toBe("URGENT_ORDER_FEASIBILITY");
    expect(res2.entities.quantity).toBe(20000);

    const res3 = parseUserIntent("Order 482 ko Machine 4 pe shift kar do");
    expect(res3.intent).toBe("REASSIGN_MACHINE");
    expect(res3.entities.orderNumber).toBe("482");
  });

  it("should enforce action risk classification & owner approval for Level 2 actions", () => {
    const riskLevel = classifyActionRisk("assign_machine");
    expect(riskLevel).toBe(2);
    expect(isApprovalRequired(riskLevel, "OWNER")).toBe(true);

    const readRisk = classifyActionRisk("get_inventory");
    expect(readRisk).toBe(0);
    expect(isApprovalRequired(readRisk, "OWNER")).toBe(false);
  });

  it("should generate a pending approval task for machine reassignment", async () => {
    const result = await processAgentTask({
      factoryId: "demo_factory",
      userPrompt: "Order 482 ko Machine 4 pe shift kar do",
      userRole: "OWNER",
    });

    expect(result.task.status).toBe("WAITING_FOR_APPROVAL");
    expect(result.task.pendingApproval).not.toBeNull();
    expect(result.task.pendingApproval?.toolName).toBe("assign_machine");
    expect(result.task.response?.approvalStatus).toBe("PENDING_APPROVAL");
  });
});
