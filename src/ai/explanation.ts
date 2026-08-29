import { FeasibilityResult } from "@/deterministic-engine/feasibility";

export type NaturalLanguageExplanation = {
  problemSummary: string;
  impactAnalysis: string;
  recommendation: string;
  riskAssessment: string;
  aiBasisMetadata: {
    engineUsed: "DETERMINISTIC_ENGINE_V1";
    calculationsAlteredByAi: false; // Mandatory zero-hallucination guarantee flag
    confidenceScore: number;
    timestamp: string;
  };
};

export function generateFeasibilityExplanation(
  feasibility: FeasibilityResult
): NaturalLanguageExplanation {
  const { classification, confidenceScore, parameters, options, reasons } = feasibility;

  let problemSummary = "";
  let impactAnalysis = "";
  let recommendation = "";
  let riskAssessment = "";

  if (classification === "SAFE") {
    problemSummary = "No critical capacity or material bottlenecks detected for this order.";
    impactAnalysis = `Order quantity of ${parameters.usableStock > 0 ? "units is fully covered" : "units can be produced"}. Production will take ${parameters.requiredProductionHours.toFixed(1)} hours with a deadline margin buffer of ${parameters.deadlineMarginHours.toFixed(1)} hours. Projected profit is ₹${parameters.expectedProfit.toLocaleString()}.`;
    recommendation = `Proceed with Option A (Standard Delivery) to achieve completion by ${new Date(options.optionA.estimatedCompletionDate).toLocaleDateString()}.`;
    riskAssessment = `Low Risk (${confidenceScore}% data confidence score). All operational parameters satisfy factory thresholds.`;
  } else if (classification === "POSSIBLE_WITH_RISK") {
    problemSummary = `Order is feasible with operational risk warnings: ${reasons.join("; ")}`;
    impactAnalysis = `Deadline margin is tight (${parameters.deadlineMarginHours.toFixed(1)} hrs safety buffer) or stock buffer is low. Projected profit is ₹${parameters.expectedProfit.toLocaleString()}.`;
    recommendation = `Consider Option B (Expedited Overtime) to increase deadline safety buffer, or Option C (Economic Batching) to increase profit margin to ₹${options.optionC.expectedProfit.toLocaleString()}.`;
    riskAssessment = `Moderate Risk (${confidenceScore}% data confidence score). Recommend owner review before confirming schedule.`;
  } else {
    problemSummary = `Order NOT RECOMMENDED under current parameters: ${reasons.join("; ")}`;
    impactAnalysis = `Production requires ${parameters.requiredProductionHours.toFixed(1)} hours, exceeding available capacity or target deadline margin (${parameters.deadlineMarginHours.toFixed(1)} hrs buffer).`;
    recommendation = "Reject order or request customer deadline extension of at least 48 hours to allow secondary press allocation.";
    riskAssessment = `High Risk of Delay or Material Deficit. Feasibility classification is NOT_RECOMMENDED.`;
  }

  return {
    problemSummary,
    impactAnalysis,
    recommendation,
    riskAssessment,
    aiBasisMetadata: {
      engineUsed: "DETERMINISTIC_ENGINE_V1",
      calculationsAlteredByAi: false,
      confidenceScore,
      timestamp: new Date().toISOString(),
    },
  };
}
