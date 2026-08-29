export type MachineCapacityParams = {
  idealHourlyOutputRate: number;
  availableProductionHours: number;
  historicalScrapRatePercentage: number;
  efficiencyFactor?: number; // Default 1.0 (100%)
  scheduledMaintenanceHours?: number;
  existingJobHours?: number;
};

export type CapacityResult = {
  grossAvailableHours: number;
  netAvailableHours: number;
  effectiveOutputRatePerHour: number;
  totalCapacityUnits: number;
  utilizationPercentage: number;
};

export function calculateMachineCapacity(params: MachineCapacityParams): CapacityResult {
  const efficiency = params.efficiencyFactor ?? 1.0;
  const scrapRate = Math.max(0, Math.min(1, params.historicalScrapRatePercentage / 100));

  // Effective Machine Rate = Ideal Hourly Speed * (1 - Scrap Rate) * Efficiency
  const effectiveOutputRatePerHour = params.idealHourlyOutputRate * (1 - scrapRate) * efficiency;

  const grossAvailableHours = params.availableProductionHours;
  const maintenanceHours = params.scheduledMaintenanceHours || 0;
  const existingHours = params.existingJobHours || 0;

  const netAvailableHours = Math.max(0, grossAvailableHours - maintenanceHours - existingHours);
  const totalCapacityUnits = Math.floor(netAvailableHours * effectiveOutputRatePerHour);

  const utilizationPercentage = grossAvailableHours > 0
    ? Math.round(((maintenanceHours + existingHours) / grossAvailableHours) * 100)
    : 0;

  return {
    grossAvailableHours,
    netAvailableHours,
    effectiveOutputRatePerHour,
    totalCapacityUnits,
    utilizationPercentage,
  };
}
