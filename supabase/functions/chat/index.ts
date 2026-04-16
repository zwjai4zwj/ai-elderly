// Supabase Edge Function - Chat API代理
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const DEEPSEEK_API_KEY = "sk-e9b60b74c62543d98f6d279a5fe589fe"

Deno.serve(async (req) => {
  // CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    })
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    const body = await req.json()
    
    // 判断模式：chat对话(150), generate生成病例(800), score评分(1000)
    const mode = body.mode || 'chat'
    let maxTokens = 150
    let temperature = 0.9
    
    if (mode === 'generate') {
      maxTokens = 800
      temperature = 0.7
    } else if (mode === 'score') {
      maxTokens = 1000
      temperature = 0.3
    }
    
    console.log("收到请求:", mode, "maxTokens:", maxTokens)

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: body.messages,
        temperature: temperature,
        max_tokens: maxTokens,
      }),
    })

    const data = await response.json()
    console.log("DeepSeek响应:", mode === 'score' ? "评分完成" : JSON.stringify(data.choices?.[0]?.message?.content?.substring(0, 50)))

    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (error) {
    console.error("错误:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    })
  }
})
