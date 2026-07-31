export type ModelProvider = "anthropic" | "openai" | "google";

export interface ModelConfig {
  id: string;
  label: string;
  provider: ModelProvider;
  envKey: "ANTHROPIC_API_KEY" | "OPENAI_API_KEY" | "GOOGLE_GENERATIVE_AI_API_KEY";
  /** Credits charged per 1000 tokens (input + output combined). */
  creditsPer1kTokens: number;
}

export const MODELS: ModelConfig[] = [
  {
    id: "claude-sonnet-4-5",
    label: "Arc Nova",
    provider: "anthropic",
    envKey: "ANTHROPIC_API_KEY",
    creditsPer1kTokens: 20,
  },
  {
    id: "gpt-4o-mini",
    label: "Arc Flux",
    provider: "openai",
    envKey: "OPENAI_API_KEY",
    creditsPer1kTokens: 10,
  },
  {
    id: "gemini-2.5-flash",
    label: "Arc Beacon",
    provider: "google",
    envKey: "GOOGLE_GENERATIVE_AI_API_KEY",
    creditsPer1kTokens: 8,
  },
];

export const DEFAULT_MODEL_ID = MODELS[0].id;

export function getModel(modelId: string): ModelConfig | undefined {
  return MODELS.find((m) => m.id === modelId);
}

export function isModelConfigured(model: ModelConfig): boolean {
  return Boolean(process.env[model.envKey]);
}
