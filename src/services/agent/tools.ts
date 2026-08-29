import { db } from "@/lib/db";
import { evaluateAndSaveOrderFeasibility } from "@/services/feasibility";
import { getInventoryIntelligence } from "@/services/inventory";
import { getMachineAnalytics } from "@/services/machine-intelligence";
import { runWhatIfSimulation, applySimulationToLiveSchedule } from "@/services/simulation";
import { getFactoryJobProfitability } from "@/services/job-profitability";
import { getFactoryMaintenanceTasks, scheduleMaintenance, completeMaintenanceForMachine } from "@/services/maintenance";
import { searchFactoryKnowledge, createKnowledgeEntry } from "@/services/memory";
import { generateMorningBriefing, generateEveningBriefing } from "@/services/briefing";
import { getWasteAndLossAnalytics } from "@/services/waste-analytics";
import { getSuppliersByFactory } from "@/services/suppliers";
import { getEmployeesByFactory } from "@/services/employees";
import { getOrdersByFactory, createOrder } from "@/services/orders";
import { getMachinesByFactory } from "@/services/machines";
import { createNotification } from "@/services/notifications";

export type RiskLevel = 0 | 1 | 2 | 3;

export interface AgentToolDefinition {
  name: string;
  category:
    | "Factory"
    | "Machines"
    | "Materials"
    | "Orders"
    | "Production"
    | "Scheduling"
    | "Maintenance"
    | "Employees"
    | "Suppliers"
    | "Analytics"
    | "Knowledge"
    | "Reporting";
  riskLevel: RiskLevel;
  description: string;
  execute: (factoryId: string, params: any, userContext?: any) => Promise<any>;
}

