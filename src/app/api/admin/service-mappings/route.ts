import { NextResponse } from "next/server";
import { requireRole, AuthError } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    await requireRole("ADMIN");

    const mappings = await prisma.serviceAgencyMapping.findMany({
      include: { agency: true },
      orderBy: { serviceName: "asc" },
    });

    return NextResponse.json({
      mappings: mappings.map((m) => ({
        id: m.id,
        serviceName: m.serviceName,
        agencyCode: m.agencyCode,
        agencyName: m.agency.name,
      })),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error fetching mappings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireRole("ADMIN");
    const body = await request.json();

    if (!body.serviceName || !body.agencyCode) {
      return NextResponse.json(
        { error: "serviceName and agencyCode are required" },
        { status: 400 }
      );
    }

    const mapping = await prisma.serviceAgencyMapping.create({
      data: {
        serviceName: body.serviceName,
        agencyCode: body.agencyCode,
      },
      include: { agency: true },
    });

    return NextResponse.json({
      id: mapping.id,
      serviceName: mapping.serviceName,
      agencyCode: mapping.agencyCode,
      agencyName: mapping.agency.name,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error creating mapping:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireRole("ADMIN");
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    await prisma.serviceAgencyMapping.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error deleting mapping:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
