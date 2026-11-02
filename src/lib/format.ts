// Number formatting: compact ("1.2K") and full ("1,234") display helpers.
export const compact = (n: number) =>
  Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);

export const full = (n: number) => Math.round(n).toLocaleString("en");
