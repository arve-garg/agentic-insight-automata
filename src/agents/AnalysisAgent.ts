import { DatasetRow, ColumnInfo, ColumnStats, AnalysisResult } from './types';

function median(arr: number[]): number {
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function stdDev(arr: number[], mean: number): number {
  const variance = arr.reduce((sum, v) => sum + (v - mean) ** 2, 0) / arr.length;
  return Math.sqrt(variance);
}

function skewness(arr: number[], mean: number, std: number): number {
  if (std === 0) return 0;
  const n = arr.length;
  const m3 = arr.reduce((sum, v) => sum + ((v - mean) / std) ** 3, 0) / n;
  return m3;
}

function pearson(x: number[], y: number[]): number {
  const n = x.length;
  if (n === 0) return 0;
  const mx = x.reduce((a, b) => a + b, 0) / n;
  const my = y.reduce((a, b) => a + b, 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) {
    num += (x[i] - mx) * (y[i] - my);
    dx += (x[i] - mx) ** 2;
    dy += (y[i] - my) ** 2;
  }
  const denom = Math.sqrt(dx * dy);
  return denom === 0 ? 0 : num / denom;
}

export async function runAnalysisAgent(
  data: DatasetRow[],
  columns: ColumnInfo[]
): Promise<AnalysisResult> {
  const numericCols = columns.filter((c) => c.type === 'numeric');

  const statistics: ColumnStats[] = numericCols.map((col) => {
    const vals = data.map((r) => Number(r[col.name])).filter((v) => !isNaN(v));
    const sorted = [...vals].sort((a, b) => a - b);
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const med = median(vals);
    const std = stdDev(vals, mean);
    const sk = skewness(vals, mean, std);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];

    return {
      column: col.name,
      mean: +mean.toFixed(2),
      median: +med.toFixed(2),
      std: +std.toFixed(2),
      min: sorted[0],
      max: sorted[sorted.length - 1],
      q1: +q1.toFixed(2),
      q3: +q3.toFixed(2),
      skewness: +sk.toFixed(2),
    };
  });

  // Correlations (top pairs)
  const correlations: { col1: string; col2: string; value: number }[] = [];
  for (let i = 0; i < numericCols.length; i++) {
    for (let j = i + 1; j < numericCols.length; j++) {
      const x = data.map((r) => Number(r[numericCols[i].name]));
      const y = data.map((r) => Number(r[numericCols[j].name]));
      const corr = pearson(x, y);
      if (!isNaN(corr)) {
        correlations.push({ col1: numericCols[i].name, col2: numericCols[j].name, value: +corr.toFixed(3) });
      }
    }
  }
  correlations.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  const missingReport = columns.map((col) => ({
    column: col.name,
    missing: col.missingCount,
    percent: +((col.missingCount / data.length) * 100).toFixed(1),
  }));

  return { statistics, correlations: correlations.slice(0, 10), missingReport };
}
