export type JobCostInputs = {
  revenue: number;
  materialCost: number;
  laborCost: number;
  machineCost: number;
  energyCost: number;
  setupCost: number;
  wasteCost: number;
  finishingCost: number;
  transportCost: number;
  otherCost?: number;
  providedInputs?: string[];
  totalRequiredInputs?: number;
};

export type JobProfitabilityResult = {
  revenue: number;
  totalCost: number;
  expectedProfit: number;
  minimumProfit: number; // Worst-case scenario (higher waste + upper cost bound)
  maximumProfit: number; // Best-case scenario (zero waste + maximum efficiency)
  profitMarginPercentage: number;
  confidenceScore: number;
  missingCostInputs: string[];
};

export function calculateJobProfitability(inputs: JobCostInputs): JobProfitabilityResult {
  const otherCost = inputs.otherCost || 0;

  const totalCost =
    inputs.materialCost +
    inputs.laborCost +
    inputs.machineCost +
    inputs.energyCost +
    inputs.setupCost +
    inputs.wasteCost +
    inputs.finishingCost +
    inputs.transportCost +
    otherCost;

  const expectedProfit = inputs.revenue - totalCost;
  const profitMarginPercentage = inputs.revenue > 0 ? (expectedProfit / inputs.revenue) * 100 : 0;

  // Worst-case: 20% waste increase + 10% unexpected operational variance
  const worstCaseCost = totalCost + inputs.wasteCost * 0.20 + (totalCost - inputs.materialCost) * 0.10;
  const minimumProfit = inputs.revenue - worstCaseCost;

  // Best-case: Zero waste + 5% operational efficiency gain
  const bestCaseCost = totalCost - inputs.wasteCost - (totalCost - inputs.materialCost) * 0.05;
  const maximumProfit = inputs.revenue - Math.max(inputs.materialCost, bestCaseCost);

  // Confidence calculation
  const providedCount = inputs.providedInputs?.length || 8;
  const totalRequired = inputs.totalRequiredInputs || 8;
  const confidenceScore = Math.round(100 * Math.min(1, Math.max(0, providedCount / totalRequired)));

  const allPossibleInputs = [
    "materialCost",
    "laborCost",
    "machineCost",
    "energyCost",
    "setupCost",
    "wasteCost",
    "finishingCost",
    "transportCost",
  ];
  const missingCostInputs = allPossibleInputs.filter(
    (key) => !inputs.providedInputs || !inputs.providedInputs.includes(key)
  );

  return {
    revenue: inputs.revenue,
    totalCost,
    expectedProfit,
    minimumProfit: Math.round(minimumProfit),
    maximumProfit: Math.round(maximumProfit),
    profitMarginPercentage: Number(profitMarginPercentage.toFixed(1)),
    confidenceScore,
    missingCostInputs,
  };
}
