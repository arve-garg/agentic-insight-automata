import { Insight } from '@/agents/types';
import { Card, CardContent } from '@/components/ui/card';
import { Database, BarChart3, ShieldCheck, Lightbulb } from 'lucide-react';

const ICONS = {
  dataset: Database,
  features: BarChart3,
  quality: ShieldCheck,
  observation: Lightbulb,
};

interface InsightCardsProps {
  insights: Insight[];
}

export function InsightCards({ insights }: InsightCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {insights.map((insight, i) => {
        const Icon = ICONS[insight.icon];
        return (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">{insight.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{insight.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
