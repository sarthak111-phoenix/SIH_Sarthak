import { db } from "@/lib/db";

export type MaterialInput = {
  factoryId: string;
  name: string;
  code: string;
  category: string;
  unitOfMeasure: string;
  costPerUnit: number;
  minimumStockThreshold: number;
  reorderQuantity: number;
  initialStock?: number;
};

export async function addMaterial(input: MaterialInput) {
  const material = await db.material.create({
    data: {
      factoryId: input.factoryId,
      name: input.name,
      code: input.code.toUpperCase(),
      category: input.category,
      unitOfMeasure: input.unitOfMeasure,
      costPerUnit: input.costPerUnit,
      minimumStockThreshold: input.minimumStockThreshold,
      reorderQuantity: input.reorderQuantity,
    },
  });

  // Automatically initialize inventory record
  await db.inventory.create({
    data: {
      factoryId: input.factoryId,
      materialId: material.id,
      currentStock: input.initialStock || 0,
      reservedStock: 0,
      damagedStock: 0,
      lastRestockedAt: new Date(),
    },
  });

  return material;
}

export async function getMaterialsByFactory(factoryId: string) {
  return await db.material.findMany({
    where: {
      factoryId,
      isDeleted: false,
    },
    include: {
      inventory: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function softDeleteMaterial(factoryId: string, materialId: string) {
  return await db.material.updateMany({
    where: {
      id: materialId,
      factoryId,
    },
    data: {
      isDeleted: true,
    },
  });
}
