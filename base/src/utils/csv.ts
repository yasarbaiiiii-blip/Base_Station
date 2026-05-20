export function toCSV<T extends object>(
  data: T[],
  headers?: Record<keyof T, string>
): string {
  if (!data.length) return "";

  const keys = Object.keys(data[0]) as (keyof T)[];
  const headerRow = keys.map(k => headers?.[k] ?? String(k)).join(",");

  const rows = data.map(row =>
    keys.map(k => JSON.stringify(row[k] ?? "")).join(",")
  );

  return [headerRow, ...rows].join("\n");
}

