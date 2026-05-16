import { describe, it, expect } from 'vitest';
import { parseFinalVerdict, parseMergeConfidence, parseOneLiner } from '../App';

describe('parseFinalVerdict', () => {
  it('returns APPROVED when output contains FINAL VERDICT: APPROVED', () => {
    expect(parseFinalVerdict('FINAL VERDICT: APPROVED')).toBe('APPROVED');
  });

  it('returns APPROVED WITH COMMENTS when verdict contains COMMENTS', () => {
    expect(parseFinalVerdict('FINAL VERDICT: APPROVED WITH COMMENTS')).toBe('APPROVED WITH COMMENTS');
  });

  it('returns BLOCKED when verdict is BLOCKED', () => {
    expect(parseFinalVerdict('FINAL VERDICT: BLOCKED')).toBe('BLOCKED');
  });

  it('returns CHANGES REQUESTED when verdict is CHANGES REQUESTED', () => {
    expect(parseFinalVerdict('FINAL VERDICT: CHANGES REQUESTED')).toBe('CHANGES REQUESTED');
  });

  it('defaults to CHANGES REQUESTED when no match found', () => {
    expect(parseFinalVerdict('no verdict here')).toBe('CHANGES REQUESTED');
  });

  it('is case-insensitive', () => {
    expect(parseFinalVerdict('final verdict: approved')).toBe('APPROVED');
  });

  it('handles extra whitespace around verdict', () => {
    expect(parseFinalVerdict('FINAL VERDICT:   APPROVED  ')).toBe('APPROVED');
  });
});

describe('parseMergeConfidence', () => {
  it('parses a valid confidence value', () => {
    expect(parseMergeConfidence('MERGE CONFIDENCE: 85')).toBe(85);
  });

  it('clamps value above 100 to 100', () => {
    expect(parseMergeConfidence('MERGE CONFIDENCE: 150')).toBe(100);
  });

  it('returns default 50 for negative numbers (regex only matches digits)', () => {
    expect(parseMergeConfidence('MERGE CONFIDENCE: -10')).toBe(50);
  });

  it('defaults to 50 when no match found', () => {
    expect(parseMergeConfidence('no confidence here')).toBe(50);
  });

  it('is case-insensitive', () => {
    expect(parseMergeConfidence('merge confidence: 72')).toBe(72);
  });

  it('parses 0 correctly', () => {
    expect(parseMergeConfidence('MERGE CONFIDENCE: 0')).toBe(0);
  });

  it('parses 100 correctly', () => {
    expect(parseMergeConfidence('MERGE CONFIDENCE: 100')).toBe(100);
  });
});

describe('parseOneLiner', () => {
  it('extracts the one-line summary', () => {
    expect(parseOneLiner('ONE LINE SUMMARY: Adds user auth endpoint')).toBe('Adds user auth endpoint');
  });

  it('returns empty string when no match found', () => {
    expect(parseOneLiner('no summary here')).toBe('');
  });

  it('trims whitespace from summary', () => {
    expect(parseOneLiner('ONE LINE SUMMARY:   Adds endpoint   ')).toBe('Adds endpoint');
  });

  it('is case-insensitive', () => {
    expect(parseOneLiner('one line summary: Security fix')).toBe('Security fix');
  });
});
