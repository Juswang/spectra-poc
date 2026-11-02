// GET /api/adoption — returns overview or zoom data, scoped by user's agencies.
import { NextResponse } from "next/server";
import type { PeriodMode } from "@/types/adoption";
import { authenticateAndScope, scopeAgencies } from "@/lib/auth-utils";
import { withErrorHandling } from "@/lib/api-utils";
import { getAdoptionRepository } from "@/lib/repositories";

export const GET = withErrorHandling(async (request) => {
  const { allowedAgencyCodes } = await authenticateAndScope();

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month") || "2026-10";
  const agenciesParam = searchParams.get("agencies") || "";
  const requestedCodes = agenciesParam ? agenciesParam.split(",") : [];
  const tab = searchParams.get("tab") || "overview";
  const periodMode = (searchParams.get("periodMode") || "month") as PeriodMode;

  const scopedCodes = scopeAgencies(requestedCodes, allowedAgencyCodes);

  const repo = getAdoptionRepository();
  const data =
    tab === "zoom"
      ? await repo.getZoomTabData(month, scopedCodes, periodMode)
      : await repo.getAdoptionOverview(month, scopedCodes);

  return NextResponse.json({
    success: true,
    data,
    tab,
    queriedAt: new Date().toISOString(),
  });
});
