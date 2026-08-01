// Centralised AI configuration — all AI calls in the app use this.
// Provider: NVIDIA API (OpenAI-compatible)
export const AI_API_KEY  = import.meta.env.VITE_AI_API_KEY  as string;
export const AI_BASE_URL = import.meta.env.VITE_AI_BASE_URL as string;
export const AI_MODEL    = import.meta.env.VITE_AI_MODEL    as string;

// In both development and production, route through our /api/ai/chat/completions endpoint.
// In development: Vite proxy intercepts this and forwards to NVIDIA.
// In production: Vercel Serverless Function intercepts this and adds the API key securely.
export const AI_CHAT_URL = '/api/ai/chat/completions';

/**
 * Thin wrapper around the NVIDIA / OpenAI-compatible chat endpoint.
 * Automatically retries on 429 / 529 (rate limit / server overloaded)
 * with exponential back-off.
 */
export async function callAI(params: {
  model?: string;
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}, maxRetries = 3): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // In dev, we might have the key on the client. In prod, the Vercel function injects it.
    if (AI_API_KEY) {
      headers['Authorization'] = `Bearer ${AI_API_KEY}`;
    }

    const response = await fetch(AI_CHAT_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: params.model || AI_MODEL,
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
    const msg = data.choices?.[0]?.message;
    return msg?.content || msg?.reasoning_content || msg?.reasoning || '';
  }

  throw lastError ?? new Error('AI request failed after retries.');
}
