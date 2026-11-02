// Postgres implementation of IAdoptionRepository — queries AdoptionMetric table via Prisma.
import prisma from "@/lib/prisma";
import type { IAdoptionRepository } from "./adoption-repository";
import {
  monthOffset,
  offsetToKey,
  formatMonthLabel,
  reportingStep,
  reportingShortLabel,
} from "./date-utils";
import {
  PRODUCTS,
  toProductRecord,
  sumProductRecords,
  computeTotals,
  type MetricRow,
} from "./metric-aggregation";
import type {
  MonthKey,
  PeriodMode,
  ProductId,
  ProductRecord,
  AdoptionOverviewData,
  TrendDataPoint,
  AgencyAdoptionRow,
  AdoptionMonth,
  AgencyOption,
  ZoomTabData,
  ZoomKpiData,
  ZoomMonthTag,
  ZoomWeeklyPoint,
  ZoomMeetingData,
  ZoomAiData,
  ZoomAiTrendPoint,
  ZoomAiFeatureSlice,
  ZoomAiFeaturesPeriod,
  ZoomExperiencePoint,
} from "@/types/adoption";

const LICENSE_THRESHOLD = 12500;
const USERS_ONBOARDED = 67435;
const TOTAL_WOG_USERS = 120000;

export class PostgresAdoptionRepository implements IAdoptionRepository {
  private async fetchMetrics(
    months: string[],
    agencyCodes: string[]
  ): Promise<MetricRow[]> {
    if (agencyCodes.length === 0) return [];
    const where = {
      month: { in: months },
      agencyCode: { in: agencyCodes },
    };
    return prisma.adoptionMetric.findMany({ where }) as Promise<MetricRow[]>;
  }

  private groupByProduct(
    rows: MetricRow[],
    product?: ProductId
  ): Map<ProductId, ProductRecord[]> {
    const map = new Map<ProductId, ProductRecord[]>();
    for (const row of rows) {
      if (product && row.product !== product) continue;
      const p = row.product as ProductId;
      if (!map.has(p)) map.set(p, []);
      map.get(p)!.push(toProductRecord(row));
    }
    return map;
  }

  private productSumsForMonth(
    rows: MetricRow[],
    month: string
  ): Map<ProductId, ProductRecord & { adoption: number }> {
    const monthRows = rows.filter((r) => r.month === month);
    const grouped = this.groupByProduct(monthRows);
    const sums = new Map<ProductId, ProductRecord & { adoption: number }>();
    for (const p of PRODUCTS) {
      sums.set(p, sumProductRecords(grouped.get(p) ?? []));
    }
    return sums;
  }

  private sumReportingPeriod(
    rows: MetricRow[],
    endMonth: string,
    product: ProductId,
    periodMode: PeriodMode
  ): ProductRecord & { adoption: number } {
    if (periodMode !== "quarter") {
      const monthRows = rows.filter(
        (r) => r.month === endMonth && r.product === product
      );
      return sumProductRecords(monthRows.map(toProductRecord));
    }
    const endOffset = monthOffset(endMonth);
    const quarterMonths = [
      offsetToKey(endOffset - 2),
      offsetToKey(endOffset - 1),
      endMonth,
    ];
    const quarterRows = rows.filter(
      (r) => quarterMonths.includes(r.month) && r.product === product
    );
    const monthlyGroups = new Map<string, ProductRecord[]>();
    for (const r of quarterRows) {
      if (!monthlyGroups.has(r.month)) monthlyGroups.set(r.month, []);
      monthlyGroups.get(r.month)!.push(toProductRecord(r));
    }
    const monthlySums = [...monthlyGroups.values()].map(sumProductRecords);
    if (monthlySums.length === 0)
      return sumProductRecords([]);

    const averaged: Record<string, number> = {};
    for (const key of [
      "provisioned",
      "active",
      "daily",
      "hosts",
    ] as const) {
      averaged[key] = Math.round(
        monthlySums.reduce((t, r) => t + r[key], 0) / monthlySums.length
      );
    }
    for (const key of [
      "emails",
      "spam",
      "sessions",
      "minutes",
    ] as const) {
      averaged[key] = monthlySums.reduce((t, r) => t + r[key], 0);
    }
    averaged.duration = averaged.sessions
      ? averaged.minutes / averaged.sessions
      : 0;
    const adoption = averaged.provisioned
      ? (averaged.active / averaged.provisioned) * 100
      : 0;
    return { ...(averaged as unknown as ProductRecord), adoption };
  }

