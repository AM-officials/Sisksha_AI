// Centralised AI configuration — all AI calls in the app use this.
// Provider: NVIDIA API (OpenAI-compatible)
export const AI_API_KEY  = import.meta.env.VITE_AI_API_KEY  as string;
export const AI_BASE_URL = import.meta.env.VITE_AI_BASE_URL as string;
export const AI_MODEL    = import.meta.env.VITE_AI_MODEL    as string;
export const AI_CHAT_URL = `${AI_BASE_URL}/chat/completions`;

/**
 * Thin wrapper around the NVIDIA / OpenAI-compatible chat endpoint.
 * All AI calls in the app should go through this helper.
 */
export async function callAI(params: {
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}): Promise<string> {
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

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? '';
}
