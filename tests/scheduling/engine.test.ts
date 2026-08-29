import { describe, it, expect } from "vitest";
import { scheduleProductionJobs, ScheduleJobInput, AvailableResource } from "../../src/deterministic-engine/scheduling";

describe("Phase 4 — Smart Scheduling Engine", () => {
  const now = new Date("2026-08-23T12:00:00Z");

  const sampleMachines: AvailableResource[] = [
    { machineId: "m1", machineName: "Offset Press 1", status: "IDLE", hourlyRate: 1200, nextAvailableTime: now },
    { machineId: "m2", machineName: "Die Cutter 1", status: "IDLE", hourlyRate: 800, nextAvailableTime: now },
  ];

  const sampleJobs: ScheduleJobInput[] = [
    {
      orderId: "ord_1",
      orderNumber: "ORD-0001",
      productId: "prod_1",
      quantity: 1000,
      priority: "URGENT",
      targetDeadline: new Date("2026-08-25T12:00:00Z"),
      processes: [
        { processId: "p1", sequenceOrder: 1, name: "Printing", setupTimeMinutes: 30, unitProductionTimeSeconds: 2 },
        { processId: "p2", sequenceOrder: 2, name: "Cutting", setupTimeMinutes: 15, unitProductionTimeSeconds: 1 },
      ],
    },
    {
      orderId: "ord_2",
      orderNumber: "ORD-0002",
      productId: "prod_1",
      quantity: 2000,
      priority: "NORMAL",
      targetDeadline: new Date("2026-08-26T12:00:00Z"),
      processes: [
        { processId: "p1", sequenceOrder: 1, name: "Printing", setupTimeMinutes: 30, unitProductionTimeSeconds: 2 },
      ],
    },
  ];

  it("should schedule jobs prioritizing URGENT priority orders over NORMAL orders", () => {
    const res = scheduleProductionJobs(sampleJobs, sampleMachines, now);

    expect(res.scheduledTasks.length).toBeGreaterThan(0);
    // URGENT order ord_1 task should be scheduled first
    expect(res.scheduledTasks[0].orderId).toBe("ord_1");
  });

  it("should exclude DOWN_BREAKDOWN machines from scheduling assignments", () => {
    const brokenMachines: AvailableResource[] = [
      { machineId: "m1", machineName: "Offset Press 1", status: "DOWN_BREAKDOWN", hourlyRate: 1200, nextAvailableTime: now },
      { machineId: "m2", machineName: "Die Cutter 1", status: "IDLE", hourlyRate: 800, nextAvailableTime: now },
    ];

    const res = scheduleProductionJobs(sampleJobs, brokenMachines, now);

    // All scheduled tasks must assign machine m2 (since m1 is DOWN_BREAKDOWN)
    res.scheduledTasks.forEach((task) => {
      expect(task.machineId).toBe("m2");
    });
  });

  it("should enforce process sequence order (Stage 2 start >= Stage 1 end)", () => {
    const res = scheduleProductionJobs(sampleJobs, sampleMachines, now);

    const ord1Tasks = res.scheduledTasks.filter((t) => t.orderId === "ord_1");
    const stage1 = ord1Tasks.find((t) => t.sequenceOrder === 1);
    const stage2 = ord1Tasks.find((t) => t.sequenceOrder === 2);

    if (stage1 && stage2) {
      expect(stage2.plannedStartTime.getTime()).toBeGreaterThanOrEqual(stage1.plannedEndTime.getTime());
    }
  });
});
