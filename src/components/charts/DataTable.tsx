// Generic sortable, paginated data table.
"use client";

import { useState, useMemo } from "react";

export interface DataTableColumn<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  sortValue?: (row: T) => number;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string | number;
  pageSize?: number;
  defaultSortKey?: string;
  defaultSortDesc?: boolean;
  emptyMessage?: string;
}

export default function DataTable<T>({
  columns,
  rows,
  rowKey,
  pageSize = 8,
  defaultSortKey,
  defaultSortDesc = true,
  emptyMessage = "No data available.",
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState(defaultSortKey ?? columns[0]?.key ?? "");
  const [sortDesc, setSortDesc] = useState(defaultSortDesc);
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return rows;
    return [...rows].sort((a, b) => {
      const diff = sortDesc
        ? col.sortValue!(b) - col.sortValue!(a)
        : col.sortValue!(a) - col.sortValue!(b);
      return diff;
    });
  }, [rows, columns, sortKey, sortDesc]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const pageRows = sorted.slice(safePage * pageSize, (safePage + 1) * pageSize);

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDesc(!sortDesc);
    } else {
      setSortKey(key);
      setSortDesc(true);
    }
    setPage(0);
  }

  return (
    <>
      <div className="sa-table-scroll">
        <table>
          <thead>
            <tr>
              <th>#</th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  aria-sort={sortKey === col.key ? (sortDesc ? "descending" : "ascending") : "none"}
                >
                  <button onClick={() => handleSort(col.key)}>
                    {col.label} {sortKey === col.key ? (sortDesc ? "↓" : "↑") : ""}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length > 0 ? (
              pageRows.map((row, i) => (
                <tr key={rowKey(row, safePage * pageSize + i)}>
                  <td>{safePage * pageSize + i + 1}</td>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1}>{emptyMessage}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="sa-table-footer">
        <span>
          {sorted.length > 0
            ? `Showing ${safePage * pageSize + 1}–${Math.min((safePage + 1) * pageSize, sorted.length)} of ${sorted.length}`
            : "0 items"}
        </span>
        <div>
          <button disabled={safePage === 0} onClick={() => setPage(safePage - 1)} aria-label="Previous page">←</button>
          <span>{safePage + 1} / {totalPages}</span>
          <button disabled={(safePage + 1) * pageSize >= sorted.length} onClick={() => setPage(safePage + 1)} aria-label="Next page">→</button>
        </div>
      </div>
    </>
  );
}
