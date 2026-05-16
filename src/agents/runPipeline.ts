import { AGENTS } from './agentConfig';
import { runAgent } from './runAgent';
import type { AgentStatus } from '../types';

export async function runPipeline(
  prContext: string,
  onAgentStart: (id: string) => void,
  onAgentComplete: (id: string, output: string, status: AgentStatus) => void
): Promise<Record<string, string>> {
  const outputs: Record<string, string> = {};
  const regularAgents = AGENTS.slice(0, 5);
  const mergeAgent = AGENTS[5];

  for (const agent of regularAgents) {
    onAgentStart(agent.id);
    try {
      const output = await runAgent(agent.systemPrompt, prContext);
      outputs[agent.id] = output;
      const status = parseVerdict(output);
      onAgentComplete(agent.id, output, status);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      outputs[agent.id] = `Error: ${msg}`;
      onAgentComplete(agent.id, `Error: ${msg}`, 'error');
    }
  }

  const allReviews = regularAgents
    .map((a) => `=== ${a.name} ===\n${outputs[a.id] ?? '(no output)'}`)
    .join('\n\n');
  const mergeInput = `${prContext}\n\n--- ALL AGENT REVIEWS ---\n${allReviews}`;

  onAgentStart(mergeAgent.id);
  try {
    const mergeOutput = await runAgent(mergeAgent.systemPrompt, mergeInput);
    outputs[mergeAgent.id] = mergeOutput;
    onAgentComplete(mergeAgent.id, mergeOutput, 'approve');
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    outputs[mergeAgent.id] = `Error: ${msg}`;
    onAgentComplete(mergeAgent.id, `Error: ${msg}`, 'error');
  }

  return outputs;
}

export function parseVerdict(output: string): AgentStatus {
  const match = output.match(/^VERDICT:\s*(.+)$/m);
  if (!match) return 'needs_review';
  const v = match[1].trim().toUpperCase();
  if (v === 'APPROVE') return 'approve';
  if (v === 'BLOCK') return 'block';
  return 'needs_review';
}
