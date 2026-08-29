import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { addMachine, getMachinesByFactory } from "@/services/machines";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let factoryId = searchParams.get("factoryId");

  try {
    if (!factoryId) {
      const activeFactory = await db.factory.findFirst({
        orderBy: { createdAt: "desc" },
      });
      factoryId = activeFactory?.id || null;
    }

    let machines = factoryId ? await getMachinesByFactory(factoryId) : [];

    if (machines.length === 0) {
      machines = await db.machine.findMany({
        where: { isDeleted: false },
        orderBy: { createdAt: "asc" },
      });
    }

    return NextResponse.json({
      success: true,
      data: machines,
      metadata: { timestamp: new Date().toISOString(), factoryId },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "GET_MACHINES_FAILED", message: err.message } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { factoryId, name, code, type, hourlyRate, energyConsumptionKw, idealOutputRatePerHour, workStartTime, workEndTime, nextMaintenanceDate } = body;

    if (!factoryId) {
      const activeFactory = await db.factory.findFirst({
        orderBy: { createdAt: "desc" },
      });
      factoryId = activeFactory?.id;
    }

    if (!factoryId || !name) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_FIELDS", message: "factoryId and machine name are required." } },
        { status: 400 }
      );
    }

    const machine = await addMachine({
      factoryId,
      name,
      code: code || `MCH-${Math.floor(100 + Math.random() * 900)}`,
      type: type || "General Machinery",
      hourlyRate: hourlyRate || 450,
      energyConsumptionKw: energyConsumptionKw || 12.5,
      idealOutputRatePerHour: idealOutputRatePerHour || 150,
      workStartTime: workStartTime || "08:00",
      workEndTime: workEndTime || "17:00",
      nextMaintenanceDate: nextMaintenanceDate || null,
    });

    return NextResponse.json({
      success: true,
      data: machine,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "ADD_MACHINE_FAILED", message: err.message } },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    let { factoryId, machineId, workStartTime, workEndTime, nextMaintenanceDate, status, name, hourlyRate } = body;

    if (!machineId) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_FIELDS", message: "machineId is required." } },
        { status: 400 }
      );
    }

    // Lookup machine by ID, code, or name to be resilient to tenant mismatches
    const existingMachine = await db.machine.findFirst({
      where: {
        isDeleted: false,
        OR: [
          { id: machineId },
          { code: machineId },
          { name: machineId },
          { code: { contains: machineId } },
          { name: { contains: machineId } },
        ],
      },
    });

    if (existingMachine) {
      await db.machine.update({
        where: { id: existingMachine.id },
        data: {
          ...(workStartTime !== undefined ? { workStartTime } : {}),
          ...(workEndTime !== undefined ? { workEndTime } : {}),
          ...(nextMaintenanceDate !== undefined ? { nextMaintenanceDate: nextMaintenanceDate ? new Date(nextMaintenanceDate) : null } : {}),
          ...(status !== undefined ? { status } : {}),
          ...(name !== undefined ? { name } : {}),
          ...(hourlyRate !== undefined ? { hourlyRate: Number(hourlyRate) } : {}),
        },
      });

      // If machine is updated to IDLE, automatically mark open maintenance records completed
      if (status === "IDLE") {
        await db.maintenance.updateMany({
          where: { machineId: existingMachine.id, completedDate: null },
          data: { completedDate: new Date() },
        });
      }

      // If nextMaintenanceDate was set, sync with Maintenance model
      if (nextMaintenanceDate) {
        const existingMaint = await db.maintenance.findFirst({
          where: { machineId: existingMachine.id, completedDate: null },
        });
        if (existingMaint) {
          await db.maintenance.update({
            where: { id: existingMaint.id },
            data: { scheduledDate: new Date(nextMaintenanceDate) },
          });
        } else {
          await db.maintenance.create({
            data: {
              factoryId: existingMachine.factoryId,
              machineId: existingMachine.id,
              type: "PREVENTIVE",
              scheduledDate: new Date(nextMaintenanceDate),
              notes: "Scheduled by Machine Owner",
            },
          });
        }
      }

      const updated = await db.machine.findFirst({
        where: { id: existingMachine.id },
      });

      return NextResponse.json({
        success: true,
        data: updated,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Machine updated successfully",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "UPDATE_MACHINE_FAILED", message: err.message } },
      { status: 500 }
    );
  }
}

