import { AGENTS } from '../agents/agentConfig';
import AgentCard from './AgentCard';
import type { PipelineState } from '../types';

interface Props {
  state: PipelineState;
  activeAgentId: string | null;
}

export default function PipelineView({ state, activeAgentId }: Props) {
  return (
    <div className="flex flex-col gap-2">
      {AGENTS.map((agent, index) => (
        <AgentCard
          key={agent.id}
          agent={agent}
          result={state.results[agent.id]}
          isActive={activeAgentId === agent.id}
          index={index}
        />
      ))}
    </div>
  );
}
