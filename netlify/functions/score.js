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
    const { conversation, caseInfo } = JSON.parse(event.body);
    
    const conversationText = conversation
      .map(m => `${m.role === 'user' ? '学生' : '老人'}：${m.content}`)
      .join('\n');

    const prompt = `你是康养专业教学评估专家。请根据以下对话记录评分。

对话记录：
${conversationText}

老人病例：${caseInfo.caseName}，${caseInfo.medicalHistory?.chiefComplaint}

评分标准（每项0-25分，总分100）：
1. 思政维度：是否体现关爱老人、尊重老人价值观
2. 心理慰藉：是否给予情感支持、缓解焦虑
3. 健康宣教：健康知识传达是否准确、易懂
4. 康复训练：是否指导合理的康复方法

严格返回JSON格式：
{
  "totalScore": 总分,
  "dimensions": {"思政":分,"心理慰藉":分,"健康宣教":分,"康复训练":分},
  "strengths": ["做得好的地方1","做得好的地方2"],
  "omissions": ["不足之处1","不足之处2"],
  "suggestions": ["改进建议1","改进建议2"]
}`;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const scoreData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    
    return { statusCode: 200, headers, body: JSON.stringify(scoreData) };
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
}
