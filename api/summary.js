// Edge function — generates conversation summary via Claude
export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const { history, prevSummary } = await req.json();

  const prompt = `Summarize key facts about the user (Saniwa) from this conversation — name, topics discussed, mood, important personal details Hizamaru should remember. Max 4 sentences. Previous summary: ${prevSummary || 'none'}

Conversation:
${history.map(m => `${m.role === 'user' ? 'Saniwa' : 'Hizamaru'}: ${m.content}`).join('\n')}

New summary:`;

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method:  'POST',
    headers: {
      'x-api-key':         process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type':      'application/json',
    },
    body: JSON.stringify({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 250,
      messages:   [{ role: 'user', content: prompt }],
    }),
  });

  const data = await r.json();
  const summary = data?.content?.[0]?.text ?? '';
  return Response.json({ summary });
}
