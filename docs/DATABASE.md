# Database Specification & Entity Strategy — Phase 0

> **Platform:** Universal Factory Platform  
> **Status:** LOCKED (Phase 0 Complete)  
> **ORM:** Prisma ORM with PostgreSQL  

---

## 1. Multi-Tenant Data Strategy

### 1.1 Tenant Isolation Rule
- Every operational database table includes a mandatory column: `factoryId String @db.Uuid`.
- All database queries MUST include `{ where: { factoryId } }`.
- Foreign keys pointing between operational entities MUST validate matching `factoryId` values to prevent cross-tenant record linking.

### 1.2 Soft Delete & Auditing
- Critical entities (`Order`, `Machine`, `Material`, `Employee`, `Supplier`, `Product`) implement soft deletion using `isDeleted Boolean @default(false)` and `deletedAt DateTime?`.
- Historical state changes (schedule adjustments, feasibility evaluations, AI recommendations) are append-only.

---

## 2. Entity Dictionary (24 Entities)

### 1. Factory
- `id`: UUID (PK)
- `name`: String
- `code`: String (Unique)
- `industry`: String (Default: "PRINTING")
- `currency`: String (Default: "INR")
- `timezone`: String (Default: "Asia/Kolkata")
- `status`: Enum `[ONBOARDING, ACTIVE, INACTIVE, SUSPENDED]`
- `onboardingStep`: Int (1..6)
- `createdAt`, `updatedAt`: DateTime

### 2. User
- `id`: UUID (PK)
- `factoryId`: UUID (FK -> Factory)
- `email`: String (Unique)
- `passwordHash`: String
- `name`: String
- `phone`: String?
- `roleId`: UUID (FK -> Role)
- `isActive`: Boolean @default(true)
- `createdAt`, `updatedAt`: DateTime

### 3. Role
- `id`: UUID (PK)
- `factoryId`: UUID? (Null for system default roles)
- `name`: Enum `[OWNER_ADMIN, SUPERVISOR, WORKER_OPERATOR, CUSTOMER]`
- `permissions`: Json (Array of permission strings)
- `createdAt`, `updatedAt`: DateTime

### 4. Machine
- `id`: UUID (PK)
- `factoryId`: UUID (FK -> Factory)
- `name`: String
- `code`: String
- `type`: String (e.g. "OFFSET_PRESS", "CUTTER", "BINDER")
- `status`: Enum `[RUNNING, IDLE, DOWN_BREAKDOWN, DOWN_MAINTENANCE, DOWN_SETUP]`
- `hourlyRate`: Decimal (INR per hour)
- `energyConsumptionKw`: Decimal
- `idealOutputRatePerHour`: Decimal
- `isDeleted`: Boolean @default(false)
- `createdAt`, `updatedAt`: DateTime

### 5. MachineCapability
- `id`: UUID (PK)
- `machineId`: UUID (FK -> Machine)
- `processId`: UUID (FK -> Process)
- `setupTimeMinutes`: Int
- `maxSpeedUnitsPerHour`: Decimal
- `efficiencyFactor`: Decimal @default(1.0)

### 6. Employee
- `id`: UUID (PK)
- `factoryId`: UUID (FK -> Factory)
- `userId`: UUID? (FK -> User, optional)
- `employeeCode`: String
- `name`: String
- `roleTitle`: String
- `hourlyRate`: Decimal
- `shiftHoursPerDay`: Decimal @default(8.0)
- `status`: Enum `[ACTIVE, ON_LEAVE, TERMINATED]`
- `isDeleted`: Boolean @default(false)

### 7. Material
- `id`: UUID (PK)
- `factoryId`: UUID (FK -> Factory)
- `name`: String
- `code`: String
- `category`: String (e.g. "PAPER", "INK", "PLATE", "CHEMICAL")
- `unitOfMeasure`: String (e.g. "SHEETS", "KG", "LITERS")
- `costPerUnit`: Decimal
- `minimumStockThreshold`: Decimal
- `reorderQuantity`: Decimal
- `isDeleted`: Boolean @default(false)

