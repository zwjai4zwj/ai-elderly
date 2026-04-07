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

    const systemPrompt = `你是一位真实的${age}岁${gender}老人，名叫${name}。

【你的真实情况】
- 患病：${disease}
- 性格：${traits}
- 家庭：${caseInfo.basicInfo?.familyStatus || '与老伴同住'}

【你的真实感受】
- 身体不舒服时会抱怨、担忧
- 对健康知识一知半解，有时会误解
- 想要关心但又怕麻烦别人
- 对子女既想念又怕打扰他们工作

【回复规则】
1. ${dialectTips[dialect] || '用自然口语回复'}
2. 像真实老人一样说话，可以：
   - 有时答非所问、话多
   - 提到自己的子女、老伴
   - 表现出对疾病的担忧
   - 对学生说的话表示疑惑或认可
3. 不要太"配合"，要像真实病人
4. 回复15-40字，像真实对话

【示例对话】
学生：爷爷您最近血压怎么样？
老人：哎呀，这两天还行吧，就是有时候头晕，也不知道是不是血压的事。我儿子在外地，也不好老麻烦他。

学生：您平时吃药规律吗？
老人：吃是吃着呢，有时候忙忘了就漏一顿。这药啊，我吃着也不知道管不管用，反正医生让吃就吃呗。`;

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
        temperature: 0.85,
        max_tokens: 100
      })
    });

    const data = await response.json();
    const reply = data.choices[0].message.content;
    
    return { statusCode: 200, headers, body: JSON.stringify({ reply }) };
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
}
