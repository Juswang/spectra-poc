// GET /api/adoption/filters — available months and agencies scoped to user access.
import { NextResponse } from "next/server";
import { authenticateAndScope } from "@/lib/auth-utils";
import { withErrorHandling } from "@/lib/api-utils";
import { getAdoptionRepository } from "@/lib/repositories";

export const GET = withErrorHandling(async () => {
  const { allowedAgencyCodes } = await authenticateAndScope();

  const repo = getAdoptionRepository();
  const [months, agencies] = await Promise.all([
    repo.getAvailableMonths(),
    repo.getAgencies(allowedAgencyCodes ?? undefined),
  ]);

  return NextResponse.json({
    success: true,
    data: { months, agencies },
    queriedAt: new Date().toISOString(),
  });
});
