// lib/auditEngine.ts
// Pure functions — no API calls, no side effects, fully testable

import { TOOL_MAP, getPlan, type PlanTier } from "./pricingData";

export type UseCase = "coding" | "writing" | "data" | "research" | "mixed";

export type ToolInput = {
  toolId: string;
  planId: string;
  seats: number;
  monthlySpend: number; // what they're actually paying
};

export type FormData = {
  tools: ToolInput[];
  teamSize: number;
  useCase: UseCase;
};

export type Recommendation =
  | { type: "downgrade"; toPlanId: string; reason: string }
  | { type: "switch"; toToolId: string; toPlanId: string; reason: string }
  | { type: "optimal"; reason: string };

export type AuditLineItem = {
  toolId: string;
  toolName: string;
  planName: string;
  currentMonthlyCost: number;
  recommendedMonthlyCost: number;
  monthlySavings: number;
  recommendation: Recommendation;
};

export type AuditResult = {
  items: AuditLineItem[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  totalCurrentSpend: number;
  totalRecommendedSpend: number;
  isAlreadyOptimal: boolean;
  hasHighSavings: boolean; // >$500/mo — show Credex CTA
};

// ─── Per-tool audit logic ──────────────────────────────────────────────────

function auditCursor(input: ToolInput, teamSize: number, useCase: UseCase): AuditLineItem {
  const tool = TOOL_MAP["cursor"];
  const currentPlan = getPlan("cursor", input.planId);
  const planName = currentPlan?.name ?? input.planId;
  const currentCost = input.monthlySpend;

  // Teams plan for 1-2 devs is overkill — individual Pro is sufficient
  if (input.planId === "cursor_teams" && input.seats <= 2) {
    const proCost = 20 * input.seats;
    return {
      toolId: "cursor",
      toolName: tool.name,
      planName,
      currentMonthlyCost: currentCost,
      recommendedMonthlyCost: proCost,
      monthlySavings: currentCost - proCost,
      recommendation: {
        type: "downgrade",
        toPlanId: "cursor_pro",
        reason: `Teams plan adds admin features you don't need at ${input.seats} seats. Individual Pro at $20/seat gives the same AI access for ${input.seats <= 1 ? "1 person" : `${input.seats} people`}.`,
      },
    };
  }

  // Pro+ is hard to justify unless burning through credits daily
  if (input.planId === "cursor_pro_plus" && useCase !== "coding") {
    const proCost = 20;
    return {
      toolId: "cursor",
      toolName: tool.name,
      planName,
      currentMonthlyCost: currentCost,
      recommendedMonthlyCost: proCost,
      monthlySavings: currentCost - proCost,
      recommendation: {
        type: "downgrade",
        toPlanId: "cursor_pro",
        reason: `Pro+ ($60) provides 3x credits for heavy coding use. Your primary use case is ${useCase} — Pro ($20) covers typical usage. Downgrade and monitor for a month.`,
      },
    };
  }

  // If paying for Teams but GitHub Copilot Individual would suffice for writing/research
  if (
    (input.planId === "cursor_teams" || input.planId === "cursor_pro") &&
    (useCase === "writing" || useCase === "research") &&
    input.seats >= 3
  ) {
    const copilotCost = 10 * input.seats;
    if (copilotCost < currentCost) {
      return {
        toolId: "cursor",
        toolName: tool.name,
        planName,
        currentMonthlyCost: currentCost,
        recommendedMonthlyCost: copilotCost,
        monthlySavings: currentCost - copilotCost,
        recommendation: {
          type: "switch",
          toToolId: "github_copilot",
          toPlanId: "copilot_individual",
          reason: `Cursor is optimized for deep coding workflows. For ${useCase} tasks, GitHub Copilot Individual at $10/seat provides equivalent value at ${Math.round(((currentCost - copilotCost) / currentCost) * 100)}% lower cost.`,
        },
      };
    }
  }

  return optimal("cursor", tool.name, planName, currentCost);
}

function auditGitHubCopilot(input: ToolInput, teamSize: number): AuditLineItem {
  const tool = TOOL_MAP["github_copilot"];
  const currentPlan = getPlan("github_copilot", input.planId);
  const planName = currentPlan?.name ?? input.planId;
  const currentCost = input.monthlySpend;

  // Enterprise requires GitHub Enterprise Cloud — overkill for small teams
  if (input.planId === "copilot_enterprise" && input.seats < 20) {
    const businessCost = 19 * input.seats;
    return {
      toolId: "github_copilot",
      toolName: tool.name,
      planName,
      currentMonthlyCost: currentCost,
      recommendedMonthlyCost: businessCost,
      monthlySavings: currentCost - businessCost,
      recommendation: {
        type: "downgrade",
        toPlanId: "copilot_business",
        reason: `Enterprise ($39/seat) requires GitHub Enterprise Cloud and adds fine-tuning on private repos — valuable at 20+ seats with compliance needs. At ${input.seats} seats, Business ($19/seat) covers org controls, IP indemnity, and SSO at half the price.`,
      },
    };
  }

  // Business for a solo developer
  if (input.planId === "copilot_business" && input.seats === 1) {
    return {
      toolId: "github_copilot",
      toolName: tool.name,
      planName,
      currentMonthlyCost: currentCost,
      recommendedMonthlyCost: 10,
      monthlySavings: currentCost - 10,
      recommendation: {
        type: "downgrade",
        toPlanId: "copilot_individual",
        reason: `Business plan adds org management for teams. As a solo user, Individual ($10/mo) gives identical AI completions and chat — the $9/mo difference buys you nothing.`,
      },
    };
  }

  return optimal("github_copilot", tool.name, planName, currentCost);
}

function auditClaude(input: ToolInput, teamSize: number, useCase: UseCase): AuditLineItem {
  const tool = TOOL_MAP["claude"];
  const currentPlan = getPlan("claude", input.planId);
  const planName = currentPlan?.name ?? input.planId;
  const currentCost = input.monthlySpend;

  // Team plan for fewer than 5 people — minimum is 5 seats
  if (input.planId === "claude_team" && input.seats < 5) {
    const proCost = 20 * input.seats;
    return {
      toolId: "claude",
      toolName: tool.name,
      planName,
      currentMonthlyCost: currentCost,
      recommendedMonthlyCost: proCost,
      monthlySavings: currentCost - proCost,
      recommendation: {
        type: "downgrade",
        toPlanId: "claude_pro",
        reason: `Claude Team requires a minimum of 5 seats at $30/seat. At ${input.seats} users, individual Pro accounts at $20/seat provide the same model access with no minimum, saving $${currentCost - proCost}/mo.`,
      },
    };
  }

  // Max 5x or 20x for non-coding, non-heavy use cases
  if (
    (input.planId === "claude_max_5x" || input.planId === "claude_max_20x") &&
    useCase !== "coding" &&
    input.seats === 1
  ) {
    return {
      toolId: "claude",
      toolName: tool.name,
      planName,
      currentMonthlyCost: currentCost,
      recommendedMonthlyCost: 20,
      monthlySavings: currentCost - 20,
      recommendation: {
        type: "downgrade",
        toPlanId: "claude_pro",
        reason: `Max tiers are designed for Claude Code power users burning through tokens daily. For ${useCase} work, Pro ($20/mo) provides ample capacity — Max's extra headroom goes unused for most non-coding workflows.`,
      },
    };
  }

  return optimal("claude", tool.name, planName, currentCost);
}

function auditChatGPT(input: ToolInput, teamSize: number, useCase: UseCase): AuditLineItem {
  const tool = TOOL_MAP["chatgpt"];
  const currentPlan = getPlan("chatgpt", input.planId);
  const planName = currentPlan?.name ?? input.planId;
  const currentCost = input.monthlySpend;

  // Enterprise has 150 seat minimum — anyone below that shouldn't be on it
  if (input.planId === "chatgpt_enterprise" && input.seats < 150) {
    const teamCost = 30 * input.seats;
    return {
      toolId: "chatgpt",
      toolName: tool.name,
      planName,
      currentMonthlyCost: currentCost,
      recommendedMonthlyCost: teamCost,
      monthlySavings: currentCost - teamCost,
      recommendation: {
        type: "downgrade",
        toPlanId: "chatgpt_team",
        reason: `ChatGPT Enterprise requires a 150-seat minimum and is priced for large-org compliance. Team ($30/seat) includes shared workspaces, custom GPTs, and training data exclusion — everything a team under 150 actually needs.`,
      },
    };
  }

  // Team plan for 1 person
  if (input.planId === "chatgpt_team" && input.seats === 1) {
    return {
      toolId: "chatgpt",
      toolName: tool.name,
      planName,
      currentMonthlyCost: currentCost,
      recommendedMonthlyCost: 20,
      monthlySavings: currentCost - 20,
      recommendation: {
        type: "downgrade",
        toPlanId: "chatgpt_plus",
        reason: `Team plan is designed for shared workspaces with 2+ people. As a solo user, Plus ($20/mo) gives identical model access — the $10/mo premium buys team features you can't use alone.`,
      },
    };
  }

  // Pro 20x for non-heavy use
  if (input.planId === "chatgpt_pro_200" && useCase !== "coding" && useCase !== "data") {
    return {
      toolId: "chatgpt",
      toolName: tool.name,
      planName,
      currentMonthlyCost: currentCost,
      recommendedMonthlyCost: 20,
      monthlySavings: 180,
      recommendation: {
        type: "downgrade",
        toPlanId: "chatgpt_plus",
        reason: `Pro ($200) provides 20x limits and 1M context — built for developers and analysts hitting Plus limits daily. For ${useCase} work, Plus ($20) covers standard usage at 10% of the cost.`,
      },
    };
  }

  return optimal("chatgpt", tool.name, planName, currentCost);
}

function auditAnthropicAPI(input: ToolInput, teamSize: number): AuditLineItem {
  const tool = TOOL_MAP["anthropic_api"];
  const currentCost = input.monthlySpend;

  // If spending > $100/mo on API and use case is chat (not coding), suggest Claude Pro
  if (currentCost > 100 && teamSize === 1) {
    return {
      toolId: "anthropic_api",
      toolName: tool.name,
      planName: "API Direct",
      currentMonthlyCost: currentCost,
      recommendedMonthlyCost: 20,
      monthlySavings: currentCost - 20,
      recommendation: {
        type: "downgrade",
        toPlanId: "claude_pro",
        reason: `At $${currentCost}/mo on the API as a solo user, Claude Pro ($20/mo flat) likely covers your usage with no per-token anxiety. API makes sense for developers building products; Pro is better for direct personal use.`,
      },
    };
  }

  return optimal("anthropic_api", tool.name, "API Direct", currentCost);
}

function auditOpenAIAPI(input: ToolInput, teamSize: number): AuditLineItem {
  const tool = TOOL_MAP["openai_api"];
  const currentCost = input.monthlySpend;

  if (currentCost > 80 && teamSize === 1) {
    return {
      toolId: "openai_api",
      toolName: tool.name,
      planName: "API Direct",
      currentMonthlyCost: currentCost,
      recommendedMonthlyCost: 20,
      monthlySavings: currentCost - 20,
      recommendation: {
        type: "downgrade",
        toPlanId: "chatgpt_plus",
        reason: `At $${currentCost}/mo on the API for personal use, ChatGPT Plus ($20/mo) provides unlimited interactive access. API billing is efficient for products; for personal productivity, the flat subscription wins.`,
      },
    };
  }

  return optimal("openai_api", tool.name, "API Direct", currentCost);
}

function auditGemini(input: ToolInput, useCase: UseCase): AuditLineItem {
  const tool = TOOL_MAP["gemini"];
  const currentPlan = getPlan("gemini", input.planId);
  const planName = currentPlan?.name ?? input.planId;
  const currentCost = input.monthlySpend;

  // Ultra for non-research, non-data use cases
  if (input.planId === "gemini_ultra" && useCase !== "research" && useCase !== "data") {
    return {
      toolId: "gemini",
      toolName: tool.name,
      planName,
      currentMonthlyCost: currentCost,
      recommendedMonthlyCost: 19.99,
      monthlySavings: currentCost - 19.99,
      recommendation: {
        type: "downgrade",
        toPlanId: "gemini_pro",
        reason: `Gemini Ultra ($99.99/mo) adds Deep Think reasoning and Veo video generation — valuable for research and data analysis workflows. For ${useCase} work, Google AI Pro ($19.99/mo) with Gemini 3.1 Pro provides equivalent capability at 80% lower cost.`,
      },
    };
  }

  return optimal("gemini", tool.name, planName, currentCost);
}

function auditWindsurf(input: ToolInput, teamSize: number, useCase: UseCase): AuditLineItem {
  const tool = TOOL_MAP["windsurf"];
  const currentPlan = getPlan("windsurf", input.planId);
  const planName = currentPlan?.name ?? input.planId;
  const currentCost = input.monthlySpend;

  // Max plan for non-coding use
  if (input.planId === "windsurf_max" && useCase !== "coding") {
    return {
      toolId: "windsurf",
      toolName: tool.name,
      planName,
      currentMonthlyCost: currentCost,
      recommendedMonthlyCost: 20,
      monthlySavings: 180,
      recommendation: {
        type: "downgrade",
        toPlanId: "windsurf_pro",
        reason: `Windsurf Max ($200/mo) is for developers running Cascade agent continuously on large codebases. For ${useCase} work, Pro ($20/mo) provides sufficient daily quota — Max's headroom is unused outside intensive coding.`,
      },
    };
  }

  // Teams for 1-2 people
  if (input.planId === "windsurf_teams" && input.seats <= 2) {
    const proCost = 20 * input.seats;
    return {
      toolId: "windsurf",
      toolName: tool.name,
      planName,
      currentMonthlyCost: currentCost,
      recommendedMonthlyCost: proCost,
      monthlySavings: currentCost - proCost,
      recommendation: {
        type: "downgrade",
        toPlanId: "windsurf_pro",
        reason: `Windsurf Teams adds centralized billing and analytics — useful at 3+ seats. At ${input.seats} ${input.seats === 1 ? "seat" : "seats"}, individual Pro at $20/seat gives identical AI access without the team overhead cost.`,
      },
    };
  }

  return optimal("windsurf", tool.name, planName, currentCost);
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function optimal(
  toolId: string,
  toolName: string,
  planName: string,
  currentCost: number
): AuditLineItem {
  return {
    toolId,
    toolName,
    planName,
    currentMonthlyCost: currentCost,
    recommendedMonthlyCost: currentCost,
    monthlySavings: 0,
    recommendation: {
      type: "optimal",
      reason: "Your current plan fits your usage profile well.",
    },
  };
}

// ─── Main audit function ───────────────────────────────────────────────────

export function runAudit(form: FormData): AuditResult {
  const items: AuditLineItem[] = form.tools.map((input) => {
    switch (input.toolId) {
      case "cursor":
        return auditCursor(input, form.teamSize, form.useCase);
      case "github_copilot":
        return auditGitHubCopilot(input, form.teamSize);
      case "claude":
        return auditClaude(input, form.teamSize, form.useCase);
      case "chatgpt":
        return auditChatGPT(input, form.teamSize, form.useCase);
      case "anthropic_api":
        return auditAnthropicAPI(input, form.teamSize);
      case "openai_api":
        return auditOpenAIAPI(input, form.teamSize);
      case "gemini":
        return auditGemini(input, form.useCase);
      case "windsurf":
        return auditWindsurf(input, form.teamSize, form.useCase);
      default:
        return optimal(input.toolId, input.toolId, input.planId, input.monthlySpend);
    }
  });

  const totalCurrentSpend = items.reduce((s, i) => s + i.currentMonthlyCost, 0);
  const totalRecommendedSpend = items.reduce((s, i) => s + i.recommendedMonthlyCost, 0);
  const totalMonthlySavings = totalCurrentSpend - totalRecommendedSpend;
  const totalAnnualSavings = totalMonthlySavings * 12;

  return {
    items,
    totalMonthlySavings,
    totalAnnualSavings,
    totalCurrentSpend,
    totalRecommendedSpend,
    isAlreadyOptimal: totalMonthlySavings === 0,
    hasHighSavings: totalMonthlySavings > 500,
  };
}