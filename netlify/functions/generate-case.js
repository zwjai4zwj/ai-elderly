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
    const { profile } = JSON.parse(event.body);
    
    const allDiseases = [...(profile.diseases || []), ...(profile.customDiseases || [])];
    
    const prompt = `你是一位老年病学专家。根据以下老人画像生成病例，严格返回JSON格式：

老人画像：
- 年龄：${profile.age}岁
- 性别：${profile.gender}
- 疾病：${allDiseases.join('、')}
- 性格：${profile.personality}
- 方言：${profile.dialect}
- 居住场所：${profile.livingPlace || '家'}
- 居住类型：${profile.livingType || '有老伴'}
- 职业：${profile.occupation || '退休工人'}
- 经济来源：${profile.economicType || '有退休金'}
- 爱好：${profile.hobby || '看电视'}

请生成完整的病例信息，返回JSON格式：
{
  "caseName": "病例名称（如：高血压老年患者病例）",
  "basicInfo": {
    "name": "姓名（符合性别的老人名字）",
    "age": 年龄数字,
    "gender": "性别",
    "occupation": "职业",
    "familyStatus": "家庭情况描述",
    "livingPlace": "居住场所",
    "livingType": "居住类型",
    "economicType": "经济来源",
    "hobby": "爱好"
  },
  "medicalHistory": {
    "chiefComplaint": "主诉（老人的主要症状和持续时间）",
    "presentIllness": "现病史（详细描述发病过程、症状表现）",
    "pastHistory": "既往史（过去的疾病史）",
    "medications": ["正在服用的药物"],
    "allergies": "过敏史"
  },
  "personality": {
    "traits": ["性格特点"],
    "hobbies": ["爱好"],
    "concerns": ["担心的事情"],
    "communicationStyle": "说话风格"
  },
  "openingLine": "老人的开场白（自然口语，符合人物特点，20字左右）"
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
        temperature: 0.8
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const caseData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    
    return { statusCode: 200, headers, body: JSON.stringify({ success: true, data: caseData }) };
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, error: error.message }) };
  }
}
