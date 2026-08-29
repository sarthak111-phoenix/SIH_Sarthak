import { db } from "@/lib/db";
import { calculateMachineCapacity } from "@/deterministic-engine/capacity";

export type MachineAnalyticsSummary = {
  machineId: string;
  machineName: string;
  machineCode: string;
  status: string;
  hourlyRate: number;
  energyConsumptionKw: number;
  totalProducedUnits: number;
  downtimeMinutesTotal: number;
  downtimeByCategory: Record<string, number>;
  oeePercentage: number;
};

export async function getMachineAnalytics(factoryId: string): Promise<MachineAnalyticsSummary[]> {
  const machines = await db.machine.findMany({
    where: { factoryId, isDeleted: false },
    include: {
      jobs: true,
      downtimes: true,
    },
  });

  const results: MachineAnalyticsSummary[] = [];

  for (const m of machines) {
    const totalProducedUnits = m.jobs.reduce((sum, j) => sum + j.producedQuantity, 0);

    const downtimeByCategory: Record<string, number> = {
      BREAKDOWN: 0,
      SETUP: 0,
      MATERIAL_WAITING: 0,
      OPERATOR_UNAVAILABLE: 0,
      MAINTENANCE: 0,
      OTHER: 0,
    };

    let downtimeMinutesTotal = 0;
    for (const dt of m.downtimes) {
      const minutes = dt.durationMinutes || 30;
      downtimeMinutesTotal += minutes;
      downtimeByCategory[dt.reasonCategory] = (downtimeByCategory[dt.reasonCategory] || 0) + minutes;
    }

    // Capacity calculation
    const capRes = calculateMachineCapacity({
      idealHourlyOutputRate: m.idealOutputRatePerHour || 2000,
      availableProductionHours: 168, // 1 week
      historicalScrapRatePercentage: 3.0,
      scheduledMaintenanceHours: downtimeMinutesTotal / 60,
    });

    const oeePercentage = Math.min(100, Math.max(0, Math.round(100 - capRes.utilizationPercentage)));

    results.push({
      machineId: m.id,
      machineName: m.name,
      machineCode: m.code,
      status: m.status,
      hourlyRate: m.hourlyRate,
      energyConsumptionKw: m.energyConsumptionKw,
      totalProducedUnits,
      downtimeMinutesTotal,
      downtimeByCategory,
      oeePercentage,
    });
  }

  return results;
}

export async function logMachineDowntime(input: {
  factoryId: string;
  machineId: string;
  reasonCategory: string;
  description?: string;
  durationMinutes: number;
}) {
  const { factoryId, machineId, reasonCategory, description, durationMinutes } = input;

  const dt = await db.machineDowntime.create({
    data: {
      factoryId,
      machineId,
      reasonCategory,
      description: description || "Floor machine downtime log",
      startTime: new Date(Date.now() - durationMinutes * 60 * 1000),
      endTime: new Date(),
      durationMinutes,
    },
  });

  // Update machine status if BREAKDOWN
  if (reasonCategory === "BREAKDOWN") {
    await db.machine.update({
      where: { id: machineId },
      data: { status: "DOWN_BREAKDOWN" },
    });
  }

  return dt;
}
