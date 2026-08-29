import { db } from "@/lib/db";

export type ProcessInput = {
  name: string;
  sequenceOrder: number;
  setupTimeMinutes: number;
  unitProductionTimeSeconds: number;
  scrapPercentage?: number;
};

export type ProductInput = {
  factoryId: string;
  name: string;
  code: string;
  category: string;
  unitPrice: number;
  processes: ProcessInput[];
};

export async function addProductWithProcesses(input: ProductInput) {
  return await db.product.create({
    data: {
      factoryId: input.factoryId,
      name: input.name,
      code: input.code.toUpperCase(),
      category: input.category,
      unitPrice: input.unitPrice,
      processes: {
        create: input.processes.map((p) => ({
          factoryId: input.factoryId,
          name: p.name,
          sequenceOrder: p.sequenceOrder,
          setupTimeMinutes: p.setupTimeMinutes,
          unitProductionTimeSeconds: p.unitProductionTimeSeconds,
          scrapPercentage: p.scrapPercentage || 0,
        })),
      },
    },
    include: {
      processes: true,
    },
  });
}

export async function getProductsByFactory(factoryId: string) {
  return await db.product.findMany({
    where: {
      factoryId,
      isDeleted: false,
    },
    include: {
      processes: {
        orderBy: { sequenceOrder: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
