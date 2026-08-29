import { NextRequest, NextResponse } from "next/server";
import { createOrderDraft } from "@/services/orders";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { factoryId, intakeChannel, content, simulateAmbiguity } = body;

    if (!factoryId || !intakeChannel) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_REQUEST", message: "factoryId and intakeChannel required." } },
        { status: 400 }
      );
    }

    // Default mock extraction parser simulating AI extraction (Voice / OCR / CSV)
    let customerName = "Sun Rise Enterprises";
    let productName = "A4 Tri-fold Brochure";
    let quantity = 5000;
    let targetDeadline = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    let confidences = {
      customerName: 0.95,
      productName: 0.92,
      quantity: 0.98,
      targetDeadline: 0.90,
    };

    if (intakeChannel === "VOICE") {
      customerName = "Reliance Logistics (Extracted Voice)";
      productName = "Shipping Labels";
      quantity = 10000;
      // If voice parsing has audio noise or ambiguous deadline, flag lower confidence
      if (simulateAmbiguity) {
        confidences.customerName = 0.65; // Trigger Ambiguity Warning
        confidences.targetDeadline = 0.70; // Trigger Ambiguity Warning
      }
    } else if (intakeChannel === "PDF_OCR") {
      customerName = "Hindustan Lever Ltd (OCR Scanned PO)";
      productName = "Cardboard Outer Box";
      quantity = 2500;
      if (simulateAmbiguity) {
        confidences.quantity = 0.72; // Trigger Ambiguity Warning
      }
    } else if (intakeChannel === "CSV_IMPORT") {
      customerName = "Metro Wholesale India";
      productName = "Product Catalog 2026";
      quantity = 8000;
    }

    const draft = createOrderDraft(factoryId, intakeChannel, {
      customerName,
      productName,
      quantity,
      targetDeadline,
      confidences,
      notes: `Extracted via AI ${intakeChannel} parser at ${new Date().toLocaleTimeString()}`,
    });

    return NextResponse.json({
      success: true,
      data: draft,
      metadata: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID() },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "PARSE_FAILED", message: err.message } },
      { status: 500 }
    );
  }
}
