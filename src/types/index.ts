export type AgentStatus = 'idle' | 'thinking' | 'approve' | 'needs_review' | 'block' | 'error';

export type Verdict = 'APPROVED' | 'APPROVED WITH COMMENTS' | 'CHANGES REQUESTED' | 'BLOCKED';

export interface AgentResult {
  id: string;
  status: AgentStatus;
  output: string;
}

export interface PipelineState {
  running: boolean;
  results: Record<string, AgentResult>;
  finalVerdict?: Verdict;
  verdictSummary?: string;
  mergeConfidence?: number;
}
