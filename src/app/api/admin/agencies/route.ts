import { NextResponse } from "next/server";
import { requireRole, AuthError } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    await requireRole("ADMIN");

    const agencies = await prisma.agency.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ agencies });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error fetching agencies:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
