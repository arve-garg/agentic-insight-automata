import { DatasetRow, ColumnInfo, VisualizationResult, ChartConfig } from './types';

const COLORS = [
  'hsl(221, 83%, 53%)', 'hsl(262, 83%, 58%)', 'hsl(142, 71%, 45%)',
  'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)', 'hsl(199, 89%, 48%)',
];

function buildHistogram(data: DatasetRow[], col: string, color: string): ChartConfig {
  const vals = data.map((r) => Number(r[col])).filter((v) => !isNaN(v));
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const binCount = Math.min(15, Math.max(5, Math.ceil(Math.sqrt(vals.length))));
  const binWidth = (max - min) / binCount || 1;

  const bins: { name: string; value: number }[] = [];
  for (let i = 0; i < binCount; i++) {
    const lo = min + i * binWidth;
    const hi = lo + binWidth;
    const label = `${lo.toFixed(1)}`;
    const count = vals.filter((v) => (i === binCount - 1 ? v >= lo && v <= hi : v >= lo && v < hi)).length;
    bins.push({ name: label, value: count });
  }

  return { type: 'histogram', title: `Distribution of ${col}`, dataKey: col, data: bins, color };
}

function buildBarChart(data: DatasetRow[], col: string, color: string): ChartConfig {
  const counts: Record<string, number> = {};
  data.forEach((r) => {
    const val = String(r[col] ?? 'Unknown');
    counts[val] = (counts[val] || 0) + 1;
  });

  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return {
    type: 'bar',
    title: `Top values of ${col}`,
    dataKey: col,
    data: sorted.map(([name, value]) => ({ name, value })),
    color,
  };
}

export async function runVisualizationAgent(
  data: DatasetRow[],
  columns: ColumnInfo[]
): Promise<VisualizationResult> {
  const charts: ChartConfig[] = [];
  let colorIdx = 0;

  // Histograms for numeric columns (max 4)
  columns
    .filter((c) => c.type === 'numeric')
    .slice(0, 4)
    .forEach((col) => {
      charts.push(buildHistogram(data, col.name, COLORS[colorIdx % COLORS.length]));
      colorIdx++;
    });

  // Bar charts for categorical columns (max 3)
  columns
    .filter((c) => c.type === 'categorical' && c.uniqueCount > 1 && c.uniqueCount <= 50)
    .slice(0, 3)
    .forEach((col) => {
      charts.push(buildBarChart(data, col.name, COLORS[colorIdx % COLORS.length]));
      colorIdx++;
    });

  return { charts };
}
