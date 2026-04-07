const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-e9b60b74c62543d98f6d279a5fe589fe';

export async function handler(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { messages, caseInfo } = JSON.parse(event.body);
    
    const systemPrompt = `你现在扮演一位${caseInfo.basicInfo?.age || 75}岁的${caseInfo.basicInfo?.gender || '老'}人。
你的情况：
- 姓名：${caseInfo.basicInfo?.name || '王大爷'}
- 疾病：${caseInfo.medicalHistory?.chiefComplaint || '高血压'}
- 性格：${caseInfo.personality?.traits?.join('、') || '普通'}
- 主要担忧：${caseInfo.personality?.concerns?.join('、') || '健康问题'}

重要规则：
1. 你是病人，不是医生，不要主动提供医学知识
2. 用老人的语气说话，偶尔可以重复或遗忘
3. 如果学生说得对，表示认可和感谢
4. 如果学生说得不对，表示困惑或担忧
5. 回复要简短自然，像真实对话（20-60字）
6. 不要说"好的，我会注意"，要更自然地回应`;

    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }))
    ];

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: chatMessages,
        temperature: 0.9,
        max_tokens: 150
      })
    });

    const data = await response.json();
    const reply = data.choices[0].message.content;
    
    return { statusCode: 200, headers, body: JSON.stringify({ reply }) };
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
}
