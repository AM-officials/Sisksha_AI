// Centralised AI configuration — all AI calls in the app use this.
// Provider: NVIDIA API (OpenAI-compatible)
export const AI_API_KEY  = import.meta.env.VITE_AI_API_KEY  as string;
export const AI_BASE_URL = import.meta.env.VITE_AI_BASE_URL as string;
export const AI_MODEL    = import.meta.env.VITE_AI_MODEL    as string;

// In development, route through Vite's proxy (/api/ai → https://integrate.api.nvidia.com/v1)
// to bypass CORS. In production, call the API directly.
export const AI_CHAT_URL = import.meta.env.DEV
  ? '/api/ai/chat/completions'
  : `${AI_BASE_URL}/chat/completions`;

/**
 * Thin wrapper around the NVIDIA / OpenAI-compatible chat endpoint.
 * Automatically retries on 429 / 529 (rate limit / server overloaded)
 * with exponential back-off.
 */
export async function callAI(params: {
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}, maxRetries = 3): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await fetch(AI_CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        ...params,
      }),
    });

    // Retry on rate-limit (429) or server overload (529)
    if (response.status === 429 || response.status === 529) {
      const retryAfter = parseInt(response.headers.get('retry-after') ?? '0', 10);
      const backoff = retryAfter > 0 ? retryAfter * 1000 : Math.pow(2, attempt) * 1500;
      lastError = new Error(`Rate limited (${response.status}). Retrying in ${backoff / 1000}s…`);
      await new Promise(res => setTimeout(res, backoff));
      continue;
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? '';
  }

  throw lastError ?? new Error('AI request failed after retries.');
}
