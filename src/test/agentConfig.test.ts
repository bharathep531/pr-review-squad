import { describe, it, expect } from 'vitest';
import { AGENTS } from '../agents/agentConfig';

describe('AGENTS config', () => {
  it('has exactly 6 agents', () => {
    expect(AGENTS).toHaveLength(6);
  });

  it('last agent is the merge decision agent', () => {
    expect(AGENTS[5].id).toBe('merge');
  });

  it('first 5 agents are specialist reviewers', () => {
    const ids = AGENTS.slice(0, 5).map((a) => a.id);
    expect(ids).toEqual(['analyst', 'qa', 'security', 'perf', 'style']);
  });

  it('every agent has required fields', () => {
    for (const agent of AGENTS) {
      expect(agent.id).toBeTruthy();
      expect(agent.name).toBeTruthy();
      expect(agent.role).toBeTruthy();
      expect(agent.icon).toBeTruthy();
      expect(agent.systemPrompt).toBeTruthy();
    }
  });

  it('every specialist agent system prompt includes VERDICT output instruction', () => {
    for (const agent of AGENTS.slice(0, 5)) {
      expect(agent.systemPrompt).toMatch(/VERDICT/i);
    }
  });

  it('merge agent system prompt includes FINAL VERDICT instruction', () => {
    expect(AGENTS[5].systemPrompt).toMatch(/FINAL VERDICT/i);
  });

  it('merge agent system prompt includes MERGE CONFIDENCE instruction', () => {
    expect(AGENTS[5].systemPrompt).toMatch(/MERGE CONFIDENCE/i);
  });

  it('security agent system prompt mentions OWASP', () => {
    const security = AGENTS.find((a) => a.id === 'security');
    expect(security?.systemPrompt).toMatch(/OWASP/i);
  });

  it('all agent ids are unique', () => {
    const ids = AGENTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
