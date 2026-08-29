export type FeasibilityInput = {
  orderQuantity: number;
  unitPrice: number;
  targetDeadline: Date;
  currentStock: number;
  reservedStock: number;
  damagedStock: number;
  requiredMaterialPerUnit: number;
  materialCostPerUnit: number;
  availableMachineHours: number;
  unitProductionTimeSeconds: number;
  setupTimeMinutes: number;
  machineHourlyRate: number;
  energyKw: number;
  energyCostPerKwh?: number;
  operatorHourlyRate: number;
  finishingCapacityAvailable: boolean;
  transportConstrained?: boolean;
  historicalScrapPercentage?: number;
  providedCostInputCount?: number;
  totalRequiredCostInputs?: number;
};

export type FeasibilityClassification = "SAFE" | "POSSIBLE_WITH_RISK" | "NOT_RECOMMENDED";

export type FeasibilityOption = {
  optionKey: "OPTION_A" | "OPTION_B" | "OPTION_C";
  title: string;
  description: string;
  estimatedCompletionDate: Date;
  totalCost: number;
  expectedProfit: number;
  profitMarginPercentage: number;
  riskFactor: string;
};

export type FeasibilityResult = {
  classification: FeasibilityClassification;
  confidenceScore: number;
  parameters: {
    materialAvailable: boolean;
    usableStock: number;
    requiredMaterialTotal: number;
    machineCapacityHours: number;
    requiredProductionHours: number;
    existingCommitmentHours: number;
    deadlineMarginHours: number;
    setupTimeMinutes: number;
    productionTimeHours: number;
    wastageEstimateUnits: number;
    finishingCapacityAvailable: boolean;
    transportConstrained: boolean;
    materialCostTotal: number;
    operationalCostTotal: number;
    totalCost: number;
    expectedProfit: number;
  };
  options: {
    optionA: FeasibilityOption;
    optionB: FeasibilityOption;
    optionC: FeasibilityOption;
  };
  reasons: string[];
};

