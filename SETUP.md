# AI老人系统部署配置指南

## 已完成
✅ 前端代码更新（真实API调用、Supabase登录）
✅ Netlify Functions 创建
✅ 推送到 GitHub

## 需要在 Netlify 后台配置

### 1. 配置环境变量
进入 Netlify 项目设置 → Environment variables，添加以下变量：

```
VITE_SUPABASE_URL = https://todnsmeovkpmniqcwucm.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvZG5zbWVvdmtwbW5pcWN3dWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0OTY0NzMsImV4cCI6MjA5MTA3MjQ3M30.7LSP7dtoRDTiGp--7gC9NXvQARd_uPh1_-i0PajluHU
DEEPSEEK_API_KEY = sk-e9b60b74c62543d98f6d279a5fe589fe
```

### 2. 触发重新部署
配置完环境变量后，点击 "Deploys" → "Trigger deploy" → "Deploy site"

## 功能说明

### API 端点
- `/.netlify/functions/generate-case` - 调用 DeepSeek 生成病例
- `/.netlify/functions/chat` - AI 对话
- `/.netlify/functions/score` - 练习评分

### 登录方式
- 管理员：admin / admin123
- 测试学生：student / 123456
- 或通过 Supabase 注册新用户

### Supabase 数据表结构
需要确保 Supabase 中有以下表：

```sql
-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name TEXT,
  email TEXT,
  role TEXT DEFAULT 'student',
  class_id UUID
);

-- 班级表
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 练习记录表
CREATE TABLE practice_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  case_data JSONB,
  messages JSONB,
  score INTEGER,
  dimensions JSONB,
  feedback TEXT,
  status TEXT DEFAULT 'created',
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 本地开发

```bash
# 安装依赖
npm install

# 创建 .env 文件（复制 .env.example）
cp .env.example .env

# 启动开发服务器
npm run dev

# 或使用 Netlify CLI 本地测试 Functions
npx netlify-cli dev
```
