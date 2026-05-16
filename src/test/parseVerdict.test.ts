import { describe, it, expect } from 'vitest';
import { parseVerdict } from '../agents/runPipeline';

describe('parseVerdict', () => {
  it('returns approve when VERDICT is APPROVE', () => {
    expect(parseVerdict('VERDICT: APPROVE')).toBe('approve');
  });

  it('returns block when VERDICT is BLOCK', () => {
    expect(parseVerdict('VERDICT: BLOCK')).toBe('block');
  });

  it('returns needs_review when VERDICT is NEEDS_REVIEW', () => {
    expect(parseVerdict('VERDICT: NEEDS_REVIEW')).toBe('needs_review');
  });

  it('defaults to needs_review when no VERDICT line found', () => {
    expect(parseVerdict('no verdict here')).toBe('needs_review');
  });

  it('matches VERDICT only at the start of a line', () => {
    const output = `SUMMARY: looks good\nVERDICT: APPROVE\nSCOPE: Small`;
    expect(parseVerdict(output)).toBe('approve');
  });

  it('returns needs_review for unknown verdict value', () => {
    expect(parseVerdict('VERDICT: UNKNOWN')).toBe('needs_review');
  });
});
