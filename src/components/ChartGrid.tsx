import { ChartConfig as AgentChartConfig } from '@/agents/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

interface ChartGridProps {
  charts: AgentChartConfig[];
}

export function ChartGrid({ charts }: ChartGridProps) {
  if (!charts.length) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {charts.map((chart, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{chart.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chart.data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  className="fill-muted-foreground"
                  angle={-30}
                  textAnchor="end"
                  height={50}
                />
                <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="value" fill={chart.color} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
