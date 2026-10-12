import { NextResponse } from "next/server";
import { requireRole, AuthError } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
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
          role: true,
          agencies: { include: { agency: true } },
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
        role: u.role?.name ?? null,
        roleId: u.roleId,
        agencies: u.agencies.map((ua) => ({
          id: ua.agency.id,
          name: ua.agency.name,
          code: ua.agency.code,
        })),
        createdAt: u.createdAt,
      })),
      total,
      page,
      limit,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
