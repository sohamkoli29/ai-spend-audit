// tests/auditEngine.test.ts
import { runAudit, type FormData } from "../lib/auditEngine";

// ── Test 1: Teams plan overkill for small Cursor team ─────────────────────
test("Cursor Teams for 2 seats recommends downgrade to Pro", () => {
  const form: FormData = {
    tools: [{ toolId: "cursor", planId: "cursor_teams", seats: 2, monthlySpend: 80 }],
    teamSize: 2,
    useCase: "coding",
  };
  const result = runAudit(form);
  const item = result.items[0];
  expect(item.recommendation.type).toBe("downgrade");
  expect(item.monthlySavings).toBe(40); // 80 - (20*2)
});

// ── Test 2: Copilot Business for solo dev is wasteful ─────────────────────
test("GitHub Copilot Business for 1 seat recommends downgrade to Individual", () => {
  const form: FormData = {
    tools: [{ toolId: "github_copilot", planId: "copilot_business", seats: 1, monthlySpend: 19 }],
    teamSize: 1,
    useCase: "coding",
  };
  const result = runAudit(form);
  const item = result.items[0];
  expect(item.recommendation.type).toBe("downgrade");
  expect(item.monthlySavings).toBe(9); // 19 - 10
});

// ── Test 3: Claude Max for writing use case is overkill ───────────────────
test("Claude Max 5x for writing use case recommends downgrade to Pro", () => {
  const form: FormData = {
    tools: [{ toolId: "claude", planId: "claude_max_5x", seats: 1, monthlySpend: 100 }],
    teamSize: 1,
    useCase: "writing",
  };
  const result = runAudit(form);
  const item = result.items[0];
  expect(item.recommendation.type).toBe("downgrade");
  expect(item.monthlySavings).toBe(80); // 100 - 20
});

// ── Test 4: ChatGPT Team for solo user is wasteful ────────────────────────
test("ChatGPT Team for 1 seat recommends downgrade to Plus", () => {
  const form: FormData = {
    tools: [{ toolId: "chatgpt", planId: "chatgpt_team", seats: 1, monthlySpend: 30 }],
    teamSize: 1,
    useCase: "writing",
  };
  const result = runAudit(form);
  const item = result.items[0];
  expect(item.recommendation.type).toBe("downgrade");
  expect(item.monthlySavings).toBe(10); // 30 - 20
});

// ── Test 5: Gemini Ultra for coding use case is overkill ──────────────────
test("Gemini Ultra for coding recommends downgrade to Pro", () => {
  const form: FormData = {
    tools: [{ toolId: "gemini", planId: "gemini_ultra", seats: 1, monthlySpend: 99.99 }],
    teamSize: 1,
    useCase: "coding",
  };
  const result = runAudit(form);
  const item = result.items[0];
  expect(item.recommendation.type).toBe("downgrade");
  expect(item.monthlySavings).toBeCloseTo(80, 0); // ~99.99 - 19.99
});

// ── Test 6: Well-configured stack is marked optimal ───────────────────────
test("Well-configured stack returns optimal with zero savings", () => {
  const form: FormData = {
    tools: [
      { toolId: "cursor", planId: "cursor_pro", seats: 1, monthlySpend: 20 },
      { toolId: "github_copilot", planId: "copilot_individual", seats: 1, monthlySpend: 10 },
    ],
    teamSize: 1,
    useCase: "coding",
  };
  const result = runAudit(form);
  expect(result.isAlreadyOptimal).toBe(true);
  expect(result.totalMonthlySavings).toBe(0);
});

// ── Test 7: High savings threshold triggers Credex CTA ────────────────────
test("Audit with >$500/mo savings sets hasHighSavings to true", () => {
  const form: FormData = {
    tools: [
      { toolId: "cursor", planId: "cursor_teams", seats: 10, monthlySpend: 400 },
      { toolId: "chatgpt", planId: "chatgpt_pro_200", seats: 1, monthlySpend: 200 },
      { toolId: "claude", planId: "claude_max_20x", seats: 1, monthlySpend: 200 },
    ],
    teamSize: 10,
    useCase: "writing",
  };
  const result = runAudit(form);
  expect(result.hasHighSavings).toBe(true);
  expect(result.totalMonthlySavings).toBeGreaterThan(500);
});