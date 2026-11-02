// CRUD /api/admin/service-mappings — manage service-to-agency links (ADMIN only).
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { withErrorHandling } from "@/lib/api-utils";
import prisma from "@/lib/prisma";

export const GET = withErrorHandling(async () => {
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
});

export const POST = withErrorHandling(async (request) => {
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
});

export const DELETE = withErrorHandling(async (request) => {
  await requireRole("ADMIN");
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await prisma.serviceAgencyMapping.delete({ where: { id } });

  return NextResponse.json({ success: true });
});
