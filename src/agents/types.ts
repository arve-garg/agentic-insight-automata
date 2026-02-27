export interface DatasetRow {
  [key: string]: string | number | null;
}

export interface ColumnInfo {
  name: string;
  type: 'numeric' | 'categorical' | 'unknown';
  missingCount: number;
  uniqueCount: number;
}

export interface LoaderResult {
  rawData: DatasetRow[];
  headers: string[];
  rowCount: number;
  columnCount: number;
}

export interface CleaningResult {
  cleanedData: DatasetRow[];
  columns: ColumnInfo[];
  rowsRemoved: number;
  valuesFilled: number;
  originalRowCount: number;
}

export interface ColumnStats {
  column: string;
  mean: number;
  median: number;
  std: number;
  min: number;
  max: number;
  q1: number;
  q3: number;
  skewness: number;
}

export interface AnalysisResult {
  statistics: ColumnStats[];
  correlations: { col1: string; col2: string; value: number }[];
  missingReport: { column: string; missing: number; percent: number }[];
}

export interface ChartConfig {
  type: 'histogram' | 'bar';
  title: string;
  dataKey: string;
  data: { name: string; value: number }[];
  color: string;
}

export interface VisualizationResult {
  charts: ChartConfig[];
}

export interface Insight {
  title: string;
  description: string;
  icon: 'dataset' | 'features' | 'quality' | 'observation';
}

export interface InsightResult {
  insights: Insight[];
}

export type AgentName = 'loader' | 'cleaner' | 'analysis' | 'visualization' | 'insights';

export interface AgentStatus {
  name: AgentName;
  label: string;
  status: 'pending' | 'running' | 'done' | 'error';
  log?: string;
}

export interface PipelineState {
  agents: AgentStatus[];
  loaderResult?: LoaderResult;
  cleaningResult?: CleaningResult;
  analysisResult?: AnalysisResult;
  visualizationResult?: VisualizationResult;
  insightResult?: InsightResult;
}
