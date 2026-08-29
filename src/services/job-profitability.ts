import { db } from "@/lib/db";

export type FactoryProfitabilitySummary = {
  totalRevenue: number;
  totalExpectedProfit: number;
  totalMinProfit: number;
  totalMaxProfit: number;
  averageProfitMargin: number;
  averageConfidenceScore: number;
  jobCount: number;
  jobDetails: any[];
};

export async function getFactoryJobProfitability(factoryId: string): Promise<FactoryProfitabilitySummary> {
  const jobProfits = await db.jobProfitability.findMany({
    where: { factoryId },
    include: {
      order: { include: { customer: true } },
    },
  });

  let totalRevenue = 0;
  let totalExpectedProfit = 0;
  let totalMinProfit = 0;
  let totalMaxProfit = 0;
  let totalConfidenceSum = 0;

  const jobDetails = jobProfits.map((jp) => {
    totalRevenue += jp.revenue;
    totalExpectedProfit += jp.expectedProfit;
    totalMinProfit += jp.minProfit;
    totalMaxProfit += jp.maxProfit;
    totalConfidenceSum += jp.confidenceScore;

    const margin = jp.revenue > 0 ? (jp.expectedProfit / jp.revenue) * 100 : 0;

    return {
      id: jp.id,
      orderNumber: jp.order.orderNumber,
      companyName: jp.order.customer.companyName,
      revenue: jp.revenue,
      expectedProfit: jp.expectedProfit,
      minProfit: jp.minProfit,
      maxProfit: jp.maxProfit,
      marginPercentage: Number(margin.toFixed(1)),
      confidenceScore: jp.confidenceScore,
      missingInputs: JSON.parse(jp.missingInputs || "[]"),
    };
  });

  const count = jobProfits.length || 1;
  const averageProfitMargin = totalRevenue > 0 ? (totalExpectedProfit / totalRevenue) * 100 : 0;
  const averageConfidenceScore = Math.round(totalConfidenceSum / count);

  return {
    totalRevenue,
    totalExpectedProfit,
    totalMinProfit,
    totalMaxProfit,
    averageProfitMargin: Number(averageProfitMargin.toFixed(1)),
    averageConfidenceScore,
    jobCount: jobProfits.length,
    jobDetails,
  };
}
