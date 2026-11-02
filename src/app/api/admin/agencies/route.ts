// GET /api/admin/agencies — lists all agencies (ADMIN only).
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { withErrorHandling } from "@/lib/api-utils";
import prisma from "@/lib/prisma";

export const GET = withErrorHandling(async () => {
  await requireRole("ADMIN");

  const agencies = await prisma.agency.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ agencies });
});
