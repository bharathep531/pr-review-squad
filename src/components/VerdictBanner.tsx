import type { Verdict } from '../types';

interface Props {
  verdict: Verdict;
  summary: string;
  confidence: number;
  mergeOutput: string;
}

const verdictConfig: Record<Verdict, { label: string; cls: string; bar: string; icon: string }> = {
  APPROVED: {
    label: 'APPROVED',
    icon: '✅',
    cls: 'border-emerald-500 bg-emerald-950/40',
    bar: 'bg-emerald-500',
  },
  'APPROVED WITH COMMENTS': {
    label: 'APPROVED WITH COMMENTS',
    icon: '✅',
    cls: 'border-teal-500 bg-teal-950/40',
    bar: 'bg-teal-500',
  },
  'CHANGES REQUESTED': {
    label: 'CHANGES REQUESTED',
    icon: '⚠️',
    cls: 'border-amber-500 bg-amber-950/40',
    bar: 'bg-amber-500',
  },
  BLOCKED: {
    label: 'BLOCKED',
    icon: '🚫',
    cls: 'border-red-500 bg-red-950/40',
    bar: 'bg-red-500',
  },
};

function parseSection(output: string, label: string): string | null {
  const regex = new RegExp(`${label}:\\s*(.+?)(?=\\n[A-Z ]+:|$)`, 's');
  const match = output.match(regex);
  return match ? match[1].trim() : null;
}

function parseListSection(output: string, label: string): string[] {
  const raw = parseSection(output, label);
  if (!raw || raw === 'None') return [];
  return raw
    .split('\n')
    .map((l) => l.replace(/^\d+\.\s*/, '').trim())
    .filter(Boolean);
}

export default function VerdictBanner({ verdict, summary, confidence, mergeOutput }: Props) {
  const cfg = verdictConfig[verdict];
  const blocking = parseListSection(mergeOutput, 'BLOCKING ISSUES');
  const required = parseListSection(mergeOutput, 'REQUIRED CHANGES');
  const optional = parseListSection(mergeOutput, 'OPTIONAL IMPROVEMENTS');

  return (
    <div className={`slide-in rounded-xl border-2 ${cfg.cls} p-5`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{cfg.icon}</span>
        <div>
          <div className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Final Verdict</div>
          <div className="text-xl font-bold text-white tracking-tight">{cfg.label}</div>
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <p className="text-sm text-slate-300 mb-4 leading-relaxed border-l-2 border-slate-600 pl-3 italic">
          {summary}
        </p>
      )}

      {/* Confidence bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Merge Confidence</span>
          <span className="font-semibold text-slate-200">{confidence}%</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${cfg.bar}`}
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>

      {/* Blocking issues */}
      {blocking.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-1.5">
            🔴 Blocking Issues
          </div>
          <ul className="space-y-1">
            {blocking.map((item, i) => (
              <li key={i} className="text-sm text-red-300 flex gap-2">
                <span className="mt-0.5 flex-shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Required changes */}
      {required.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">
            🟡 Required Changes
          </div>
          <ol className="space-y-1">
            {required.map((item, i) => (
              <li key={i} className="text-sm text-amber-200 flex gap-2">
                <span className="flex-shrink-0 text-amber-500 font-mono">{i + 1}.</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Optional improvements */}
      {optional.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            💡 Optional Improvements
          </div>
          <ul className="space-y-1">
            {optional.map((item, i) => (
              <li key={i} className="text-sm text-slate-400 flex gap-2">
                <span className="mt-0.5 flex-shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
