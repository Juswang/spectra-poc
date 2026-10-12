import { NextResponse } from "next/server";
import { requireRole, AuthError } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("ADMIN");
    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, unknown> = {};

    if (body.roleId !== undefined) {
      const role = await prisma.role.findUnique({ where: { id: body.roleId } });
      if (!role) {
        return NextResponse.json({ error: "Role not found" }, { status: 400 });
      }
      updateData.roleId = body.roleId;
    }

    if (body.agencyIds !== undefined) {
      await prisma.userAgency.deleteMany({ where: { userId: id } });
      if (body.agencyIds.length > 0) {
        await prisma.userAgency.createMany({
          data: body.agencyIds.map((agencyId: string) => ({
            userId: id,
            agencyId,
          })),
        });
      }
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({ where: { id }, data: updateData });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        agencies: { include: { agency: true } },
      },
    });

    return NextResponse.json({
      id: user!.id,
      name: user!.name,
      email: user!.email,
      role: user!.role?.name ?? null,
      roleId: user!.roleId,
      agencies: user!.agencies.map((ua) => ({
        id: ua.agency.id,
        name: ua.agency.name,
        code: ua.agency.code,
      })),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
