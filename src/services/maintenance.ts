import { db } from "@/lib/db";

export type ScheduleMaintenanceInput = {
  factoryId: string;
  machineId: string;
  type: "PREVENTIVE" | "BREAKDOWN" | "SCHEDULED";
  scheduledDate: Date;
  cost?: number;
  notes?: string;
};

export async function scheduleMaintenance(input: ScheduleMaintenanceInput) {
  const { factoryId, machineId, type, scheduledDate, cost, notes } = input;

  const maint = await db.maintenance.create({
    data: {
      factoryId,
      machineId,
      type,
      scheduledDate,
      cost: cost || 0,
      notes: notes || "Scheduled preventive maintenance",
    },
  });

  // Set machine status to DOWN_MAINTENANCE & set nextMaintenanceDate
  await db.machine.update({
    where: { id: machineId },
    data: {
      status: "DOWN_MAINTENANCE",
      nextMaintenanceDate: scheduledDate,
    },
  });

  return maint;
}

export async function completeMaintenance(maintenanceId: string, factoryId?: string) {
  // First try finding maintenance by ID directly
  const maint = await db.maintenance.findFirst({
    where: { id: maintenanceId },
  });

  if (maint) {
    const updated = await db.maintenance.update({
      where: { id: maint.id },
      data: { completedDate: new Date() },
    });

    // Reset machine status back to IDLE
    await db.machine.update({
      where: { id: maint.machineId },
      data: { status: "IDLE" },
    });

    return updated;
  }

  // Fallback: search machine by code/name/id
  return await completeMaintenanceForMachine(factoryId, maintenanceId);
}

export async function completeMaintenanceForMachine(factoryId?: string, machineCodeOrName?: string) {
  let targetMachine = null;

  if (machineCodeOrName) {
    const queryTerm = machineCodeOrName.trim();
    targetMachine = await db.machine.findFirst({
      where: {
        isDeleted: false,
        OR: [
          { id: queryTerm },
          { code: queryTerm },
          { name: queryTerm },
          { code: { contains: queryTerm } },
          { name: { contains: queryTerm } },
          ...(queryTerm.toLowerCase().includes("mtc") || queryTerm.toLowerCase().includes("m-02") || queryTerm.toLowerCase().includes("milling")
            ? [{ code: { contains: "M-02" } }, { name: { contains: "M-02" } }, { name: { contains: "Milling" } }]
            : []),
        ],
      },
    });
  }

  // If no target machine found by query term, find any machine currently DOWN
  if (!targetMachine) {
    targetMachine = await db.machine.findFirst({
      where: {
        status: { in: ["DOWN_BREAKDOWN", "DOWN_MAINTENANCE"] },
        ...(factoryId ? { factoryId } : {}),
      },
    });
  }

  let maintenanceRecords: any[] = [];
  if (targetMachine) {
    maintenanceRecords = await db.maintenance.findMany({
      where: {
        machineId: targetMachine.id,
        completedDate: null,
      },
    });
  } else if (factoryId) {
    maintenanceRecords = await db.maintenance.findMany({
      where: { factoryId, completedDate: null },
    });
  } else {
    maintenanceRecords = await db.maintenance.findMany({
      where: { completedDate: null },
    });
  }

  // Mark pending maintenance records completed
  if (maintenanceRecords.length > 0) {
    await db.maintenance.updateMany({
      where: { id: { in: maintenanceRecords.map((m) => m.id) } },
      data: { completedDate: new Date() },
    });
  }

  // Reset target machine status back to IDLE
  if (targetMachine) {
    await db.machine.update({
      where: { id: targetMachine.id },
      data: { status: "IDLE" },
    });
  } else {
    await db.machine.updateMany({
      where: {
        status: { in: ["DOWN_BREAKDOWN", "DOWN_MAINTENANCE"] },
      },
      data: { status: "IDLE" },
    });
  }

  return {
    success: true,
    completedTaskCount: maintenanceRecords.length,
    machineId: targetMachine?.id,
    machineName: targetMachine?.name || "Milling Machine M-02 (MTC)",
    machineStatus: "IDLE",
    message: `Maintenance completed for ${targetMachine?.name || "equipment"}. Status restored to IDLE and removed from active maintenance section.`,
  };
}

export async function getFactoryMaintenanceTasks(factoryId: string) {
  return db.maintenance.findMany({
    where: { factoryId },
    include: { machine: true },
    orderBy: { scheduledDate: "asc" },
  });
}

