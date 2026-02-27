import { CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react';
import { AgentStatus } from '@/agents/types';

interface AgentPipelineProps {
  agents: AgentStatus[];
}

export function AgentPipeline({ agents }: AgentPipelineProps) {
  return (
    <div className="flex flex-col gap-2">
      {agents.map((agent, i) => (
        <div key={agent.name} className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8">
            {agent.status === 'done' && <CheckCircle2 className="h-6 w-6 text-success" />}
            {agent.status === 'running' && <Loader2 className="h-6 w-6 text-primary animate-spin" />}
            {agent.status === 'error' && <XCircle className="h-6 w-6 text-destructive" />}
            {agent.status === 'pending' && <Circle className="h-6 w-6 text-muted-foreground/40" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${agent.status === 'running' ? 'text-primary' : agent.status === 'done' ? 'text-foreground' : 'text-muted-foreground'}`}>
                {agent.label}
              </span>
              {i < agents.length - 1 && agent.status === 'done' && (
                <span className="text-xs text-muted-foreground">→</span>
              )}
            </div>
            {agent.log && (
              <p className="text-xs text-muted-foreground truncate">{agent.log}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