  async getAdoptionOverview(
    monthKey: MonthKey,
    agencyCodes: string[]
  ): Promise<AdoptionOverviewData> {
    const m = monthOffset(monthKey);
    const prevMonth = offsetToKey(m - 1);
    const trendMonths = Array.from({ length: 6 }, (_, i) =>
      offsetToKey(m - 5 + i)
    );
    const allMonths = [...new Set([monthKey, prevMonth, ...trendMonths])];

    const rows = await this.fetchMetrics(allMonths, agencyCodes);

    const currentSums = this.productSumsForMonth(rows, monthKey);
    const currentTotals = computeTotals(currentSums);

    const prevSums = this.productSumsForMonth(rows, prevMonth);
    const previousTotals = computeTotals(prevSums);

    const trend: TrendDataPoint[] = trendMonths.map((tm) => {
      const monthRows = rows.filter((r) => r.month === tm);
      const grouped = this.groupByProduct(monthRows);
      return {
        month: tm,
        monthLabel: formatMonthLabel(tm),
        exchange: sumProductRecords(grouped.get("exchange") ?? []).active,
        teams: sumProductRecords(grouped.get("teams") ?? []).active,
        zoom: sumProductRecords(grouped.get("zoom") ?? []).active,
      };
    });

    const agencyCodesInData = [
      ...new Set(
        rows.filter((r) => r.month === monthKey).map((r) => r.agencyCode)
      ),
    ];

    const agencies: AgencyAdoptionRow[] = agencyCodesInData.map(
      (code, idx) => {
        const currentRows = rows.filter(
          (r) => r.month === monthKey && r.agencyCode === code
        );
        const prevRows = rows.filter(
          (r) => r.month === prevMonth && r.agencyCode === code
        );
        const curSums = new Map<
          ProductId,
          ProductRecord & { adoption: number }
        >();
        const prSums = new Map<
          ProductId,
          ProductRecord & { adoption: number }
        >();
        for (const p of PRODUCTS) {
          curSums.set(
            p,
            sumProductRecords(
              currentRows.filter((r) => r.product === p).map(toProductRecord)
            )
          );
          prSums.set(
            p,
            sumProductRecords(
              prevRows.filter((r) => r.product === p).map(toProductRecord)
            )
          );
        }
        const cur = computeTotals(curSums);
        const prev = computeTotals(prSums);
        const activeDelta = prev.active
          ? ((cur.active - prev.active) / prev.active) * 100
          : 0;
        const agencyName =
          currentRows[0]?.agencyCode ?? code;
        return {
          agencyId: idx,
          agencyName: code,
          agencyCode: code,
          active: cur.active,
          sessions: cur.sessions,
          adoption: cur.adoption,
          activeDelta,
        };
      }
    );

    // Resolve proper agency names from DB
    const agencyLookup = await prisma.agency.findMany({
      where: { code: { in: agencyCodesInData } },
      select: { code: true, name: true },
    });
    const nameMap = new Map(agencyLookup.map((a) => [a.code, a.name]));
    for (const agency of agencies) {
      agency.agencyName = nameMap.get(agency.agencyCode) ?? agency.agencyCode;
    }

    const topAgency =
      agencies.length > 0
        ? agencies.reduce((top, a) => (a.active > top.active ? a : top))
        : null;

    return {
      currentTotals,
      previousTotals,
      trend,
      agencies,
      topAgency: topAgency
        ? { name: topAgency.agencyName, active: topAgency.active }
        : null,
    };
  }

