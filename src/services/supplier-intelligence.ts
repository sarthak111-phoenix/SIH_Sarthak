import { db } from "@/lib/db";
import { calculateSupplierReliability, SupplierReliabilityResult } from "@/deterministic-engine/supplier";

export type SupplierIntelligenceItem = {
  id: string;
  name: string;
  code: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  averageLeadTimeDays: number;
  reliabilityScore: number;
  leadTimeVarianceScore: number;
  grade: "EXCELLENT" | "GOOD" | "AVERAGE" | "POOR";
};

export async function getSupplierIntelligence(factoryId: string): Promise<SupplierIntelligenceItem[]> {
  const suppliers = await db.supplier.findMany({
    where: { factoryId, isDeleted: false },
    orderBy: { reliabilityScore: "desc" },
  });

  return suppliers.map((sup) => {
    // Evaluate supplier metrics deterministically
    const scoring = calculateSupplierReliability({
      onTimeDeliveryPercentage: sup.reliabilityScore,
      rejectionPercentage: Math.max(0, 100 - sup.reliabilityScore),
      fulfillmentPercentage: sup.reliabilityScore,
      promisedLeadTimeDays: sup.averageLeadTimeDays,
      actualLeadTimeDays: sup.averageLeadTimeDays,
    });

    return {
      id: sup.id,
      name: sup.name,
      code: sup.code,
      contactPerson: sup.contactPerson,
      email: sup.email,
      phone: sup.phone,
      averageLeadTimeDays: sup.averageLeadTimeDays,
      reliabilityScore: scoring.reliabilityScore,
      leadTimeVarianceScore: scoring.leadTimeVarianceScore,
      grade: scoring.grade,
    };
  });
}
