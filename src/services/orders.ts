import { db } from "@/lib/db";

export type CreateOrderInput = {
  factoryId: string;
  customerId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  targetDeadline: Date;
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  intakeChannel?: "MANUAL_FORM" | "VOICE" | "PDF_OCR" | "CSV_IMPORT";
  specifications?: Record<string, any>;
  notes?: string;
};

export type ExtractedFieldConfidence = {
  field: string;
  value: any;
  confidence: number; // 0.0 to 1.0
  source: string;
  ambiguous: boolean;
};

export type OrderDraft = {
  id: string;
  factoryId: string;
  intakeChannel: "VOICE" | "PDF_OCR" | "CSV_IMPORT";
  customerName: string;
  productName: string;
  quantity: number;
  targetDeadline: string;
  specifications: Record<string, any>;
  notes?: string;
  fields: ExtractedFieldConfidence[];
  hasAmbiguity: boolean;
  createdAt: string;
};

// In-memory / transactional draft store for unconfirmed AI extracted orders
const draftStore = new Map<string, OrderDraft>();

export async function createOrder(input: CreateOrderInput) {
  // Generate unique order number per factory
  const count = await db.order.count({ where: { factoryId: input.factoryId } });
  const orderNumber = `ORD-${(count + 1).toString().padStart(4, "0")}`;

  const totalAmount = input.quantity * input.unitPrice;

  return await db.order.create({
    data: {
      factoryId: input.factoryId,
      customerId: input.customerId,
      orderNumber,
      status: "RECEIVED",
      feasibilityStatus: "PENDING",
      totalAmount,
      targetDeadline: input.targetDeadline,
      priority: input.priority || "NORMAL",
      intakeChannel: input.intakeChannel || "MANUAL_FORM",
      notes: input.notes,
      items: {
        create: [
          {
            productId: input.productId,
            quantity: input.quantity,
            unitPrice: input.unitPrice,
            totalPrice: totalAmount,
            specifications: JSON.stringify(input.specifications || {}),
          },
        ],
      },
    },
    include: {
      customer: true,
      items: {
        include: { product: true },
      },
    },
  });
}

export function createOrderDraft(
  factoryId: string,
  intakeChannel: "VOICE" | "PDF_OCR" | "CSV_IMPORT",
  extractedData: {
    customerName: string;
    productName: string;
    quantity: number;
    targetDeadline: string;
    specifications?: Record<string, any>;
    notes?: string;
    confidences: Record<string, number>;
  }
): OrderDraft {
  const draftId = `draft_${crypto.randomUUID()}`;
  
  const fields: ExtractedFieldConfidence[] = [
    {
      field: "customerName",
      value: extractedData.customerName,
      confidence: extractedData.confidences.customerName ?? 0.9,
      source: intakeChannel,
      ambiguous: (extractedData.confidences.customerName ?? 0.9) < 0.8,
    },
    {
      field: "productName",
      value: extractedData.productName,
      confidence: extractedData.confidences.productName ?? 0.95,
      source: intakeChannel,
      ambiguous: (extractedData.confidences.productName ?? 0.95) < 0.8,
    },
    {
      field: "quantity",
      value: extractedData.quantity,
      confidence: extractedData.confidences.quantity ?? 0.95,
      source: intakeChannel,
      ambiguous: (extractedData.confidences.quantity ?? 0.95) < 0.8,
    },
    {
      field: "targetDeadline",
      value: extractedData.targetDeadline,
      confidence: extractedData.confidences.targetDeadline ?? 0.85,
      source: intakeChannel,
      ambiguous: (extractedData.confidences.targetDeadline ?? 0.85) < 0.8,
    },
  ];

  const hasAmbiguity = fields.some((f) => f.ambiguous);

  const draft: OrderDraft = {
    id: draftId,
    factoryId,
    intakeChannel,
    customerName: extractedData.customerName,
    productName: extractedData.productName,
    quantity: extractedData.quantity,
    targetDeadline: extractedData.targetDeadline,
    specifications: extractedData.specifications || {},
    notes: extractedData.notes,
    fields,
    hasAmbiguity,
    createdAt: new Date().toISOString(),
  };

  draftStore.set(draftId, draft);
  return draft;
}

export function getOrderDraft(draftId: string): OrderDraft | undefined {
  return draftStore.get(draftId);
}

export async function confirmAndCommitOrderDraft(
  draftId: string,
  factoryId: string,
  userConfirmedData: {
    customerId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    targetDeadline: string;
    priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  }
) {
  const draft = draftStore.get(draftId);
  if (!draft) {
    throw new Error(`Order draft ${draftId} not found or expired.`);
  }

  if (draft.factoryId !== factoryId) {
    throw new Error("Cross-tenant order draft confirmation is prohibited.");
  }

  const order = await createOrder({
    factoryId,
    customerId: userConfirmedData.customerId,
    productId: userConfirmedData.productId,
    quantity: userConfirmedData.quantity,
    unitPrice: userConfirmedData.unitPrice,
    targetDeadline: new Date(userConfirmedData.targetDeadline),
    priority: userConfirmedData.priority || "NORMAL",
    intakeChannel: draft.intakeChannel,
    specifications: draft.specifications,
    notes: draft.notes,
  });

  draftStore.delete(draftId);
  return order;
}

export async function getOrdersByFactory(
  factoryId: string,
  statusFilter?: string
) {
  return await db.order.findMany({
    where: {
      factoryId,
      isDeleted: false,
      ...(statusFilter && statusFilter !== "ALL" ? { status: statusFilter } : {}),
    },
    include: {
      customer: true,
      items: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrCreateCustomer(
  factoryId: string,
  companyName: string,
  phone: string,
  contactName: string = "Purchasing Officer",
  email?: string
) {
  const existing = await db.customer.findFirst({
    where: { factoryId, companyName },
  });

  if (existing) return existing;

  return await db.customer.create({
    data: {
      factoryId,
      companyName,
      contactName,
      phone,
      email,
    },
  });
}
