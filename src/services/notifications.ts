import { db } from "@/lib/db";
import { calculateUsableStock, calculateProjectedShortageDate } from "@/deterministic-engine/inventory";

export type AttentionCard = {
  id: string;
  problem: string;
  impact: string;
  severity: "CRITICAL" | "IMPORTANT" | "INFORMATIONAL";
  recommendedAction: string;
  relatedRecordType: "INVENTORY" | "ORDER" | "MACHINE" | "MAINTENANCE";
  relatedRecordId?: string;
  actionUrl: string;
};

export async function aggregateNotifications(factoryId: string) {
  // Query unread notifications for factory
  const notifications = await db.notification.findMany({
    where: { factoryId, isRead: false },
    orderBy: { createdAt: "desc" },
  });

  // Group by groupKey
  const grouped = new Map<string, typeof notifications>();
  for (const n of notifications) {
    const key = n.groupKey || "GENERAL";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(n);
  }

  const aggregatedSummaries: {
    groupKey: string;
    count: number;
    highestSeverity: string;
    title: string;
    summaryMessage: string;
  }[] = [];

  grouped.forEach((items, groupKey) => {
    const hasCritical = items.some((i) => i.severity === "CRITICAL");
    const hasImportant = items.some((i) => i.severity === "IMPORTANT");
    const highestSeverity = hasCritical
      ? "CRITICAL"
      : hasImportant
      ? "IMPORTANT"
      : "INFORMATIONAL";

    aggregatedSummaries.push({
      groupKey,
      count: items.length,
      highestSeverity,
      title: `${items.length} Related Issue${items.length > 1 ? "s" : ""} in ${groupKey.replace("_", " ")}`,
      summaryMessage: items.map((i) => i.message).slice(0, 3).join("; "),
    });
  });

  return aggregatedSummaries;
}