export function evaluateOrderFeasibility(input: FeasibilityInput, now: Date = new Date()): FeasibilityResult {
  // 1. Stock Math
  const usableStock = Math.max(0, input.currentStock - input.reservedStock - input.damagedStock);
  const scrapRate = (input.historicalScrapPercentage || 2.0) / 100;
  const wastageEstimateUnits = Math.ceil(input.orderQuantity * scrapRate);
  const requiredMaterialTotal = (input.orderQuantity + wastageEstimateUnits) * input.requiredMaterialPerUnit;
  const materialAvailable = usableStock >= requiredMaterialTotal;

  // 2. Production Time Math
  const totalProductionSeconds = input.orderQuantity * input.unitProductionTimeSeconds;
  const productionTimeHours = totalProductionSeconds / 3600;
  const setupTimeHours = input.setupTimeMinutes / 60;
  const requiredProductionHours = setupTimeHours + productionTimeHours;
  const existingCommitmentHours = 0; // Calculated by service
  const machineCapacityHours = input.availableMachineHours;

  // 3. Deadline Margin Math
  const availableTimeUntilDeadlineHours = Math.max(
    0,
    (input.targetDeadline.getTime() - now.getTime()) / (1000 * 60 * 60)
  );
  const deadlineMarginHours = availableTimeUntilDeadlineHours - requiredProductionHours;

  // 4. Financial Cost Breakdown
  const materialCostTotal = requiredMaterialTotal * input.materialCostPerUnit;
  const machineCostTotal = requiredProductionHours * input.machineHourlyRate;
  const energyKwhTotal = requiredProductionHours * input.energyKw;
  const energyCostTotal = energyKwhTotal * (input.energyCostPerKwh || 8.0); // Default ₹8/kWh
  const operatorCostTotal = requiredProductionHours * input.operatorHourlyRate;
  const operationalCostTotal = machineCostTotal + energyCostTotal + operatorCostTotal;
  const totalCost = materialCostTotal + operationalCostTotal;

  const totalRevenue = input.orderQuantity * input.unitPrice;
  const expectedProfit = totalRevenue - totalCost;

  // 5. Classification Logic
  const reasons: string[] = [];
  let classification: FeasibilityClassification = "SAFE";

  if (!materialAvailable) {
    classification = "NOT_RECOMMENDED";
    reasons.push(`Material shortage: Required ${requiredMaterialTotal} units, but usable stock is ${usableStock}.`);
  }

  if (requiredProductionHours > machineCapacityHours) {
    classification = "NOT_RECOMMENDED";
    reasons.push(`Machine capacity exceeded: Required ${requiredProductionHours.toFixed(1)} hrs, available ${machineCapacityHours} hrs.`);
  }

  if (deadlineMarginHours < 0) {
    classification = "NOT_RECOMMENDED";
    reasons.push(`Deadline impossible: Required ${requiredProductionHours.toFixed(1)} hrs, but only ${availableTimeUntilDeadlineHours.toFixed(1)} hrs remaining before target deadline.`);
  }

  if (classification !== "NOT_RECOMMENDED") {
    // Check for Risk Warnings
    const safetyBufferHours = 12.0; // 12-hour safety buffer requirement
    if (deadlineMarginHours < safetyBufferHours) {
      classification = "POSSIBLE_WITH_RISK";
      reasons.push(`Tight deadline margin: Only ${deadlineMarginHours.toFixed(1)} hrs safety buffer remaining.`);
    }

    if (usableStock < requiredMaterialTotal * 1.1) {
      classification = "POSSIBLE_WITH_RISK";
      reasons.push(`Low material safety margin (< 10% buffer).`);
    }

    if (expectedProfit < totalRevenue * 0.15) {
      classification = "POSSIBLE_WITH_RISK";
      reasons.push(`Low profit margin: Projected profit is ₹${expectedProfit.toFixed(0)} (${((expectedProfit / totalRevenue) * 100).toFixed(1)}%).`);
    }
  }

  // 6. Deterministic Confidence Score Formula
  const providedInputs = input.providedCostInputCount || 5;
  const totalRequiredInputs = input.totalRequiredCostInputs || 5;
  const completenessRatio = Math.min(1, Math.max(0, providedInputs / totalRequiredInputs));
  const confidenceScore = Math.round(100 * completenessRatio);

  // 7. Generate Options A / B / C
  const optionACompletion = new Date(now.getTime() + requiredProductionHours * 60 * 60 * 1000);
  const optionAProfitMargin = (expectedProfit / totalRevenue) * 100;

  const optionA: FeasibilityOption = {
    optionKey: "OPTION_A",
    title: "Option A: Standard Delivery (As Requested)",
    description: "Standard production speed using single machine allocation.",
    estimatedCompletionDate: optionACompletion,
    totalCost: Math.round(totalCost),
    expectedProfit: Math.round(expectedProfit),
    profitMarginPercentage: Number(optionAProfitMargin.toFixed(1)),
    riskFactor: classification === "SAFE" ? "Low Risk" : "Moderate Risk",
  };

  // Option B: Expedited (Overtime / Multi-press, 30% faster completion, 15% higher labor cost)
  const optionBProductionHours = requiredProductionHours * 0.7;
  const optionBCompletion = new Date(now.getTime() + optionBProductionHours * 60 * 60 * 1000);
  const optionBTotalCost = totalCost + operatorCostTotal * 0.5; // Overtime bonus cost
  const optionBExpectedProfit = totalRevenue - optionBTotalCost;

  const optionB: FeasibilityOption = {
    optionKey: "OPTION_B",
    title: "Option B: Fast / Expedited Delivery",
    description: "Allocates overtime shift to complete order 30% faster.",
    estimatedCompletionDate: optionBCompletion,
    totalCost: Math.round(optionBTotalCost),
    expectedProfit: Math.round(optionBExpectedProfit),
    profitMarginPercentage: Number(((optionBExpectedProfit / totalRevenue) * 100).toFixed(1)),
    riskFactor: "Higher Operational Cost",
  };

  // Option C: Economic (Bulk batching, +24h delivery, 8% lower operational cost)
  const optionCProductionHours = requiredProductionHours + 24;
  const optionCCompletion = new Date(now.getTime() + optionCProductionHours * 60 * 60 * 1000);
  const optionCTotalCost = materialCostTotal + operationalCostTotal * 0.92;
  const optionCExpectedProfit = totalRevenue - optionCTotalCost;

  const optionC: FeasibilityOption = {
    optionKey: "OPTION_C",
    title: "Option C: Margin-Optimized Economic Delivery",
    description: "Batches setup with existing queued jobs to save setup costs.",
    estimatedCompletionDate: optionCCompletion,
    totalCost: Math.round(optionCTotalCost),
    expectedProfit: Math.round(optionCExpectedProfit),
    profitMarginPercentage: Number(((optionCExpectedProfit / totalRevenue) * 100).toFixed(1)),
    riskFactor: "Extended Lead Time",
  };

  return {
    classification,
    confidenceScore,
    parameters: {
      materialAvailable,
      usableStock,
      requiredMaterialTotal,
      machineCapacityHours,
      requiredProductionHours,
      existingCommitmentHours,
      deadlineMarginHours,
      setupTimeMinutes: input.setupTimeMinutes,
      productionTimeHours,
      wastageEstimateUnits,
      finishingCapacityAvailable: input.finishingCapacityAvailable,
      transportConstrained: input.transportConstrained || false,
      materialCostTotal,
      operationalCostTotal,
      totalCost,
      expectedProfit,
    },
    options: {
      optionA,
      optionB,
      optionC,
    },
    reasons,
  };
}
