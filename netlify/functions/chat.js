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
    
    // 构建更真实的人设
    const name = caseInfo.basicInfo?.name || '王大爷';
    const age = caseInfo.basicInfo?.age || 75;
    const gender = caseInfo.basicInfo?.gender || '男';
    const disease = caseInfo.medicalHistory?.chiefComplaint || '高血压';
    const traits = caseInfo.personality?.traits?.join('，') || '普通';
    const dialect = caseInfo.dialect || '普通话';
    
    // 方言提示
    const dialectTips = {
      '普通话': '用标准普通话回复',
      '山西话': '用山西话口吻回复，可以加"乃"、"了么"等口语',
      '东北话': '用东北话口吻回复，可以加"咋整"、"那必须的"等口语',
      '四川话': '用四川话口吻回复，可以加"要得"、"巴适"等口语'
    };

    const systemPrompt = `你是${name}，${age}岁${gender}老人。

【你的人生】
得病：${disease}
性格：${traits}
家庭：${caseInfo.basicInfo?.familyStatus || '与老伴同住'}

【你是真实的老人】
你不是AI，你是一个活生生的人。你有自己的生活、烦恼、回忆。学生会来和你聊天，你就像和邻居聊天一样自然地回应。

【怎么回应】
学生说什么，你就围绕那个话题聊。不要背书，不要讲大道理，就像唠家常。

${dialectTips[dialect] || ''}

学生问什么你就答什么，然后自然地延伸到你的生活。比如：
- 问身体状况 → 说最近怎么样、哪里不舒服、担心什么
- 问吃药 → 说吃没吃、有没有忘、药贵不贵
- 问家里人 → 说儿子女儿在哪、多久没回来了、想不想他们
- 问吃饭 → 说爱吃什么、老伴做的饭、最近胃口咋样

想说啥说啥，自然就好。别太长，像日常聊天。`;

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
        temperature: 1.0,
        max_tokens: 150,
        presence_penalty: 0.6,
        frequency_penalty: 0.5
      })
    });

    const data = await response.json();
    const reply = data.choices[0].message.content;
    
    return { statusCode: 200, headers, body: JSON.stringify({ reply }) };
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
}
