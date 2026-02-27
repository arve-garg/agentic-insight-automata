import { AgentStatus, PipelineState } from './types';
import { runDataLoaderAgent } from './DataLoaderAgent';
import { runDataCleaningAgent } from './DataCleaningAgent';
import { runAnalysisAgent } from './AnalysisAgent';
import { runVisualizationAgent } from './VisualizationAgent';
import { runInsightGenerationAgent } from './InsightGenerationAgent';

const INITIAL_AGENTS: AgentStatus[] = [
  { name: 'loader', label: 'Data Loader', status: 'pending' },
  { name: 'cleaner', label: 'Data Cleaning', status: 'pending' },
  { name: 'analysis', label: 'Analysis', status: 'pending' },
  { name: 'visualization', label: 'Visualization', status: 'pending' },
  { name: 'insights', label: 'Insight Generation', status: 'pending' },
];

export function getInitialPipelineState(): PipelineState {
  return { agents: INITIAL_AGENTS.map((a) => ({ ...a })) };
}

type OnUpdate = (state: PipelineState) => void;

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function runPipeline(file: File, onUpdate: OnUpdate): Promise<PipelineState> {
  const state: PipelineState = getInitialPipelineState();

  const setAgent = (idx: number, patch: Partial<AgentStatus>) => {
    state.agents[idx] = { ...state.agents[idx], ...patch };
    onUpdate({ ...state, agents: [...state.agents] });
  };

  try {
    // 1. Data Loader
    setAgent(0, { status: 'running' });
    await delay(400);
    const loaderResult = await runDataLoaderAgent(file);
    state.loaderResult = loaderResult;
    setAgent(0, { status: 'done', log: `Loaded ${loaderResult.rowCount} rows, ${loaderResult.columnCount} columns` });

    // 2. Data Cleaning
    setAgent(1, { status: 'running' });
    await delay(300);
    const cleaningResult = await runDataCleaningAgent(loaderResult.rawData, loaderResult.headers);
    state.cleaningResult = cleaningResult;
    setAgent(1, { status: 'done', log: `Removed ${cleaningResult.rowsRemoved} rows, filled ${cleaningResult.valuesFilled} values` });

    // 3. Analysis
    setAgent(2, { status: 'running' });
    await delay(300);
    const analysisResult = await runAnalysisAgent(cleaningResult.cleanedData, cleaningResult.columns);
    state.analysisResult = analysisResult;
    setAgent(2, { status: 'done', log: `Computed stats for ${analysisResult.statistics.length} numeric columns` });

    // 4. Visualization
    setAgent(3, { status: 'running' });
    await delay(300);
    const visualizationResult = await runVisualizationAgent(cleaningResult.cleanedData, cleaningResult.columns);
    state.visualizationResult = visualizationResult;
    setAgent(3, { status: 'done', log: `Generated ${visualizationResult.charts.length} charts` });

    // 5. Insights
    setAgent(4, { status: 'running' });
    await delay(300);
    const insightResult = await runInsightGenerationAgent(cleaningResult.columns, cleaningResult, analysisResult);
    state.insightResult = insightResult;
    setAgent(4, { status: 'done', log: `Generated ${insightResult.insights.length} insights` });
  } catch (err: unknown) {
    const currentIdx = state.agents.findIndex((a) => a.status === 'running');
    if (currentIdx >= 0) {
      setAgent(currentIdx, { status: 'error', log: err instanceof Error ? err.message : 'Unknown error' });
    }
  }

  return state;
}
