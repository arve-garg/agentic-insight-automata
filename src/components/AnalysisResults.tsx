import { AnalysisResult, CleaningResult } from '@/agents/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

interface AnalysisResultsProps {
  analysis: AnalysisResult;
  cleaning: CleaningResult;
}

export function AnalysisResults({ analysis, cleaning }: AnalysisResultsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Summary Statistics</CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Column</TableHead>
                <TableHead className="text-xs">Mean</TableHead>
                <TableHead className="text-xs">Median</TableHead>
                <TableHead className="text-xs">Std</TableHead>
                <TableHead className="text-xs">Min</TableHead>
                <TableHead className="text-xs">Max</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analysis.statistics.map((s) => (
                <TableRow key={s.column}>
                  <TableCell className="text-xs font-medium">{s.column}</TableCell>
                  <TableCell className="text-xs">{s.mean}</TableCell>
                  <TableCell className="text-xs">{s.median}</TableCell>
                  <TableCell className="text-xs">{s.std}</TableCell>
                  <TableCell className="text-xs">{s.min}</TableCell>
                  <TableCell className="text-xs">{s.max}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Data Cleaning Report</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p>Original rows: <span className="font-medium">{cleaning.originalRowCount}</span></p>
            <p>Rows removed: <span className="font-medium text-destructive">{cleaning.rowsRemoved}</span></p>
            <p>Values imputed: <span className="font-medium text-warning">{cleaning.valuesFilled}</span></p>
            <p>Final rows: <span className="font-medium text-success">{cleaning.cleanedData.length}</span></p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Missing Values</CardTitle>
          </CardHeader>
          <CardContent className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Column</TableHead>
                  <TableHead className="text-xs">Missing</TableHead>
                  <TableHead className="text-xs">%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analysis.missingReport
                  .filter((r) => r.missing > 0)
                  .map((r) => (
                    <TableRow key={r.column}>
                      <TableCell className="text-xs">{r.column}</TableCell>
                      <TableCell className="text-xs">{r.missing}</TableCell>
                      <TableCell className="text-xs">{r.percent}%</TableCell>
                    </TableRow>
                  ))}
                {analysis.missingReport.every((r) => r.missing === 0) && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-xs text-muted-foreground text-center">
                      No missing values
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
