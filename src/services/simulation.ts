import { db } from "@/lib/db";
import { scheduleProductionJobs, ScheduleJobInput, AvailableResource } from "@/deterministic-engine/scheduling";

export type SimulationScenarioInput = {
  factoryId: string;
  scenarioType: "MACHINE_BREAKDOWN" | "URGENT_ORDER_INSERTION" | "MATERIAL_DELAY";
  downMachineId?: string;
  urgentOrder?: {
    orderNumber: string;
    quantity: number;
    targetDeadline: string;
    unitPrice: number;
  };
  materialDelayDays?: number;
};

export type SimulationComparisonResult = {
  scenarioType: string;
  baseline: {
    totalDurationHours: number;
    deadlineViolations: number;
  };
  simulation: {
    totalDurationHours: number;
    deadlineViolations: number;
  };
  impact: {
    delayedOrdersDelta: number;
    revenueAtRisk: number;
    completionDeltaHours: number;
    summaryMessage: string;
  };
  scheduledTasksPreview: any[];
};

export async function runWhatIfSimulation(
  input: SimulationScenarioInput
): Promise<SimulationComparisonResult> {
  const { factoryId, scenarioType, downMachineId, urgentOrder, materialDelayDays } = input;

  // Load live factory orders
  const orders = await db.order.findMany({
    where: { factoryId, status: { in: ["RECEIVED", "DESIGN_APPROVED", "IN_PRODUCTION"] }, isDeleted: false },
    include: { items: { include: { product: { include: { processes: true } } } } },
  });

  // Load live factory machines
  const machines = await db.machine.findMany({
    where: { factoryId, isDeleted: false },
  });

  // Convert DB entities to scheduler inputs
  const baselineJobs: ScheduleJobInput[] = orders.map((o) => ({
    orderId: o.id,
    orderNumber: o.orderNumber,
    productId: o.items[0]?.productId || "p1",
    quantity: o.items[0]?.quantity || 1000,
    priority: (o.priority as any) || "NORMAL",
    targetDeadline: new Date(o.targetDeadline),
    processes: o.items[0]?.product?.processes.map((p) => ({
      processId: p.id,
      sequenceOrder: p.sequenceOrder,
      name: p.name,
      setupTimeMinutes: p.setupTimeMinutes,
      unitProductionTimeSeconds: p.unitProductionTimeSeconds,
    })) || [
      { processId: "pr1", sequenceOrder: 1, name: "Printing", setupTimeMinutes: 30, unitProductionTimeSeconds: 2 },
    ],
  }));

  const baselineResources: AvailableResource[] = machines.map((m) => ({
    machineId: m.id,
    machineName: m.name,
    status: m.status,
    hourlyRate: m.hourlyRate,
    nextAvailableTime: new Date(),
  }));

  // Run Baseline Schedule
  const baselineResult = scheduleProductionJobs(baselineJobs, baselineResources);

  // Build Simulated Resources & Jobs
  let simulatedJobs = [...baselineJobs];
  let simulatedResources = baselineResources.map((r) => ({ ...r }));

  if (scenarioType === "MACHINE_BREAKDOWN" && downMachineId) {
    simulatedResources = simulatedResources.map((r) =>
      r.machineId === downMachineId ? { ...r, status: "DOWN_BREAKDOWN" } : r
    );
  } else if (scenarioType === "URGENT_ORDER_INSERTION" && urgentOrder) {
    simulatedJobs.push({
      orderId: "sim_urgent_01",
      orderNumber: urgentOrder.orderNumber || "ORD-URGENT",
      productId: "p1",
      quantity: urgentOrder.quantity,
      priority: "URGENT",
      targetDeadline: new Date(urgentOrder.targetDeadline),
      processes: [
        { processId: "pr1", sequenceOrder: 1, name: "Printing", setupTimeMinutes: 20, unitProductionTimeSeconds: 1.5 },
      ],
    });
  } else if (scenarioType === "MATERIAL_DELAY" && materialDelayDays) {
    // Delay start time of jobs requiring material
    const delayMs = materialDelayDays * 24 * 60 * 60 * 1000;
    simulatedResources = simulatedResources.map((r) => ({
      ...r,
      nextAvailableTime: new Date(Date.now() + delayMs),
    }));
  }

  // Run Simulation Schedule
  const simResult = scheduleProductionJobs(simulatedJobs, simulatedResources);

  const delayedOrdersDelta = simResult.deadlineViolationCount - baselineResult.deadlineViolationCount;
  const completionDeltaHours = Number(
    (simResult.totalScheduleDurationHours - baselineResult.totalScheduleDurationHours).toFixed(2)
  );
  const revenueAtRisk = delayedOrdersDelta > 0 ? delayedOrdersDelta * 45000 : 0;

  let summaryMessage = "Simulation indicates zero negative impact on delivery schedules.";
  if (delayedOrdersDelta > 0) {
    summaryMessage = `WARNING: Scenario causes ${delayedOrdersDelta} additional order deadline violation(s) with ₹${revenueAtRisk.toLocaleString()} revenue at risk.`;
  } else if (completionDeltaHours > 0) {
    summaryMessage = `INFO: Completion pushed back by ${completionDeltaHours} hours, but all deadlines are preserved.`;
  }

  return {
    scenarioType,
    baseline: {
      totalDurationHours: baselineResult.totalScheduleDurationHours,
      deadlineViolations: baselineResult.deadlineViolationCount,
    },
    simulation: {
      totalDurationHours: simResult.totalScheduleDurationHours,
      deadlineViolations: simResult.deadlineViolationCount,
    },
    impact: {
      delayedOrdersDelta,
      revenueAtRisk,
      completionDeltaHours,
      summaryMessage,
    },
    scheduledTasksPreview: simResult.scheduledTasks.slice(0, 10),
  };
}

export async function applySimulationToLiveSchedule(
  factoryId: string,
  scenarioTasks: any[]
) {
  // Commit simulated schedule tasks to DB ProductionJob records
  for (const task of scenarioTasks) {
    const order = await db.order.findFirst({
      where: { id: task.orderId, factoryId },
    });
    if (!order) continue;

    await db.productionJob.upsert({
      where: { id: `job_${task.orderId}_${task.processId}` },
      create: {
        id: `job_${task.orderId}_${task.processId}`,
        factoryId,
        orderId: task.orderId,
        machineId: task.machineId,
        status: "QUEUED",
        plannedStartTime: new Date(task.plannedStartTime),
        plannedEndTime: new Date(task.plannedEndTime),
      },
      update: {
        machineId: task.machineId,
        plannedStartTime: new Date(task.plannedStartTime),
        plannedEndTime: new Date(task.plannedEndTime),
      },
    });
  }

  return { success: true, count: scenarioTasks.length };
}
