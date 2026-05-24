// lib/pricingData.ts
// All pricing verified May 24, 2026 — sources documented in PRICING_DATA.md

export type PlanTier = {
  id: string;
  name: string;
  monthlyPrice: number; // per user/seat, USD
  annualMonthlyPrice?: number; // if annual billing available
  isPerSeat: boolean;
  minSeats?: number;
  features: string[];
};

export type Tool = {
  id: string;
  name: string;
  category: "coding" | "chat" | "api";
  plans: PlanTier[];
  officialPricingUrl: string;
};

export const TOOLS: Tool[] = [
  {
    id: "cursor",
    name: "Cursor",
    category: "coding",
    officialPricingUrl: "https://cursor.sh/pricing",
    plans: [
      {
        id: "cursor_hobby",
        name: "Hobby",
        monthlyPrice: 0,
        isPerSeat: false,
        features: ["Limited completions", "Basic AI access"],
      },
      {
        id: "cursor_pro",
        name: "Pro",
        monthlyPrice: 20,
        annualMonthlyPrice: 16,
        isPerSeat: false,
        features: ["Unlimited Tab completions", "$20 usage credits/mo", "Auto mode"],
      },
      {
        id: "cursor_pro_plus",
        name: "Pro+",
        monthlyPrice: 60,
        annualMonthlyPrice: 48,
        isPerSeat: false,
        features: ["3x usage credits ($60/mo)", "Everything in Pro"],
      },
      {
        id: "cursor_teams",
        name: "Teams",
        monthlyPrice: 40,
        annualMonthlyPrice: 32,
        isPerSeat: true,
        features: ["Pro-level access per seat", "Shared rules & chats", "Centralized billing", "Usage analytics"],
      },
      {
        id: "cursor_enterprise",
        name: "Enterprise",
        monthlyPrice: 0, // custom — use 65 as estimate
        isPerSeat: true,
        features: ["Pooled usage", "SCIM", "SAML SSO", "Priority support"],
      },
    ],
  },
  {
    id: "github_copilot",
    name: "GitHub Copilot",
    category: "coding",
    officialPricingUrl: "https://github.com/features/copilot#pricing",
    plans: [
      {
        id: "copilot_free",
        name: "Free",
        monthlyPrice: 0,
        isPerSeat: false,
        features: ["2,000 completions/mo", "50 chat messages/mo"],
      },
      {
        id: "copilot_individual",
        name: "Individual",
        monthlyPrice: 10,
        annualMonthlyPrice: 8.33,
        isPerSeat: false,
        features: ["Unlimited completions", "Copilot Chat", "All major IDEs"],
      },
      {
        id: "copilot_business",
        name: "Business",
        monthlyPrice: 19,
        isPerSeat: true,
        features: ["All Individual features", "Org policy controls", "Audit logs", "IP indemnity", "SAML SSO"],
      },
      {
        id: "copilot_enterprise",
        name: "Enterprise",
        monthlyPrice: 39,
        isPerSeat: true,
        features: ["All Business features", "Fine-tuned models", "Private codebase knowledge", "Requires GitHub Enterprise Cloud"],
      },
    ],
  },
  {
    id: "claude",
    name: "Claude (Anthropic)",
    category: "chat",
    officialPricingUrl: "https://www.anthropic.com/pricing",
    plans: [
      {
        id: "claude_free",
        name: "Free",
        monthlyPrice: 0,
        isPerSeat: false,
        features: ["Limited usage", "Access to Claude Sonnet"],
      },
      {
        id: "claude_pro",
        name: "Pro",
        monthlyPrice: 20,
        annualMonthlyPrice: 17,
        isPerSeat: false,
        features: ["5x Free tier usage", "Priority access", "Claude Code included"],
      },
      {
        id: "claude_max_5x",
        name: "Max (5x)",
        monthlyPrice: 100,
        isPerSeat: false,
        features: ["5x Pro capacity", "Maximum priority", "Full Claude Code"],
      },
      {
        id: "claude_max_20x",
        name: "Max (20x)",
        monthlyPrice: 200,
        isPerSeat: false,
        features: ["20x Pro capacity", "Zero-latency priority", "Full Claude Code"],
      },
      {
        id: "claude_team",
        name: "Team",
        monthlyPrice: 30,
        annualMonthlyPrice: 25,
        isPerSeat: true,
        minSeats: 5,
        features: ["Higher usage than Pro", "Centralized billing", "Admin controls", "Shared workspaces"],
      },
      {
        id: "claude_team_premium",
        name: "Team (Premium)",
        monthlyPrice: 125,
        annualMonthlyPrice: 100,
        isPerSeat: true,
        minSeats: 5,
        features: ["6.25x Pro usage", "Claude Code access", "All Team features"],
      },
      {
        id: "claude_enterprise",
        name: "Enterprise",
        monthlyPrice: 0, // custom
        isPerSeat: true,
        features: ["SSO", "HIPAA ready", "Custom usage limits", "Dedicated support"],
      },
    ],
  },
  {
    id: "chatgpt",
    name: "ChatGPT (OpenAI)",
    category: "chat",
    officialPricingUrl: "https://openai.com/chatgpt/pricing",
    plans: [
      {
        id: "chatgpt_free",
        name: "Free",
        monthlyPrice: 0,
        isPerSeat: false,
        features: ["Limited GPT-5.3 access", "Basic features"],
      },
      {
        id: "chatgpt_plus",
        name: "Plus",
        monthlyPrice: 20,
        isPerSeat: false,
        features: ["GPT-5.5 access", "Deep Research", "Sora", "Agent Mode"],
      },
      {
        id: "chatgpt_pro_100",
        name: "Pro (5x)",
        monthlyPrice: 100,
        isPerSeat: false,
        features: ["5x Plus limits", "GPT-5.5 Pro access", "Extended thinking"],
      },
      {
        id: "chatgpt_pro_200",
        name: "Pro (20x)",
        monthlyPrice: 200,
        isPerSeat: false,
        features: ["20x Plus limits", "1M token context", "All model access"],
      },
      {
        id: "chatgpt_team",
        name: "Team",
        monthlyPrice: 30,
        annualMonthlyPrice: 25,
        isPerSeat: true,
        minSeats: 2,
        features: ["GPT-5.5 access", "Shared workspace", "Custom GPTs", "Admin controls", "Training data exclusion"],
      },
      {
        id: "chatgpt_enterprise",
        name: "Enterprise",
        monthlyPrice: 60, // estimated — custom pricing
        isPerSeat: true,
        minSeats: 150,
        features: ["Custom pricing", "SOC 2 compliance", "SLA guarantees", "Advanced analytics"],
      },
    ],
  },
  {
    id: "anthropic_api",
    name: "Anthropic API",
    category: "api",
    officialPricingUrl: "https://www.anthropic.com/pricing#api",
    plans: [
      {
        id: "anthropic_api_direct",
        name: "API Direct",
        monthlyPrice: 0, // pay-per-token
        isPerSeat: false,
        features: [
          "Sonnet 4.6: $3/M input, $15/M output",
          "Opus 4.6: $5/M input, $25/M output",
          "Haiku 4.5: $1/M input, $5/M output",
          "50% Batch API discount",
        ],
      },
    ],
  },
  {
    id: "openai_api",
    name: "OpenAI API",
    category: "api",
    officialPricingUrl: "https://openai.com/api/pricing",
    plans: [
      {
        id: "openai_api_direct",
        name: "API Direct",
        monthlyPrice: 0, // pay-per-token
        isPerSeat: false,
        features: [
          "GPT-5.5: $5/M input, $30/M output",
          "50% Batch API discount",
          "No free credits",
        ],
      },
    ],
  },
  {
    id: "gemini",
    name: "Google Gemini",
    category: "chat",
    officialPricingUrl: "https://gemini.google.com/advanced",
    plans: [
      {
        id: "gemini_free",
        name: "Free",
        monthlyPrice: 0,
        isPerSeat: false,
        features: ["Basic Gemini access", "Limited usage"],
      },
      {
        id: "gemini_pro",
        name: "Google AI Pro",
        monthlyPrice: 19.99,
        isPerSeat: false,
        features: ["Gemini 3.1 Pro", "1M context window", "5TB storage", "Workspace integration"],
      },
      {
        id: "gemini_ultra",
        name: "Google AI Ultra",
        monthlyPrice: 99.99,
        isPerSeat: false,
        features: ["Gemini 3.1 Pro + Deep Think", "Veo video generation", "20x limits", "100$/mo Google Cloud credits"],
      },
    ],
  },
  {
    id: "windsurf",
    name: "Windsurf",
    category: "coding",
    officialPricingUrl: "https://windsurf.com/pricing",
    plans: [
      {
        id: "windsurf_free",
        name: "Free",
        monthlyPrice: 0,
        isPerSeat: false,
        features: ["25 credits/mo", "Unlimited Tab completions"],
      },
      {
        id: "windsurf_pro",
        name: "Pro",
        monthlyPrice: 20,
        annualMonthlyPrice: 16,
        isPerSeat: false,
        features: ["Daily/weekly quotas", "Cascade agent", "All model access"],
      },
      {
        id: "windsurf_max",
        name: "Max",
        monthlyPrice: 200,
        isPerSeat: false,
        features: ["Maximum AI capacity", "Priority access", "All features"],
      },
      {
        id: "windsurf_teams",
        name: "Teams",
        monthlyPrice: 40,
        annualMonthlyPrice: 32,
        isPerSeat: true,
        features: ["Centralized billing", "Usage analytics", "Team quota management"],
      },
    ],
  },
];

export const TOOL_MAP = Object.fromEntries(TOOLS.map((t) => [t.id, t]));

export function getPlan(toolId: string, planId: string): PlanTier | undefined {
  return TOOL_MAP[toolId]?.plans.find((p) => p.id === planId);
}