import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Brain, Lightbulb } from 'lucide-react';

interface AIInsightPanelProps {
  title?: string;
  insights: string[];
}

export function AIInsightPanel({ title = 'AI Recommendations', insights }: AIInsightPanelProps) {
  return (
    <Card className="bg-accent/30 border-accent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Brain className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight, idx) => (
          <div key={idx} className="flex gap-3">
            <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-foreground">{insight}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
