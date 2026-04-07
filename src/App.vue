<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 登录页面 -->
    <div v-if="!isLoggedIn" class="flex items-center justify-center min-h-screen p-4">
      <div class="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h1 class="text-2xl font-bold text-center text-blue-600 mb-6">康养AI实训系统</h1>
        <p class="text-gray-500 text-center mb-6">阳泉师专康养系</p>
        
        <div class="space-y-4">
          <input 
            v-model="loginForm.username" 
            placeholder="账号" 
            class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input 
            v-model="loginForm.password" 
            type="password"
            placeholder="密码" 
            class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            @click="login" 
            class="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            登录
          </button>
        </div>
        
        <p class="text-center text-gray-400 text-sm mt-4">
          默认管理员：admin / admin123
        </p>
      </div>
    </div>
    
    <!-- 主界面 -->
    <div v-else class="min-h-screen">
      <!-- 顶部导航 -->
      <div class="bg-blue-600 text-white p-4">
        <div class="flex justify-between items-center max-w-4xl mx-auto">
          <h1 class="text-lg font-bold">康养AI实训系统</h1>
          <button @click="logout" class="text-sm bg-blue-500 px-3 py-1 rounded">退出</button>
        </div>
      </div>
      
      <!-- 内容区域 -->
      <div class="max-w-4xl mx-auto p-4">
        <!-- 学生首页 -->
        <div v-if="currentUser.role === 'student'">
          <!-- 步骤指示器 -->
          <div v-if="currentStep === 'home'" class="space-y-4">
            <div class="bg-white rounded-xl p-6 shadow">
              <h2 class="text-xl font-bold mb-4">开始练习</h2>
              <p class="text-gray-500 mb-4">输入老人画像，AI将自动生成病例和对话场景</p>
              <button @click="currentStep = 'input'" class="w-full py-3 bg-blue-600 text-white rounded-lg font-medium">
                开始新练习
              </button>
            </div>
            
            <div class="bg-white rounded-xl p-6 shadow">
              <h2 class="text-lg font-bold mb-2">练习历史</h2>
              <p class="text-gray-400">暂无练习记录</p>
            </div>
          </div>
          
          <!-- 输入画像 -->
          <div v-else-if="currentStep === 'input'" class="bg-white rounded-xl p-6 shadow">
            <h2 class="text-xl font-bold mb-6">老人画像设置</h2>
            
            <div class="space-y-4">
              <div>
                <label class="block text-gray-700 mb-2">年龄</label>
                <select v-model="caseProfile.age" class="w-full px-4 py-3 border rounded-lg">
                  <option value="60-70">60-70岁</option>
                  <option value="70-80">70-80岁</option>
                  <option value="80-90">80-90岁</option>
                </select>
              </div>
              
              <div>
                <label class="block text-gray-700 mb-2">性别</label>
                <select v-model="caseProfile.gender" class="w-full px-4 py-3 border rounded-lg">
                  <option value="男">男</option>
                  <option value="女">女</option>
                </select>
              </div>
              
              <div>
                <label class="block text-gray-700 mb-2">疾病类型</label>
                <div class="grid grid-cols-2 gap-2">
                  <label v-for="d in diseases" :key="d" class="flex items-center p-2 border rounded-lg">
                    <input type="checkbox" v-model="caseProfile.diseases" :value="d" class="mr-2">
                    {{ d }}
                  </label>
                </div>
              </div>
              
              <div>
                <label class="block text-gray-700 mb-2">性格特点</label>
                <select v-model="caseProfile.personality" class="w-full px-4 py-3 border rounded-lg">
                  <option value="开朗健谈">开朗健谈</option>
                  <option value="内向沉默">内向沉默</option>
                  <option value="焦虑多疑">焦虑多疑</option>
                  <option value="固执保守">固执保守</option>
                </select>
              </div>
              
              <div>
                <label class="block text-gray-700 mb-2">方言偏好</label>
                <select v-model="caseProfile.dialect" class="w-full px-4 py-3 border rounded-lg">
                  <option value="普通话">普通话</option>
                  <option value="山西话">山西话</option>
                  <option value="东北话">东北话</option>
                  <option value="四川话">四川话</option>
                </select>
              </div>
              
              <button 
                @click="generateCase" 
                :disabled="isGenerating"
                class="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
              >
                {{ isGenerating ? '生成中...' : '生成病例' }}
              </button>
            </div>
          </div>
          
          <!-- 病例展示 -->
          <div v-else-if="currentStep === 'case'" class="space-y-4">
            <div class="bg-white rounded-xl p-6 shadow">
              <h2 class="text-xl font-bold mb-4">{{ generatedCase.caseName }}</h2>
              <div class="space-y-3 text-gray-600">
                <p><strong>姓名：</strong>{{ generatedCase.basicInfo.name }}</p>
                <p><strong>年龄：</strong>{{ generatedCase.basicInfo.age }}岁</p>
                <p><strong>性别：</strong>{{ generatedCase.basicInfo.gender }}</p>
                <p><strong>主诉：</strong>{{ generatedCase.medicalHistory.chiefComplaint }}</p>
              </div>
            </div>
            
            <button 
              @click="startChat" 
              class="w-full py-3 bg-green-600 text-white rounded-lg font-medium"
            >
              开始对话练习
            </button>
          </div>
          
          <!-- 对话界面 -->
          <div v-else-if="currentStep === 'chat'" class="flex flex-col h-[calc(100vh-120px)]">
            <div class="flex-1 overflow-y-auto p-4 space-y-3">
              <div v-for="(msg, i) in messages" :key="i" 
                   :class="msg.role === 'user' ? 'text-right' : 'text-left'">
                <div :class="msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'"
                     class="inline-block max-w-[80%] px-4 py-2 rounded-lg">
                  {{ msg.content }}
                </div>
              </div>
            </div>
            
            <div class="p-4 bg-white border-t">
              <div class="flex gap-2">
                <input 
                  v-model="userInput" 
                  @keyup.enter="sendMessage"
                  placeholder="输入消息..."
                  class="flex-1 px-4 py-2 border rounded-lg"
                />
                <button @click="sendMessage" class="px-4 py-2 bg-blue-600 text-white rounded-lg">发送</button>
              </div>
              <button @click="endChat" class="w-full mt-2 py-2 bg-red-500 text-white rounded-lg text-sm">
                结束对话并评分
              </button>
            </div>
          </div>
          
          <!-- 评分报告 -->
          <div v-else-if="currentStep === 'score'" class="space-y-4">
            <div class="bg-white rounded-xl p-6 shadow text-center">
              <h2 class="text-2xl font-bold mb-2">练习完成！</h2>
              <div class="text-5xl font-bold text-blue-600 my-4">{{ score.totalScore }}</div>
              <p class="text-gray-500">总分 / 100</p>
            </div>
            
            <div class="bg-white rounded-xl p-6 shadow">
              <h3 class="font-bold mb-4">各维度得分</h3>
              <div class="space-y-3">
                <div v-for="(value, key) in score.dimensions" :key="key" class="flex items-center">
                  <span class="w-24">{{ key }}</span>
                  <div class="flex-1 bg-gray-200 rounded-full h-4 mx-2">
                    <div class="bg-blue-600 h-4 rounded-full" :style="{ width: value * 4 + '%' }"></div>
                  </div>
                  <span class="w-8 text-right">{{ value }}</span>
                </div>
              </div>
            </div>
            
            <button @click="resetPractice" class="w-full py-3 bg-blue-600 text-white rounded-lg font-medium">
              开始新练习
            </button>
          </div>
        </div>
        
        <!-- 管理员首页 -->
        <div v-else-if="currentUser.role === 'admin'" class="space-y-4">
          <div class="bg-white rounded-xl p-6 shadow">
            <h2 class="text-xl font-bold mb-4">管理员后台</h2>
            <p class="text-gray-500">欢迎，{{ currentUser.name }}</p>
          </div>
          
          <div class="grid gap-4">
            <div class="bg-white rounded-xl p-6 shadow">
              <h3 class="font-bold mb-2">创建班级</h3>
              <p class="text-gray-400 text-sm">功能开发中...</p>
            </div>
            <div class="bg-white rounded-xl p-6 shadow">
              <h3 class="font-bold mb-2">创建用户</h3>
              <p class="text-gray-400 text-sm">功能开发中...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const isLoggedIn = ref(false)
