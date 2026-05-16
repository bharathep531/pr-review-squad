import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runPipeline } from '../agents/runPipeline';

vi.mock('../agents/runAgent', () => ({
  runAgent: vi.fn(),
}));

import { runAgent } from '../agents/runAgent';

const mockedRunAgent = vi.mocked(runAgent);

const APPROVE_OUTPUT = `SUMMARY: Looks good\nSCOPE: Small\nVERDICT: APPROVE`;
const BLOCK_OUTPUT = `SUMMARY: Critical issue\nSCOPE: Large\nVERDICT: BLOCK`;
const NEEDS_REVIEW_OUTPUT = `SUMMARY: Minor issues\nSCOPE: Medium\nVERDICT: NEEDS_REVIEW`;
const MERGE_OUTPUT = `FINAL VERDICT: APPROVED\nBLOCKING ISSUES: None\nMERGE CONFIDENCE: 90\nONE LINE SUMMARY: Safe to merge`;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('runPipeline', () => {
  it('calls runAgent 6 times total (5 specialists + 1 merge)', async () => {
    mockedRunAgent.mockResolvedValue(APPROVE_OUTPUT);
    mockedRunAgent.mockResolvedValueOnce(APPROVE_OUTPUT)
      .mockResolvedValueOnce(APPROVE_OUTPUT)
      .mockResolvedValueOnce(APPROVE_OUTPUT)
      .mockResolvedValueOnce(APPROVE_OUTPUT)
      .mockResolvedValueOnce(APPROVE_OUTPUT)
      .mockResolvedValueOnce(MERGE_OUTPUT);

    await runPipeline('PR context', vi.fn(), vi.fn());

    expect(mockedRunAgent).toHaveBeenCalledTimes(6);
  });

  it('calls onAgentStart before onAgentComplete for each agent', async () => {
    mockedRunAgent.mockResolvedValue(APPROVE_OUTPUT);
    mockedRunAgent.mockResolvedValueOnce(APPROVE_OUTPUT)
      .mockResolvedValueOnce(APPROVE_OUTPUT)
      .mockResolvedValueOnce(APPROVE_OUTPUT)
      .mockResolvedValueOnce(APPROVE_OUTPUT)
      .mockResolvedValueOnce(APPROVE_OUTPUT)
      .mockResolvedValueOnce(MERGE_OUTPUT);

    const callOrder: string[] = [];
    const onStart = vi.fn((id: string) => callOrder.push(`start:${id}`));
    const onComplete = vi.fn((id: string) => callOrder.push(`complete:${id}`));

    await runPipeline('PR context', onStart, onComplete);

    expect(callOrder[0]).toBe('start:analyst');
    expect(callOrder[1]).toBe('complete:analyst');
    expect(callOrder[callOrder.length - 2]).toBe('start:merge');
    expect(callOrder[callOrder.length - 1]).toBe('complete:merge');
  });

  it('fires onAgentComplete with approve status for APPROVE output', async () => {
    mockedRunAgent.mockResolvedValue(APPROVE_OUTPUT);
    mockedRunAgent.mockResolvedValueOnce(APPROVE_OUTPUT)
      .mockResolvedValueOnce(APPROVE_OUTPUT)
      .mockResolvedValueOnce(APPROVE_OUTPUT)
      .mockResolvedValueOnce(APPROVE_OUTPUT)
      .mockResolvedValueOnce(APPROVE_OUTPUT)
      .mockResolvedValueOnce(MERGE_OUTPUT);

    const onComplete = vi.fn();
    await runPipeline('PR context', vi.fn(), onComplete);

    const [analystId, , analystStatus] = onComplete.mock.calls[0];
    expect(analystId).toBe('analyst');
    expect(analystStatus).toBe('approve');
  });

  it('fires onAgentComplete with block status for BLOCK output', async () => {
    mockedRunAgent
      .mockResolvedValueOnce(APPROVE_OUTPUT)
      .mockResolvedValueOnce(APPROVE_OUTPUT)
      .mockResolvedValueOnce(BLOCK_OUTPUT)   // security blocks
      .mockResolvedValueOnce(APPROVE_OUTPUT)
      .mockResolvedValueOnce(APPROVE_OUTPUT)
      .mockResolvedValueOnce(MERGE_OUTPUT);

    const onComplete = vi.fn();
    await runPipeline('PR context', vi.fn(), onComplete);

    const securityCall = onComplete.mock.calls.find(([id]) => id === 'security');
    expect(securityCall?.[2]).toBe('block');
  });

  it('fires onAgentComplete with needs_review status for NEEDS_REVIEW output', async () => {
    mockedRunAgent
      .mockResolvedValueOnce(NEEDS_REVIEW_OUTPUT)
      .mockResolvedValueOnce(APPROVE_OUTPUT)
      .mockResolvedValueOnce(APPROVE_OUTPUT)
      .mockResolvedValueOnce(APPROVE_OUTPUT)
      .mockResolvedValueOnce(APPROVE_OUTPUT)
      .mockResolvedValueOnce(MERGE_OUTPUT);

    const onComplete = vi.fn();
    await runPipeline('PR context', vi.fn(), onComplete);

    const analystCall = onComplete.mock.calls.find(([id]) => id === 'analyst');
    expect(analystCall?.[2]).toBe('needs_review');
  });

  it('passes all 5 agent outputs to the merge agent', async () => {
    mockedRunAgent
      .mockResolvedValueOnce(APPROVE_OUTPUT)
      .mockResolvedValueOnce(APPROVE_OUTPUT)
      .mockResolvedValueOnce(APPROVE_OUTPUT)
      .mockResolvedValueOnce(APPROVE_OUTPUT)
      .mockResolvedValueOnce(APPROVE_OUTPUT)
      .mockResolvedValueOnce(MERGE_OUTPUT);

    await runPipeline('PR context', vi.fn(), vi.fn());

    const mergeCallArgs = mockedRunAgent.mock.calls[5];
    const mergeInput = mergeCallArgs[1];
    expect(mergeInput).toContain('PR Analyst');
    expect(mergeInput).toContain('QA Reviewer');
    expect(mergeInput).toContain('Security Auditor');
    expect(mergeInput).toContain('Performance Reviewer');
    expect(mergeInput).toContain('Code Style');
  });

  it('handles a runAgent error gracefully and fires onAgentComplete with error status', async () => {
    mockedRunAgent
      .mockRejectedValueOnce(new Error('API timeout'))
      .mockResolvedValue(APPROVE_OUTPUT)
      .mockResolvedValueOnce(MERGE_OUTPUT);

    const onComplete = vi.fn();
    await runPipeline('PR context', vi.fn(), onComplete);

    const analystCall = onComplete.mock.calls.find(([id]) => id === 'analyst');
    expect(analystCall?.[2]).toBe('error');
    expect(analystCall?.[1]).toContain('API timeout');
  });

  it('returns a record of all agent outputs', async () => {
    mockedRunAgent
      .mockResolvedValueOnce(APPROVE_OUTPUT)
      .mockResolvedValueOnce(APPROVE_OUTPUT)
      .mockResolvedValueOnce(APPROVE_OUTPUT)
      .mockResolvedValueOnce(APPROVE_OUTPUT)
      .mockResolvedValueOnce(APPROVE_OUTPUT)
      .mockResolvedValueOnce(MERGE_OUTPUT);

    const result = await runPipeline('PR context', vi.fn(), vi.fn());

    expect(Object.keys(result)).toEqual(['analyst', 'qa', 'security', 'perf', 'style', 'merge']);
    expect(result['merge']).toBe(MERGE_OUTPUT);
  });
});
