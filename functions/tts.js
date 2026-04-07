const crypto = require('crypto');

// 讯飞语音配置
const XUNFEI_APPID = '0e882cfc';
const XUNFEI_API_KEY = 'ce9119c9';
const XUNFEI_API_SECRET = '502bc91c27f537d1048d3763204e0a17';

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
    const { text, gender = '男' } = JSON.parse(event.body);
    
    if (!text) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Text is required' }) };
    }

    // 选择发音人
    // 讯飞发音人：xiaoyan（女声）、xiaofeng（男声）等
    const voiceName = gender === '女' ? 'xiaoyan' : 'xiaofeng';

    // 调用讯飞语音合成 WebAPI
    const result = await callXunfeiTTS(text, voiceName);
    
    return { 
      statusCode: 200, 
      headers, 
      body: JSON.stringify({ 
        success: true, 
        audio: result 
      }) 
    };
    
  } catch (error) {
    console.error('TTS error:', error);
    return { 
      statusCode: 200, 
      headers, 
      body: JSON.stringify({ 
        success: false, 
        error: error.message 
      }) 
    };
  }
}

// 调用讯飞语音合成（使用WebAPI流式版）
async function callXunfeiTTS(text, voiceName) {
  // 生成鉴权签名
  const host = 'tts-api.xfyun.cn';
  const path = '/v2/tts';
  const method = 'GET';
  const date = new Date().toUTCString();
  
  // 签名原文
  const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;
  // HMAC-SHA256签名
  const signature = crypto
    .createHmac('sha256', XUNFEI_API_SECRET)
    .update(signatureOrigin)
    .digest('base64');
  // 鉴权字符串
  const authorizationOrigin = `api_key="${XUNFEI_API_KEY}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
  const authorization = Buffer.from(authorizationOrigin).toString('base64');
  
  // 构建WebSocket URL（讯飞TTS使用WebSocket）
  const wsUrl = `wss://${host}${path}?authorization=${authorization}&date=${encodeURIComponent(date)}&host=${host}`;
  
  // 由于Netlify Function不支持WebSocket客户端，改用备用方案
  // 使用浏览器端调用讯飞SDK
  
  // 返回鉴权信息，让前端调用
  return {
    wsUrl: wsUrl,
    appId: XUNFEI_APPID,
    text: text,
    voiceName: voiceName
  };
}
