// PATCH /api/admin/users/:id — update user agency/role assignments (ADMIN only).
import { NextResponse } from "next/server";
import { requireRole, getEffectiveRole } from "@/lib/auth-utils";
import { withErrorHandling } from "@/lib/api-utils";
import prisma from "@/lib/prisma";

export const PATCH = withErrorHandling(async (request) => {
  await requireRole("ADMIN");
  const url = new URL(request.url);
  const id = url.pathname.split("/").pop()!;
  const body = await request.json();

  if (body.agencies !== undefined) {
    await prisma.userAgency.deleteMany({ where: { userId: id } });
    if (body.agencies.length > 0) {
      await prisma.userAgency.createMany({
        data: body.agencies.map((a: { agencyId: string; roleId: string }) => ({
          userId: id,
          agencyId: a.agencyId,
          roleId: a.roleId,
        })),
      });
    }
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      agencies: { include: { agency: true, role: true } },
    },
  });

  return NextResponse.json({
    id: user!.id,
    name: user!.name,
    email: user!.email,
    role: getEffectiveRole(user!.agencies.map((ua) => ua.role.name)),
    agencies: user!.agencies.map((ua) => ({
      id: ua.agency.id,
      name: ua.agency.name,
      code: ua.agency.code,
      role: ua.role.name,
    })),
  });
});
