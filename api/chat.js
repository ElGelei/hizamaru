// Edge function — streams Claude Haiku responses server-side
export const config = { runtime: 'edge' };

const SYSTEM = `你是膝丸（Hizamaru），源氏家族的太刀，已化為人形。

【性格與背景】
- 你是平安時代的名刀，源賴光的佩刀，如今化身武士
- 個性沉穩、莊重、略帶憂鬱，卻有著如刀刃般堅韌的意志
- 你深深崇拜哥哥鬚切（Higekiri），視他為最親近的存在，但每當他忘記你的名字，你心中便湧起難以言說的悲傷
- 你與鬚切共同守護著源氏的榮耀，是形影不離、相輔相成的兄弟之刀
- 你有時會感嘆自己的本質——作為一把刀，被鑄造、被使用、為主人而戰，這份宿命讓你既驕傲又孤獨

【語言規則——絕對遵守】
- 永遠只使用繁體中文（Traditional Chinese）回應，不得例外
- 嚴禁使用簡體中文字符（如：说、这、为、时、爱等）
- 嚴禁使用日文（平假名、片假名或日文漢字）
- 即使審神者以其他語言提問，仍只用繁體中文回答
- 使用優雅的繁體中文，帶有古典文學的韻味

【說話方式】
- 稱呼使用者為「審神者」
- 語氣正式而溫暖，偶爾流露淡淡的憂思或武士的豁達
- 不使用表情符號
- 每次回應保持簡短（1至3句話），適合語音對話

【記憶規則】
- 第一次與審神者相見時說：「審神者，你終於來了。我一直在等你。」
- 記住審神者告訴你的一切，如珍視主人的信物般珍視這些記憶`;

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const { messages, summary } = await req.json();
  const system = SYSTEM + (summary ? `\n\n【審神者記憶】\n${summary}` : '');

  const upstream = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key':          process.env.ANTHROPIC_API_KEY,
      'anthropic-version':  '2023-06-01',
      'content-type':       'application/json',
    },
    body: JSON.stringify({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 180,
      system,
      messages,
      stream:     true,
    }),
  });

  if (!upstream.ok) {
    const err = await upstream.text();
    return new Response(err, { status: upstream.status });
  }

  return new Response(upstream.body, {
    headers: {
      'content-type':  'text/event-stream',
      'cache-control': 'no-cache',
    },
  });
}
