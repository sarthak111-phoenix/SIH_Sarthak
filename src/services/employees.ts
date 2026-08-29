import { db } from "@/lib/db";

export type EmployeeInput = {
  factoryId: string;
  employeeCode: string;
  name: string;
  roleTitle: string;
  hourlyRate: number;
  shiftHoursPerDay?: number;
};

export async function addEmployee(input: EmployeeInput) {
  return await db.employee.create({
    data: {
      factoryId: input.factoryId,
      employeeCode: input.employeeCode.toUpperCase(),
      name: input.name,
      roleTitle: input.roleTitle,
      hourlyRate: input.hourlyRate,
      shiftHoursPerDay: input.shiftHoursPerDay || 8.0,
      status: "ACTIVE",
    },
  });
}

export async function getEmployeesByFactory(factoryId: string) {
  return await db.employee.findMany({
    where: {
      factoryId,
      isDeleted: false,
    },
    orderBy: { createdAt: "desc" },
  });
}
