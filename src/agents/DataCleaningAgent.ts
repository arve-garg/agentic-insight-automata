import { DatasetRow, ColumnInfo, CleaningResult } from './types';

function isNumeric(val: unknown): boolean {
  if (val === null || val === undefined || val === '') return false;
  return !isNaN(Number(val));
}

export async function runDataCleaningAgent(
  rawData: DatasetRow[],
  headers: string[]
): Promise<CleaningResult> {
  // Determine column types
  const columns: ColumnInfo[] = headers.map((name) => {
    let numericCount = 0;
    let missingCount = 0;
    const uniqueVals = new Set<string>();

    rawData.forEach((row) => {
      const val = row[name];
      if (val === null || val === undefined || val === '') {
        missingCount++;
      } else {
        uniqueVals.add(String(val));
        if (isNumeric(val)) numericCount++;
      }
    });

    const nonMissing = rawData.length - missingCount;
    const type = nonMissing > 0 && numericCount / nonMissing > 0.7 ? 'numeric' : 'categorical';

    return { name, type, missingCount, uniqueCount: uniqueVals.size };
  });

  // Clean data: remove fully empty rows, fill missing values
  let valuesFilled = 0;
  const numericMedians: Record<string, number> = {};

  // Pre-compute medians for numeric columns
  columns.filter((c) => c.type === 'numeric').forEach((col) => {
    const vals = rawData
      .map((r) => r[col.name])
      .filter((v) => v !== null && v !== undefined && v !== '' && !isNaN(Number(v)))
      .map(Number)
      .sort((a, b) => a - b);
    numericMedians[col.name] = vals.length ? vals[Math.floor(vals.length / 2)] : 0;
  });

  const cleanedData = rawData
    .filter((row) => {
      // Remove rows where ALL values are empty
      return headers.some((h) => row[h] !== null && row[h] !== undefined && row[h] !== '');
    })
    .map((row) => {
      const newRow = { ...row };
      columns.forEach((col) => {
        if (newRow[col.name] === null || newRow[col.name] === undefined || newRow[col.name] === '') {
          if (col.type === 'numeric') {
            newRow[col.name] = numericMedians[col.name];
          } else {
            newRow[col.name] = 'Unknown';
          }
          valuesFilled++;
        } else if (col.type === 'numeric') {
          newRow[col.name] = Number(newRow[col.name]);
        }
      });
      return newRow;
    });

  return {
    cleanedData,
    columns,
    rowsRemoved: rawData.length - cleanedData.length,
    valuesFilled,
    originalRowCount: rawData.length,
  };
}