### 8. Inventory
- `id`: UUID (PK)
- `factoryId`: UUID (FK -> Factory)
- `materialId`: UUID (FK -> Material, Unique per Factory)
- `currentStock`: Decimal
- `reservedStock`: Decimal @default(0)
- `damagedStock`: Decimal @default(0)
- `lastRestockedAt`: DateTime?
- `createdAt`, `updatedAt`: DateTime

### 9. Supplier
- `id`: UUID (PK)
- `factoryId`: UUID (FK -> Factory)
- `name`: String
- `code`: String
- `contactPerson`: String?
- `email`: String?
- `phone`: String?
- `averageLeadTimeDays`: Decimal
- `reliabilityScore`: Decimal @default(100.0) // Deterministically calculated
- `isDeleted`: Boolean @default(false)

### 10. Product
- `id`: UUID (PK)
- `factoryId`: UUID (FK -> Factory)
- `name`: String
- `code`: String
- `category`: String
- `unitPrice`: Decimal
- `isDeleted`: Boolean @default(false)

### 11. Process
- `id`: UUID (PK)
- `factoryId`: UUID (FK -> Factory)
- `productId`: UUID (FK -> Product)
- `sequenceOrder`: Int
- `name`: String (e.g. "PRINTING", "CUTTING", "FINISHING")
- `setupTimeMinutes`: Int
- `unitProductionTimeSeconds`: Decimal
- `scrapPercentage`: Decimal @default(0.0)

### 12. Customer
- `id`: UUID (PK)
- `factoryId`: UUID (FK -> Factory)
- `companyName`: String
- `contactName`: String
- `email`: String?
- `phone`: String
- `address`: String?
- `portalAccessCode`: String? (For read-only customer tracking)

### 13. Order
- `id`: UUID (PK)
- `factoryId`: UUID (FK -> Factory)
- `customerId`: UUID (FK -> Customer)
- `orderNumber`: String (Unique per Factory)
- `status`: Enum `[DRAFT, RECEIVED, DESIGN_APPROVED, MATERIAL_READY, IN_PRODUCTION, QUALITY_CHECK, PACKING, DISPATCHED, CANCELLED]`
- `feasibilityStatus`: Enum `[PENDING, SAFE, POSSIBLE_WITH_RISK, NOT_RECOMMENDED]`
- `totalAmount`: Decimal
- `targetDeadline`: DateTime
- `estimatedCompletion`: DateTime?
- `priority`: Enum `[LOW, NORMAL, HIGH, URGENT]`
- `intakeChannel`: Enum `[MANUAL_FORM, VOICE, PDF_OCR, CSV_IMPORT]`
- `notes`: String?
- `isDeleted`: Boolean @default(false)
- `createdAt`, `updatedAt`: DateTime

### 14. OrderItem
- `id`: UUID (PK)
- `orderId`: UUID (FK -> Order)
- `productId`: UUID (FK -> Product)
- `quantity`: Int
- `unitPrice`: Decimal
- `totalPrice`: Decimal
- `specifications`: Json

### 15. ProductionJob
- `id`: UUID (PK)
- `factoryId`: UUID (FK -> Factory)
- `orderId`: UUID (FK -> Order)
- `machineId`: UUID? (FK -> Machine)
- `assignedEmployeeId`: UUID? (FK -> Employee)
- `status`: Enum `[QUEUED, IN_PROGRESS, PAUSED, COMPLETED, CANCELLED]`
- `plannedStartTime`: DateTime?
- `plannedEndTime`: DateTime?
- `actualStartTime`: DateTime?
- `actualEndTime`: DateTime?
- `producedQuantity`: Int @default(0)
- `wasteQuantity`: Int @default(0)

### 16. ProductionStage
- `id`: UUID (PK)
- `jobId`: UUID (FK -> ProductionJob)
- `stageName`: Enum `[RECEIVED, DESIGN_APPROVED, MATERIAL_READY, PRINTING, CUTTING, FINISHING, QC, PACKING, DISPATCHED]`
- `status`: Enum `[PENDING, IN_PROGRESS, PASSED, FAILED]`
- `startedAt`: DateTime?
- `completedAt`: DateTime?
- `operatorId`: UUID? (FK -> Employee)
- `notes`: String?

