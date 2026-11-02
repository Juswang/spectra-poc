// GET /api/admin/roles — lists all roles (ADMIN only).
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { withErrorHandling } from "@/lib/api-utils";
import prisma from "@/lib/prisma";

export const GET = withErrorHandling(async () => {
  await requireRole("ADMIN");

  const roles = await prisma.role.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ roles });
});
