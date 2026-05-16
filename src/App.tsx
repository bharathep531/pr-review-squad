import { useState, useRef } from 'react';
import type { PipelineState, Verdict, AgentStatus } from './types';
import { runPipeline } from './agents/runPipeline';
import PRInputForm from './components/PRInputForm';
import PipelineView from './components/PipelineView';
import VerdictBanner from './components/VerdictBanner';
import './index.css';

const INITIAL_STATE: PipelineState = {
  running: false,
  results: {},
};

export function parseFinalVerdict(output: string): Verdict {
  const match = output.match(/FINAL VERDICT:\s*(.+)/i);
  if (!match) return 'CHANGES REQUESTED';
  const v = match[1].trim().toUpperCase();
  if (v === 'APPROVED') return 'APPROVED';
  if (v.includes('COMMENTS')) return 'APPROVED WITH COMMENTS';
  if (v === 'BLOCKED') return 'BLOCKED';
  return 'CHANGES REQUESTED';
}

export function parseMergeConfidence(output: string): number {
  const match = output.match(/MERGE CONFIDENCE:\s*(\d+)/i);
  return match ? Math.min(100, Math.max(0, parseInt(match[1]))) : 50;
}

export function parseOneLiner(output: string): string {
  const match = output.match(/ONE LINE SUMMARY:\s*(.+)/i);
  return match ? match[1].trim() : '';
}

export default function App() {
  const [pipeline, setPipeline] = useState<PipelineState>(INITIAL_STATE);
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
  const verdictRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (title: string, branch: string, diff: string) => {
    setPipeline({ running: true, results: {} });
    setActiveAgentId(null);

    const prContext = `PR TITLE: ${title}\nBRANCH: ${branch || 'N/A'}\n\nCODE DIFF / DESCRIPTION:\n${diff}`;

    await runPipeline(
      prContext,
      (id) => {
        setActiveAgentId(id);
      },
      (id, output, status: AgentStatus) => {
        setActiveAgentId(null);
        setPipeline((prev) => ({
          ...prev,
          results: {
            ...prev.results,
            [id]: { id, status, output },
          },
        }));
      }
    );

    setPipeline((prev) => {
      const mergeOutput = prev.results['merge']?.output ?? '';
      return {
        ...prev,
        running: false,
        finalVerdict: parseFinalVerdict(mergeOutput),
        mergeConfidence: parseMergeConfidence(mergeOutput),
        verdictSummary: parseOneLiner(mergeOutput),
      };
    });

    setTimeout(() => {
      verdictRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  const handleReset = () => {
    setPipeline(INITIAL_STATE);
    setActiveAgentId(null);
  };

  return (
    <div className="min-h-screen flex bg-[#0f1117]">
      {/* Left sidebar */}
      <aside className="w-80 flex-shrink-0 bg-[#13151e] border-r border-slate-800 flex flex-col">
        <div className="px-5 py-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center text-base">
              🤖
            </div>
            <div>
              <div className="text-sm font-bold text-white">PR Review Squad</div>
              <div className="text-xs text-slate-500">6-agent pipeline</div>
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 py-4 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-1">
            Agent Pipeline
          </div>
          <PipelineView state={pipeline} activeAgentId={activeAgentId} />
        </div>

        <div className="px-5 py-4 border-t border-slate-800">
          <div className="text-xs text-slate-600">
            Powered by <span className="text-violet-500">Claude Sonnet 4</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-1">Submit a PR for Review</h1>
            <p className="text-sm text-slate-400">
              Paste your git diff or describe your changes — 6 specialized agents will review it in sequence.
            </p>
          </div>

          <div className="bg-slate-800/30 border border-slate-700/60 rounded-2xl p-6 mb-6">
            <PRInputForm onSubmit={handleSubmit} disabled={pipeline.running} />
          </div>

          {!pipeline.running && Object.keys(pipeline.results).length > 0 && (
            <div className="flex justify-end mb-6">
              <button
                onClick={handleReset}
                className="text-xs text-slate-500 hover:text-slate-300 transition px-3 py-1.5 rounded-md border border-slate-700 hover:border-slate-500"
              >
                ↺ Reset
              </button>
            </div>
          )}

          {pipeline.finalVerdict && !pipeline.running && (
            <div ref={verdictRef}>
              <VerdictBanner
                verdict={pipeline.finalVerdict}
                summary={pipeline.verdictSummary ?? ''}
                confidence={pipeline.mergeConfidence ?? 50}
                mergeOutput={pipeline.results['merge']?.output ?? ''}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
