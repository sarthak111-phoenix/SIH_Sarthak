export type UsableStockParams = {
  currentStock: number;
  reservedStock: number;
  damagedStock: number;
};

export type ShortagePredictionParams = {
  usableStock: number;
  averageDailyConsumption: number;
};

export function calculateUsableStock(params: UsableStockParams): number {
  const usable = params.currentStock - params.reservedStock - params.damagedStock;
  return Math.max(0, usable);
}

export function calculateProjectedShortageDate(
  params: ShortagePredictionParams,
  currentDate: Date = new Date()
): { shortageDays: number | typeof Infinity; projectedDate: Date | null } {
  if (params.averageDailyConsumption <= 0) {
    return { shortageDays: Infinity, projectedDate: null };
  }

  const daysRemaining = params.usableStock / params.averageDailyConsumption;
  const projectedDate = new Date(currentDate.getTime() + daysRemaining * 24 * 60 * 60 * 1000);

  return {
    shortageDays: daysRemaining,
    projectedDate,
  };
}
