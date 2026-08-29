import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, companyName, roleTitle, phone } = body;

    if (!email || !password || !companyName) {
      return NextResponse.json(
        { success: false, error: "Name, Email, Password and Company Name are required." },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "An account with this email address already exists." },
        { status: 400 }
      );
    }

    // Create factory code
    const factoryCode = "FACT-" + Math.random().toString(36).substring(2, 7).toUpperCase();

    // Create Factory
    const factory = await prisma.factory.create({
      data: {
        name: companyName,
        code: factoryCode,
        status: "ONBOARDING",
        onboardingStep: 1,
      },
    });

    // Create default Role
    const role = await prisma.role.create({
      data: {
        factoryId: factory.id,
        name: roleTitle || "Factory Owner",
        permissions: JSON.stringify(["ALL"]),
      },
    });

    // Create User (In production, hash password using bcrypt/argon2)
    const user = await prisma.user.create({
      data: {
        factoryId: factory.id,
        email,
        passwordHash: password, // Store string securely
        name: name || "Factory Manager",
        phone: phone || "",
        roleId: role.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        factory: {
          id: factory.id,
          name: factory.name,
          code: factory.code,
          status: factory.status,
        },
      },
    });
  } catch (error: any) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create account." },
      { status: 500 }
    );
  }
}
