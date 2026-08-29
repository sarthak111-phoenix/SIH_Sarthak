import { db } from "@/lib/db";

export type MachineInput = {
  factoryId: string;
  name: string;
  code: string;
  type: string;
  hourlyRate: number;
  energyConsumptionKw: number;
  idealOutputRatePerHour: number;
  workStartTime?: string;
  workEndTime?: string;
  nextMaintenanceDate?: Date | string | null;
};

export async function addMachine(input: MachineInput) {
  return await db.machine.create({
    data: {
      factoryId: input.factoryId,
      name: input.name,
      code: input.code.toUpperCase(),
      type: input.type,
      hourlyRate: input.hourlyRate,
      energyConsumptionKw: input.energyConsumptionKw,
      idealOutputRatePerHour: input.idealOutputRatePerHour,
      workStartTime: input.workStartTime || "08:00",
      workEndTime: input.workEndTime || "17:00",
      nextMaintenanceDate: input.nextMaintenanceDate ? new Date(input.nextMaintenanceDate) : null,
      status: "IDLE",
    },
  });
}

export async function updateMachine(
  factoryId: string,
  machineId: string,
  data: {
    workStartTime?: string;
    workEndTime?: string;
    nextMaintenanceDate?: Date | string | null;
    status?: string;
    name?: string;
    hourlyRate?: number;
  }
) {
  const updateData: any = {};
  if (data.workStartTime !== undefined) updateData.workStartTime = data.workStartTime;
  if (data.workEndTime !== undefined) updateData.workEndTime = data.workEndTime;
  if (data.nextMaintenanceDate !== undefined) {
    updateData.nextMaintenanceDate = data.nextMaintenanceDate ? new Date(data.nextMaintenanceDate) : null;
  }
  if (data.status !== undefined) updateData.status = data.status;
  if (data.name !== undefined) updateData.name = data.name;
  if (data.hourlyRate !== undefined) updateData.hourlyRate = data.hourlyRate;

  return await db.machine.updateMany({
    where: {
      id: machineId,
      factoryId,
      isDeleted: false,
    },
    data: updateData,
  });
}

export async function getMachinesByFactory(factoryId: string) {
  return await db.machine.findMany({
    where: {
      factoryId,
      isDeleted: false,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function softDeleteMachine(factoryId: string, machineId: string) {
  return await db.machine.updateMany({
    where: {
      id: machineId,
      factoryId, // Tenant boundary check
    },
    data: {
      isDeleted: true,
    },
  });
}
