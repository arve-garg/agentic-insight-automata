import { ColumnInfo, AnalysisResult, CleaningResult, InsightResult, Insight } from './types';

export async function runInsightGenerationAgent(
  columns: ColumnInfo[],
  cleaning: CleaningResult,
  analysis: AnalysisResult
): Promise<InsightResult> {
  const insights: Insight[] = [];
  const numericCols = columns.filter((c) => c.type === 'numeric');
  const categoricalCols = columns.filter((c) => c.type === 'categorical');

  // Dataset overview
  insights.push({
    title: 'Dataset Overview',
    description: `The dataset contains ${cleaning.cleanedData.length} rows and ${columns.length} columns after cleaning (${cleaning.rowsRemoved} rows removed, ${cleaning.valuesFilled} missing values imputed).`,
    icon: 'dataset',
  });

  // Feature breakdown
  insights.push({
    title: 'Feature Breakdown',
    description: `Found ${numericCols.length} numeric feature${numericCols.length !== 1 ? 's' : ''} (${numericCols.map((c) => c.name).join(', ')}) and ${categoricalCols.length} categorical feature${categoricalCols.length !== 1 ? 's' : ''}.`,
    icon: 'features',
  });

  // Data quality
  const totalMissing = analysis.missingReport.reduce((s, r) => s + r.missing, 0);
  const totalCells = cleaning.originalRowCount * columns.length;
  const missingPct = ((totalMissing / totalCells) * 100).toFixed(1);
  insights.push({
    title: 'Data Quality',
    description: totalMissing === 0
      ? 'Excellent data quality — no missing values detected in the original dataset.'
      : `${totalMissing} missing values detected (${missingPct}% of all data cells). All have been imputed during cleaning.`,
    icon: 'quality',
  });

  // Skewed distributions
  const skewed = analysis.statistics.filter((s) => Math.abs(s.skewness) > 1);
  if (skewed.length > 0) {
    insights.push({
      title: 'Skewed Distributions',
      description: `${skewed.length} column${skewed.length > 1 ? 's' : ''} show${skewed.length === 1 ? 's' : ''} significant skewness: ${skewed.map((s) => `${s.column} (${s.skewness > 0 ? 'right' : 'left'}-skewed, ${s.skewness})`).join(', ')}. Consider log-transformation for modelling.`,
      icon: 'observation',
    });
  }

  // Strong correlations
  const strong = analysis.correlations.filter((c) => Math.abs(c.value) > 0.5);
  if (strong.length > 0) {
    insights.push({
      title: 'Notable Correlations',
      description: `${strong.length} strong correlation${strong.length > 1 ? 's' : ''} found: ${strong.slice(0, 3).map((c) => `${c.col1} ↔ ${c.col2} (${c.value})`).join(', ')}.`,
      icon: 'observation',
    });
  }

  // Outlier detection (IQR method)
  const outlierCols = analysis.statistics.filter((s) => {
    const iqr = s.q3 - s.q1;
    return s.min < s.q1 - 1.5 * iqr || s.max > s.q3 + 1.5 * iqr;
  });
  if (outlierCols.length > 0) {
    insights.push({
      title: 'Potential Outliers',
      description: `${outlierCols.length} column${outlierCols.length > 1 ? 's' : ''} may contain outliers based on IQR analysis: ${outlierCols.map((c) => c.column).join(', ')}.`,
      icon: 'observation',
    });
  }

  return { insights };
}
