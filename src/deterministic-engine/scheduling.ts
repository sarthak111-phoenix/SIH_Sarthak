export type ScheduleJobInput = {
  orderId: string;
  orderNumber: string;
  productId: string;
  quantity: number;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  targetDeadline: Date;
  processes: {
    processId: string;
    sequenceOrder: number;
    name: string;
    setupTimeMinutes: number;
    unitProductionTimeSeconds: number;
  }[];
};

export type AvailableResource = {
  machineId: string;
  machineName: string;
  status: string; // "IDLE", "RUNNING", "DOWN_BREAKDOWN", "DOWN_MAINTENANCE"
  hourlyRate: number;
  nextAvailableTime: Date;
};

export type ScheduledTask = {
  orderId: string;
  orderNumber: string;
  processId: string;
  stageName: string;
  sequenceOrder: number;
  machineId: string;
  machineName: string;
  plannedStartTime: Date;
  plannedEndTime: Date;
  durationHours: number;
};

export type ScheduleResult = {
  scheduledTasks: ScheduledTask[];
  unassignedJobs: string[];
  totalScheduleDurationHours: number;
  deadlineViolationCount: number;
};

export function scheduleProductionJobs(
  jobs: ScheduleJobInput[],
  resources: AvailableResource[],
  startTime: Date = new Date()
): ScheduleResult {
  const scheduledTasks: ScheduledTask[] = [];
  const unassignedJobs: string[] = [];
  let deadlineViolationCount = 0;

  // Filter usable machines (exclude DOWN_BREAKDOWN machines)
  const activeMachines = new Map<string, AvailableResource>(
    resources
      .filter((r) => r.status !== "DOWN_BREAKDOWN")
      .map((r) => [r.machineId, { ...r, nextAvailableTime: new Date(Math.max(r.nextAvailableTime.getTime(), startTime.getTime())) }])
  );

  if (activeMachines.size === 0) {
    return {
      scheduledTasks: [],
      unassignedJobs: jobs.map((j) => j.orderId),
      totalScheduleDurationHours: 0,
      deadlineViolationCount: jobs.length,
    };
  }

  // Sort jobs by Priority (URGENT > HIGH > NORMAL > LOW) then by Target Deadline
  const priorityScore = { URGENT: 4, HIGH: 3, NORMAL: 2, LOW: 1 };
  const sortedJobs = [...jobs].sort((a, b) => {
    const diff = priorityScore[b.priority] - priorityScore[a.priority];
    if (diff !== 0) return diff;
    return a.targetDeadline.getTime() - b.targetDeadline.getTime();
  });

  const machineList = Array.from(activeMachines.values());

  for (const job of sortedJobs) {
    let jobStageStartTime = new Date(startTime);

    // Sort processes in sequence order
    const sortedProcesses = [...job.processes].sort((a, b) => a.sequenceOrder - b.sequenceOrder);

    let jobSuccessfullyScheduled = true;

    for (const proc of sortedProcesses) {
      // Find machine with earliest available time
      machineList.sort((a, b) => a.nextAvailableTime.getTime() - b.nextAvailableTime.getTime());
      const selectedMachine = machineList[0];

      if (!selectedMachine) {
        jobSuccessfullyScheduled = false;
        break;
      }

      // Task Start Time = Max(Job sequence start time, Machine next available time)
      const taskStartTime = new Date(
        Math.max(jobStageStartTime.getTime(), selectedMachine.nextAvailableTime.getTime())
      );

      const setupHours = proc.setupTimeMinutes / 60;
      const prodHours = (job.quantity * proc.unitProductionTimeSeconds) / 3600;
      const totalDurationHours = setupHours + prodHours;

      const taskEndTime = new Date(taskStartTime.getTime() + totalDurationHours * 60 * 60 * 1000);

      // Update machine next available time
      selectedMachine.nextAvailableTime = new Date(taskEndTime);

      // Next process sequence can only start after current task completes
      jobStageStartTime = new Date(taskEndTime);

      scheduledTasks.push({
        orderId: job.orderId,
        orderNumber: job.orderNumber,
        processId: proc.processId,
        stageName: proc.name,
        sequenceOrder: proc.sequenceOrder,
        machineId: selectedMachine.machineId,
        machineName: selectedMachine.machineName,
        plannedStartTime: taskStartTime,
        plannedEndTime: taskEndTime,
        durationHours: Number(totalDurationHours.toFixed(2)),
      });

      // Check deadline compliance on final process stage
      if (proc.sequenceOrder === sortedProcesses[sortedProcesses.length - 1].sequenceOrder) {
        if (taskEndTime.getTime() > job.targetDeadline.getTime()) {
          deadlineViolationCount++;
        }
      }
    }

    if (!jobSuccessfullyScheduled) {
      unassignedJobs.push(job.orderId);
    }
  }

  const scheduleEndTimes = scheduledTasks.map((t) => t.plannedEndTime.getTime());
  const maxEndTime = scheduleEndTimes.length > 0 ? Math.max(...scheduleEndTimes) : startTime.getTime();
  const totalScheduleDurationHours = Number(((maxEndTime - startTime.getTime()) / (1000 * 60 * 60)).toFixed(2));

  return {
    scheduledTasks,
    unassignedJobs,
    totalScheduleDurationHours,
    deadlineViolationCount,
  };
}