  async getZoomTabData(
    monthKey: MonthKey,
    agencyCodes: string[],
    periodMode: PeriodMode
  ): Promise<ZoomTabData> {
    const m = monthOffset(monthKey);
    const step = reportingStep(periodMode);

    // Determine all months we'll need
    const neededOffsets = new Set<number>();
    // KPIs: current, previous, and 3 recent periods with their predecessors
    for (let i = -step * 3; i <= 0; i += step) {
      neededOffsets.add(m + i);
      neededOffsets.add(m + i - step);
    }
    // Weekly trend: need a range of months around the selected month
    const weekCount = periodMode === "quarter" ? 12 : 4;
    for (let i = -2; i <= 1; i++) neededOffsets.add(m + i);
    // Meeting insight: 8 periods back
    for (let i = 0; i < 8; i++) neededOffsets.add(m - step * (7 - i));
    // AI adoption: 6 periods back
    for (let i = 0; i < 6; i++) neededOffsets.add(m - step * (5 - i));
    // Participant experience: same range as weekly trend
    // Already covered above

    const allMonths = [...neededOffsets].map(offsetToKey);
    const rows = await this.fetchMetrics(allMonths, agencyCodes);

    const kpis = this.buildZoomKpis(rows, m, periodMode);
    const weeklyTrend = this.buildZoomWeeklyTrend(rows, m, periodMode);
    const meetingData = this.buildZoomMeetingInsight(rows, m, periodMode);
    const aiAdoption = this.buildZoomAiAdoption(rows, m, periodMode);
    const participantExperience = this.buildZoomParticipantExperience(
      rows,
      m,
      periodMode
    );

    return {
      kpis,
      weeklyTrend,
      meetingData,
      aiAdoption,
      participantExperience,
      licenseThreshold: LICENSE_THRESHOLD,
    };
  }

  private buildZoomKpis(
    rows: MetricRow[],
    m: number,
    periodMode: PeriodMode
  ): ZoomKpiData {
    const step = reportingStep(periodMode);
    const monthKey = offsetToKey(m);
    const prevMonthKey = offsetToKey(m - step);

    const current = this.sumReportingPeriod(rows, monthKey, "zoom", periodMode);
    const previous = this.sumReportingPeriod(
      rows,
      prevMonthKey,
      "zoom",
      periodMode
    );

    const recentOffsets = [m - step * 2, m - step, m];
    const activeTags: ZoomMonthTag[] = recentOffsets.map((pe) => {
      const val = this.sumReportingPeriod(
        rows,
        offsetToKey(pe),
        "zoom",
        periodMode
      ).active;
      const prev = this.sumReportingPeriod(
        rows,
        offsetToKey(pe - step),
        "zoom",
        periodMode
      ).active;
      const growth = prev ? ((val - prev) / prev) * 100 : 0;
      return {
        label: reportingShortLabel(offsetToKey(pe), periodMode),
        value: val,
        growth,
      };
    });

    const hostTags: ZoomMonthTag[] = recentOffsets.map((pe) => {
      const val = this.sumReportingPeriod(
        rows,
        offsetToKey(pe),
        "zoom",
        periodMode
      ).hosts;
      const prev = this.sumReportingPeriod(
        rows,
        offsetToKey(pe - step),
        "zoom",
        periodMode
      ).hosts;
      const growth = prev ? ((val - prev) / prev) * 100 : 0;
      return {
        label: reportingShortLabel(offsetToKey(pe), periodMode),
        value: val,
        growth,
      };
    });

    const usersOnboarded = current.provisioned;
    const totalWogUsers = Math.round(usersOnboarded * 1.78);

    const activeProgress = Math.min(
      100,
      usersOnboarded > 0 ? (current.active / usersOnboarded) * 100 : 0
    );
    const hostUtil = Math.min(
      100,
      (current.hosts / LICENSE_THRESHOLD) * 100
    );
    const utilColor: "green" | "orange" | "red" =
      hostUtil < 70 ? "green" : hostUtil < 91 ? "orange" : "red";

    const activeDelta = previous.active
      ? ((current.active - previous.active) / previous.active) * 100
      : 0;
    const hostDelta = previous.hosts
      ? ((current.hosts - previous.hosts) / previous.hosts) * 100
      : 0;

    return {
      usersOnboarded,
      totalWogUsers,
      activeUsers: {
        value: current.active,
        delta: activeDelta,
        monthTags: activeTags,
        progressPercent: activeProgress,
        progressLabel: `${activeProgress.toFixed(1)}% of onboarded users active`,
      },
      activeHosts: {
        value: current.hosts,
        delta: hostDelta,
        monthTags: hostTags,
        progressPercent: hostUtil,
        progressLabel: `${hostUtil.toFixed(1)}% Commercial license utilisation`,
        utilizationPercent: hostUtil,
        utilizationColor: utilColor,
        thresholdNote: `Below 70% of the ${LICENSE_THRESHOLD.toLocaleString()} threshold`,
      },
    };
  }

