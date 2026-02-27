import { useState, useCallback } from 'react';
import { Brain, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileUpload } from '@/components/FileUpload';
import { AgentPipeline } from '@/components/AgentPipeline';
import { DataPreview } from '@/components/DataPreview';
import { AnalysisResults } from '@/components/AnalysisResults';
import { ChartGrid } from '@/components/ChartGrid';
import { InsightCards } from '@/components/InsightCards';
import { PipelineState } from '@/agents/types';
import { getInitialPipelineState, runPipeline } from '@/agents/ControllerAgent';

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [running, setRunning] = useState(false);
  const [pipeline, setPipeline] = useState<PipelineState>(getInitialPipelineState());
  const [hasRun, setHasRun] = useState(false);

  const handleRun = useCallback(async () => {
    if (!file) return;
    setRunning(true);
    setHasRun(false);
    setPipeline(getInitialPipelineState());

    const result = await runPipeline(file, (state) => {
      setPipeline({ ...state });
    });

    setPipeline(result);
    setRunning(false);
    setHasRun(true);
  }, [file]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary p-2.5">
              <Brain className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Agentic AI Data Analysis
              </h1>
              <p className="text-sm text-muted-foreground">
                Autonomous multi-agent pipeline for CSV dataset analysis
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Upload & Control */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Upload Dataset</h2>
            <FileUpload onFileSelected={setFile} disabled={running} />
            <Button
              size="lg"
              className="w-full gap-2"
              disabled={!file || running}
              onClick={handleRun}
            >
              <Play className="h-4 w-4" />
              {running ? 'Running Analysis…' : 'Run Agentic AI Analysis'}
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">Agent Pipeline</h2>
              {running && <Badge variant="secondary" className="animate-pulse">Running</Badge>}
              {hasRun && !running && <Badge className="bg-success text-success-foreground">Complete</Badge>}
            </div>
            <Card>
              <CardContent className="pt-6">
                <AgentPipeline agents={pipeline.agents} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dataset Preview */}
        {pipeline.loaderResult && (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-foreground">Dataset Preview</h2>
              <Badge variant="outline">
                {pipeline.loaderResult.rowCount} rows × {pipeline.loaderResult.columnCount} cols
              </Badge>
            </div>
            <DataPreview
              data={pipeline.loaderResult.rawData}
              headers={pipeline.loaderResult.headers}
            />
          </section>
        )}

        {/* Analysis Results */}
        {pipeline.analysisResult && pipeline.cleaningResult && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Analysis Results</h2>
            <AnalysisResults
              analysis={pipeline.analysisResult}
              cleaning={pipeline.cleaningResult}
            />
          </section>
        )}

        {/* Visualizations */}
        {pipeline.visualizationResult && pipeline.visualizationResult.charts.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Visualizations</h2>
            <ChartGrid charts={pipeline.visualizationResult.charts} />
          </section>
        )}

        {/* Insights */}
        {pipeline.insightResult && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">AI-Generated Insights</h2>
            <InsightCards insights={pipeline.insightResult.insights} />
          </section>
        )}
      </main>
    </div>
  );
};

export default Index;
