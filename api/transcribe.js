// Edge function — proxies audio to OpenAI Whisper
export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  // Forward the multipart FormData as-is to OpenAI
  const formData = await req.formData();

  // Rebuild FormData (Edge runtime requires explicit append)
  const out = new FormData();
  out.append('file',  formData.get('file'), 'audio.webm');
  out.append('model', 'whisper-1');

  const r = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method:  'POST',
    headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
    body:    out,
  });

  const data = await r.json();
  return Response.json(data, { status: r.status });
}
