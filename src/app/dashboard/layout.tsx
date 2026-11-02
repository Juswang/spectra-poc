// Dashboard shell: DashboardProvider context, sidebar, filters, tab routing.
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { DashboardProvider, useDashboard } from "@/components/adoption/DashboardContext";
import AdoptionSidebar from "@/components/adoption/AdoptionSidebar";
import AdoptionFilters from "@/components/adoption/AdoptionFilters";
import UserMenu from "@/components/adoption/UserMenu";
import LoadingSpinner from "@/components/LoadingSpinner";
import "@/styles/adoption.css";

const ENABLED_TABS = new Set(["zoom"]);

const TAB_CONFIG: Record<string, { name: string; title: string; subtitle: string }> = {
  overview: {
    name: "Executive overview",
    title: "The bigger picture.",
    subtitle: "A shared view of how government connects, collaborates and communicates.",
  },
  exchange: {
    name: "Microsoft Exchange",
    title: "Microsoft Exchange",
    subtitle: "Understand email engagement, communication volume and protection.",
  },
  teams: {
    name: "Microsoft Teams",
    title: "Microsoft Teams",
    subtitle: "Explore how agencies connect and collaborate every month.",
  },
  zoom: {
    name: "SG-Zoom",
    title: "SG-Zoom",
    subtitle: "Track hosting activity, meeting volume and participation.",
  },
};

function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const ctx = useDashboard();

  const activeTab = pathname.split("/").pop() || "zoom";
  const config = TAB_CONFIG[activeTab] || TAB_CONFIG.zoom;
  const isZoom = activeTab === "zoom";

  useEffect(() => {
    if (!ENABLED_TABS.has(activeTab)) {
      router.replace("/dashboard/zoom");
    }
  }, [activeTab, router]);

  const handleTabChange = useCallback(
    (tab: string) => router.push(`/dashboard/${tab}`),
    [router]
  );

  const currentMonthLabel = ctx.months.find((m) => m.value === ctx.month)?.label || ctx.month;
  const contextLabel = `${currentMonthLabel} · ${ctx.selectedAgencies.length} ${ctx.selectedAgencies.length === 1 ? "agency" : "agencies"} selected`;

  if (ctx.filtersLoading) {
    return (
      <div className="spectra-adoption">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={`spectra-adoption${isZoom ? " sa-zoom-view" : ""}`}>
      <div className="sa-prototype">
        INTERACTIVE PROTOTYPE · Synthetic sample data · Not an official government service
      </div>

      <div className="sa-header">
        <a className="sa-brand" href="#">
          <span className="sa-spectra-mark">S</span>
          <span>
            <strong className="sa-spectra-name">Spectra</strong>
            <br />
            <span className="sa-brand-tagline">Digital Workplace Intelligence</span>
          </span>
        </a>
        <div className="sa-header-actions">
          <img
            className="sa-govtech-logo"
            src="/powered-by-govtech.webp"
            alt="Powered by GovTech Singapore"
            width={1200}
            height={258}
          />
          <div className="sa-account-controls">
            <UserMenu />
          </div>
        </div>
      </div>

      <div className="sa-shell">
        <AdoptionSidebar activeTab={activeTab} onTabChange={handleTabChange} />

        <div className="sa-main">
          <div className="sa-breadcrumb">
            Digital workplace <span>/</span> <span>{config.name}</span>
          </div>

          <div className="sa-title-row">
            <div>
              <div className="sa-eyebrow">PRODUCT PERFORMANCE</div>
              <h1 className="sa-title">{config.title}</h1>
              <p className="sa-subtitle">{config.subtitle}</p>
            </div>
            <button className="sa-export">↓ &nbsp; Download CSV</button>
          </div>

          <AdoptionFilters
            month={ctx.month}
            onMonthChange={ctx.setMonth}
            availableMonths={ctx.months}
            selectedAgencies={ctx.selectedAgencies}
            allAgencies={ctx.allAgencies}
            onToggleAgency={ctx.toggleAgency}
            onSelectAll={ctx.selectAllAgencies}
            onClearAll={ctx.clearAllAgencies}
            onReset={ctx.resetFilters}
            contextLabel={contextLabel}
            periodMode={isZoom ? ctx.periodMode : undefined}
            onPeriodModeChange={isZoom ? ctx.setPeriodMode : undefined}
          />

          {children}

          <footer className="sa-footer">
            Illustrative data only. No live government or Microsoft / Zoom data is connected.
            <span>Spectra · Product Performance · Prototype v1.1</span>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <DashboardShell>{children}</DashboardShell>
    </DashboardProvider>
  );
}
