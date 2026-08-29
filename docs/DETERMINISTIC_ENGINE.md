# Deterministic Engine & Mathematical Specification — Phase 0

> **Platform:** Universal Factory Platform  
> **Status:** LOCKED (Phase 0 Complete)  
> **Module Path:** `/src/deterministic-engine`  

---

## 1. Core Rule of the Deterministic Engine

The **Deterministic Engine** is a pure, isolated TypeScript engine with ZERO external LLM or AI dependencies.

```text
User Input / Order Data
        ↓
Deterministic Engine (/src/deterministic-engine)
        │ ── pure math, auditable business logic, zero LLM
        ↓
Structured Result (Classification, Capacity, Cost, Risk, Options A/B/C)
        ↓
LLM Explanation Layer (/src/ai)
        │ ── language translation, natural explanation ONLY
        ↓
Human Decision UI (VIEW / ACCEPT)
```

---

## 2. Mathematical Specifications & Formulas

### 2.1 Feasibility Score & Classification

The engine evaluates **14 Operational Parameters**:
1. Material availability ($M_{avail}$)
2. Stock usable quantity ($S_{usable}$)
3. Machine capacity ($C_{mach}$)
4. Existing commitments ($O_{exist}$)
5. Deadline margin ($D_{margin}$)
6. Setup time ($T_{setup}$)
7. Production time ($T_{prod}$)
8. Wastage estimate ($W_{est}$)
9. Finishing capacity ($F_{cap}$)
10. Transport/logistics constraints ($L_{trans}$)
11. Expected material cost ($K_{mat}$)
12. Expected labor & machine cost ($K_{oper}$)
13. Total operational cost ($K_{total}$)
14. Expected job profit ($P_{exp}$)

#### Feasibility Classification Algorithm
```text
IF (M_avail < Required_Material) OR (C_mach < Required_Time) OR (D_margin < 0):
    Classification = "NOT_RECOMMENDED"
    Confidence = DeterministicDataCompletenessScore()

ELSE IF (D_margin < Safety_Buffer_Time) OR (S_usable < Required_Material * 1.1) OR (P_exp < Min_Profit_Threshold):
    Classification = "POSSIBLE_WITH_RISK"
    Confidence = DeterministicDataCompletenessScore()

ELSE:
    Classification = "SAFE"
    Confidence = DeterministicDataCompletenessScore()
```

#### Deterministic Confidence Score Formula
$$\text{Confidence} = 100 \times \left( \frac{N_{\text{provided\_cost\_inputs}}}{N_{\text{total\_required\_cost\_inputs}}} \right) \times \left( 1 - 0.2 \times \mathbb{I}_{\text{estimated\_speed}} \right)$$

---

### 2.2 Capacity Calculation

$$\text{Available Capacity (Hours)} = \text{Available Production Time} \times \text{Effective Machine Rate} \times \text{Efficiency Factor}$$

$$\text{Effective Machine Rate} = \frac{\text{Ideal Hourly Speed} \times (1 - \text{Historical Scrap Rate})}{\text{Base Rate}}$$

$$\text{Net Available Capacity} = \text{Available Capacity} - \text{Scheduled Maintenance} - \text{Existing Jobs Setup/Run Time}$$

#### Factors Handled:
- Existing scheduled production jobs
- Planned preventive maintenance windows
- Setup and changeover duration per machine capability
- Operator availability constraints

---

### 2.3 Inventory Availability & Shortage Prediction

#### Usable Stock Formula
$$\text{Usable Stock} = \text{Current Stock} - \text{Reserved Stock} - \text{Damaged Stock}$$

#### Projected Shortage Date Formula
$$\text{Projected Shortage Date} = \text{Current Date} + \left( \frac{\text{Usable Stock}}{\text{Average Daily Consumption}} \right) \text{ Days}$$

#### Edge Case Handling:
1. **Zero Average Daily Consumption:** If consumption is 0, return `Projected Shortage Date = Infinity` (No shortage projected).
2. **Missing Inventory Data:** Mark `confidence` ratio lower and output `missing_data_warning: true`.
3. **Abnormal / Spike Consumption:** Calculate 7-day weighted moving average:
   $$\text{Daily Consumption} = 0.5 \times \text{Avg}_{3\text{d}} + 0.3 \times \text{Avg}_{7\text{d}} + 0.2 \times \text{Avg}_{30\text{d}}$$

---

### 2.4 Job Profitability & Cost Range

$$\text{Profit} = \text{Revenue} - (K_{\text{mat}} + K_{\text{labor}} + K_{\text{mach}} + K_{\text{energy}} + K_{\text{setup}} + K_{\text{waste}} + K_{\text{finish}} + K_{\text{transport}} + K_{\text{other}})$$

#### Incomplete Data Range Output
When operational cost inputs are partially missing or based on estimates:

```typescript
export type JobProfitabilityResult = {
  revenue: number;
  expectedProfit: number;
  minimumProfit: number; // Worst-case (max waste + upper cost bound)
  maximumProfit: number; // Best-case (zero waste + ideal speed)
  confidence: number;    // Percentage (0 - 100)
  missingCostInputs: string[];
};
```

---

### 2.5 Supplier Reliability Score

The Supplier Reliability Score ($R_{supp}$) is a weighted metric scaled from 0 to 100:

$$R_{supp} = (0.40 \times \text{OnTime}\%) + (0.30 \times (100 - \text{Rejection}\%)) + (0.20 \times \text{Fulfillment}\%) + (0.10 \times \text{LeadTimeVarianceScore})$$

$$\text{LeadTimeVarianceScore} = \max\left(0, 100 - 10 \times |\text{Actual Lead Time} - \text{Promised Lead Time}|\right)$$

---

## 3. LLM Explanation Wrapper Constraints

When the LLM receives the structured output from the Deterministic Engine:

1. **NO Recalculations:** The LLM MUST NOT perform additions, multiplications, or alter any numbers.
2. **NO Synthetic Numbers:** The LLM MUST NOT fabricate costs, lead times, or completion dates not present in the engine response.
3. **Strict Natural Language Formatting:** The LLM formats the deterministic output into concise, human-readable bullet points emphasizing **Problem, Impact, Recommendation, and Risk**.

---

## 4. Testing Strategy (100% Unit Coverage Requirement)

All files under `/src/deterministic-engine/*` MUST have **100% test coverage** using Vitest:
- Unit tests for zero/negative inputs.
- Unit tests for missing inventory or cost figures.
- Unit tests for boundary conditions (deadline = exact run time).
- Unit tests for large order quantities (brochure demo scenario: 20,000 units).
- Unit tests for machine downtime overlaps.
