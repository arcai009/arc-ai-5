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
    id: "gemini-flash-latest",
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

/** Models that actually have an API key set (server-side). */
export function configuredModels(): ModelConfig[] {
  return MODELS.filter(isModelConfigured);
}

/** Client-safe list ({id,label}) of models that work, for the model picker. */
export function configuredModelOptions(): { id: string; label: string }[] {
  return configuredModels().map((m) => ({ id: m.id, label: m.label }));
}

/** The default model that is actually usable, falling back to the static default. */
export function defaultConfiguredModelId(): string {
  return configuredModels()[0]?.id ?? DEFAULT_MODEL_ID;
}

/**
 * Resolve the model to actually run: the chosen one if it has a key, otherwise
 * the first configured model. Returns undefined only when nothing is configured.
 */
export function resolveConfiguredModel(modelId: string): ModelConfig | undefined {
  const chosen = getModel(modelId);
  if (chosen && isModelConfigured(chosen)) return chosen;
  return configuredModels()[0];
}
