/**
 * utils/exportCsv.ts
 * Browser-side CSV generator and trigger download utility.
 */

export const exportToCsv = <T>(
  filename: string,
  rows: T[],
  columns: { key: keyof T | string; label: string; format?: (val: unknown, row: T) => string }[]
): void => {
  if (!rows || !rows.length) return;

  const header = columns.map((col) => `"${col.label.replace(/"/g, '""')}"`).join(',');

  const body = rows
    .map((row) =>
      columns
        .map((col) => {
          const rawVal = (row as Record<string, unknown>)[col.key as string];
          const formatted = col.format ? col.format(rawVal, row) : rawVal != null ? String(rawVal) : '';
          return `"${formatted.replace(/"/g, '""')}"`;
        })
        .join(',')
    )
    .join('\r\n');

  const csvContent = `${header}\r\n${body}`;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
