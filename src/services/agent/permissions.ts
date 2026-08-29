import { agentTools, RiskLevel } from "./tools";

export type UserRole = "OWNER" | "SUPERVISOR" | "WORKER" | "ADMIN";

export type ActionApprovalRequest = {
  approvalId: string;
  taskId: string;
  riskLevel: RiskLevel;
  actionSummary: string;
  reason: string;
  expectedResult: string;
  impact: string;
  toolName: string;
  params: any;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
};

export function classifyActionRisk(toolName: string): RiskLevel {
  const tool = agentTools[toolName];
  if (!tool) return 0;
  return tool.riskLevel;
}

export function isApprovalRequired(riskLevel: RiskLevel, userRole: UserRole = "OWNER"): boolean {
  if (riskLevel === 0) return false;
  if (riskLevel === 1) return false; // Low risk automatic execution
  if (riskLevel === 2) return true;  // Owner approval required
  if (riskLevel === 3) return true;  // High risk / financial action approval required
  return false;
}

export function canApproveAction(userRole: UserRole, riskLevel: RiskLevel): boolean {
  if (userRole === "OWNER" || userRole === "ADMIN") return true;
  if (userRole === "SUPERVISOR") {
    return riskLevel <= 1; // Supervisors cannot approve Level 2 or 3 actions
  }
  if (userRole === "WORKER") {
    return riskLevel === 0; // Workers cannot approve Level 1, 2, or 3 actions
  }
  return false;
}

export function validateRolePermission(userRole: UserRole, toolName: string): { authorized: boolean; reason?: string } {
  const tool = agentTools[toolName];
  if (!tool) return { authorized: false, reason: `Tool ${toolName} does not exist.` };

  if (userRole === "WORKER") {
    // Workers can only trigger worker-level read or job status update tools
    const allowedForWorker = ["get_production_jobs", "update_production_stage", "start_job", "pause_job", "complete_job", "search_factory_memory"];
    if (!allowedForWorker.includes(toolName)) {
      return {
        authorized: false,
        reason: `Worker role is not authorized to execute ${toolName}. Requires Owner or Supervisor access.`,
      };
    }
  }

  if (userRole === "SUPERVISOR") {
    // Supervisors cannot execute financial high-risk actions
    if (tool.riskLevel === 3) {
      return {
        authorized: false,
        reason: `Supervisor role is not authorized to execute high-risk financial action ${toolName}. Requires Owner approval.`,
      };
    }
  }

  return { authorized: true };
}

export function buildApprovalRequestCard(
  taskId: string,
  toolName: string,
  reason: string,
  expectedResult: string,
  impact: string,
  params: any
): ActionApprovalRequest {
  const tool = agentTools[toolName];
  const riskLevel = tool ? tool.riskLevel : 2;

  let actionSummary = `Execute ${toolName}`;
  if (toolName === "assign_machine") {
    actionSummary = `Move Order #${params.orderNumber || params.orderId || "Target"} → Machine ${params.targetMachineName || params.targetMachineId || "Selected"}`;
  } else if (toolName === "create_order") {
    actionSummary = `Create Production Order for ${params.quantity || 1000} units`;
  } else if (toolName === "update_order_priority") {
    actionSummary = `Update Order Priority to ${params.priority}`;
  } else if (toolName === "create_maintenance_task") {
    actionSummary = `Schedule Maintenance Task for Machine ${params.machineId}`;
  } else if (toolName === "create_purchase_recommendation") {
    actionSummary = `Issue Purchase Order for ${params.materialName || "Raw Material"}`;
  }

  return {
    approvalId: `appr_${crypto.randomUUID()}`,
    taskId,
    riskLevel,
    actionSummary,
    reason,
    expectedResult,
    impact,
    toolName,
    params,
    status: "PENDING",
    createdAt: new Date().toISOString(),
  };
}
