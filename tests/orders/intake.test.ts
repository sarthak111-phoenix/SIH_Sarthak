import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/lib/db";
import { createFactory } from "../../src/services/factory";
import { addProductWithProcesses } from "../../src/services/products";
import { 
  createOrder, 
  createOrderDraft, 
  confirmAndCommitOrderDraft, 
  getOrdersByFactory, 
  getOrCreateCustomer 
} from "../../src/services/orders";

describe("Phase 2 — Order Intake & AI Ambiguity Confirmation Engine", () => {
  let factoryId: string;
  let customerId: string;
  let productId: string;

  beforeEach(async () => {
    await db.orderItem.deleteMany({});
    await db.order.deleteMany({});
    await db.customer.deleteMany({});
    await db.inventory.deleteMany({});
    await db.material.deleteMany({});
    await db.machine.deleteMany({});
    await db.employee.deleteMany({});
    await db.supplier.deleteMany({});
    await db.notification.deleteMany({});
    await db.process.deleteMany({});
    await db.product.deleteMany({});
    await db.auditLog.deleteMany({});
    await db.factoryKnowledge.deleteMany({});
    await db.user.deleteMany({});
    await db.role.deleteMany({});
    await db.factory.deleteMany({});

    const factory = await createFactory({
      name: "Delta Printing Hub",
      code: "FACT-DELTA",
    });
    factoryId = factory.id;

    const customer = await getOrCreateCustomer(
      factoryId,
      "Apex Corp India",
      "+91 91234 56789"
    );
    customerId = customer.id;

    const product = await addProductWithProcesses({
      factoryId,
      name: "Tri-fold Catalogue",
      code: "PRD-CAT-01",
      category: "CATALOGUE",
      unitPrice: 25.0,
      processes: [
        {
          name: "Printing",
          sequenceOrder: 1,
          setupTimeMinutes: 20,
          unitProductionTimeSeconds: 1.5,
        },
      ],
    });
    productId = product.id;
  });

  it("should successfully create a manual order and compute total amount", async () => {
    const order = await createOrder({
      factoryId,
      customerId,
      productId,
      quantity: 2000,
      unitPrice: 25.0,
      targetDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      priority: "HIGH",
      intakeChannel: "MANUAL_FORM",
      notes: "Urgent shipment required",
    });

    expect(order.orderNumber).toMatch(/^ORD-\d{4}$/);
    expect(order.totalAmount).toBe(50000);
    expect(order.status).toBe("RECEIVED");
    expect(order.intakeChannel).toBe("MANUAL_FORM");
  });

  it("should extract AI OrderDraft and flag low-confidence fields as AMBIGUOUS", () => {
    const draft = createOrderDraft(factoryId, "VOICE", {
      customerName: "Apex Corp India",
      productName: "Tri-fold Catalogue",
      quantity: 5000,
      targetDeadline: "2026-09-01",
      confidences: {
        customerName: 0.65, // < 0.8 -> Ambiguous!
        productName: 0.95,
        quantity: 0.98,
        targetDeadline: 0.70, // < 0.8 -> Ambiguous!
      },
    });

    expect(draft.hasAmbiguity).toBe(true);
    const ambiguousFields = draft.fields.filter((f) => f.ambiguous);
    expect(ambiguousFields.length).toBe(2);
    expect(ambiguousFields.map((f) => f.field)).toContain("customerName");
    expect(ambiguousFields.map((f) => f.field)).toContain("targetDeadline");
  });

  it("should require human confirmation before committing AI OrderDraft to DB", async () => {
    const draft = createOrderDraft(factoryId, "PDF_OCR", {
      customerName: "Apex Corp India",
      productName: "Tri-fold Catalogue",
      quantity: 1000,
      targetDeadline: "2026-09-05",
      confidences: {
        customerName: 0.95,
        productName: 0.95,
        quantity: 0.95,
        targetDeadline: 0.95,
      },
    });

    // Verify order is NOT in DB prior to confirmation
    let orders = await getOrdersByFactory(factoryId);
    expect(orders.length).toBe(0);

    // Human confirms & commits order draft
    const committedOrder = await confirmAndCommitOrderDraft(draft.id, factoryId, {
      customerId,
      productId,
      quantity: 1000,
      unitPrice: 25.0,
      targetDeadline: "2026-09-05",
      priority: "NORMAL",
    });

    expect(committedOrder.id).toBeDefined();
    expect(committedOrder.totalAmount).toBe(25000);

    // Verify order is now persisted in DB
    orders = await getOrdersByFactory(factoryId);
    expect(orders.length).toBe(1);
    expect(orders[0].intakeChannel).toBe("PDF_OCR");
  });

  it("should enforce tenant isolation on order queries", async () => {
    // Create secondary factory
    const factoryB = await createFactory({
      name: "Factory B Limited",
      code: "FACT-BEE",
    });

    await createOrder({
      factoryId,
      customerId,
      productId,
      quantity: 500,
      unitPrice: 25.0,
      targetDeadline: new Date(),
    });

    const factoryBOrders = await getOrdersByFactory(factoryB.id);
    expect(factoryBOrders.length).toBe(0);
  });
});