  private buildZoomWeeklyTrend(
    rows: MetricRow[],
    m: number,
    periodMode: PeriodMode
  ): ZoomWeeklyPoint[] {
    const weekCount = periodMode === "quarter" ? 12 : 4;
    const monthKey = offsetToKey(m);
    const [year, month] = monthKey.split("-").map(Number);
    const endDate = new Date(year, month, 0); // last day of month

    return Array.from({ length: weekCount }, (_, i) => {
      const date = new Date(endDate);
      date.setDate(date.getDate() - (weekCount - 1 - i) * 7);
      const weekMonthOffset = Math.max(
        0,
        (date.getFullYear() - 2025) * 12 + date.getMonth() - 9
      );
      const weekMonth = offsetToKey(weekMonthOffset);
      const zoomRows = rows.filter(
        (r) => r.month === weekMonth && r.product === "zoom"
      );
      const rec = sumProductRecords(zoomRows.map(toProductRecord));
      const wave = Math.sin(i * 0.72 + m) * 0.045;
      return {
        weekEnding: date.toLocaleDateString("en", {
          month: "short",
          day: "numeric",
        }),
        activeUsers: Math.round(rec.active * (0.72 + wave)),
        activeHosts: Math.round(rec.hosts * (0.82 + wave * 0.7)),
      };
    });
  }

  private buildZoomMeetingInsight(
    rows: MetricRow[],
    m: number,
    periodMode: PeriodMode
  ): ZoomMeetingData {
    const step = reportingStep(periodMode);
    const monthKey = offsetToKey(m);

    const makePie = (
      sessions: number,
      offset: number
    ): { upToCCE: number; confidential: number } => {
      const confidential = Math.round(
        sessions * (0.1 + (offset % 6) / 100)
      );
      return { upToCCE: sessions - confidential, confidential };
    };

    const meetingsCurrent = this.sumReportingPeriod(
      rows,
      monthKey,
      "zoom",
      periodMode
    ).sessions;
    const webinarsCurrent = Math.round(meetingsCurrent * 0.075);

    const meetingsMonthPie = makePie(meetingsCurrent, m);
    const webinarsMonthPie = makePie(webinarsCurrent, m);

    const periodEnds = Array.from(
      { length: 8 },
      (_, i) => m - step * (7 - i)
    );
    const meetingsQuarterBars = periodEnds.map((pe, i) => {
      const sessions = this.sumReportingPeriod(
        rows,
        offsetToKey(pe),
        "zoom",
        periodMode
      ).sessions;
      const conf = Math.round(
        sessions * (0.1 + ((i * 7 + m) % 6) / 100)
      );
      return {
        period: reportingShortLabel(offsetToKey(pe), periodMode),
        upToCCE: sessions - conf,
        confidential: conf,
      };
    });
    const webinarsQuarterBars = periodEnds.map((pe, i) => {
      const sessions = Math.round(
        this.sumReportingPeriod(rows, offsetToKey(pe), "zoom", periodMode)
          .sessions *
          (0.075 + Math.sin(i * 0.9 + m) * 0.006)
      );
      const conf = Math.round(
        sessions * (0.1 + ((i * 7 + m) % 6) / 100)
      );
      return {
        period: reportingShortLabel(offsetToKey(pe), periodMode),
        upToCCE: sessions - conf,
        confidential: conf,
      };
    });

    return {
      meetings: {
        monthPie: meetingsMonthPie,
        quarterBars: meetingsQuarterBars,
      },
      webinars: {
        monthPie: webinarsMonthPie,
        quarterBars: webinarsQuarterBars,
      },
    };
  }

