import Anthropic from "@anthropic-ai/sdk";

// Supported Sonnet 4.6 replacement for the Sonnet 4 model retired June 15, 2026.
// Check https://platform.claude.com/docs/en/about-claude/model-deprecations
// before changing this selection; do not restore retired model identifiers.
export const DEFAULT_MODEL_STR = "claude-sonnet-4-6";

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export function hasAnthropicKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}
