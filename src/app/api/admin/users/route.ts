// GET /api/admin/users — paginated user list with roles and agencies (ADMIN only).
import { NextResponse } from "next/server";
import { requireRole, getEffectiveRole } from "@/lib/auth-utils";
import { withErrorHandling } from "@/lib/api-utils";
import prisma from "@/lib/prisma";

export const GET = withErrorHandling(async (request) => {
  await requireRole("ADMIN");

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const search = url.searchParams.get("search") || "";
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        agencies: { include: { agency: true, role: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      image: u.image,
      role: getEffectiveRole(u.agencies.map((ua) => ua.role.name)),
      agencies: u.agencies.map((ua) => ({
        id: ua.agency.id,
        name: ua.agency.name,
        code: ua.agency.code,
        role: ua.role.name,
      })),
      createdAt: u.createdAt,
    })),
    total,
    page,
    limit,
  });
});