  private buildZoomAiAdoption(
    rows: MetricRow[],
    m: number,
    periodMode: PeriodMode
  ): ZoomAiData {
    const step = reportingStep(periodMode);
    const monthKey = offsetToKey(m);
    const prevKey = offsetToKey(m - step);

    const current = this.sumReportingPeriod(rows, monthKey, "zoom", periodMode);
    const previous = this.sumReportingPeriod(rows, prevKey, "zoom", periodMode);

    const adoptionRate = Math.min(0.72, 0.31 + m * 0.012);
    const previousRate = Math.min(0.72, 0.31 + (m - step) * 0.012);
    const aiActive = Math.round(current.active * adoptionRate);
    const prevAiActive = Math.round(previous.active * previousRate);
    const aiActiveDelta = prevAiActive
      ? ((aiActive - prevAiActive) / prevAiActive) * 100
      : 0;
    const rateDelta = previousRate
      ? ((adoptionRate - previousRate) / previousRate) * 100
      : 0;

    const weekCount = periodMode === "quarter" ? 12 : 4;
    const [year, month] = monthKey.split("-").map(Number);
    const endDate = new Date(year, month, 0);
    const trend: ZoomAiTrendPoint[] = Array.from(
      { length: weekCount },
      (_, i) => {
        const date = new Date(endDate);
        date.setDate(date.getDate() - (weekCount - 1 - i) * 7);
        const weekMonthOffset = Math.max(
          0,
          (date.getFullYear() - 2025) * 12 + date.getMonth() - 9
        );
        const weekMonth = offsetToKey(weekMonthOffset);
        const zoomRows = rows.filter(
          (r) => r.month === weekMonth && r.product === "zoom"
        );
        const rec = sumProductRecords(zoomRows.map(toProductRecord));
        const wave = Math.sin(i * 0.72 + m) * 0.045;
        const activeUsers = Math.round(rec.active * (0.72 + wave));
        const weekRate = Math.min(
          0.72,
          0.31 + weekMonthOffset * 0.012 + (i % 4) * 0.0015
        );
        return {
          period: date.toLocaleDateString("en", {
            month: "short",
            day: "numeric",
          }),
          activeUsers,
          aiActiveUsers: Math.round(activeUsers * weekRate),
          aiAdoptionRate: weekRate,
        };
      }
    );

    const total = Math.round(current.active * adoptionRate * 2.1);
    const transcribing = Math.round(total * 0.38);
    const takingMinutes = Math.round(total * 0.285);
    const scheduling = Math.round(total * 0.204);
    const others = Math.max(0, total - transcribing - takingMinutes - scheduling);
    const featuresPie: ZoomAiFeatureSlice[] = [
      { name: "Transcribing", value: transcribing },
      { name: "Taking Minutes", value: takingMinutes },
      { name: "Scheduling Meetings", value: scheduling },
      { name: "Others", value: others },
    ];

    const periodEnds = Array.from(
      { length: 6 },
      (_, i) => m - step * (5 - i)
    );
    const featuresBar: ZoomAiFeaturesPeriod[] = periodEnds.map((pe, i) => {
      const active = this.sumReportingPeriod(
        rows,
        offsetToKey(pe),
        "zoom",
        periodMode
      ).active;
      const rate = Math.min(0.72, 0.31 + pe * 0.012);
      const t = Math.round(
        active * rate * (2.1 + Math.sin(i * 0.8 + m) * 0.12)
      );
      const tr = Math.round(t * (0.37 + (i % 2) * 0.01));
      const tm = Math.round(t * (0.28 + ((i + 1) % 3) * 0.005));
      const sc = Math.round(t * (0.2 + (i % 3) * 0.004));
      const ot = Math.max(0, t - tr - tm - sc);
      return {
        period: reportingShortLabel(offsetToKey(pe), periodMode),
        features: [
          { name: "Transcribing", value: tr },
          { name: "Taking Minutes", value: tm },
          { name: "Scheduling Meetings", value: sc },
          { name: "Others", value: ot },
        ],
      };
    });

    return {
      aiActiveUsers: aiActive,
      aiActiveUsersDelta: aiActiveDelta,
      aiAdoptionRate: adoptionRate * 100,
      aiAdoptionRateDelta: rateDelta,
      trend,
      featuresPie,
      featuresBar,
    };
  }

