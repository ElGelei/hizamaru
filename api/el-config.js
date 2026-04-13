// Edge function — returns ElevenLabs config for WebSocket connection
// The WS key is returned at runtime, never baked into source code
export const config = { runtime: 'edge' };

export default function handler() {
  return Response.json({
    apiKey:  process.env.ELEVENLABS_API_KEY,
    voiceId: process.env.ELEVENLABS_VOICE_ID,
  });
}
