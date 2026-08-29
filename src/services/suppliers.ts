import { db } from "@/lib/db";

export type SupplierInput = {
  factoryId: string;
  name: string;
  code: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  averageLeadTimeDays: number;
};

export async function addSupplier(input: SupplierInput) {
  return await db.supplier.create({
    data: {
      factoryId: input.factoryId,
      name: input.name,
      code: input.code.toUpperCase(),
      contactPerson: input.contactPerson,
      email: input.email,
      phone: input.phone,
      averageLeadTimeDays: input.averageLeadTimeDays,
      reliabilityScore: 100.0,
    },
  });
}

export async function getSuppliersByFactory(factoryId: string) {
  return await db.supplier.findMany({
    where: {
      factoryId,
      isDeleted: false,
    },
    orderBy: { createdAt: "desc" },
  });
}
