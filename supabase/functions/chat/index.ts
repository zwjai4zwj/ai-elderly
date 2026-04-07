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
    
    // 判断是评分模式还是对话模式
    const isScoreMode = body.mode === 'score'
    const maxTokens = isScoreMode ? 800 : 150
    
    console.log("收到请求:", isScoreMode ? "评分模式" : "对话模式")

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: body.messages,
        temperature: isScoreMode ? 0.3 : 0.9,  // 评分模式更确定
        max_tokens: maxTokens,
      }),
    })

    const data = await response.json()
    console.log("DeepSeek响应:", isScoreMode ? "评分完成" : JSON.stringify(data.choices?.[0]?.message?.content?.substring(0, 50)))

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
