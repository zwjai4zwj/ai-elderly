// Supabase Edge Function - Chat API代理（修复版）
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const DEEPSEEK_API_KEY = "sk-e9b60b74c62543d98f6d279a5fe589fe"

Deno.serve(async (req) => {
  // CORS预检
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
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    })
  }

  try {
    const body = await req.json()
    const isScoreMode = body.mode === 'score'
    
    // 对话模式用150token，评分模式用800token
    const maxTokens = isScoreMode ? 800 : 150
    // 对话模式更有创意(0.9)，评分模式更严谨(0.3)
    const temperature = isScoreMode ? 0.3 : 0.9

    console.log("请求模式:", isScoreMode ? "评分" : "对话", "max_tokens:", maxTokens)

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

    if (!response.ok) {
      const errorText = await response.text()
      console.error("DeepSeek API错误:", response.status, errorText)
      return new Response(JSON.stringify({ error: "DeepSeek API错误: " + response.status }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      })
    }

    const data = await response.json()
    
    // 验证响应格式
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("响应格式错误:", JSON.stringify(data))
      return new Response(JSON.stringify({ error: "响应格式错误" }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      })
    }

    console.log("DeepSeek响应成功:", isScoreMode ? "评分完成" : data.choices[0].message.content.substring(0, 30))

    return new Response(JSON.stringify(data), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      },
    })
  } catch (error) {
    console.error("服务器错误:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      },
    })
  }
})
