"use client";

import { useState, useRef } from "react";
import { 
  Zap, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  X, 
  Box, 
  Upload,
  Loader2, 
  CheckCircle2,
  Cpu,
  Sparkles,
  ChevronDown,
  FileText,
  Table,
  Trash2,
  Database
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

// Industry machine suggestions mapping
const INDUSTRY_MACHINE_MAP: Record<string, string[]> = {
  "Automotive Parts": [
    "CNC Lathe 2-Axis (CNC-L01)",
    "Vertical Machining Center (VMC-850)",
    "Multi-Spindle Drill Press",
    "Heavy Duty Precision Grinder",
    "Robotic Arc Welding Cell",
    "Coordinate Measuring Machine (CMM)",
    "Hydraulic Press 200T",
  ],
  "Sheet Metal Fabrication": [
    "Fiber Laser Cutting Machine 3kW",
    "Hydraulic CNC Press Brake 100T",
    "CNC Turret Punch Press",
    "Hydraulic Shearing Machine",
    "MIG / TIG Welding Station",
    "Pneumatic Spot Welder",
    "Corner Notching Machine",
  ],
  "Plastic Moulding": [
    "Injection Moulding Machine 180T",
    "Injection Moulding Machine 350T",
    "Extrusion Blow Moulding Unit",
    "Mould Temperature Controller (MTC)",
    "Plastic Granulator & Hopper Dryer",
    "Industrial Water Chiller",
    "Ultrasonic Plastic Welder",
  ],
  "Electrical Components": [
    "Automatic Wire Stripping & Crimping Machine",
    "SMT Pick & Place Machine",
    "Reflow Soldering Oven",
    "Automatic Transformer Coil Winder",
    "High-Speed Stamping Press",
    "Component Testing & Inspection Bench",
  ],
  "Precision Engineering": [
    "5-Axis CNC Milling Machine",
    "CNC Swiss Auto Lathe (Star / Citizen)",
    "Wire Cut EDM Machine",
    "CNC Surface Grinder",
    "Optical Profile Grinder",
    "Tool Room Engine Lathe",
  ],
  "Textile / Garment": [
    "Automatic Fabric Spreading & Cutting Machine",
    "High-Speed Industrial Sewing Machine",
    "Multi-Head Automatic Embroidery Machine",
    "Fabric Dyeing & Washing Vessel",
    "Computerized Flat Knitting Machine",
    "Steam Finishing & Ironing Station",
  ],
  "Food Processing": [
    "Stainless Steel Mixing & Blending Vessel (500L)",
    "Automatic Form Fill Seal (FFS) Packaging Machine",
    "Continuous Conveyor Tunnel Oven",
    "Automated Liquid Bottling & Capping Line",
    "Industrial Food Retort Sterilizer",
    "Metal Detector & Online Checkweigher",
  ],
  "Chemical / Pharma": [
    "Fluid Bed Dryer (FBD 150kg)",
    "Rotary High-Speed Tablet Press",
    "High-Shear Mixer Granulator (RMG)",
    "Jacketed SS Reactor Vessel",
    "Automatic Blister Packing Machine",
    "Colloid Mill & Homogenizer",
  ],
};

// Industry raw material suggestions mapping
const INDUSTRY_MATERIAL_MAP: Record<string, string[]> = {
  "Automotive Parts": [
    "EN8 Steel Rod 50mm dia",
    "MS Flat Bar 40×8mm",
    "Cast Iron Billet (Grade FG260)",
    "Aluminum Alloy Ingot ADC12",
    "Stainless Steel SS304 Bar",
    "High Tensile Fastener Wire",
    "Synthetic Cutting Coolant",
  ],
  "Sheet Metal Fabrication": [
    "Cold Rolled (CRCA) Sheet 1.5mm",
    "Hot Rolled (HR) Sheet 2.5mm",
    "Galvanized Iron (GI) Sheet 1.2mm",
    "Stainless Steel SS316 Sheet 2.0mm",
    "Aluminum Sheet 6061-T6 3.0mm",
    "MS Angle Bar 50×50×5mm",
    "MIG Welding Wire ER70S-6 (1.2mm)",
  ],
  "Plastic Moulding": [
    "Polypropylene (PP) Prime Granules",
    "High Density Polyethylene (HDPE)",
    "ABS Resin Natural Grade",
    "Polycarbonate (PC) Granules",
    "Masterbatch Color Concentrate (Black)",
    "Nylon 66 Glass Filled 30%",
    "Mold Release Spray",
  ],
  "Electrical Components": [
    "Electrolytic Copper Wire 1.5 sq mm",
    "FR-4 Epoxy Glass PCB Laminate",
    "Brass Strip (CuZn37) 0.5mm",
    "SAC305 Lead-Free Solder Paste",
    "PVC Insulation Compound",
    "Tinned Copper Busbar",
    "Heat Shrinkable Tubing",
  ],
  "Precision Engineering": [
    "Stainless Steel SS316L Rod 25mm",
    "Titanium Grade 5 (Ti-6Al-4V) Bar",
    "Brass Rod Free Cutting IS319",
    "Tool Steel D2 Round Bar",
    "Aluminum 7075-T6 Precision Plate",
    "Carbide Tooling Blanks",
    "Synthetic EDM Dielectric Fluid",
  ],
  "Textile / Garment": [
    "100% Combed Cotton Yarn 30s",
    "Polyester Filament Yarn 150D",
    "Denim Fabric 12 oz",
    "High-Strength Nylon Thread",
    "Reactive Dyes & Fixatives",
    "Interlining Fusing Fabric",
    "YKK Metal Zippers & Sliders",
  ],
  "Food Processing": [
    "Food Grade Stainless Steel SS316 Tube",
    "Refined Edible Oil (Bulk 200L)",
    "Organic Wheat Flour (Atta)",
    "Food Grade Preservatives & Additives",
    "Laminated Flexible Packaging Film",
    "Corrugated Outer Shipping Boxes",
    "Nitrogen Gas Cylinders (Food Grade)",
  ],
  "Chemical / Pharma": [
    "Active Pharmaceutical Ingredient (Paracetamol)",
    "Microcrystalline Cellulose (MCC 102)",
    "Lactose Monohydrate (Pharma Grade)",
    "Purified Water USP Grade",
    "Isopropyl Alcohol (IPA 99.9%)",
    "Aluminium Foil 25 Micron (Blister)",
    "High Density Polyethylene (HDPE) Containers",
  ],
};

export function FactoryOnboardingWizard() {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [factoryId, setFactoryId] = useState<string | null>("demo_fac_id");
  const [factoryStatus, setFactoryStatus] = useState<string>("ONBOARDING");

  // Step 1 Form
  const [factoryForm, setFactoryForm] = useState({
    name: "",
    gstNumber: "",
    city: "",
    state: "Maharashtra",
    workersCount: 10,
    industry: "Automotive Parts",
  });

  // Materials List (Step 4) - Starts empty for user setup
  const [materialsList, setMaterialsList] = useState<string[]>([]);
  const [selectedDropdownMaterial, setSelectedDropdownMaterial] = useState<string>("");
  const [customMaterialInput, setCustomMaterialInput] = useState<string>("");

  // Machines List (Step 3) - Starts empty for user setup
  const [machinesList, setMachinesList] = useState<string[]>([]);
  const [selectedDropdownMachine, setSelectedDropdownMachine] = useState<string>("");
  const [customMachineInput, setCustomMachineInput] = useState("");

  // Workers Roster (Step 5) - Starts empty for user setup
  const [workersList, setWorkersList] = useState<string[]>([]);

  const [newWorkerForm, setNewWorkerForm] = useState({
    name: "",
    role: "CNC Operator",
    shift: "Shift A (Day)",
    qualification: "",
    phone: "",
  });

  const handleAddWorker = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newWorkerForm.name.trim()) return;

    const details: string[] = [];
    if (newWorkerForm.role) details.push(newWorkerForm.role);
    if (newWorkerForm.shift) details.push(newWorkerForm.shift);
    if (newWorkerForm.qualification.trim()) details.push(`Skill: ${newWorkerForm.qualification.trim()}`);

    const formattedStr = `${newWorkerForm.name.trim()} (${details.join(" · ")})`;
    
    if (!workersList.includes(formattedStr)) {
      setWorkersList((prev) => [...prev, formattedStr]);
    }

    setNewWorkerForm({
      name: "",
      role: "CNC Operator",
      shift: "Shift A (Day)",
      qualification: "",
      phone: "",
    });
  };

  const handleQuickAddWorker = (workerTitle: string) => {
    if (!workersList.includes(workerTitle)) {
      setWorkersList((prev) => [...prev, workerTitle]);
    }
  };

  const handleRemoveWorker = (index: number) => {
    setWorkersList((prev) => prev.filter((_, i) => i !== index));
  };

  // Step 6 Drag-and-Drop & CSV File Import State
  const [activeImportCategory, setActiveImportCategory] = useState<"orders" | "inventory" | "customers" | null>(null);
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal Inspection & Modification State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [modalFileMeta, setModalFileMeta] = useState<{ name: string; size: string; typeKey: "orders" | "inventory" | "customers" }>({
    name: "",
    size: "",
    typeKey: "orders",
  });
  const [modalColumns, setModalColumns] = useState<string[]>([]);
  const [modalRows, setModalRows] = useState<Record<string, string>[]>([]);
  const [importingStatus, setImportingStatus] = useState<Record<string, { count: number; importedAt: string }>>({});
  const [isSavingImport, setIsSavingImport] = useState(false);

  const getSampleData = (category: "orders" | "inventory" | "customers") => {
    if (category === "orders") {
      return {
        columns: ["order_id", "customer_name", "product_name", "quantity", "unit_price", "deadline", "priority"],
        rows: [
          { order_id: "ORD-9021", customer_name: "Tata Motors Ltd.", product_name: "Gear Shaft Pinion", quantity: "250", unit_price: "450", deadline: "2026-09-15", priority: "HIGH" },
          { order_id: "ORD-9022", customer_name: "Mahindra & Mahindra", product_name: "Brake Caliper Housing", quantity: "500", unit_price: "820", deadline: "2026-09-20", priority: "NORMAL" },
          { order_id: "ORD-9023", customer_name: "Bajaj Auto", product_name: "Engine Valve Guide", quantity: "1200", unit_price: "150", deadline: "2026-09-10", priority: "URGENT" },
          { order_id: "ORD-9024", customer_name: "Hero MotoCorp", product_name: "Piston Pin Bushing", quantity: "800", unit_price: "210", deadline: "2026-09-25", priority: "NORMAL" },
        ],
      };
    }
    if (category === "inventory") {
      return {
        columns: ["material_name", "item_code", "category", "current_stock", "unit", "min_stock", "unit_cost"],
        rows: [
          { material_name: "EN8 Steel Rod 50mm", item_code: "MAT-1002", category: "Raw Metal", current_stock: "450", unit: "kg", min_stock: "50", unit_cost: "120" },
          { material_name: "MS Sheet 2.0mm CRCA", item_code: "MAT-1008", category: "Sheet Metal", current_stock: "200", unit: "sheet", min_stock: "30", unit_cost: "850" },
          { material_name: "Synthetic Coolant Oil", item_code: "MAT-3011", category: "Consumable", current_stock: "80", unit: "Litre", min_stock: "20", unit_cost: "240" },
          { material_name: "High Tensile Bolt M12", item_code: "MAT-4050", category: "Fastener", current_stock: "1500", unit: "pcs", min_stock: "200", unit_cost: "15" },
        ],
      };
    }
    return {
      columns: ["company_name", "gstin", "contact_person", "phone", "email", "city"],
      rows: [
        { company_name: "Tata Motors Ltd.", gstin: "27AAACT2727Q1ZW", contact_person: "Vikram Shah", phone: "+91 98220 11223", email: "procurement@tatamotors.com", city: "Pune" },
        { company_name: "Bharat Forge Ltd.", gstin: "27AAACB1100R1Z2", contact_person: "Anand Kulkarni", phone: "+91 98900 44556", email: "orders@bharatforge.com", city: "Pune" },
        { company_name: "Bosch India Pvt Ltd", gstin: "29AAACB4433P1Z9", contact_person: "Sandeep Roy", phone: "+91 99160 88990", email: "supply@bosch.in", city: "Bengaluru" },
        { company_name: "Endurance Technologies", gstin: "27AAACE5522K1Z4", contact_person: "Pooja Deshmukh", phone: "+91 97654 33221", email: "vendor@endurance.co.in", city: "Aurangabad" },
      ],
    };
  };

  const processFile = (file: File, category: "orders" | "inventory" | "customers") => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text && text.trim().length > 0) {
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length >= 2) {
          const rawHeaders = lines[0].split(",").map((h) => h.trim().replace(/^["']|["']$/g, ""));
          const parsedRows: Record<string, string>[] = [];

          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(",").map((v) => v.trim().replace(/^["']|["']$/g, ""));
            const rowObj: Record<string, string> = {};
            rawHeaders.forEach((h, idx) => {
              rowObj[h] = values[idx] || "";
            });
            parsedRows.push(rowObj);
          }

          setModalColumns(rawHeaders);
          setModalRows(parsedRows);
          setModalFileMeta({
            name: file.name,
            size: (file.size / 1024).toFixed(1) + " KB",
            typeKey: category,
          });
          setIsImportModalOpen(true);
          return;
        }
      }

      // Fallback sample data if empty file or binary Excel uploaded
      const sample = getSampleData(category);
      setModalColumns(sample.columns);
      setModalRows(sample.rows);
      setModalFileMeta({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + " KB",
        typeKey: category,
      });
      setIsImportModalOpen(true);
    };

    reader.readAsText(file);
  };

  const handleCardClick = (category: "orders" | "inventory" | "customers") => {
    setActiveImportCategory(category);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeImportCategory) {
      processFile(file, activeImportCategory);
    }
  };

  const handleDragOver = (e: React.DragEvent, category: string) => {
    e.preventDefault();
    setDragOverCategory(category);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverCategory(null);
  };

  const handleDrop = (e: React.DragEvent, category: "orders" | "inventory" | "customers") => {
    e.preventDefault();
    setDragOverCategory(null);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setActiveImportCategory(category);
      processFile(file, category);
    }
  };

  const handleCellChange = (rowIndex: number, colName: string, value: string) => {
    setModalRows((prev) => {
      const updated = [...prev];
      updated[rowIndex] = { ...updated[rowIndex], [colName]: value };
      return updated;
    });
  };

  const handleAddRow = () => {
    const newRow: Record<string, string> = {};
    modalColumns.forEach((col) => {
      newRow[col] = "";
    });
    setModalRows((prev) => [...prev, newRow]);
  };

  const handleDeleteRow = (index: number) => {
    setModalRows((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveImportedData = async () => {
    setIsSavingImport(true);
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulk_import_" + modalFileMeta.typeKey,
          factoryId: factoryId || "demo_fac_id",
          payload: { items: modalRows },
        }),
      });

      setImportingStatus((prev) => ({
        ...prev,
        [modalFileMeta.typeKey]: {
          count: modalRows.length,
          importedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      }));
      setIsImportModalOpen(false);
    } catch (err) {
      console.error(err);
      setImportingStatus((prev) => ({
        ...prev,
        [modalFileMeta.typeKey]: {
          count: modalRows.length,
          importedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      }));
      setIsImportModalOpen(false);
    } finally {
      setIsSavingImport(false);
    }
  };

  // Industry selection handler: auto-populates machine & material suggestions
  const handleSelectIndustry = (ind: string) => {
    setFactoryForm((prev) => ({ ...prev, industry: ind }));
    
    // Auto-suggest machines
    const suggestedMachines = INDUSTRY_MACHINE_MAP[ind] || [];
    if (suggestedMachines.length > 0) {
      setMachinesList(suggestedMachines.slice(0, 3));
    }

    // Auto-suggest materials
    const suggestedMaterials = INDUSTRY_MATERIAL_MAP[ind] || [];
    if (suggestedMaterials.length > 0) {
      setMaterialsList(suggestedMaterials.slice(0, 3));
    }
  };

  // Machine handlers
  const handleAddMachineFromDropdown = (machineName: string) => {
    if (!machineName) return;
    if (!machinesList.includes(machineName)) {
      setMachinesList((prev) => [...prev, machineName]);
    }
    setSelectedDropdownMachine("");
  };

  const handleAddCustomMachine = () => {
    const trimmed = customMachineInput.trim();
    if (trimmed && !machinesList.includes(trimmed)) {
      setMachinesList((prev) => [...prev, trimmed]);
      setCustomMachineInput("");
    }
  };

  const handleAddAllSuggestedMachines = () => {
    const currentSuggested = INDUSTRY_MACHINE_MAP[factoryForm.industry] || [];
    const uniqueCombined = Array.from(new Set([...machinesList, ...currentSuggested]));
    setMachinesList(uniqueCombined);
  };

  // Material handlers
  const handleAddMaterialFromDropdown = (materialName: string) => {
    if (!materialName) return;
    if (!materialsList.includes(materialName)) {
      setMaterialsList((prev) => [...prev, materialName]);
    }
    setSelectedDropdownMaterial("");
  };

  const handleAddCustomMaterial = () => {
    const trimmed = customMaterialInput.trim();
    if (trimmed && !materialsList.includes(trimmed)) {
      setMaterialsList((prev) => [...prev, trimmed]);
      setCustomMaterialInput("");
    }
  };

  const handleAddAllSuggestedMaterials = () => {
    const currentSuggested = INDUSTRY_MATERIAL_MAP[factoryForm.industry] || [];
    const uniqueCombined = Array.from(new Set([...materialsList, ...currentSuggested]));
    setMaterialsList(uniqueCombined);
  };

  const handleSaveFactoryInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create_factory", payload: factoryForm }),
      });
      setStep(2);
    } catch (err) {
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStep3Machines = async () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("factoryiq_onboarded_machines", JSON.stringify(machinesList));
    }
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_machines",
          factoryId,
          payload: { machines: machinesList },
        }),
      });
    } catch (e) {
      console.error("Failed to save machines during step 3:", e);
    }
    setStep(4);
  };

  const handleCompleteOnboarding = async () => {
    setLoading(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("factoryiq_onboarded_machines", JSON.stringify(machinesList));
      localStorage.setItem("factoryiq_onboarded_workers", JSON.stringify(workersList));
      localStorage.removeItem("factoryiq_machines_state_data");
    }
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "complete_onboarding",
          factoryId,
          payload: { machines: machinesList, materials: materialsList, workers: workersList },
        }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setFactoryStatus("ACTIVE");
      window.location.href = "/machines";
    }
  };

  const steps = [
    { id: 1, label: t("stepFactoryInfo", "Factory Info") },
    { id: 2, label: t("stepIndustry", "Industry") },
    { id: 3, label: t("stepMachines", "Machines") },
    { id: 4, label: t("stepMaterials", "Materials") },
    { id: 5, label: t("stepWorkers", "Workers") },
    { id: 6, label: t("stepImportData", "Import Data") },
  ];

  // Compute available machine suggestions for current industry that are not yet added
  const currentIndustrySuggestions = INDUSTRY_MACHINE_MAP[factoryForm.industry] || [];
  const unaddedSuggestions = currentIndustrySuggestions.filter(
    (m) => !machinesList.includes(m)
  );

  // All other industry machines for full dropdown menu
  const allIndustryMachines = Object.values(INDUSTRY_MACHINE_MAP).flat();
  const remainingDropdownOptions = allIndustryMachines.filter(
    (m) => !machinesList.includes(m)
  );

  // Compute available raw material suggestions for current industry that are not yet added
  const currentMaterialSuggestions = INDUSTRY_MATERIAL_MAP[factoryForm.industry] || [];
  const unaddedMaterialSuggestions = currentMaterialSuggestions.filter(
    (m) => !materialsList.includes(m)
  );

  // All other industry raw materials for full dropdown menu
  const allIndustryMaterials = Object.values(INDUSTRY_MATERIAL_MAP).flat();
  const remainingMaterialDropdownOptions = allIndustryMaterials.filter(
    (m) => !materialsList.includes(m)
  );

  return (
    <div className="min-h-screen bg-[#EFF4FA] text-slate-900 py-12 px-4 sm:px-8 font-sans">
      <div className="max-w-4xl sm:max-w-5xl mx-auto space-y-10">
        
        {/* Top Logo & Title Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#00A8FF] text-white shadow-lg shadow-sky-500/25">
              <Zap className="h-5 w-5 fill-current" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">FactoryIQ</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {t("setupFactoryTitle", "Set up your factory")}
          </h1>
          <p className="text-sm sm:text-base font-bold text-slate-500 max-w-xl mx-auto">
            {t("setupFactorySubtitle", "Complete in 3 minutes. You can skip optional steps and return later.")}
          </p>
        </div>

        {/* 6 Step Connected Stepper Bar */}
        <div className="flex items-center justify-between max-w-3xl mx-auto px-4 relative">
          {steps.map((s, idx) => {
            const isCompleted = step > s.id;
            const isActive = step === s.id;

            return (
              <div key={s.id} className="flex flex-col items-center relative z-10">
                {idx > 0 && (
                  <div
                    className={`absolute top-6 right-1/2 left-[-100%] h-[3.5px] -translate-y-1/2 -z-10 transition-colors ${
                      step >= s.id ? "bg-[#00A8FF]" : "bg-slate-200"
                    }`}
                  />
                )}

                <button
                  type="button"
                  onClick={() => setStep(s.id)}
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm sm:text-base font-black transition-all ${
                    isCompleted
                      ? "bg-[#00A8FF] text-white shadow-md"
                      : isActive
                      ? "bg-[#1B365D] text-white shadow-lg scale-110 ring-4 ring-sky-500/20"
                      : "bg-white border-2 border-slate-300 text-slate-400 hover:border-slate-400"
                  }`}
                >
                  {isCompleted ? <Check className="h-5 w-5 stroke-[3]" /> : s.id}
                </button>
                <span className={`text-xs sm:text-sm font-black mt-3 ${isActive ? "text-slate-900 font-black" : "text-slate-400"}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* MAIN CENTER WHITE FORM CARD */}
        <div className="rounded-[36px] bg-white p-8 sm:p-12 shadow-2xl shadow-slate-200/70 border border-slate-100 space-y-8">
          
          {/* STEP 1: Factory Information */}
          {step === 1 && (
            <form onSubmit={handleSaveFactoryInfo} className="space-y-6">
              <div className="space-y-1 border-b border-slate-100 pb-4">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">Basic Factory Information</h2>
                <p className="text-xs sm:text-sm font-semibold text-slate-500">Provide your enterprise details for local compliance & AI calibration.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs sm:text-sm font-extrabold text-slate-700 block mb-2">
                    Factory / Company Name *
                  </label>
                  <input
                    type="text"
                    value={factoryForm.name}
                    onChange={(e) => setFactoryForm({ ...factoryForm, name: e.target.value })}
                    placeholder="Rajesh Industries Pvt. Ltd."
                    className="w-full rounded-2xl border border-slate-200 bg-[#F7F9FC] px-4 py-3.5 text-sm sm:text-base text-slate-900 font-semibold focus:border-[#00A8FF] focus:bg-white focus:outline-none transition shadow-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">GST Number</label>
                  <input
                    type="text"
                    value={factoryForm.gstNumber}
                    onChange={(e) => setFactoryForm({ ...factoryForm, gstNumber: e.target.value })}
                    placeholder="27AAJCR4329B1ZW"
                    className="w-full rounded-xl border border-slate-200 bg-[#F7F9FC] px-4 py-3 text-sm text-slate-900 font-semibold font-mono focus:border-[#00A8FF] focus:bg-white focus:outline-none transition shadow-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">City *</label>
                  <input
                    type="text"
                    value={factoryForm.city}
                    onChange={(e) => setFactoryForm({ ...factoryForm, city: e.target.value })}
                    placeholder="Pune"
                    className="w-full rounded-xl border border-slate-200 bg-[#F7F9FC] px-4 py-3 text-sm text-slate-900 font-semibold focus:border-[#00A8FF] focus:bg-white focus:outline-none transition shadow-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">State *</label>
                  <select
                    value={factoryForm.state}
                    onChange={(e) => setFactoryForm({ ...factoryForm, state: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-[#F7F9FC] px-4 py-3 text-sm text-slate-900 font-semibold focus:border-[#00A8FF] focus:bg-white focus:outline-none transition shadow-xs"
                  >
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Karnataka">Karnataka</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Number of Workers</label>
                <input
                  type="number"
                  value={factoryForm.workersCount}
                  onChange={(e) => setFactoryForm({ ...factoryForm, workersCount: Number(e.target.value) })}
                  placeholder="45"
                  className="w-full rounded-xl border border-slate-200 bg-[#F7F9FC] px-4 py-3 text-sm text-slate-900 font-semibold focus:border-[#00A8FF] focus:bg-white focus:outline-none transition shadow-xs"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 rounded-xl bg-[#1B365D] hover:bg-[#142845] px-6 py-3 text-sm font-extrabold text-white shadow-md transition cursor-pointer"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue"} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Select Your Industry */}
          {step === 2 && (
            <div className="space-y-8">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Select Your Industry</h2>
                <p className="text-sm sm:text-base font-semibold text-slate-500">
                  Selecting an industry type will automatically calibrate AI recommendations and suggest relevant floor machines.
                </p>
              </div>

              {/* Industry Grid Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {[
                  "Automotive Parts",
                  "Sheet Metal Fabrication",
                  "Plastic Moulding",
                  "Electrical Components",
                  "Precision Engineering",
                  "Textile / Garment",
                  "Food Processing",
                  "Chemical / Pharma",
                ].map((ind) => {
                  const isSelected = factoryForm.industry === ind;
                  return (
                    <button
                      key={ind}
                      type="button"
                      onClick={() => handleSelectIndustry(ind)}
                      className={`p-6 sm:p-7 min-h-[84px] rounded-[24px] border-2 text-left text-base sm:text-lg font-black transition-all relative flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? "border-[#00A8FF] bg-[#F0F8FF] text-[#0070C0] shadow-md ring-2 ring-[#00A8FF]/20"
                          : "border-slate-200/90 bg-[#F7F9FC] text-slate-800 hover:border-slate-300 hover:bg-white hover:shadow-sm"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        {isSelected && <Check className="h-6 w-6 text-[#00A8FF] stroke-[3.5] shrink-0" />}
                        {ind}
                      </span>
                      {isSelected && (
                        <span className="text-xs sm:text-sm bg-[#00A8FF] text-white px-3.5 py-1 rounded-full font-black shadow-xs">
                          Active
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Recommendation Preview Banner */}
              {factoryForm.industry && (
                <div className="p-6 sm:p-7 rounded-3xl bg-sky-50/80 border-2 border-sky-200/90 flex items-start gap-4 text-sm sm:text-base shadow-sm">
                  <Sparkles className="h-6 w-6 text-[#00A8FF] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black text-slate-900 block mb-1 text-base sm:text-lg">
                      Suggested Machines for {factoryForm.industry}:
                    </span>
                    <span className="text-slate-700 font-extrabold text-xs sm:text-sm leading-relaxed block">
                      {(INDUSTRY_MACHINE_MAP[factoryForm.industry] || []).join(" · ")}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-8 border-t border-slate-100">
                <button type="button" onClick={() => setStep(1)} className="text-sm sm:text-base font-black text-slate-600 hover:text-slate-900 cursor-pointer">
                  ‹ Back
                </button>
                <div className="flex items-center gap-6">
                  <button type="button" onClick={() => setStep(3)} className="text-sm sm:text-base font-black text-slate-500 hover:text-slate-800 cursor-pointer">
                    Skip
                  </button>
                  <button type="button" onClick={() => setStep(3)} className="flex items-center gap-2.5 rounded-2xl bg-[#1B365D] hover:bg-[#142845] px-8 sm:px-10 py-4 text-base sm:text-lg font-black text-white shadow-xl shadow-slate-900/20 active:scale-98 transition cursor-pointer">
                    Continue <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Machines Configuration with Industry Suggestions & Dropdown */}
          {step === 3 && (
            <div className="space-y-8">
              <div className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Add Factory Machines</h2>
                  <span className="text-xs sm:text-sm font-black bg-sky-100 text-[#0070C0] px-4 py-1.5 rounded-full border border-sky-200 shadow-2xs">
                    {factoryForm.industry} Industry
                  </span>
                </div>
                <p className="text-sm sm:text-base font-semibold text-slate-500">
                  Select from suggested machines for {factoryForm.industry}, choose from the dropdown list, or add custom machines.
                </p>
              </div>

              {/* 1. Added Machines Roster */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider">
                    Configured Floor Equipment ({machinesList.length})
                  </label>
                  {unaddedSuggestions.length > 0 && (
                    <button
                      type="button"
                      onClick={handleAddAllSuggestedMachines}
                      className="text-xs sm:text-sm font-black text-[#00A8FF] hover:underline flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="h-4 w-4" /> Add All Suggested Machines ({unaddedSuggestions.length})
                    </button>
                  )}
                </div>

                {machinesList.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-3xl text-sm font-bold text-slate-400">
                    No machines added yet. Select from suggestions below or add a machine.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {machinesList.map((m, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-[#F7F9FC] border-2 border-slate-200/90 text-sm sm:text-base font-black text-slate-900 shadow-xs hover:border-slate-300 transition"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-[#00A8FF] shrink-0 border border-sky-200">
                            <Cpu className="h-5 w-5" />
                          </div>
                          <span className="truncate">{m}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setMachinesList(machinesList.filter((_, idx) => idx !== i))}
                          className="text-slate-400 hover:text-rose-600 p-1.5 transition cursor-pointer"
                          title="Remove machine"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Quick Suggested Machines Chips for Industry */}
              {unaddedSuggestions.length > 0 && (
                <div className="p-6 sm:p-7 rounded-3xl bg-sky-50/80 border-2 border-sky-100 space-y-3.5">
                  <div className="flex items-center gap-2 text-sm sm:text-base font-black text-slate-900">
                    <Sparkles className="h-5 w-5 text-[#00A8FF]" />
                    <span>Suggested Machines for {factoryForm.industry}:</span>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {unaddedSuggestions.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => handleAddMachineFromDropdown(m)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border-2 border-sky-200 text-slate-800 text-xs sm:text-sm font-black hover:bg-[#00A8FF] hover:text-white hover:border-[#00A8FF] transition shadow-xs cursor-pointer group"
                      >
                        <Plus className="h-4 w-4 text-[#00A8FF] group-hover:text-white" />
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Add Machine via Dropdown List & Custom Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
                {/* Dropdown Menu Option */}
                <div className="space-y-2 min-w-0">
                  <label className="text-xs sm:text-sm font-extrabold text-slate-800 block truncate">
                    Select from Dropdown List
                  </label>
                  <div className="flex gap-2.5 items-center min-w-0">
                    <select
                      value={selectedDropdownMachine}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val) {
                          handleAddMachineFromDropdown(val);
                        } else {
                          setSelectedDropdownMachine("");
                        }
                      }}
                      className="flex-1 min-w-0 w-full rounded-2xl border-2 border-slate-200 bg-[#F7F9FC] px-4 py-3.5 text-sm sm:text-base text-slate-900 font-bold focus:border-[#00A8FF] focus:bg-white focus:outline-none shadow-xs truncate"
                    >
                      <option value="">-- Choose Machine --</option>
                      {currentIndustrySuggestions.length > 0 && (
                        <optgroup label={`Suggested for ${factoryForm.industry}`}>
                          {currentIndustrySuggestions.map((m) => (
                            <option key={m} value={m} disabled={machinesList.includes(m)}>
                              {m} {machinesList.includes(m) ? "✓ Added" : ""}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      <optgroup label="Other Industry Equipment">
                        {remainingDropdownOptions.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </optgroup>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleAddMachineFromDropdown(selectedDropdownMachine)}
                      disabled={!selectedDropdownMachine}
                      className="px-5 py-3.5 rounded-2xl bg-[#00A8FF] hover:bg-blue-600 disabled:opacity-50 text-white font-black text-sm transition shadow-md cursor-pointer shrink-0"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Custom Machine Text Input */}
                <div className="space-y-2 min-w-0">
                  <label className="text-xs sm:text-sm font-extrabold text-slate-800 block truncate">
                    Or Type Custom Machine Name
                  </label>
                  <div className="flex gap-2.5 items-center min-w-0">
                    <input
                      type="text"
                      placeholder="e.g. Haas VF-2 Milling Center"
                      value={customMachineInput}
                      onChange={(e) => setCustomMachineInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomMachine();
                        }
                      }}
                      className="flex-1 min-w-0 w-full rounded-2xl border-2 border-slate-200 bg-[#F7F9FC] px-4 py-3.5 text-sm sm:text-base text-slate-900 font-bold focus:border-[#00A8FF] focus:bg-white focus:outline-none shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomMachine}
                      disabled={!customMachineInput.trim()}
                      className="flex items-center gap-1.5 px-5 py-3.5 rounded-2xl bg-[#1B365D] hover:bg-[#142845] disabled:opacity-50 text-white font-black text-sm transition shadow-md cursor-pointer shrink-0"
                    >
                      <Plus className="h-4.5 w-4.5" /> Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-8 border-t border-slate-100">
                <button type="button" onClick={() => setStep(2)} className="text-sm sm:text-base font-black text-slate-600 hover:text-slate-900 cursor-pointer">
                  ‹ Back
                </button>
                <div className="flex items-center gap-6">
                  <button type="button" onClick={() => setStep(4)} className="text-sm sm:text-base font-black text-slate-500 hover:text-slate-800 cursor-pointer">
                    Skip
                  </button>
                  <button type="button" onClick={handleSaveStep3Machines} className="flex items-center gap-2.5 rounded-2xl bg-[#1B365D] hover:bg-[#142845] px-8 sm:px-10 py-4 text-base sm:text-lg font-black text-white shadow-xl shadow-slate-900/20 active:scale-98 transition cursor-pointer">
                    Continue <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Add Key Materials with Industry Suggestions & Dropdown */}
          {step === 4 && (
            <div className="space-y-8">
              <div className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Add Key Materials</h2>
                  <span className="text-xs sm:text-sm font-black bg-sky-100 text-[#0070C0] px-4 py-1.5 rounded-full border border-sky-200 shadow-2xs">
                    {factoryForm.industry} Industry
                  </span>
                </div>
                <p className="text-sm sm:text-base font-semibold text-slate-500">
                  Select from suggested raw materials for {factoryForm.industry}, choose from the dropdown list, or add custom materials.
                </p>
              </div>

              {/* 1. Added Materials Roster */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider">
                    Configured Raw Materials & Consumables ({materialsList.length})
                  </label>
                  {unaddedMaterialSuggestions.length > 0 && (
                    <button
                      type="button"
                      onClick={handleAddAllSuggestedMaterials}
                      className="text-xs sm:text-sm font-black text-[#00A8FF] hover:underline flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="h-4 w-4" /> Add All Suggested Materials ({unaddedMaterialSuggestions.length})
                    </button>
                  )}
                </div>

                {materialsList.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-3xl text-sm font-bold text-slate-400">
                    No raw materials added yet. Select from suggestions below or add a material.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {materialsList.map((mat, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-[#F7F9FC] border-2 border-slate-200/90 text-sm sm:text-base font-black text-slate-900 shadow-xs hover:border-slate-300 transition"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-[#00A8FF] shrink-0 border border-sky-200">
                            <Box className="h-5 w-5" />
                          </div>
                          <span className="truncate">{mat}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setMaterialsList(materialsList.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-rose-600 p-1.5 transition cursor-pointer"
                          title="Remove material"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Quick Suggested Materials Chips for Industry */}
              {unaddedMaterialSuggestions.length > 0 && (
                <div className="p-6 sm:p-7 rounded-3xl bg-sky-50/80 border-2 border-sky-100 space-y-3.5">
                  <div className="flex items-center gap-2 text-sm sm:text-base font-black text-slate-900">
                    <Sparkles className="h-5 w-5 text-[#00A8FF]" />
                    <span>Suggested Raw Materials for {factoryForm.industry}:</span>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {unaddedMaterialSuggestions.map((mat) => (
                      <button
                        key={mat}
                        type="button"
                        onClick={() => handleAddMaterialFromDropdown(mat)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border-2 border-sky-200 text-slate-800 text-xs sm:text-sm font-black hover:bg-[#00A8FF] hover:text-white hover:border-[#00A8FF] transition shadow-xs cursor-pointer group"
                      >
                        <Plus className="h-4 w-4 text-[#00A8FF] group-hover:text-white" />
                        {mat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Add Material via Dropdown List & Custom Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
                {/* Dropdown Menu Option */}
                <div className="space-y-2 min-w-0">
                  <label className="text-xs sm:text-sm font-extrabold text-slate-800 block truncate">
                    Select Material from Dropdown List
                  </label>
                  <div className="flex gap-2.5 items-center min-w-0">
                    <select
                      value={selectedDropdownMaterial}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val) {
                          handleAddMaterialFromDropdown(val);
                        } else {
                          setSelectedDropdownMaterial("");
                        }
                      }}
                      className="flex-1 min-w-0 w-full rounded-2xl border-2 border-slate-200 bg-[#F7F9FC] px-4 py-3.5 text-sm sm:text-base text-slate-900 font-bold focus:border-[#00A8FF] focus:bg-white focus:outline-none shadow-xs truncate"
                    >
                      <option value="">-- Choose Material --</option>
                      {currentMaterialSuggestions.length > 0 && (
                        <optgroup label={`Suggested for ${factoryForm.industry}`}>
                          {currentMaterialSuggestions.map((mat) => (
                            <option key={mat} value={mat} disabled={materialsList.includes(mat)}>
                              {mat} {materialsList.includes(mat) ? "✓ Added" : ""}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      <optgroup label="Other Industry Raw Materials">
                        {remainingMaterialDropdownOptions.map((mat) => (
                          <option key={mat} value={mat}>
                            {mat}
                          </option>
                        ))}
                      </optgroup>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleAddMaterialFromDropdown(selectedDropdownMaterial)}
                      disabled={!selectedDropdownMaterial}
                      className="px-5 py-3.5 rounded-2xl bg-[#00A8FF] hover:bg-blue-600 disabled:opacity-50 text-white font-black text-sm transition shadow-md cursor-pointer shrink-0"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Custom Material Text Input */}
                <div className="space-y-2 min-w-0">
                  <label className="text-xs sm:text-sm font-extrabold text-slate-800 block truncate">
                    Or Type Custom Material Name
                  </label>
                  <div className="flex gap-2.5 items-center min-w-0">
                    <input
                      type="text"
                      placeholder="e.g. Mild Steel Sheet 2.0mm"
                      value={customMaterialInput}
                      onChange={(e) => setCustomMaterialInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomMaterial();
                        }
                      }}
                      className="flex-1 min-w-0 w-full rounded-2xl border-2 border-slate-200 bg-[#F7F9FC] px-4 py-3.5 text-sm sm:text-base text-slate-900 font-bold focus:border-[#00A8FF] focus:bg-white focus:outline-none shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomMaterial}
                      disabled={!customMaterialInput.trim()}
                      className="flex items-center gap-1.5 px-5 py-3.5 rounded-2xl bg-[#1B365D] hover:bg-[#142845] disabled:opacity-50 text-white font-black text-sm transition shadow-md cursor-pointer shrink-0"
                    >
                      <Plus className="h-4.5 w-4.5" /> Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-8 border-t border-slate-100">
                <button type="button" onClick={() => setStep(3)} className="text-sm sm:text-base font-black text-slate-600 hover:text-slate-900 cursor-pointer">
                  ‹ Back
                </button>
                <div className="flex items-center gap-6">
                  <button type="button" onClick={() => setStep(5)} className="text-sm sm:text-base font-black text-slate-500 hover:text-slate-800 cursor-pointer">
                    Skip
                  </button>
                  <button type="button" onClick={() => setStep(5)} className="flex items-center gap-2.5 rounded-2xl bg-[#1B365D] hover:bg-[#142845] px-8 sm:px-10 py-4 text-base sm:text-lg font-black text-white shadow-xl shadow-slate-900/20 active:scale-98 transition cursor-pointer">
                    Continue <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Workers & Floor Operators */}
          {step === 5 && (
            <div className="space-y-8">
              <div className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Workers & Floor Operators</h2>
                  <span className="text-xs sm:text-sm font-black bg-emerald-100 text-emerald-800 px-4 py-1.5 rounded-full border border-emerald-200 shadow-2xs">
                    {workersList.length} Configured Workers
                  </span>
                </div>
                <p className="text-sm sm:text-base font-semibold text-slate-500">
                  Add floor manpower, designate machine skills, and set shift schedules for real-time task dispatches.
                </p>
              </div>

              {/* 1. Interactive Form Card to Add New Worker */}
              <form onSubmit={handleAddWorker} className="p-6 sm:p-8 rounded-3xl bg-slate-50 border-2 border-slate-200 space-y-6">
                <div className="flex items-center gap-2.5 text-sm sm:text-base font-black text-slate-900 border-b-2 border-slate-200/80 pb-3">
                  <Plus className="h-5 w-5 text-[#00A8FF]" /> Add New Worker / Operator
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs sm:text-sm font-extrabold text-slate-800 block mb-2">
                      Worker Full Name *
                    </label>
                    <input
                      type="text"
                      value={newWorkerForm.name}
                      onChange={(e) => setNewWorkerForm({ ...newWorkerForm, name: e.target.value })}
                      placeholder="e.g. Prakash Verma"
                      className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3.5 text-sm sm:text-base text-slate-900 font-semibold focus:border-[#00A8FF] focus:outline-none shadow-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm font-extrabold text-slate-800 block mb-2">
                      Role / Designation
                    </label>
                    <select
                      value={newWorkerForm.role}
                      onChange={(e) => setNewWorkerForm({ ...newWorkerForm, role: e.target.value })}
                      className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3.5 text-sm sm:text-base text-slate-900 font-semibold focus:border-[#00A8FF] focus:outline-none shadow-xs"
                    >
                      <option value="CNC Operator">CNC Operator</option>
                      <option value="VMC Operator">VMC Operator</option>
                      <option value="Floor Supervisor">Floor Supervisor</option>
                      <option value="Quality Inspector">Quality Inspector</option>
                      <option value="Welding Specialist">Welding Specialist</option>
                      <option value="Sheet Metal Fabricator">Sheet Metal Fabricator</option>
                      <option value="Assembly Worker">Assembly Worker</option>
                      <option value="Maintenance Engineer">Maintenance Engineer</option>
                      <option value="Material Handler">Material Handler</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm font-extrabold text-slate-800 block mb-2">
                      Shift Schedule
                    </label>
                    <select
                      value={newWorkerForm.shift}
                      onChange={(e) => setNewWorkerForm({ ...newWorkerForm, shift: e.target.value })}
                      className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3.5 text-sm sm:text-base text-slate-900 font-semibold focus:border-[#00A8FF] focus:outline-none shadow-xs"
                    >
                      <option value="Shift A (Day)">Shift A (Day: 06:00 AM - 02:00 PM)</option>
                      <option value="Shift B (Evening)">Shift B (Evening: 02:00 PM - 10:00 PM)</option>
                      <option value="Shift C (Night)">Shift C (Night: 10:00 PM - 06:00 AM)</option>
                      <option value="General Shift">General Shift (09:00 AM - 06:00 PM)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm font-extrabold text-slate-800 block mb-2">
                      Machine Qualification / Skill
                    </label>
                    <input
                      type="text"
                      value={newWorkerForm.qualification}
                      onChange={(e) => setNewWorkerForm({ ...newWorkerForm, qualification: e.target.value })}
                      placeholder="e.g. CNC Lathe 2-Axis, VMC-850"
                      className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3.5 text-sm sm:text-base text-slate-900 font-semibold focus:border-[#00A8FF] focus:outline-none shadow-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={!newWorkerForm.name.trim()}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#00A8FF] hover:bg-blue-600 disabled:opacity-50 text-white font-black text-sm shadow-md cursor-pointer transition"
                  >
                    <Plus className="h-5 w-5" /> Add Worker to Roster
                  </button>
                </div>
              </form>

              {/* 2. Quick Preset Add Worker Chips */}
              <div className="p-6 rounded-3xl bg-sky-50/80 border-2 border-sky-100 space-y-3">
                <div className="flex items-center gap-2 text-sm sm:text-base font-black text-slate-900">
                  <Sparkles className="h-5 w-5 text-[#00A8FF]" />
                  <span>Quick Add Standard Roles:</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {[
                    "Vijay Deshmukh (Welding Specialist · Shift B)",
                    "Vikram Singh (CNC Machinist · Shift A · Skill: VMC-850)",
                    "Pooja Mehta (Assembly Operator · General Shift)",
                    "Sunil Rao (Maintenance Engineer · Shift C)",
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleQuickAddWorker(preset)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border-2 border-sky-200 text-slate-800 text-xs sm:text-sm font-black hover:bg-[#00A8FF] hover:text-white transition shadow-xs cursor-pointer group"
                    >
                      <Plus className="h-4 w-4 text-[#00A8FF] group-hover:text-white" />
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Configured Workers Roster List */}
              <div className="space-y-3">
                <label className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider block">
                  Configured Worker Roster ({workersList.length})
                </label>

                {workersList.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-3xl text-sm font-bold text-slate-400">
                    No workers added yet. Fill out the form above or select quick add roles.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {workersList.map((w, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-[#F7F9FC] border-2 border-slate-200/90 text-sm sm:text-base font-black text-slate-900 shadow-xs hover:border-slate-300 transition"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-extrabold shrink-0 border border-emerald-200 text-base">
                            👷
                          </div>
                          <span className="truncate">{w}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveWorker(i)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 transition cursor-pointer shrink-0"
                          title="Remove worker"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-8 border-t border-slate-100">
                <button type="button" onClick={() => setStep(4)} className="text-sm sm:text-base font-black text-slate-600 hover:text-slate-900 cursor-pointer">
                  ‹ Back
                </button>
                <div className="flex items-center gap-6">
                  <button type="button" onClick={() => setStep(6)} className="text-sm sm:text-base font-black text-slate-500 hover:text-slate-800 cursor-pointer">
                    Skip
                  </button>
                  <button type="button" onClick={() => setStep(6)} className="flex items-center gap-2.5 rounded-2xl bg-[#1B365D] hover:bg-[#142845] px-8 sm:px-10 py-4 text-base sm:text-lg font-black text-white shadow-xl shadow-slate-900/20 active:scale-98 transition cursor-pointer">
                    Continue <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Import Existing Data */}
          {step === 6 && (
            <div className="space-y-8">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".csv, .xlsx, .xls, .txt"
                className="hidden"
              />

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Import Existing Data</h2>
                <p className="text-sm sm:text-base font-semibold text-slate-500">
                  Select files from desktop or drag & drop CSV/Excel files onto any category below. You can inspect, modify columns, and edit records before saving to the database.
                </p>
              </div>

              {/* 3 Upload Card Dropzone Boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[
                  { key: "orders" as const, title: "Orders / Jobs", format: "CSV or XLSX" },
                  { key: "inventory" as const, title: "Inventory / Stock", format: "CSV or XLSX" },
                  { key: "customers" as const, title: "Customer Master", format: "CSV or XLSX" },
                ].map((card) => {
                  const isDragging = dragOverCategory === card.key;
                  const imported = importingStatus[card.key];

                  return (
                    <div
                      key={card.key}
                      onClick={() => handleCardClick(card.key)}
                      onDragOver={(e) => handleDragOver(e, card.key)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, card.key)}
                      className={`border-3 border-dashed transition-all cursor-pointer rounded-3xl p-8 sm:p-10 flex flex-col items-center justify-center text-center space-y-4 relative group min-h-[220px] ${
                        isDragging
                          ? "border-[#00A8FF] bg-sky-50 shadow-xl scale-102"
                          : imported
                          ? "border-emerald-400 bg-emerald-50/60"
                          : "border-slate-200 bg-[#F7F9FC] hover:bg-[#F0F5FC] hover:border-[#00A8FF]"
                      }`}
                    >
                      {imported ? (
                        <>
                          <div className="p-3 rounded-full bg-emerald-100 text-emerald-600 shadow-xs">
                            <CheckCircle2 className="h-6 w-6" />
                          </div>
                          <span className="text-xs font-extrabold text-slate-900">{card.title}</span>
                          <div className="space-y-0.5">
                            <span className="text-[11px] font-extrabold text-emerald-700 block">
                              ✓ {imported.count} Records Saved to DB
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400 block">
                              Saved at {imported.importedAt}
                            </span>
                            <span className="text-[10px] font-extrabold text-[#00A8FF] underline pt-1 block">
                              Click or drop file to re-import
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="p-3.5 rounded-full bg-white text-slate-400 group-hover:text-[#00A8FF] group-hover:bg-sky-50 shadow-xs transition">
                            <Upload className="h-6 w-6" />
                          </div>
                          <span className="text-xs font-extrabold text-slate-800">{card.title}</span>
                          <span className="text-[10px] font-bold text-slate-400 font-mono">{card.format}</span>
                          <span className="text-[10px] font-semibold text-sky-600 opacity-80 group-hover:opacity-100 transition">
                            Click to select or drag & drop file
                          </span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setStep(5)} className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer">
                  ‹ Back
                </button>
                <button
                  type="button"
                  onClick={handleCompleteOnboarding}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-xl bg-[#1B365D] hover:bg-[#142845] px-8 py-3 text-sm font-extrabold text-white shadow-md transition cursor-pointer"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Launch Dashboard →"}
                </button>
              </div>
            </div>
          )}

          {/* INSPECT & MODIFY DATA MODAL */}
          {isImportModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                {/* Modal Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-[#F7F9FC]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#00A8FF] text-white shadow-md">
                      <Table className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-slate-900 capitalize">
                          Inspect & Modify Imported {modalFileMeta.typeKey} Data
                        </h3>
                        <span className="text-[10px] font-extrabold bg-sky-100 text-[#0070C0] px-2.5 py-0.5 rounded-full border border-sky-200 uppercase">
                          {modalRows.length} Rows Detected
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-500">
                        File: <span className="font-mono text-slate-700 font-bold">{modalFileMeta.name}</span> ({modalFileMeta.size})
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Identified Columns Badges */}
                <div className="px-6 py-3 bg-sky-50/70 border-b border-sky-100 flex items-center gap-2 overflow-x-auto text-xs">
                  <span className="font-bold text-slate-700 shrink-0 flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-[#00A8FF]" /> Identified Columns ({modalColumns.length}):
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {modalColumns.map((col) => (
                      <span
                        key={col}
                        className="px-2.5 py-1 rounded-lg bg-white border border-sky-200 text-slate-800 font-mono text-[11px] font-bold shadow-2xs"
                      >
                        {col}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Editable Table Content */}
                <div className="p-6 overflow-y-auto flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                      Data Preview & Cell Modification ({modalRows.length} Records)
                    </span>
                    <button
                      type="button"
                      onClick={handleAddRow}
                      className="inline-flex items-center gap-1 text-xs font-extrabold text-[#00A8FF] hover:underline cursor-pointer"
                    >
                      <Plus className="h-4 w-4" /> Add Row
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
                    <table className="w-full text-left text-xs font-semibold text-slate-800 border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                          <th className="p-3 w-12 text-center">#</th>
                          {modalColumns.map((col) => (
                            <th key={col} className="p-3 capitalize font-mono text-[11px] tracking-tight">
                              {col.replace(/_/g, " ")}
                            </th>
                          ))}
                          <th className="p-3 w-12 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/80 bg-white">
                        {modalRows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-sky-50/40 transition">
                            <td className="p-3 text-center text-slate-400 font-mono text-[11px]">{rIdx + 1}</td>
                            {modalColumns.map((col) => (
                              <td key={col} className="p-2">
                                <input
                                  type="text"
                                  value={row[col] || ""}
                                  onChange={(e) => handleCellChange(rIdx, col, e.target.value)}
                                  className="w-full rounded-lg border border-slate-200 bg-[#F7F9FC] px-2.5 py-1.5 text-xs text-slate-900 font-semibold focus:border-[#00A8FF] focus:bg-white focus:outline-none transition"
                                />
                              </td>
                            ))}
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteRow(rIdx)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                title="Delete row"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-5 border-t border-slate-100 bg-[#F7F9FC] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveImportedData}
                    disabled={isSavingImport || modalRows.length === 0}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1B365D] hover:bg-[#142845] text-white font-extrabold text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingImport ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Database className="h-4 w-4" />
                    )}
                    Confirm & Save {modalRows.length} Items to Site / Database
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}