const currentUser = ref({})
const currentStep = ref('home')

const loginForm = reactive({
  username: '',
  password: ''
})

const caseProfile = reactive({
  age: '70-80',
  gender: '男',
  diseases: ['高血压'],
  personality: '开朗健谈',
  dialect: '普通话'
})

const diseases = ['高血压', '糖尿病', '冠心病', '阿尔茨海默', '帕金森', '关节炎']

const generatedCase = ref({})
const messages = ref([])
const userInput = ref('')
const isGenerating = ref(false)

const score = ref({
  totalScore: 0,
  dimensions: {}
})

// 登录
function login() {
  if (loginForm.username === 'admin' && loginForm.password === 'admin123') {
    currentUser.value = { username: 'admin', name: '管理员', role: 'admin' }
    isLoggedIn.value = true
  } else if (loginForm.username === 'student' && loginForm.password === '123456') {
    currentUser.value = { username: 'student', name: '学生', role: 'student' }
    isLoggedIn.value = true
  } else {
    alert('账号或密码错误')
  }
}

// 退出
function logout() {
  isLoggedIn.value = false
  currentUser.value = {}
  loginForm.username = ''
  loginForm.password = ''
}

// 生成病例
async function generateCase() {
  isGenerating.value = true
  
  // 模拟 AI 生成
  await new Promise(r => setTimeout(r, 2000))
  
  generatedCase.value = {
    caseName: '高血压老年患者病例',
    basicInfo: {
      name: '王大爷',
      age: 75,
      gender: caseProfile.gender,
      occupation: '退休教师',
      familyStatus: '与老伴同住，子女在外地工作'
    },
    medicalHistory: {
      chiefComplaint: '头晕、乏力1周',
      presentIllness: '患者1周前开始出现头晕，伴乏力，血压波动在150-170/90-100mmHg',
      medications: ['硝苯地平缓释片', '阿司匹林']
    },
    personality: {
      traits: [caseProfile.personality],
      concerns: ['担心血压控制不好', '想了解饮食注意事项']
    },
    openingLine: '大夫啊，我这几天老觉得头晕，是不是血压又高了？'
  }
  
  isGenerating.value = false
  currentStep.value = 'case'
}