export async function getTop3AttentionItems(factoryId: string): Promise<AttentionCard[]> {
  const cards: AttentionCard[] = [];

  // 1. Check Inventory Risks & Shortages
  const materials = await db.material.findMany({
    where: { factoryId, isDeleted: false },
    include: { inventory: true },
  });

  for (const mat of materials) {
    if (!mat.inventory) continue;

    const usable = calculateUsableStock({
      currentStock: mat.inventory.currentStock,
      reservedStock: mat.inventory.reservedStock,
      damagedStock: mat.inventory.damagedStock,
    });

    if (usable <= mat.minimumStockThreshold) {
      cards.push({
        id: `card_mat_${mat.id}`,
        problem: `Material stock critical for "${mat.name}".`,
        impact: `Usable stock is ${usable} ${mat.unitOfMeasure} (Minimum threshold: ${mat.minimumStockThreshold}). Risk of immediate production stoppage.`,
        severity: "CRITICAL",
        recommendedAction: `Issue PO to supplier for reorder quantity of ${mat.reorderQuantity} ${mat.unitOfMeasure}.`,
        relatedRecordType: "INVENTORY",
        relatedRecordId: mat.id,
        actionUrl: `/inventory?materialId=${mat.id}`,
      });
    }
  }

  // 2. Check Machine Downtime & Capacity Bottlenecks
  const downMachines = await db.machine.findMany({
    where: {
      factoryId,
      isDeleted: false,
      status: { in: ["DOWN_BREAKDOWN", "DOWN_MAINTENANCE"] },
    },
  });

  for (const m of downMachines) {
    cards.push({
      id: `card_mach_${m.id}`,
      problem: `Machine "${m.name}" (${m.code}) is DOWN due to ${m.status.replace("DOWN_", "")}.`,
      impact: `Zero capacity available. Hourly loss rate estimated at ₹${m.hourlyRate}/hr.`,
      severity: "CRITICAL",
      recommendedAction: "Dispatch maintenance engineer or re-assign queued jobs to secondary press.",
      relatedRecordType: "MACHINE",
      relatedRecordId: m.id,
      actionUrl: `/machines?machineId=${m.id}`,
    });
  }

  // 2b. Check Machine Upcoming Maintenance Dates (Nearer Maintenance Alerts)
  const now = new Date();
  const threeDaysAhead = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const machinesWithUpcomingMaint = await db.machine.findMany({
    where: {
      factoryId,
      isDeleted: false,
      nextMaintenanceDate: { lte: threeDaysAhead },
      status: { notIn: ["DOWN_BREAKDOWN", "DOWN_MAINTENANCE"] },
    },
  });

  for (const m of machinesWithUpcomingMaint) {
    if (!m.nextMaintenanceDate) continue;
    const maintDate = new Date(m.nextMaintenanceDate);
    const diffMs = maintDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const dayText = diffDays <= 0 ? "Today / Overdue" : `In ${diffDays} day${diffDays > 1 ? "s" : ""}`;

    cards.push({
      id: `card_maint_near_${m.id}`,
      problem: `Upcoming Maintenance Alert: Machine "${m.name}" (${m.code}) servicing due soon (${dayText}).`,
      impact: `Maintenance is scheduled for ${maintDate.toLocaleDateString()}. Work hours defined as ${m.workStartTime || "08:00"} to ${m.workEndTime || "17:00"}.`,
      severity: diffDays <= 1 ? "CRITICAL" : "IMPORTANT",
      recommendedAction: "Prepare replacement parts and schedule technician visit before breakdown occurs.",
      relatedRecordType: "MAINTENANCE",
      relatedRecordId: m.id,
      actionUrl: `/maintenance?machineId=${m.id}`,
    });
  }

  // Also check scheduled Maintenance model records
  const upcomingMaintenances = await db.maintenance.findMany({
    where: {
      factoryId,
      completedDate: null,
      scheduledDate: { lte: threeDaysAhead },
    },
    include: { machine: true },
  });

  for (const maint of upcomingMaintenances) {
    const isAlreadyAdded = cards.some((c) => c.relatedRecordId === maint.machineId && c.relatedRecordType === "MAINTENANCE");
    if (!isAlreadyAdded && maint.machine) {
      const scheduledDate = new Date(maint.scheduledDate);
      const diffMs = scheduledDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const dayText = diffDays <= 0 ? "Today" : `In ${diffDays} day${diffDays > 1 ? "s" : ""}`;

      cards.push({
        id: `card_maint_task_${maint.id}`,
        problem: `Scheduled Servicing Approaching: ${maint.machine.name} (${maint.type})`,
        impact: `Servicing target date: ${scheduledDate.toLocaleDateString()} (${dayText}). Scope: ${maint.notes || "Preventative maintenance check"}.`,
        severity: diffDays <= 1 ? "CRITICAL" : "IMPORTANT",
        recommendedAction: "Review work order and assign maintenance technician.",
        relatedRecordType: "MAINTENANCE",
        relatedRecordId: maint.id,
        actionUrl: `/maintenance?id=${maint.id}`,
      });
    }
  }

  // 3. Check Delayed Orders / Impending Deadlines
  const urgentOrders = await db.order.findMany({
    where: {
      factoryId,
      isDeleted: false,
      status: { in: ["RECEIVED", "DESIGN_APPROVED", "IN_PRODUCTION"] },
      targetDeadline: { lte: threeDaysAhead },
    },
    include: { customer: true },
    take: 3,
  });

  for (const ord of urgentOrders) {
    cards.push({
      id: `card_ord_${ord.id}`,
      problem: `Order ${ord.orderNumber} for "${ord.customer.companyName}" deadline approaching.`,
      impact: `Deadline target: ${new Date(ord.targetDeadline).toLocaleDateString()}. Order status is currently ${ord.status}.`,
      severity: "IMPORTANT",
      recommendedAction: "Prioritize job on production schedule board and confirm material readiness.",
      relatedRecordType: "ORDER",
      relatedRecordId: ord.id,
      actionUrl: `/orders?orderId=${ord.id}`,
    });
  }

  // Fallback default cards if operational data has no active alerts
  if (cards.length === 0) {
    cards.push({
      id: "card_default_1",
      problem: "All machines and inventory levels operating normally.",
      impact: "No immediate bottleneck or stockout risk detected.",
      severity: "INFORMATIONAL",
      recommendedAction: "Review weekly production schedule or intake new orders.",
      relatedRecordType: "ORDER",
      actionUrl: "/orders/new",
    });
  }

  // Sort by severity (CRITICAL > IMPORTANT > INFORMATIONAL) and return top 3
  const severityScore = { CRITICAL: 3, IMPORTANT: 2, INFORMATIONAL: 1 };
  cards.sort((a, b) => severityScore[b.severity] - severityScore[a.severity]);

  return cards.slice(0, 3);
}

export async function createNotification(input: {
  factoryId: string;
  severity: "CRITICAL" | "IMPORTANT" | "INFORMATIONAL";
  title: string;
  message: string;
  groupKey?: string;
  relatedRecordType?: string;
  relatedRecordId?: string;
}) {
  return await db.notification.create({
    data: {
      factoryId: input.factoryId,
      severity: input.severity,
      title: input.title,
      message: input.message,
      groupKey: input.groupKey || "GENERAL",
      relatedRecordType: input.relatedRecordType,
      relatedRecordId: input.relatedRecordId,
      isRead: false,
    },
  });
}