### 17. MachineDowntime
- `id`: UUID (PK)
- `factoryId`: UUID (FK -> Factory)
- `machineId`: UUID (FK -> Machine)
- `reasonCategory`: Enum `[BREAKDOWN, SETUP, MATERIAL_WAITING, OPERATOR_UNAVAILABLE, MAINTENANCE, OTHER]`
- `description`: String?
- `startTime`: DateTime
- `endTime`: DateTime?
- `durationMinutes`: Int?

### 18. Waste
- `id`: UUID (PK)
- `factoryId`: UUID (FK -> Factory)
- `jobId`: UUID (FK -> ProductionJob)
- `materialId`: UUID (FK -> Material)
- `quantity`: Decimal
- `reason`: String
- `reportedBy`: UUID (FK -> Employee)
- `createdAt`: DateTime

### 19. Rework
- `id`: UUID (PK)
- `factoryId`: UUID (FK -> Factory)
- `jobId`: UUID (FK -> ProductionJob)
- `reworkQuantity`: Int
- `reason`: String
- `additionalCost`: Decimal
- `createdAt`: DateTime

### 20. Maintenance
- `id`: UUID (PK)
- `factoryId`: UUID (FK -> Factory)
- `machineId`: UUID (FK -> Machine)
- `type`: Enum `[PREVENTIVE, BREAKDOWN, SCHEDULED]`
- `scheduledDate`: DateTime
- `completedDate`: DateTime?
- `cost`: Decimal @default(0.0)
- `notes`: String?

### 21. JobProfitability
- `id`: UUID (PK)
- `factoryId`: UUID (FK -> Factory)
- `orderId`: UUID (FK -> Order, Unique)
- `revenue`: Decimal
- `materialCost`: Decimal
- `laborCost`: Decimal
- `machineCost`: Decimal
- `energyCost`: Decimal
- `setupCost`: Decimal
- `wasteCost`: Decimal
- `finishingCost`: Decimal
- `transportCost`: Decimal
- `otherCost`: Decimal
- `expectedProfit`: Decimal
- `minProfit`: Decimal
- `maxProfit`: Decimal
- `confidenceScore`: Decimal // 0 to 100
- `missingInputs`: Json // Array of missing cost field strings

### 22. FactoryKnowledge
- `id`: UUID (PK)
- `factoryId`: UUID (FK -> Factory)
- `title`: String
- `category`: Enum `[MACHINE_SOP, PROCESS_SPEC, TROUBLESHOOTING, SUPPLIER_NOTE, HISTORICAL_DECISION]`
- `content`: String
- `tags`: Json // Array of tags
- `createdBy`: UUID (FK -> User)
- `createdAt`, `updatedAt`: DateTime

### 23. Notification
- `id`: UUID (PK)
- `factoryId`: UUID (FK -> Factory)
- `severity`: Enum `[CRITICAL, IMPORTANT, INFORMATIONAL]`
- `title`: String
- `message`: String
- `groupKey`: String? // For grouping duplicate notifications
- `relatedRecordType`: String?
- `relatedRecordId`: String?
- `isRead`: Boolean @default(false)
- `createdAt`: DateTime

### 24. AuditLog
- `id`: UUID (PK)
- `factoryId`: UUID (FK -> Factory)
- `userId`: UUID (FK -> User)
- `action`: String (e.g. "ORDER_CREATED", "FEASIBILITY_APPROVED", "SCHEDULE_UPDATED")
- `details`: Json
- `ipAddress`: String?
- `timestamp`: DateTime @default(now())

---

## 3. Database Indexes Strategy

To guarantee rapid UI scan performance (<30ms queries), the following composite indexes will be created:

```prisma
// Multi-tenant operational indexes
@@index([factoryId, status])
@@index([factoryId, targetDeadline])
@@index([factoryId, isDeleted])
@@index([factoryId, category])
@@index([factoryId, groupKey, isRead])
```
