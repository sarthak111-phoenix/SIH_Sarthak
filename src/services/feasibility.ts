import { db } from "@/lib/db";
import { evaluateOrderFeasibility, FeasibilityResult } from "@/deterministic-engine/feasibility";
import { calculateJobProfitability } from "@/deterministic-engine/profitability";
import { generateFeasibilityExplanation, NaturalLanguageExplanation } from "@/ai/explanation";

export type OrderFeasibilityEvaluation = {
  orderId: string;
  orderNumber: string;
  factoryId: string;
  deterministicResult: FeasibilityResult;
  aiExplanation: NaturalLanguageExplanation;
};

export async function evaluateAndSaveOrderFeasibility(
  orderId: string,
  factoryId: string
): Promise<OrderFeasibilityEvaluation> {
  const order = await db.order.findFirst({
    where: { id: orderId, factoryId, isDeleted: false },
    include: {
      customer: true,
      items: { include: { product: { include: { processes: true } } } },
    },
  });

  if (!order) {
    throw new Error(`Order ${orderId} not found or tenant access denied.`);
  }

  const firstItem = order.items[0];
  const product = firstItem?.product;

  // Retrieve material stock for product (or default fallback material)
  const material = await db.material.findFirst({
    where: { factoryId, isDeleted: false },
    include: { inventory: true },
  });

  // Retrieve machine capacity for product process
  const machine = await db.machine.findFirst({
    where: { factoryId, isDeleted: false, status: { not: "DOWN_BREAKDOWN" } },
  });

  // Retrieve operator employee rate
  const operator = await db.employee.findFirst({
    where: { factoryId, isDeleted: false },
  });

  const orderQuantity = firstItem?.quantity || 1000;
  const unitPrice = firstItem?.unitPrice || 15.0;
  const currentStock = material?.inventory?.currentStock || 50000;
  const reservedStock = material?.inventory?.reservedStock || 0;
  const damagedStock = material?.inventory?.damagedStock || 0;

  const unitProductionTimeSeconds = product?.processes[0]?.unitProductionTimeSeconds || 2.0;
  const setupTimeMinutes = product?.processes[0]?.setupTimeMinutes || 30;

  // Perform Pure Deterministic Calculation
  const deterministicResult = evaluateOrderFeasibility({
    orderQuantity,
    unitPrice,
    targetDeadline: new Date(order.targetDeadline),
    currentStock,
    reservedStock,
    damagedStock,
    requiredMaterialPerUnit: 1.0,
    materialCostPerUnit: material?.costPerUnit || 3.5,
    availableMachineHours: 72.0, // 3-day production window
    unitProductionTimeSeconds,
    setupTimeMinutes,
    machineHourlyRate: machine?.hourlyRate || 1200,
    energyKw: machine?.energyConsumptionKw || 15,
    energyCostPerKwh: 8.0,
    operatorHourlyRate: operator?.hourlyRate || 250,
    finishingCapacityAvailable: true,
    historicalScrapPercentage: 2.5,
    providedCostInputCount: 5,
    totalRequiredCostInputs: 5,
  });

  // Calculate detailed Job Profitability
  const jobProfit = calculateJobProfitability({
    revenue: order.totalAmount,
    materialCost: deterministicResult.parameters.materialCostTotal,
    laborCost: (deterministicResult.parameters.requiredProductionHours * (operator?.hourlyRate || 250)),
    machineCost: (deterministicResult.parameters.requiredProductionHours * (machine?.hourlyRate || 1200)),
    energyCost: deterministicResult.parameters.requiredProductionHours * 15 * 8.0,
    setupCost: (setupTimeMinutes / 60) * (machine?.hourlyRate || 1200),
    wasteCost: deterministicResult.parameters.wastageEstimateUnits * (material?.costPerUnit || 3.5),
    finishingCost: orderQuantity * 0.50,
    transportCost: 1500,
    providedInputs: ["materialCost", "laborCost", "machineCost", "energyCost", "setupCost", "wasteCost", "finishingCost", "transportCost"],
    totalRequiredInputs: 8,
  });

  // Update DB order feasibility status & record profitability
  await db.order.update({
    where: { id: order.id },
    data: { feasibilityStatus: deterministicResult.classification },
  });

  await db.jobProfitability.upsert({
    where: { orderId: order.id },
    create: {
      factoryId,
      orderId: order.id,
      revenue: jobProfit.revenue,
      materialCost: deterministicResult.parameters.materialCostTotal,
      laborCost: deterministicResult.parameters.requiredProductionHours * (operator?.hourlyRate || 250),
      machineCost: deterministicResult.parameters.requiredProductionHours * (machine?.hourlyRate || 1200),
      energyCost: deterministicResult.parameters.requiredProductionHours * 15 * 8.0,
      setupCost: (setupTimeMinutes / 60) * (machine?.hourlyRate || 1200),
      wasteCost: deterministicResult.parameters.wastageEstimateUnits * (material?.costPerUnit || 3.5),
      finishingCost: orderQuantity * 0.50,
      transportCost: 1500,
      otherCost: 0,
      expectedProfit: jobProfit.expectedProfit,
      minProfit: jobProfit.minimumProfit,
      maxProfit: jobProfit.maximumProfit,
      confidenceScore: jobProfit.confidenceScore,
      missingInputs: JSON.stringify(jobProfit.missingCostInputs),
    },
    update: {
      revenue: jobProfit.revenue,
      expectedProfit: jobProfit.expectedProfit,
      minProfit: jobProfit.minimumProfit,
      maxProfit: jobProfit.maximumProfit,
      confidenceScore: jobProfit.confidenceScore,
    },
  });

  // Generate AI Explanation Wrapper
  const aiExplanation = generateFeasibilityExplanation(deterministicResult);

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    factoryId,
    deterministicResult,
    aiExplanation,
  };
}
