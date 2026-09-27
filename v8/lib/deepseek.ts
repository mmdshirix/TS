const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions"

export class DeepSeekUnavailableError extends Error {}

export async function callDeepSeek(
  prompt: string,
  options: {
    system?: string
    temperature?: number
    maxTokens?: number
    history?: { role: "user" | "assistant"; content: string }[]
  } = {},
): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    throw new DeepSeekUnavailableError("DEEPSEEK_API_KEY تنظیم نشده است")
  }

  const messages = [
    ...(options.system ? [{ role: "system", content: options.system }] : []),
    ...(options.history || []),
    { role: "user", content: prompt },
  ]

  const response = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1800,
    }),
  })

  if (!response.ok) {
    throw new Error(`DeepSeek error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ""
}

// DeepSeek is asked to reply with a single JSON array/object; this pulls it out even
// if the model wraps it in prose or a ```json fence.
export function extractJson<T>(text: string): T | null {
  const match = text.match(/\[[\s\S]*\]|\{[\s\S]*\}/)
  if (!match) return null
  try {
    return JSON.parse(match[0]) as T
  } catch {
    return null
  }
}
