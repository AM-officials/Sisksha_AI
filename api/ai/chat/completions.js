export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get the AI API key and Base URL from environment variables
  // Note: On Vercel, you should add these to your project's Environment Variables
  // WITHOUT the VITE_ prefix (e.g. AI_API_KEY) so they are hidden from the frontend,
  // but for backward compatibility we can check both.
  const apiKey = process.env.AI_API_KEY || process.env.VITE_AI_API_KEY;
  const baseUrl = process.env.AI_BASE_URL || process.env.VITE_AI_BASE_URL || 'https://integrate.api.nvidia.com/v1';

  if (!apiKey) {
    return res.status(500).json({ error: 'AI API Key is not configured on the server' });
  }

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('AI Proxy Error:', error);
    return res.status(500).json({ error: 'Internal server error while communicating with AI API' });
  }
}
