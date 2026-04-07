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
    
    const prompt = `你是一位老年病学专家。根据以下画像生成病例，严格返回JSON格式：

画像：年龄${profile.age}岁，${profile.gender}，患${profile.diseases.join('、')}，性格${profile.personality}，说${profile.dialect}。

返回格式：
{"caseName":"病例名","basicInfo":{"name":"姓名","age":75,"gender":"性别","occupation":"职业","familyStatus":"家庭"},"medicalHistory":{"chiefComplaint":"主诉","presentIllness":"现病史","pastHistory":"既往史","medications":["药物"],"allergies":"无"},"personality":{"traits":["特点"],"hobbies":["爱好"],"concerns":["担忧"]},"openingLine":"老人开场白"}`;

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
    
    return { statusCode: 200, headers, body: JSON.stringify(caseData) };
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
}