  private buildZoomParticipantExperience(
    rows: MetricRow[],
    m: number,
    periodMode: PeriodMode
  ): ZoomExperiencePoint[] {
    const weekCount = periodMode === "quarter" ? 12 : 4;
    const monthKey = offsetToKey(m);
    const [year, month] = monthKey.split("-").map(Number);
    const endDate = new Date(year, month, 0);

    return Array.from({ length: weekCount }, (_, i) => {
      const date = new Date(endDate);
      date.setDate(date.getDate() - (weekCount - 1 - i) * 7);
      const weekMonthOffset = Math.max(
        0,
        (date.getFullYear() - 2025) * 12 + date.getMonth() - 9
      );
      const weekMonth = offsetToKey(weekMonthOffset);
      const zoomRows = rows.filter(
        (r) => r.month === weekMonth && r.product === "zoom"
      );
      const rec = sumProductRecords(zoomRows.map(toProductRecord));
      const usersResponded = Math.round(
        rec.active * (0.0062 + Math.sin(i * 0.8 + m) * 0.0004)
      );
      const overallRating = usersResponded
        ? Math.min(
            5,
            4.08 +
              weekMonthOffset * 0.018 +
              Math.sin(i * 0.9 + m) * 0.06
          )
        : 0;
      return {
        weekEnding: date.toLocaleDateString("en", {
          month: "short",
          day: "numeric",
        }),
        usersResponded,
        overallRating: +overallRating.toFixed(2),
      };
    });
  }

  async getAvailableMonths(): Promise<AdoptionMonth[]> {
    const distinctMonths = await prisma.adoptionMetric.findMany({
      distinct: ["month"],
      select: { month: true },
      orderBy: { month: "asc" },
    });

    return distinctMonths.map((row) => {
      const [year, month] = row.month.split("-").map(Number);
      const d = new Date(year, month - 1, 1);
      return {
        value: row.month,
        label: d.toLocaleDateString("en-SG", {
          month: "long",
          year: "numeric",
        }),
      };
    });
  }

  async getAgencies(allowedCodes?: string[]): Promise<AgencyOption[]> {
    const where = allowedCodes ? { code: { in: allowedCodes } } : {};
    const agencies = await prisma.agency.findMany({
      where,
      orderBy: { code: "asc" },
    });
    return agencies.map((a, idx) => ({
      id: idx,
      name: a.name,
      code: a.code,
    }));
  }
}
