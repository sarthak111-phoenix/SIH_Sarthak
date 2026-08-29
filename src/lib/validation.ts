import { z } from "zod";

export const UUIDSchema = z.string().uuid({ message: "Invalid UUID format" });

export const StandardResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z
      .object({
        code: z.string(),
        message: z.string(),
        details: z.record(z.any()).optional(),
      })
      .optional(),
    metadata: z.object({
      timestamp: z.string(),
      requestId: z.string(),
      factoryId: z.string().optional(),
    }),
  });

export const OrderIntakeFormSchema = z.object({
  customerId: UUIDSchema,
  productName: z.string().min(2, "Product name required"),
  quantity: z.number().int().positive("Quantity must be greater than 0"),
  targetDeadline: z.string().datetime("Invalid deadline format"),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
  specifications: z.record(z.any()).default({}),
  notes: z.string().optional(),
});
