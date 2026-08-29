export type ParsedIntent = {
  intent:
    | "DAILY_MANAGEMENT"
    | "URGENT_ORDER_FEASIBILITY"
    | "MATERIAL_SHORTAGE_CHECK"
    | "MACHINE_SLOWDOWN_ANALYSIS"
    | "REASSIGN_MACHINE"
    | "PURCHASE_RECOMMENDATION"
    | "COMPLETE_MAINTENANCE"
    | "SEARCH_KNOWLEDGE"
    | "GENERATE_REPORT"
    | "GENERAL_QUERY";
  confidence: number;
  entities: {
    orderId?: string;
    orderNumber?: string;
    machineId?: string;
    machineCode?: string;
    materialName?: string;
    quantity?: number;
    targetDeadline?: string;
    query?: string;
  };
  planSteps: string[];
};

export function parseUserIntent(
  userPrompt: string,
  taskMemory?: { lastOrderId?: string; lastMachineId?: string; lastMaterialName?: string }
): ParsedIntent {
  const p = userPrompt.toLowerCase().trim();

  // Extract order numbers (e.g. #482, ORD-0001, Order 482, 124)
  let orderNumber: string | undefined = undefined;
  const orderMatch = p.match(/(?:order|ord|#)\s*([a-z0-9-]+)/i) || p.match(/(\d{3,4})/);
  if (orderMatch && orderMatch[1]) {
    orderNumber = orderMatch[1];
  } else if (taskMemory?.lastOrderId) {
    orderNumber = taskMemory.lastOrderId;
  }

  // Extract machine codes (e.g. Machine 4, Machine 2, M-02, M-04, MTC, press 1)
  let machineCode: string | undefined = undefined;
  const machineMatch = p.match(/(?:machine|mac|m-)\s*([a-z0-9-]+)/i) || p.match(/(m-\d{2}|machine\s*\d+|mtc)/i);
  if (machineMatch && machineMatch[1]) {
    machineCode = machineMatch[1];
  } else if (p.includes("mtc")) {
    machineCode = "M-02";
  } else if (taskMemory?.lastMachineId) {
    machineCode = taskMemory.lastMachineId;
  }

  // Extract quantities (e.g. 20,000, 20000, 600, 1400)
  let quantity: number | undefined = undefined;
  const qtyMatch = p.match(/(\d{1,3}(?:,\d{3})+|\d+)\s*(?:units|brochures|sheets|kg|books|pcs)?/i);
  if (qtyMatch && qtyMatch[1]) {
    const num = parseInt(qtyMatch[1].replace(/,/g, ""), 10);
    if (!isNaN(num) && num > 10) {
      quantity = num;
    }
  }

  // Extract materials (e.g. 300 GSM, paper, matte, glue, steel)
  let materialName: string | undefined = undefined;
  if (p.includes("paper") || p.includes("300 gsm") || p.includes("matte") || p.includes("glue") || p.includes("material") || p.includes("samagri")) {
    if (p.includes("300 gsm") || p.includes("matte")) materialName = "300 GSM Matte Paper";
    else if (p.includes("glue")) materialName = "Binding Glue";
    else materialName = "Paper";
  }

  // 0. COMPLETE / CLEAR / REMOVE MAINTENANCE INTENT
  if (
    (p.includes("maintenence") || p.includes("maintenance") || p.includes("servicing") || p.includes("repair")) &&
    (
      p.includes("complete") ||
      p.includes("clear") ||
      p.includes("done") ||
      p.includes("resolved") ||
      p.includes("khatam") ||
      p.includes("thik") ||
      p.includes("finish") ||
      p.includes("remove") ||
      p.includes("hatao") ||
      p.includes("take out") ||
      p.includes("confirm")
    )
  ) {
    return {
      intent: "COMPLETE_MAINTENANCE",
      confidence: 0.98,
      entities: {
        machineCode: machineCode || "M-02",
        query: userPrompt,
      },
      planSteps: [
        "identify_target_machine_maintenance_record",
        "update_maintenance_task_completed",
        "reset_machine_status_to_idle",
        "verify_database_record",
      ],
    };
  }

  // 1. REASSIGN MACHINE INTENT
  if (
    p.includes("shift") ||
    p.includes("move") ||
    p.includes("assign") ||
    p.includes("transfer") ||
    p.includes("bhej do") ||
    p.includes("de do") ||
    (p.includes("machine") && (p.includes("shift") || p.includes("move")))
  ) {
    return {
      intent: "REASSIGN_MACHINE",
      confidence: 0.95,
      entities: {
        orderNumber: orderNumber || "482",
        machineCode: machineCode || "Machine 4",
      },
      planSteps: [
        "check_order_details",
        "check_target_machine_status",
        "calculate_capacity_impact",
        "request_owner_approval",
        "execute_machine_reassignment",
        "verify_schedule",
      ],
    };
  }

  // 2. URGENT ORDER FEASIBILITY INTENT
  if (
    p.includes("urgent") ||
    p.includes("accept karna") ||
    p.includes("feasible") ||
    p.includes("brochure") ||
    p.includes("order aaya") ||
    p.includes("can we accept")
  ) {
    return {
      intent: "URGENT_ORDER_FEASIBILITY",
      confidence: 0.92,
      entities: {
        orderNumber,
        quantity: quantity || 20000,
        materialName: materialName || "300 GSM Matte Paper",
      },
      planSteps: [
        "inspect_product_requirements",
        "calculate_usable_inventory",
        "check_machine_capabilities",
        "calculate_production_hours",
        "evaluate_deadline_margin",
        "calculate_profitability",
        "generate_options",
      ],
    };
  }

  // 3. MATERIAL SHORTAGE INTENT
  if (
    p.includes("material") ||
    p.includes("shortage") ||
    p.includes("stock") ||
    p.includes("khatam") ||
    p.includes("samagri") ||
    p.includes("kal ke orders")
  ) {
    return {
      intent: "MATERIAL_SHORTAGE_CHECK",
      confidence: 0.94,
      entities: { materialName },
      planSteps: [
        "get_tomorrow_orders",
        "calculate_required_materials",
        "calculate_usable_inventory",
        "identify_shortages",
        "compare_supplier_lead_times",
        "prepare_purchase_recommendation",
      ],
    };
  }

  // 4. MACHINE SLOWDOWN INTENT
  if (
    p.includes("slow") ||
    p.includes("breakdown") ||
    p.includes("downtime") ||
    p.includes("machine 2") ||
    p.includes("m-02") ||
    p.includes("problem")
  ) {
    return {
      intent: "MACHINE_SLOWDOWN_ANALYSIS",
      confidence: 0.93,
      entities: { machineCode: machineCode || "Machine 2" },
      planSteps: [
        "get_machine_telemetry",
        "compare_expected_vs_actual_rate",
        "retrieve_downtime_history",
        "search_factory_sop",
        "recommend_inspection_or_reassignment",
      ],
    };
  }

  // 5. DAILY MANAGEMENT INTENT
  if (
    p.includes("aaj") ||
    p.includes("daily") ||
    p.includes("briefing") ||
    p.includes("manage kar do") ||
    p.includes("important hai") ||
    p.includes("overview") ||
    p.includes("status")
  ) {
    return {
      intent: "DAILY_MANAGEMENT",
      confidence: 0.96,
      entities: {},
      planSteps: [
        "inspect_critical_orders",
        "check_machine_statuses",
        "calculate_material_shortages",
        "detect_operational_risks",
        "generate_daily_briefing",
        "prepare_actionable_recommendations",
      ],
    };
  }

  // 6. PURCHASE RECOMMENDATION INTENT
  if (p.includes("purchase") || p.includes("buy") || p.includes("khareedo") || p.includes("po")) {
    return {
      intent: "PURCHASE_RECOMMENDATION",
      confidence: 0.9,
      entities: { materialName, quantity },
      planSteps: ["check_inventory_shortage", "compare_suppliers", "generate_purchase_recommendation"],
    };
  }

  // 7. KNOWLEDGE / SOP INTENT
  if (p.includes("sop") || p.includes("how to") || p.includes("guide") || p.includes("troubleshoot")) {
    return {
      intent: "SEARCH_KNOWLEDGE",
      confidence: 0.9,
      entities: { query: userPrompt },
      planSteps: ["search_factory_memory"],
    };
  }

  // 8. REPORT INTENT
  if (p.includes("report") || p.includes("pdf") || p.includes("summary")) {
    return {
      intent: "GENERATE_REPORT",
      confidence: 0.9,
      entities: {},
      planSteps: ["generate_daily_report"],
    };
  }

  // Default GENERAL QUERY
  return {
    intent: "GENERAL_QUERY",
    confidence: 0.75,
    entities: { query: userPrompt },
    planSteps: ["check_factory_overview"],
  };
}