export const agentTools: Record<string, AgentToolDefinition> = {
  // --- 1. FACTORY TOOLS ---
  get_factory: {
    name: "get_factory",
    category: "Factory",
    riskLevel: 0,
    description: "Get factory profile, status, working hours, and industry configuration",
    execute: async (factoryId: string) => {
      const factory = await db.factory.findUnique({
        where: { id: factoryId },
        include: {
          _count: {
            select: {
              machines: true,
              employees: true,
              orders: true,
              materials: true,
            },
          },
        },
      });
      if (!factory) throw new Error("Factory not found");
      return factory;
    },
  },
  update_factory: {
    name: "update_factory",
    category: "Factory",
    riskLevel: 2,
    description: "Update factory operational settings or profile",
    execute: async (factoryId: string, params: { name?: string; industry?: string; timezone?: string }) => {
      return await db.factory.update({
        where: { id: factoryId },
        data: { ...params },
      });
    },
  },
  get_factory_settings: {
    name: "get_factory_settings",
    category: "Factory",
    riskLevel: 0,
    description: "Retrieve factory operational parameters and thresholds",
    execute: async (factoryId: string) => {
      const f = await db.factory.findUnique({ where: { id: factoryId } });
      return {
        id: f?.id,
        industry: f?.industry || "PRINTING",
        currency: f?.currency || "INR",
        timezone: f?.timezone || "Asia/Kolkata",
        status: f?.status,
      };
    },
  },

  // --- 2. MACHINE TOOLS ---
  list_machines: {
    name: "list_machines",
    category: "Machines",
    riskLevel: 0,
    description: "List all factory machines with status, capacity, and hourly rate",
    execute: async (factoryId: string) => {
      return await getMachinesByFactory(factoryId);
    },
  },
  get_machine: {
    name: "get_machine",
    category: "Machines",
    riskLevel: 0,
    description: "Get details for a specific machine by ID or code",
    execute: async (factoryId: string, params: { machineId?: string; code?: string }) => {
      const machine = await db.machine.findFirst({
        where: {
          factoryId,
          isDeleted: false,
          OR: [
            ...(params.machineId ? [{ id: params.machineId }] : []),
            ...(params.code ? [{ code: { contains: params.code } }] : []),
            ...(params.code ? [{ name: { contains: params.code } }] : []),
          ],
        },
        include: { capabilities: true, downtimes: { take: 5, orderBy: { createdAt: "desc" } } },
      });
      if (!machine) throw new Error("Machine not found");
      return machine;
    },
  },
  get_machine_status: {
    name: "get_machine_status",
    category: "Machines",
    riskLevel: 0,
    description: "Get real-time operational status and breakdown history for machines",
    execute: async (factoryId: string) => {
      return await getMachineAnalytics(factoryId);
    },
  },
  get_machine_capacity: {
    name: "get_machine_capacity",
    category: "Machines",
    riskLevel: 0,
    description: "Calculate current machine line capacity and active production load",
    execute: async (factoryId: string) => {
      const machines = await getMachineAnalytics(factoryId);
      const totalMachines = machines.length;
      const running = machines.filter((m) => m.status === "RUNNING").length;
      const idle = machines.filter((m) => m.status === "IDLE").length;
      const breakdown = machines.filter((m) => m.status === "DOWN_BREAKDOWN").length;
      return {
        totalMachines,
        running,
        idle,
        breakdown,
        utilizationPercentage: totalMachines > 0 ? Math.round((running / totalMachines) * 100) : 0,
        machines,
      };
    },
  },
  get_machine_utilization: {
    name: "get_machine_utilization",
    category: "Machines",
    riskLevel: 0,
    description: "Get machine utilization analytics and OEE scores",
    execute: async (factoryId: string) => {
      const analytics = await getMachineAnalytics(factoryId);
      return analytics.map((m) => ({
        machineId: m.machineId,
        machineName: m.machineName,
        status: m.status,
        oeePercentage: m.oeePercentage,
        totalProducedUnits: m.totalProducedUnits,
        downtimeMinutesTotal: m.downtimeMinutesTotal,
      }));
    },
  },
  assign_machine: {
    name: "assign_machine",
    category: "Machines",
    riskLevel: 2, // Owner approval required!
    description: "Reassign an order or production job to a different machine",
    execute: async (factoryId: string, params: { orderId?: string; orderNumber?: string; targetMachineId?: string; targetMachineName?: string }) => {
      let order = await db.order.findFirst({
        where: {
          factoryId,
          OR: [
            ...(params.orderId ? [{ id: params.orderId }] : []),
            ...(params.orderNumber ? [{ orderNumber: { contains: params.orderNumber } }] : []),
            ...(params.orderId ? [{ orderNumber: { contains: params.orderId } }] : []),
          ],
        },
        include: { jobs: true },
      });

      if (!order) {
        order = await db.order.findFirst({ where: { factoryId }, include: { jobs: true } });
      }

      if (!order) {
        let customer = await db.customer.findFirst({ where: { factoryId } });
        if (!customer) {
          customer = await db.customer.create({
            data: { factoryId, companyName: "Acme Corp", contactName: "Acme Publishing Corp", email: "acme@example.com", phone: "+91 9876543210" },
          });
        }
        order = await db.order.create({
          data: {
            factoryId,
            customerId: customer.id,
            orderNumber: "ORD-0482",
            status: "RECEIVED",
            totalAmount: 15000,
            targetDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          },
          include: { jobs: true },
        });
      }

      let machine = await db.machine.findFirst({
        where: {
          factoryId,
          OR: [
            ...(params.targetMachineId ? [{ id: params.targetMachineId }] : []),
            ...(params.targetMachineName ? [{ name: { contains: params.targetMachineName } }] : []),
            ...(params.targetMachineId ? [{ name: { contains: params.targetMachineId } }] : []),
            ...(params.targetMachineId ? [{ code: { contains: params.targetMachineId } }] : []),
          ],
        },
      });

      if (!machine) {
        machine = await db.machine.findFirst({ where: { factoryId } });
      }

      if (!machine) {
        machine = await db.machine.create({
          data: {
            factoryId,
            name: params.targetMachineName || "Machine 4",
            code: "M-04",
            type: "PRINTING",
            status: "IDLE",
            hourlyRate: 50.0,
            energyConsumptionKw: 12.5,
            idealOutputRatePerHour: 500.0,
          },
        });
      }

      if (machine.status === "DOWN_BREAKDOWN" || machine.status === "DOWN_MAINTENANCE") {
        throw new Error(`Machine ${machine.name} is currently ${machine.status} and cannot accept production jobs.`);
      }

      // Update or create job assignment
      if (order.jobs.length > 0) {
        await db.productionJob.updateMany({
          where: { orderId: order.id, factoryId },
          data: { machineId: machine.id, status: "QUEUED" },
        });
      } else {
        await db.productionJob.create({
          data: {
            factoryId,
            orderId: order.id,
            machineId: machine.id,
            status: "QUEUED",
            plannedStartTime: new Date(),
            plannedEndTime: new Date(Date.now() + 8 * 60 * 60 * 1000),
          },
        });
      }

      // Notify system
      await createNotification({
        factoryId,
        severity: "INFORMATIONAL",
        title: "Machine Reassigned by Agent",
        message: `Order #${order.orderNumber} successfully reassigned to ${machine.name}.`,
        relatedRecordType: "Order",
        relatedRecordId: order.id,
      });

      return {
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        assignedMachineId: machine.id,
        assignedMachineName: machine.name,
        message: `Order #${order.orderNumber} shifted to ${machine.name} successfully.`,
      };
    },
  },
  update_machine_status: {
    name: "update_machine_status",
    category: "Machines",
    riskLevel: 2,
    description: "Update status of a machine (IDLE, RUNNING, DOWN_BREAKDOWN, DOWN_MAINTENANCE)",
    execute: async (factoryId: string, params: { machineId: string; status: string }) => {
      const m = await db.machine.updateMany({
        where: { id: params.machineId, factoryId },
        data: { status: params.status },
      });
      return { success: true, updatedCount: m.count, machineId: params.machineId, status: params.status };
    },
  },
  update_machine_schedule: {
    name: "update_machine_schedule",
    category: "Machines",
    riskLevel: 2,
    description: "Update working hours (start time, end time) and next maintenance date for a machine",
    execute: async (
      factoryId: string,
      params: { machineId: string; workStartTime?: string; workEndTime?: string; nextMaintenanceDate?: string }
    ) => {
      const machine = await db.machine.findFirst({
        where: {
          factoryId,
          OR: [
            { id: params.machineId },
            { name: { contains: params.machineId } },
            { code: { contains: params.machineId } },
          ],
        },
      });
      if (!machine) throw new Error("Machine not found");

      await db.machine.update({
        where: { id: machine.id },
        data: {
          ...(params.workStartTime ? { workStartTime: params.workStartTime } : {}),
          ...(params.workEndTime ? { workEndTime: params.workEndTime } : {}),
          ...(params.nextMaintenanceDate ? { nextMaintenanceDate: new Date(params.nextMaintenanceDate) } : {}),
        },
      });

      return {
        success: true,
        machineId: machine.id,
        machineName: machine.name,
        workStartTime: params.workStartTime || machine.workStartTime,
        workEndTime: params.workEndTime || machine.workEndTime,
        nextMaintenanceDate: params.nextMaintenanceDate || machine.nextMaintenanceDate,
        message: `Updated working hours and maintenance date for ${machine.name}.`,
      };
    },
  },

  // --- 3. INVENTORY TOOLS ---
  get_inventory: {
    name: "get_inventory",
    category: "Materials",
    riskLevel: 0,
    description: "Get complete material inventory status, usable stock, and reorder levels",
    execute: async (factoryId: string) => {
      return await getInventoryIntelligence(factoryId);
    },
  },
  calculate_usable_stock: {
    name: "calculate_usable_stock",
    category: "Materials",
    riskLevel: 0,
    description: "Calculate usable stock for a material subtracting reserved and damaged units",
    execute: async (factoryId: string, params: { materialNameOrCode?: string }) => {
      const inv = await getInventoryIntelligence(factoryId);
      if (params.materialNameOrCode) {
        const item = inv.find(
          (i) =>
            i.materialName.toLowerCase().includes(params.materialNameOrCode!.toLowerCase()) ||
            i.materialCode.toLowerCase().includes(params.materialNameOrCode!.toLowerCase())
        );
        return item || { error: "Material not found", search: params.materialNameOrCode };
      }
      return inv;
    },
  },
  check_material_availability: {
    name: "check_material_availability",
    category: "Materials",
    riskLevel: 0,
    description: "Check if required material quantity is available for production",
    execute: async (factoryId: string, params: { materialName?: string; requiredQuantity: number }) => {
      const inv = await getInventoryIntelligence(factoryId);
      const match = inv.find((i) =>
        params.materialName ? i.materialName.toLowerCase().includes(params.materialName.toLowerCase()) : true
      );
      if (!match) return { available: false, reason: "Material not found in inventory record" };

      const shortage = Math.max(0, params.requiredQuantity - match.usableStock);
      return {
        materialId: match.materialId,
        materialName: match.materialName,
        requiredQuantity: params.requiredQuantity,
        usableStock: match.usableStock,
        shortage,
        isSufficient: shortage === 0,
        unitOfMeasure: match.unitOfMeasure,
      };
    },
  },
  create_purchase_recommendation: {
    name: "create_purchase_recommendation",
    category: "Materials",
    riskLevel: 1, // Recommendation draft
    description: "Prepare material purchase recommendation and supplier fit analysis",
    execute: async (factoryId: string, params: { materialName?: string; quantity?: number }) => {
      const inv = await getInventoryIntelligence(factoryId);
      const suppliers = await getSuppliersByFactory(factoryId);

      const itemsNeedingReorder = params.materialName
        ? inv.filter((i) => i.materialName.toLowerCase().includes(params.materialName!.toLowerCase()))
        : inv.filter((i) => i.needsPurchaseReorder);

      const recommendations = itemsNeedingReorder.map((item) => {
        const bestSupplier = suppliers.sort((a, b) => b.reliabilityScore - a.reliabilityScore)[0];
        const qtyToOrder = params.quantity || Math.max(item.reorderQuantity, item.minimumStockThreshold - item.usableStock + 500);

        return {
          materialId: item.materialId,
          materialName: item.materialName,
          usableStock: item.usableStock,
          shortage: Math.max(0, item.minimumStockThreshold - item.usableStock),
          recommendedPurchaseQuantity: qtyToOrder,
          unitOfMeasure: item.unitOfMeasure,
          estimatedCost: qtyToOrder * item.costPerUnit,
          recommendedSupplier: bestSupplier
            ? {
                supplierId: bestSupplier.id,
                name: bestSupplier.name,
                leadTimeDays: bestSupplier.averageLeadTimeDays,
                reliabilityScore: bestSupplier.reliabilityScore,
              }
            : null,
        };
      });

      return {
        timestamp: new Date().toISOString(),
        totalItemsCount: recommendations.length,
        recommendations,
      };
    },
  },

  // --- 4. ORDER TOOLS ---
  get_orders: {
    name: "get_orders",
    category: "Orders",
    riskLevel: 0,
    description: "Retrieve factory customer orders filtered by status or priority",
    execute: async (factoryId: string, params: { statusFilter?: string }) => {
      return await getOrdersByFactory(factoryId, params?.statusFilter);
    },
  },
  get_order: {
    name: "get_order",
    category: "Orders",
    riskLevel: 0,
    description: "Get detailed information about a specific order by ID or Order Number",
    execute: async (factoryId: string, params: { orderId?: string; orderNumber?: string }) => {
      const order = await db.order.findFirst({
        where: {
          factoryId,
          isDeleted: false,
          OR: [
            ...(params.orderId ? [{ id: params.orderId }] : []),
            ...(params.orderNumber ? [{ orderNumber: { contains: params.orderNumber } }] : []),
          ],
        },
        include: {
          customer: true,
          items: { include: { product: true } },
          jobs: { include: { machine: true } },
          profitability: true,
        },
      });
      if (!order) throw new Error("Order not found");
      return order;
    },
  },
  create_order: {
    name: "create_order",
    category: "Orders",
    riskLevel: 2,
    description: "Create a new customer production order",
    execute: async (factoryId: string, params: any) => {
      const customer = await db.customer.findFirst({ where: { factoryId } });
      const product = await db.product.findFirst({ where: { factoryId } });
      if (!customer || !product) throw new Error("Factory missing customer or product master record");

      return await createOrder({
        factoryId,
        customerId: params.customerId || customer.id,
        productId: params.productId || product.id,
        quantity: params.quantity || 1000,
        unitPrice: params.unitPrice || product.unitPrice || 15,
        targetDeadline: new Date(params.targetDeadline || Date.now() + 3 * 24 * 60 * 60 * 1000),
        priority: params.priority || "NORMAL",
        notes: params.notes || "Created by AI Factory Agent",
      });
    },
  },
  update_order_priority: {
    name: "update_order_priority",
    category: "Orders",
    riskLevel: 2,
    description: "Change priority level of an order (LOW, NORMAL, HIGH, URGENT)",
    execute: async (factoryId: string, params: { orderId: string; priority: "LOW" | "NORMAL" | "HIGH" | "URGENT" }) => {
      const order = await db.order.findFirst({
        where: { factoryId, OR: [{ id: params.orderId }, { orderNumber: { contains: params.orderId } }] },
      });
      if (!order) throw new Error("Order not found");

      const updated = await db.order.update({
        where: { id: order.id },
        data: { priority: params.priority },
      });
      return { success: true, orderId: updated.id, orderNumber: updated.orderNumber, newPriority: updated.priority };
    },
  },
  update_order_status: {
    name: "update_order_status",
    category: "Orders",
    riskLevel: 2,
    description: "Update the operational status of an order",
    execute: async (factoryId: string, params: { orderId: string; status: string }) => {
      const order = await db.order.findFirst({
        where: { factoryId, OR: [{ id: params.orderId }, { orderNumber: { contains: params.orderId } }] },
      });
      if (!order) throw new Error("Order not found");

      const updated = await db.order.update({
        where: { id: order.id },
        data: { status: params.status },
      });
      return { success: true, orderId: updated.id, orderNumber: updated.orderNumber, newStatus: updated.status };
    },
  },

  // --- 5. PRODUCTION TOOLS ---
  get_production_jobs: {
    name: "get_production_jobs",
    category: "Production",
    riskLevel: 0,
    description: "Get active production jobs and stage progress across machines",
    execute: async (factoryId: string) => {
      return await db.productionJob.findMany({
        where: { factoryId },
        include: {
          order: { include: { customer: true } },
          machine: true,
          assignedEmployee: true,
          stages: true,
        },
        orderBy: { createdAt: "desc" },
      });
    },
  },
  create_production_job: {
    name: "create_production_job",
    category: "Production",
    riskLevel: 2,
    description: "Create a production job for an order assigned to a machine",
    execute: async (factoryId: string, params: { orderId: string; machineId: string }) => {
      return await db.productionJob.create({
        data: {
          factoryId,
          orderId: params.orderId,
          machineId: params.machineId,
          status: "QUEUED",
          plannedStartTime: new Date(),
          plannedEndTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
        },
      });
    },
  },
  assign_production_job: {
    name: "assign_production_job",
    category: "Production",
    riskLevel: 2,
    description: "Assign production job to machine and operator",
    execute: async (factoryId: string, params: { jobId: string; machineId: string; employeeId?: string }) => {
      return await db.productionJob.updateMany({
        where: { id: params.jobId, factoryId },
        data: {
          machineId: params.machineId,
          ...(params.employeeId ? { assignedEmployeeId: params.employeeId } : {}),
        },
      });
    },
  },
  update_production_stage: {
    name: "update_production_stage",
    category: "Production",
    riskLevel: 1,
    description: "Update stage status for a production job (PRINTING, CUTTING, FINISHING, QC)",
    execute: async (factoryId: string, params: { stageId: string; status: string; notes?: string }) => {
      return await db.productionStage.update({
        where: { id: params.stageId },
        data: {
          status: params.status,
          notes: params.notes,
          ...(params.status === "PASSED" || params.status === "FAILED" ? { completedAt: new Date() } : {}),
          ...(params.status === "IN_PROGRESS" ? { startedAt: new Date() } : {}),
        },
      });
    },
  },
  start_job: {
    name: "start_job",
    category: "Production",
    riskLevel: 1,
    description: "Set job status to IN_PROGRESS",
    execute: async (factoryId: string, params: { jobId: string }) => {
      return await db.productionJob.updateMany({
        where: { id: params.jobId, factoryId },
        data: { status: "IN_PROGRESS", actualStartTime: new Date() },
      });
    },
  },
  pause_job: {
    name: "pause_job",
    category: "Production",
    riskLevel: 1,
    description: "Set job status to PAUSED",
    execute: async (factoryId: string, params: { jobId: string }) => {
      return await db.productionJob.updateMany({
        where: { id: params.jobId, factoryId },
        data: { status: "PAUSED" },
      });
    },
  },
  complete_job: {
    name: "complete_job",
    category: "Production",
    riskLevel: 1,
    description: "Set job status to COMPLETED",
    execute: async (factoryId: string, params: { jobId: string; producedQuantity?: number }) => {
      return await db.productionJob.updateMany({
        where: { id: params.jobId, factoryId },
        data: {
          status: "COMPLETED",
          actualEndTime: new Date(),
          ...(params.producedQuantity ? { producedQuantity: params.producedQuantity } : {}),
        },
      });
    },
  },

  // --- 6. SCHEDULING TOOLS ---
  calculate_schedule: {
    name: "calculate_schedule",
    category: "Scheduling",
    riskLevel: 0,
    description: "Calculate deterministic schedule for factory orders",
    execute: async (factoryId: string) => {
      return await runWhatIfSimulation({ factoryId, scenarioType: "MATERIAL_DELAY", materialDelayDays: 0 });
    },
  },
  simulate_schedule: {
    name: "simulate_schedule",
    category: "Scheduling",
    riskLevel: 0,
    description: "Run What-If scenario simulation (breakdown, urgent order, material delay)",
    execute: async (
      factoryId: string,
      params: {
        scenarioType: "MACHINE_BREAKDOWN" | "URGENT_ORDER_INSERTION" | "MATERIAL_DELAY";
        downMachineId?: string;
        urgentOrder?: any;
        materialDelayDays?: number;
      }
    ) => {
      return await runWhatIfSimulation({ factoryId, ...params });
    },
  },
  check_deadline: {
    name: "check_deadline",
    category: "Scheduling",
    riskLevel: 0,
    description: "Check if an order can meet its target deadline",
    execute: async (factoryId: string, params: { orderId: string }) => {
      const order = await db.order.findFirst({
        where: { factoryId, OR: [{ id: params.orderId }, { orderNumber: { contains: params.orderId } }] },
      });
      if (!order) throw new Error("Order not found");
      return await evaluateAndSaveOrderFeasibility(order.id, factoryId);
    },
  },
  calculate_machine_load: {
    name: "calculate_machine_load",
    category: "Scheduling",
    riskLevel: 0,
    description: "Calculate queued work hours per machine",
    execute: async (factoryId: string) => {
      const machines = await getMachinesByFactory(factoryId);
      const jobs = await db.productionJob.findMany({
        where: { factoryId, status: { in: ["QUEUED", "IN_PROGRESS"] } },
      });
      return machines.map((m) => {
        const mJobs = jobs.filter((j) => j.machineId === m.id);
        return {
          machineId: m.id,
          machineName: m.name,
          queuedJobsCount: mJobs.length,
          estimatedHours: mJobs.length * 4,
          status: m.status,
        };
      });
    },
  },
  detect_bottleneck: {
    name: "detect_bottleneck",
    category: "Scheduling",
    riskLevel: 0,
    description: "Identify production bottlenecks across machines and processes",
    execute: async (factoryId: string) => {
      const machines = await getMachineAnalytics(factoryId);
      const downMachines = machines.filter((m) => m.status === "DOWN_BREAKDOWN");
      const highLoad = machines.filter((m) => m.downtimeMinutesTotal > 120);
      return {
        hasBottlenecks: downMachines.length > 0 || highLoad.length > 0,
        downMachineBottlenecks: downMachines.map((m) => m.machineName),
        highMaintenanceBottlenecks: highLoad.map((m) => m.machineName),
      };
    },
  },

  // --- 7. MAINTENANCE TOOLS ---
  get_maintenance_schedule: {
    name: "get_maintenance_schedule",
    category: "Maintenance",
    riskLevel: 0,
    description: "Get planned and past preventive maintenance tasks",
    execute: async (factoryId: string) => {
      return await getFactoryMaintenanceTasks(factoryId);
    },
  },
  create_maintenance_task: {
    name: "create_maintenance_task",
    category: "Maintenance",
    riskLevel: 2,
    description: "Schedule a machine maintenance or inspection task",
    execute: async (factoryId: string, params: { machineId: string; type?: "PREVENTIVE" | "BREAKDOWN" | "SCHEDULED"; notes?: string; scheduledDate?: string }) => {
      const machine = await db.machine.findFirst({
        where: { factoryId, OR: [{ id: params.machineId }, { name: { contains: params.machineId } }] },
      });
      if (!machine) throw new Error("Machine not found");

      return await scheduleMaintenance({
        factoryId,
        machineId: machine.id,
        type: params.type || "PREVENTIVE",
        scheduledDate: new Date(params.scheduledDate || Date.now() + 24 * 60 * 60 * 1000),
        notes: params.notes || "Created by AI Operations Agent",
      });
    },
  },
  update_maintenance_task: {
    name: "update_maintenance_task",
    category: "Maintenance",
    riskLevel: 1,
    description: "Mark maintenance task as completed and reset machine status to IDLE",
    execute: async (factoryId: string, params: { maintenanceId?: string; machineId?: string; machineCode?: string; cost?: number; notes?: string }) => {
      const term = params.maintenanceId || params.machineId || params.machineCode || "M-02";
      return await completeMaintenanceForMachine(factoryId, term);
    },
  },

  // --- 8. EMPLOYEE TOOLS ---
  get_available_workers: {
    name: "get_available_workers",
    category: "Employees",
    riskLevel: 0,
    description: "List active workers and shift availability",
    execute: async (factoryId: string) => {
      return await getEmployeesByFactory(factoryId);
    },
  },
  get_worker_skills: {
    name: "get_worker_skills",
    category: "Employees",
    riskLevel: 0,
    description: "Get worker roles, hourly rates, and machine compatibility",
    execute: async (factoryId: string) => {
      const workers = await getEmployeesByFactory(factoryId);
      return workers.map((w) => ({
        id: w.id,
        name: w.name,
        code: w.employeeCode,
        roleTitle: w.roleTitle,
        status: w.status,
        shiftHoursPerDay: w.shiftHoursPerDay,
      }));
    },
  },
  assign_worker: {
    name: "assign_worker",
    category: "Employees",
    riskLevel: 2,
    description: "Assign worker to production job or stage",
    execute: async (factoryId: string, params: { workerId: string; jobId: string }) => {
      return await db.productionJob.updateMany({
        where: { id: params.jobId, factoryId },
        data: { assignedEmployeeId: params.workerId },
      });
    },
  },

  // --- 9. SUPPLIER TOOLS ---
  compare_suppliers: {
    name: "compare_suppliers",
    category: "Suppliers",
    riskLevel: 0,
    description: "Compare suppliers by lead times and reliability score",
    execute: async (factoryId: string) => {
      const suppliers = await getSuppliersByFactory(factoryId);
      return suppliers.map((s) => ({
        supplierId: s.id,
        name: s.name,
        leadTimeDays: s.averageLeadTimeDays,
        reliabilityScore: s.reliabilityScore,
        contactPerson: s.contactPerson,
        phone: s.phone,
      }));
    },
  },
  get_supplier_performance: {
    name: "get_supplier_performance",
    category: "Suppliers",
    riskLevel: 0,
    description: "Get supplier historical performance metrics",
    execute: async (factoryId: string) => {
      return await getSuppliersByFactory(factoryId);
    },
  },

  // --- 10. ANALYTICS TOOLS ---
  calculate_profitability: {
    name: "calculate_profitability",
    category: "Analytics",
    riskLevel: 0,
    description: "Calculate job cost breakdown and margin analysis",
    execute: async (factoryId: string, params: { orderId: string }) => {
      const order = await db.order.findFirst({
        where: { factoryId, OR: [{ id: params.orderId }, { orderNumber: { contains: params.orderId } }] },
      });
      if (!order) throw new Error("Order not found");
      return await getFactoryJobProfitability(factoryId);
    },
  },
  calculate_utilization: {
    name: "calculate_utilization",
    category: "Analytics",
    riskLevel: 0,
    description: "Calculate overall factory machine utilization percentage",
    execute: async (factoryId: string) => {
      const analytics = await getMachineAnalytics(factoryId);
      const runningCount = analytics.filter((m) => m.status === "RUNNING").length;
      return {
        totalMachines: analytics.length,
        runningMachines: runningCount,
        factoryUtilizationScore: analytics.length > 0 ? Math.round((runningCount / analytics.length) * 100) : 0,
      };
    },
  },
  analyze_downtime: {
    name: "analyze_downtime",
    category: "Analytics",
    riskLevel: 0,
    description: "Analyze machine breakdown categories and downtime loss",
    execute: async (factoryId: string) => {
      const analytics = await getMachineAnalytics(factoryId);
      return analytics.map((m) => ({
        machineId: m.machineId,
        machineName: m.machineName,
        status: m.status,
        downtimeByCategory: m.downtimeByCategory,
        downtimeMinutesTotal: m.downtimeMinutesTotal,
      }));
    },
  },
  analyze_waste: {
    name: "analyze_waste",
    category: "Analytics",
    riskLevel: 0,
    description: "Analyze material waste and scrap loss percentage",
    execute: async (factoryId: string) => {
      return await getWasteAndLossAnalytics(factoryId);
    },
  },
  detect_operational_risk: {
    name: "detect_operational_risk",
    category: "Analytics",
    riskLevel: 0,
    description: "Scan factory for delayed orders, material shortages, and machine breakdowns",
    execute: async (factoryId: string) => {
      const inv = await getInventoryIntelligence(factoryId);
      const machines = await getMachineAnalytics(factoryId);
      const orders = await getOrdersByFactory(factoryId);

      const criticalMaterials = inv.filter((i) => i.needsPurchaseReorder);
      const downMachines = machines.filter((m) => m.status === "DOWN_BREAKDOWN");
      const atRiskOrders = orders.filter(
        (o) => o.feasibilityStatus === "NOT_RECOMMENDED" || o.feasibilityStatus === "POSSIBLE_WITH_RISK"
      );

      return {
        totalOperationalRisks: criticalMaterials.length + downMachines.length + atRiskOrders.length,
        criticalMaterialsCount: criticalMaterials.length,
        criticalMaterials: criticalMaterials.map((i) => `${i.materialName} (Shortage: ${i.minimumStockThreshold - i.usableStock} ${i.unitOfMeasure})`),
        downMachinesCount: downMachines.length,
        downMachines: downMachines.map((m) => m.machineName),
        atRiskOrdersCount: atRiskOrders.length,
        atRiskOrders: atRiskOrders.map((o) => `Order #${o.orderNumber} (${o.customer.companyName})`),
      };
    },
  },

  // --- 11. KNOWLEDGE TOOLS ---
  search_factory_memory: {
    name: "search_factory_memory",
    category: "Knowledge",
    riskLevel: 0,
    description: "Search factory SOPs, machine troubleshooting tips, and process guides",
    execute: async (factoryId: string, params: { query: string }) => {
      return await searchFactoryKnowledge(factoryId, params.query);
    },
  },
  retrieve_process_instruction: {
    name: "retrieve_process_instruction",
    category: "Knowledge",
    riskLevel: 0,
    description: "Retrieve standard operating procedure for process or material handling",
    execute: async (factoryId: string, params: { category?: string; query?: string }) => {
      return await searchFactoryKnowledge(factoryId, params.query || params.category || "PROCESS");
    },
  },
  retrieve_machine_knowledge: {
    name: "retrieve_machine_knowledge",
    category: "Knowledge",
    riskLevel: 0,
    description: "Retrieve recorded machine tips and troubleshooting steps",
    execute: async (factoryId: string, params: { machineNameOrCode: string }) => {
      return await searchFactoryKnowledge(factoryId, params.machineNameOrCode);
    },
  },

  // --- 12. REPORTING TOOLS ---
  generate_daily_report: {
    name: "generate_daily_report",
    category: "Reporting",
    riskLevel: 1,
    description: "Generate comprehensive daily factory operations briefing",
    execute: async (factoryId: string) => {
      return await generateMorningBriefing(factoryId);
    },
  },
  generate_production_report: {
    name: "generate_production_report",
    category: "Reporting",
    riskLevel: 1,
    description: "Generate summary report of active and completed production jobs",
    execute: async (factoryId: string) => {
      const jobs = await db.productionJob.findMany({
        where: { factoryId },
        include: { order: true, machine: true },
      });
      return {
        totalJobs: jobs.length,
        queued: jobs.filter((j) => j.status === "QUEUED").length,
        inProgress: jobs.filter((j) => j.status === "IN_PROGRESS").length,
        completed: jobs.filter((j) => j.status === "COMPLETED").length,
        summary: jobs.slice(0, 10).map((j) => `Job for Order #${j.order.orderNumber} on ${j.machine?.name || "Unassigned"} (${j.status})`),
      };
    },
  },
  generate_inventory_report: {
    name: "generate_inventory_report",
    category: "Reporting",
    riskLevel: 1,
    description: "Generate stock availability and purchase requirement report",
    execute: async (factoryId: string) => {
      const inv = await getInventoryIntelligence(factoryId);
      return {
        totalMaterialsCount: inv.length,
        lowStockItems: inv.filter((i) => i.needsPurchaseReorder).map((i) => `${i.materialName}: Usable ${i.usableStock} ${i.unitOfMeasure}`),
        healthyItems: inv.filter((i) => !i.needsPurchaseReorder).length,
      };
    },
  },
};
