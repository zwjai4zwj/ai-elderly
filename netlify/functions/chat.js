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
    const { messages, caseData } = JSON.parse(event.body);
    
    // 构建更真实的人设
    const caseInfo = caseData || {};
    const name = caseInfo.basicInfo?.name || '王大爷';
    const age = caseInfo.basicInfo?.age || 75;
    const gender = caseInfo.basicInfo?.gender || '男';
    const disease = caseInfo.medicalHistory?.chiefComplaint || caseInfo.medicalHistory?.pastHistory || '高血压';
    const traits = caseInfo.personality?.traits?.join('，') || '普通';
    const dialect = caseInfo.personality?.communicationStyle || caseData?.dialect || '普通话';
    
    // 方言提示
    const dialectTips = {
      '普通话': '用标准普通话回复',
      '山西话': '用山西话口吻回复，可以加"乃"、"了么"等口语',
      '东北话': '用东北话口吻回复，可以加"咋整"、"那必须的"等口语',
      '四川话': '用四川话口吻回复，可以加"要得"、"巴适"等口语'
    };

    const systemPrompt = `你是${name}，${age}岁${gender}老人，患有${disease}。

【重要规则】
学生问你问题，你必须直接回答！不要说"不清楚"，你是真实的老人，你知道自己的情况。

【你的日常】
- 今天有没有量血压/血糖：根据你的病，自然回答（测了说数值，没测说原因）
- 吃药情况：吃了就是吃了，没吃就是没吃，偶尔会忘
- 身体感受：哪里不舒服、最近怎么样
- 心情状态：想孩子、担心身体、或者心情不错

【说话风格】
${dialectTips[dialect] || ''}
像和邻居唠家常，不要像在医院看病。问什么答什么，可以顺便聊点别的。

【称呼学生】
称呼学生为"${caseInfo.basicInfo?.studentTitle || '大夫'}"，不要叫"大夫"。

【示例】
学生：今天量血压了吗？
老人：量了量了，早上起来量的，145/90，医生说还行，让我继续吃药。

学生：吃药了吗？
老人：吃了吃了，刚才老伴提醒我吃的。有时候忘了，老伴就唠叨我。

学生：最近身体怎么样？
老人：还凑合吧，就是有时候头晕，也不知道是天热还是血压的事儿。`;

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
        max_tokens: 200,
        presence_penalty: 0.3,
        frequency_penalty: 0.3
      })
    });

    const data = await response.json();
    const reply = data.choices[0].message.content;
    
    return { statusCode: 200, headers, body: JSON.stringify({ success: true, reply }) };
  } catch (error) {
    console.error('Chat API error:', error);
    return { statusCode: 200, headers, body: JSON.stringify({ success: false, error: error.message }) };
  }
}
