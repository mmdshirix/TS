// Backwards-compatible facade. All AI traffic is routed through lib/ai (Arvan by
// default, DeepSeek as the switchable alternative). Existing imports keep working.
import { askAI, extractJson as extractJsonUnified, AIUnavailableError, type AIMessage } from "@/lib/ai"

export class DeepSeekUnavailableError extends AIUnavailableError {}

export async function callDeepSeek(
  prompt: string,
  options: {
    system?: string
    temperature?: number
    maxTokens?: number
    history?: { role: "user" | "assistant"; content: string }[]
    provider?: "arvan" | "deepseek"
  } = {},
): Promise<string> {
  try {
    return await askAI(prompt, {
      system: options.system,
      temperature: options.temperature,
      maxTokens: options.maxTokens ?? 1800,
      history: (options.history || []) as AIMessage[],
      provider: options.provider,
      timeoutMs: 40_000,
    })
  } catch (err) {
    if (err instanceof AIUnavailableError) throw new DeepSeekUnavailableError(err.message)
    throw err
  }
}

export const extractJson = extractJsonUnified
