export type SupplierMetrics = {
  onTimeDeliveryPercentage: number;  // 0 - 100
  rejectionPercentage: number;       // 0 - 100
  fulfillmentPercentage: number;     // 0 - 100
  actualLeadTimeDays: number;
  promisedLeadTimeDays: number;
};

export type SupplierReliabilityResult = {
  reliabilityScore: number; // 0 - 100
  leadTimeVarianceScore: number;
  grade: "EXCELLENT" | "GOOD" | "AVERAGE" | "POOR";
};

export function calculateSupplierReliability(metrics: SupplierMetrics): SupplierReliabilityResult {
  const leadTimeDiff = Math.abs(metrics.actualLeadTimeDays - metrics.promisedLeadTimeDays);
  const leadTimeVarianceScore = Math.max(0, 100 - 10 * leadTimeDiff);

  const onTimeScore = Math.min(100, Math.max(0, metrics.onTimeDeliveryPercentage));
  const qualityScore = Math.min(100, Math.max(0, 100 - metrics.rejectionPercentage));
  const fulfillmentScore = Math.min(100, Math.max(0, metrics.fulfillmentPercentage));

  // Weighted Reliability Formula:
  // 40% OnTime + 30% Quality + 20% Fulfillment + 10% LeadTimeVariance
  const reliabilityScore = Math.round(
    0.40 * onTimeScore +
    0.30 * qualityScore +
    0.20 * fulfillmentScore +
    0.10 * leadTimeVarianceScore
  );

  let grade: "EXCELLENT" | "GOOD" | "AVERAGE" | "POOR" = "GOOD";
  if (reliabilityScore >= 90) grade = "EXCELLENT";
  else if (reliabilityScore >= 75) grade = "GOOD";
  else if (reliabilityScore >= 60) grade = "AVERAGE";
  else grade = "POOR";

  return {
    reliabilityScore,
    leadTimeVarianceScore,
    grade,
  };
}
