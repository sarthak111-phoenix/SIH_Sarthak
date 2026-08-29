import { NextRequest, NextResponse } from "next/server";
import {
  createFactory,
  getFactoryById,
  updateFactoryOnboardingProgress,
  activateFactory,
} from "@/services/factory";
import { addMachine } from "@/services/machines";
import { addMaterial } from "@/services/materials";
import { addProductWithProcesses } from "@/services/products";
import { addEmployee } from "@/services/employees";
import { addSupplier } from "@/services/suppliers";
import { getOrCreateCustomer, createOrder } from "@/services/orders";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, factoryId, payload, step } = body;

    if (action === "create_factory") {
      const factory = await createFactory({
        name: payload.name,
        code: payload.code,
        industry: payload.industry,
        currency: payload.currency,
        timezone: payload.timezone,
      });

      return NextResponse.json({
        success: true,
        data: factory,
        metadata: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID() },
      });
    }

    if (!factoryId) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_FACTORY_ID", message: "factoryId is required." } },
        { status: 400 }
      );
    }

    if (action === "add_machine") {
      const machine = await addMachine({ factoryId, ...payload });
      return NextResponse.json({ success: true, data: machine });
    }

    if (action === "save_machines") {
      const machinesList: string[] = payload?.machines || payload?.machinesList || [];
      const created = [];
      for (let i = 0; i < machinesList.length; i++) {
        const name = machinesList[i];
        if (!name) continue;
        const code = `MCH-${String(i + 1).padStart(2, '0')}`;
        const type = name.toLowerCase().includes("cnc") ? "CNC Machining" 
                   : name.toLowerCase().includes("mill") ? "Milling" 
                   : name.toLowerCase().includes("press") ? "Pressing" 
                   : name.toLowerCase().includes("grind") ? "Grinding" 
                   : "Industrial Equipment";
        try {
          const machine = await addMachine({
            factoryId,
            name,
            code,
            type,
            hourlyRate: 450 + (i * 50),
            energyConsumptionKw: 12 + (i * 2),
            idealOutputRatePerHour: 120 + (i * 20),
          });
          created.push(machine);
        } catch (e) {}
      }
      return NextResponse.json({ success: true, count: created.length, data: created });
    }

    if (action === "add_material") {
      const material = await addMaterial({ factoryId, ...payload });
      return NextResponse.json({ success: true, data: material });
    }

    if (action === "add_product") {
      const product = await addProductWithProcesses({ factoryId, ...payload });
      return NextResponse.json({ success: true, data: product });
    }

    if (action === "add_employee") {
      const employee = await addEmployee({ factoryId, ...payload });
      return NextResponse.json({ success: true, data: employee });
    }

    if (action === "add_supplier") {
      const supplier = await addSupplier({ factoryId, ...payload });
      return NextResponse.json({ success: true, data: supplier });
    }

    if (action === "update_step") {
      const factory = await updateFactoryOnboardingProgress(factoryId, step);
      return NextResponse.json({ success: true, data: factory });
    }

    if (action === "bulk_import_orders") {
      const items = payload.items || [];
      const created = [];
      for (const item of items) {
        try {
          const customer = await getOrCreateCustomer(factoryId, item.customer || "General Client", item.phone || "+91 98765 43210");
          const order = await createOrder({
            factoryId,
            customerId: customer.id,
            productId: item.productId || "prod_default_1",
            quantity: Number(item.quantity || item.qty || 10),
            unitPrice: Number(item.unitPrice || item.price || 100),
            targetDeadline: item.deadline ? new Date(item.deadline) : new Date(Date.now() + 7 * 86400000),
            priority: item.priority || "NORMAL",
            intakeChannel: "CSV_IMPORT",
            notes: `Imported via onboarding CSV (${item.orderId || item.id || 'ORDER'})`,
          });
          created.push(order);
        } catch (e) {
          // Continue bulk processing even if individual item fails
        }
      }
      return NextResponse.json({ success: true, count: created.length, data: created });
    }

    if (action === "bulk_import_inventory") {
      const items = payload.items || [];
      const created = [];
      for (const item of items) {
        try {
          const mat = await addMaterial({
            factoryId,
            name: item.name || item.materialName || item.itemName || "Raw Material",
            code: item.code || `MAT-${Math.floor(Math.random() * 8999 + 1000)}`,
            category: item.category || "General",
            unitOfMeasure: item.unit || item.unitOfMeasure || "kg",
            costPerUnit: Number(item.costPerUnit || item.price || 50),
            minimumStockThreshold: Number(item.minStock || 10),
            reorderQuantity: Number(item.reorderQty || 50),
            initialStock: Number(item.currentStock || item.stock || 100),
          });
          created.push(mat);
        } catch (e) {
          // Continue bulk processing
        }
      }
      return NextResponse.json({ success: true, count: created.length, data: created });
    }

    if (action === "bulk_import_customers") {
      const items = payload.items || [];
      const created = [];
      for (const item of items) {
        try {
          const cust = await getOrCreateCustomer(
            factoryId,
            item.name || item.company || "Customer",
            item.phone || "+91 99999 00000"
          );
          created.push(cust);
        } catch (e) {
          // Continue bulk processing
        }
      }
      return NextResponse.json({ success: true, count: created.length, data: created });
    }

    if (action === "complete_onboarding") {
      const machinesList = payload?.machines || payload?.machinesList;
      if (Array.isArray(machinesList) && machinesList.length > 0) {
        for (let i = 0; i < machinesList.length; i++) {
          const name = machinesList[i];
          if (!name) continue;
          const code = `MCH-${String(i + 1).padStart(2, '0')}`;
          const type = name.toLowerCase().includes("cnc") ? "CNC Machining" 
                     : name.toLowerCase().includes("mill") ? "Milling" 
                     : name.toLowerCase().includes("press") ? "Pressing" 
                     : name.toLowerCase().includes("grind") ? "Grinding" 
                     : "Industrial Equipment";
          try {
            await addMachine({
              factoryId,
              name,
              code,
              type,
              hourlyRate: 450 + (i * 50),
              energyConsumptionKw: 12 + (i * 2),
              idealOutputRatePerHour: 120 + (i * 20),
            });
          } catch (e) {}
        }
      }
      const factory = await activateFactory(factoryId);
      return NextResponse.json({ success: true, data: factory });
    }

    return NextResponse.json(
      { success: false, error: { code: "INVALID_ACTION", message: "Action not recognized." } },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "ONBOARDING_ERROR", message: error.message || "An unexpected error occurred." },
        metadata: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID() },
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const factoryId = searchParams.get("factoryId");

  if (!factoryId) {
    return NextResponse.json(
      { success: false, error: { code: "MISSING_FACTORY_ID", message: "factoryId parameter required." } },
      { status: 400 }
    );
  }

  const factory = await getFactoryById(factoryId);
  return NextResponse.json({ success: true, data: factory });
}
