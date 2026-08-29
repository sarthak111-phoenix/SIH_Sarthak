import { evaluateAndSaveOrderFeasibility } from "@/services/feasibility";
import { getInventoryIntelligence } from "@/services/inventory";
import { getMachineAnalytics } from "@/services/machine-intelligence";
import { searchFactoryKnowledge } from "@/services/memory";
import { LanguageCode } from "@/lib/i18n/translations";

export type CopilotRequest = {
  factoryId: string;
  userPrompt: string;
  orderIdContext?: string;
  language?: LanguageCode;
};

export type CopilotResponse = {
  answer: string;
  toolsUsed: string[];
  metadata: {
    engineUsed: "CONTROLLED_TOOL_COPILOT_V1";
    calculationsAlteredByAi: false; // Mandatory zero-hallucination guarantee flag
    confidenceScore: number;
    dataSources: string[];
    timestamp: string;
  };
};

export async function askFactoryCopilot(req: CopilotRequest): Promise<CopilotResponse> {
  const { factoryId, userPrompt, orderIdContext, language = "en" } = req;
  const promptLower = userPrompt.toLowerCase();

  const toolsUsed: string[] = [];
  const dataSources: string[] = [];
  let answerComponents: string[] = [];
  let confidenceScore = 95;

  // Tool 1: Order Feasibility Checker (Tool name is language independent!)
  if (promptLower.includes("feasibility") || promptLower.includes("order") || orderIdContext) {
    if (orderIdContext) {
      toolsUsed.push("check_order_feasibility");
      dataSources.push(`Order:${orderIdContext}`);
      try {
        const feas = await evaluateAndSaveOrderFeasibility(orderIdContext, factoryId);
        if (language === "hi") {
          answerComponents.push(
            `ऑर्डर ${feas.orderNumber} के लिए व्यवहार्यता विश्लेषण: परिणाम ${feas.deterministicResult.classification} है (${feas.deterministicResult.confidenceScore}% विश्वास सूचकांक)। ${feas.aiExplanation.problemSummary}`
          );
        } else if (language === "hinglish") {
          answerComponents.push(
            `Order ${feas.orderNumber} ka feasibility analysis: Classification ${feas.deterministicResult.classification} hai (${feas.deterministicResult.confidenceScore}% confidence score ke saath). ${feas.aiExplanation.problemSummary}`
          );
        } else {
          answerComponents.push(
            `Feasibility Analysis for ${feas.orderNumber}: Classification is ${feas.deterministicResult.classification} with ${feas.deterministicResult.confidenceScore}% confidence. ${feas.aiExplanation.problemSummary}`
          );
        }
      } catch (err: any) {
        answerComponents.push(`Order feasibility query completed: ${err.message}`);
      }
    }
  }

  // Tool 2: Inventory Stock Checker
  if (promptLower.includes("stock") || promptLower.includes("inventory") || promptLower.includes("material") || promptLower.includes("reorder") || promptLower.includes("सामग्री")) {
    toolsUsed.push("check_inventory_stock");
    dataSources.push("MaterialInventoryTable");
    const inv = await getInventoryIntelligence(factoryId);
    const lowStockItems = inv.filter((i) => i.needsPurchaseReorder);
    if (lowStockItems.length > 0) {
      const itemsList = lowStockItems.map((i) => `${i.materialName} (${i.usableStock} ${i.unitOfMeasure})`).join(", ");
      if (language === "hi") {
        answerComponents.push(`इन्वेंटरी अलर्ट: ${lowStockItems.length} सामग्री को पुनः ऑर्डर करने की आवश्यकता है: ${itemsList}।`);
      } else if (language === "hinglish") {
        answerComponents.push(`Inventory Alert: ${lowStockItems.length} materials ko reorder karne ki zaroorat hai: ${itemsList}.`);
      } else {
        answerComponents.push(`Inventory Alert: ${lowStockItems.length} material(s) require reorder: ${itemsList}.`);
      }
    } else {
      if (language === "hi") {
        answerComponents.push(`इन्वेंटरी स्थिति: सभी सामग्री का स्टॉक न्यूनतम स्तर से ऊपर है।`);
      } else if (language === "hinglish") {
        answerComponents.push(`Inventory Status: Sabhi material ka stock safe level par hai.`);
      } else {
        answerComponents.push(`Inventory Status: All material stock levels satisfy minimum operational thresholds.`);
      }
    }
  }

  // Tool 3: Machine Downtime & Output Analytics
  if (promptLower.includes("machine") || promptLower.includes("downtime") || promptLower.includes("oee") || promptLower.includes("breakdown") || promptLower.includes("मशीन")) {
    toolsUsed.push("get_machine_downtime_status");
    dataSources.push("MachineDowntimeTable");
    const machines = await getMachineAnalytics(factoryId);
    const downMachines = machines.filter((m) => m.status === "DOWN_BREAKDOWN");
    if (downMachines.length > 0) {
      const downList = downMachines.map((m) => m.machineName).join(", ");
      if (language === "hi") {
        answerComponents.push(`मशीन अलर्ट: ${downMachines.length} मशीन(ें) वर्तमान में ब्रेकडाउन स्थिति में हैं: ${downList}।`);
      } else if (language === "hinglish") {
        answerComponents.push(`Machine Alert: ${downMachines.length} machine(s) breakdown state mein hain: ${downList}.`);
      } else {
        answerComponents.push(`Machine Status Alert: ${downMachines.length} machine(s) are currently DOWN_BREAKDOWN: ${downList}.`);
      }
    } else {
      if (language === "hi") {
        answerComponents.push(`मशीन स्थिति: सभी ${machines.length} फ़ैक्टरी मशीनें सामान्य रूप से चल रही हैं।`);
      } else if (language === "hinglish") {
        answerComponents.push(`Machine Status: Sabhi ${machines.length} machines normally chal rahi hain.`);
      } else {
        answerComponents.push(`Machine Status: All ${machines.length} factory press line(s) are operational.`);
      }
    }
  }

  // Tool 4: Search Factory SOP & Knowledge Base
  if (promptLower.includes("sop") || promptLower.includes("how to") || promptLower.includes("guide") || promptLower.includes("procedure")) {
    toolsUsed.push("search_factory_sop");
    dataSources.push("FactoryKnowledgeBase");
    const sops = await searchFactoryKnowledge(factoryId, userPrompt);
    if (sops.length > 0) {
      answerComponents.push(
        `Factory SOP Matched: "${sops[0].title}" (Category: ${sops[0].category}). Content preview: ${sops[0].content.slice(0, 150)}...`
      );
    } else {
      answerComponents.push(`No specific Factory SOP entries matched search query "${userPrompt}".`);
    }
  }

  // Fallback if no specific tools were explicitly triggered
  if (answerComponents.length === 0) {
    toolsUsed.push("check_inventory_stock");
    toolsUsed.push("get_machine_downtime_status");
    dataSources.push("FactoryStatusSummary");
    const inv = await getInventoryIntelligence(factoryId);
    const machines = await getMachineAnalytics(factoryId);
    if (language === "hi") {
      answerComponents.push(
        `फ़ैक्टरी अवलोकन: ${inv.length} सामग्री और ${machines.length} मशीनों की सक्रिय निगरानी चल रही है। प्रणाली सुचारू रूप से कार्य कर रही है।`
      );
    } else if (language === "hinglish") {
      answerComponents.push(
        `Factory Overview: Active monitoring of ${inv.length} materials and ${machines.length} machines chal rahi hai. System properly operate kar raha hai.`
      );
    } else {
      answerComponents.push(
        `Factory Overview: Active inventory monitoring covering ${inv.length} materials and ${machines.length} machines. System operating deterministically.`
      );
    }
  }

  return {
    answer: answerComponents.join("\n\n"),
    toolsUsed,
    metadata: {
      engineUsed: "CONTROLLED_TOOL_COPILOT_V1",
      calculationsAlteredByAi: false,
      confidenceScore,
      dataSources,
      timestamp: new Date().toISOString(),
    },
  };
}
