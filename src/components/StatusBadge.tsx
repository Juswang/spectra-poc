// =================================================================
// src/components/StatusBadge.tsx
// =================================================================
// A small pill-shaped badge showing service status (UP or DOWN).
// =================================================================

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const isUp = status.toUpperCase() === "UP";

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
        ${
          isUp
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }
      `}
    >
      <span
        className={`
          w-2 h-2 rounded-full mr-1.5
          ${isUp ? "bg-green-500" : "bg-red-500"}
        `}
      />
      {status.toUpperCase()}
    </span>
  );
}