// 开始对话
function startChat() {
  messages.value = [
    { role: 'assistant', content: generatedCase.value.openingLine }
  ]
  currentStep.value = 'chat'
}

// 发送消息
async function sendMessage() {
  if (!userInput.value.trim()) return
  
  const userMsg = userInput.value
  messages.value.push({ role: 'user', content: userMsg })
  userInput.value = ''
  
  // 模拟 AI 回复
  await new Promise(r => setTimeout(r, 1000))
  
  const replies = [
    '嗯，大夫你说得对，我记住了。',
    '这个我还真不太清楚，你给我讲讲？',
    '我平时确实喜欢吃咸的，看来得改改了。',
    '谢谢你啊，大夫，我回去一定注意。',
    '我老伴也说我得少吃点盐，看来她是对的。'
  ]
  
  messages.value.push({ 
    role: 'assistant', 
    content: replies[Math.floor(Math.random() * replies.length)]
  })
}

// 结束对话
function endChat() {
  // 模拟评分
  score.value = {
    totalScore: Math.floor(Math.random() * 30) + 70,
    dimensions: {
      '思政': Math.floor(Math.random() * 10) + 15,
      '心理慰藉': Math.floor(Math.random() * 10) + 15,
      '健康宣教': Math.floor(Math.random() * 10) + 15,
      '康复训练': Math.floor(Math.random() * 10) + 15
    }
  }
  currentStep.value = 'score'
}

// 重置练习
function resetPractice() {
  currentStep.value = 'home'
  messages.value = []
  generatedCase.value = {}
  score.value = { totalScore: 0, dimensions: {} }
}
</script>
