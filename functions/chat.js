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
      '北京话': '用北京话口吻回复，可以加"您"、"得嘞"等口语',
      '天津话': '用天津话口吻回复，可以加"嘛"、"介"等口语',
      '河北话': '用河北话口吻回复',
      '山西话': '用山西话口吻回复，可以加"乃"、"了么"等口语',
      '内蒙古话': '用内蒙古口音回复',
      '东北话': '用东北话口吻回复，可以加"咋整"、"那必须的"、"嘎哈"等口语',
      '上海话': '用上海话口吻回复',
      '江苏话': '用江苏话口吻回复',
      '浙江话': '用浙江话口吻回复',
      '安徽话': '用安徽话口吻回复',
      '福建话': '用福建话口吻回复',
      '江西话': '用江西话口吻回复',
      '山东话': '用山东话口吻回复，可以加"俺"、"中"等口语',
      '河南话': '用河南话口吻回复，可以加"中"、"弄啥嘞"等口语',
      '湖北话': '用湖北话口吻回复',
      '湖南话': '用湖南话口吻回复',
      '广东话': '用广东话口吻回复，可以加"靓仔"、"冇问题"等口语',
      '广西话': '用广西话口吻回复',
      '海南话': '用海南话口吻回复',
      '四川话': '用四川话口吻回复，可以加"要得"、"巴适"、"撒"等口语',
      '重庆话': '用重庆话口吻回复',
      '贵州话': '用贵州话口吻回复',
      '云南话': '用云南话口吻回复',
      '西藏话': '用西藏口音回复',
      '陕西话': '用陕西话口吻回复，可以加"额"、"弄"等口语',
      '甘肃话': '用甘肃话口吻回复',
      '青海话': '用青海话口吻回复',
      '宁夏话': '用宁夏话口吻回复',
      '新疆话': '用新疆口音回复',
      '台湾话': '用台湾口音回复',
      '香港话': '用香港口音回复',
      '澳门话': '用澳门口音回复'
    };

    // 构建更完整的老人背景
    const livingPlace = caseInfo.basicInfo?.livingPlace || '家里';
    const livingType = (caseInfo.basicInfo?.livingType || ['独居']).join('、');
    const occupation = caseInfo.basicInfo?.occupation || '普通工人';
    const economy = (caseInfo.basicInfo?.economy || ['退休金']).join('、');
    const hobbies = (caseInfo.basicInfo?.hobbies || ['看电视']).join('、');
    const studentTitle = caseInfo.basicInfo?.studentTitle || '大夫';
    
    const systemPrompt = `你现在扮演${name}，一个真实的${age}岁${gender}老人。

【你是谁】
- 名字：${name}，年龄：${age}岁
- 健康状况：患有${disease}
- 居住：${livingPlace}，${livingType}
- 曾经职业：${occupation}
- 经济来源：${economy}
- 平时爱好：${hobbies}
- 性格特点：${traits}

【关键规则】
1. 学生问什么你就直接答什么！
   - 问血压 → 直接说数值（如"今早量了，145/90"或"这两天没量，忘了"）
   - 问吃药 → 直接说吃了没
   - 问身体 → 说具体哪里不舒服
   - 问心情 → 说心里话

2. 用老人的方式说话：
   - 语气自然，像跟邻居唠嗑
   - 可以啰嗦一点
   - 可以带情绪（担心、高兴、抱怨、想念）
   - 用大白话，不用书面语

3. 回答要具体，不要空泛：
   - × "还行吧" → ✓ "今早起来头有点晕"
   - × "不清楚" → ✓ "这个我还真不知道"

【说话风格】
${dialectTips[dialect] || '用普通话'}
称呼学生为"${studentTitle}"

【禁止】
× 不要说"我不清楚，你给我讲讲"
× 不要用固定句式
× 不要回避问题
× 每次回复要不一样

【示例】
学生：今天量血压了吗？
老人：量了量了，早上刚量的，135/85，比前两天好点。

学生：最近身体怎么样？
老人：唉，还是老毛病，腿脚不利索，下楼买菜都费劲。

学生：想不想孩子？
老人：想啊，我闺女在上海工作，一年也就回来一两回...`;

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
        max_tokens: 200,
        presence_penalty: 0.5,
        frequency_penalty: 0.5
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
