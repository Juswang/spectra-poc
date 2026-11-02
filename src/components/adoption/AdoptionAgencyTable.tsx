// Sortable paginated table of per-agency adoption metrics.
"use client";

import type { AgencyAdoptionRow } from "@/types/adoption";
import { full } from "@/lib/format";
import { DataTable, type DataTableColumn } from "@/components/charts";
import { DeltaBadge } from "./DeltaBadge";

interface AdoptionAgencyTableProps {
  agencies: AgencyAdoptionRow[];
}

const columns: DataTableColumn<AgencyAdoptionRow>[] = [
  {
    key: "agencyName",
    label: "Agency",
    sortValue: (row) => row.active,
    render: (row) => (
      <>
        <strong>{row.agencyName}</strong>
        <div className="sa-agency-code">{row.agencyCode}</div>
      </>
    ),
  },
  {
    key: "active",
    label: "Active accounts",
    sortValue: (row) => row.active,
    render: (row) => full(row.active),
  },
  {
    key: "sessions",
    label: "Meetings & calls",
    sortValue: (row) => row.sessions,
    render: (row) => full(row.sessions),
  },
  {
    key: "adoption",
    label: "Adoption %",
    sortValue: (row) => row.adoption,
    render: (row) => (
      <div className="sa-adoption">
        {row.adoption.toFixed(1)}%
        <span className="sa-bar">
          <span className="sa-bar-fill" style={{ width: `${Math.min(100, row.adoption)}%` }} />
        </span>
      </div>
    ),
  },
  {
    key: "activeDelta",
    label: "MoM active",
    sortValue: (row) => row.activeDelta,
    render: (row) =>
      row.activeDelta === 0 ? (
        <span className="sa-delta sa-neutral">—</span>
      ) : (
        <DeltaBadge value={row.activeDelta} />
      ),
  },
];

export default function AdoptionAgencyTable({ agencies }: AdoptionAgencyTableProps) {
  return (
    <section className="sa-panel sa-comparison">
      <div className="sa-panel-head">
        <div>
          <h2 className="sa-panel-title">Agency performance</h2>
          <p className="sa-panel-desc">Compare adoption and activity across your selected agencies.</p>
        </div>
      </div>
      <DataTable
        columns={columns}
        rows={agencies}
        rowKey={(row) => row.agencyId}
        pageSize={8}
        defaultSortKey="active"
        defaultSortDesc
        emptyMessage="No agencies selected. Use the agency filter to display results."
      />
    </section>
  );
}
