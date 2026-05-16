import { useState } from 'react';
import type { AgentConfig } from '../agents/agentConfig';
import type { AgentResult } from '../types';

interface Props {
  agent: AgentConfig;
  result?: AgentResult;
  isActive: boolean;
  index: number;
}

const statusStyles: Record<string, string> = {
  idle: 'border-slate-700 bg-slate-800/40',
  thinking: 'border-violet-500/60 bg-violet-950/30 shadow-violet-900/30 shadow-md',
  approve: 'border-emerald-600/60 bg-emerald-950/20',
  needs_review: 'border-amber-500/60 bg-amber-950/20',
  block: 'border-red-600/60 bg-red-950/20',
  error: 'border-red-800/60 bg-red-950/30',
};

const verdictBadge: Record<string, { label: string; cls: string }> = {
  approve: { label: '✓ Approve', cls: 'bg-emerald-900/60 text-emerald-300 border border-emerald-700' },
  needs_review: { label: '⚠ Review', cls: 'bg-amber-900/60 text-amber-300 border border-amber-700' },
  block: { label: '⛔ Block', cls: 'bg-red-900/60 text-red-300 border border-red-700' },
  error: { label: '✗ Error', cls: 'bg-red-900/60 text-red-400 border border-red-800' },
};

export default function AgentCard({ agent, result, isActive, index }: Props) {
  const [expanded, setExpanded] = useState(false);
  const status = result?.status ?? (isActive ? 'thinking' : 'idle');
  const badge = verdictBadge[status];
  const isMerge = agent.id === 'merge';

  return (
    <div
      className={`rounded-xl border transition-all duration-300 ${statusStyles[status]} ${isMerge ? 'ring-1 ring-slate-600' : ''}`}
    >
      <div
        className={`flex items-center gap-3 px-4 py-3 ${result?.output ? 'cursor-pointer select-none' : ''}`}
        onClick={() => result?.output && setExpanded((v) => !v)}
      >
        {/* Step number */}
        <span className={`text-xs font-mono w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${status === 'idle' ? 'bg-slate-700 text-slate-500' : 'bg-slate-700 text-slate-300'}`}>
          {index + 1}
        </span>

        {/* Icon */}
        <span className="text-lg flex-shrink-0">{agent.icon}</span>

        {/* Name + role */}
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-semibold ${isMerge ? 'text-violet-300' : 'text-slate-100'}`}>
            {agent.name}
          </div>
          <div className="text-xs text-slate-500 truncate">{agent.role}</div>
        </div>

        {/* Status area */}
        {status === 'thinking' ? (
          <span className="flex gap-1 items-center px-2 py-1">
            <span className="thinking-dot w-1.5 h-1.5 bg-violet-400 rounded-full" />
            <span className="thinking-dot w-1.5 h-1.5 bg-violet-400 rounded-full" />
            <span className="thinking-dot w-1.5 h-1.5 bg-violet-400 rounded-full" />
          </span>
        ) : badge ? (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge.cls}`}>
            {badge.label}
          </span>
        ) : null}

        {/* Expand toggle */}
        {result?.output && (
          <span className="text-slate-600 text-xs ml-1">{expanded ? '▲' : '▼'}</span>
        )}
      </div>

      {/* Expanded output */}
      {expanded && result?.output && (
        <div className="slide-in border-t border-slate-700/50 px-4 py-3">
          <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
            {result.output}
          </pre>
        </div>
      )}
    </div>
  );
}
