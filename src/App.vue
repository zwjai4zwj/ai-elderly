<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 登录页面 -->
    <div v-if="!isLoggedIn" class="flex items-center justify-center min-h-screen p-4">
      <div class="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h1 class="text-2xl font-bold text-center text-blue-600 mb-6">康养AI实训系统</h1>
        <p class="text-gray-500 text-center mb-6">阳泉师专康养系</p>
        
        <!-- 登录方式选择 -->
        <div class="flex mb-4 bg-gray-100 rounded-lg p-1">
          <button 
            @click="loginMode = 'password'"
            :class="loginMode === 'password' ? 'bg-white shadow' : ''"
            class="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
          >
            账号密码
          </button>
          <button 
            @click="loginMode = 'register'"
            :class="loginMode === 'register' ? 'bg-white shadow' : ''"
            class="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
          >
            注册账号
          </button>
        </div>
        
        <!-- 账号密码登录 -->
        <div v-if="loginMode === 'password'" class="space-y-4">
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
            :disabled="isLoggingIn"
            class="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
          >
            {{ isLoggingIn ? '登录中...' : '登录' }}
          </button>
          <p v-if="loginError" class="text-red-500 text-sm text-center">{{ loginError }}</p>
        </div>
        
        <!-- 注册 -->
        <div v-else class="space-y-4">
          <input 
            v-model="registerForm.name" 
            placeholder="姓名" 
            class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input 
            v-model="registerForm.email" 
            type="email"
            placeholder="邮箱" 
            class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input 
            v-model="registerForm.password" 
            type="password"
            placeholder="密码（至少6位）" 
            class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select v-model="registerForm.classId" class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">选择班级</option>
            <option v-for="cls in classes" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
          </select>
          <button 
            @click="register" 
            :disabled="isRegistering"
            class="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400"
          >
            {{ isRegistering ? '注册中...' : '注册' }}
          </button>
          <p v-if="registerError" class="text-red-500 text-sm text-center">{{ registerError }}</p>
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
          <div>
            <h1 class="text-lg font-bold">康养AI实训系统</h1>
            <p class="text-sm text-blue-200">{{ currentUser.name }} ({{ currentUser.role === 'admin' ? '管理员' : '学生' }})</p>
          </div>
          <button @click="logout" class="text-sm bg-blue-500 px-3 py-1 rounded hover:bg-blue-400">退出</button>
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
              <button @click="currentStep = 'input'" class="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                开始新练习
              </button>
            </div>
            
            <!-- 练习历史 -->
            <div class="bg-white rounded-xl p-6 shadow">
              <h2 class="text-lg font-bold mb-4">练习历史</h2>
              <div v-if="practiceHistory.length === 0" class="text-gray-400 text-center py-4">
                暂无练习记录
              </div>
              <div v-else class="space-y-3">
                <div v-for="record in practiceHistory" :key="record.id" 
                     class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p class="font-medium">{{ record.case_data?.caseName || '练习记录' }}</p>
                    <p class="text-sm text-gray-500">{{ formatDate(record.created_at) }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-lg font-bold text-blue-600">{{ record.score || '--' }}分</p>
                    <button @click="viewRecord(record)" class="text-sm text-blue-500">查看详情</button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 统计信息 -->
            <div class="grid grid-cols-3 gap-4">
              <div class="bg-white rounded-xl p-4 shadow text-center">
                <p class="text-2xl font-bold text-blue-600">{{ stats.totalPractices }}</p>
                <p class="text-sm text-gray-500">练习次数</p>
              </div>
              <div class="bg-white rounded-xl p-4 shadow text-center">
                <p class="text-2xl font-bold text-green-600">{{ stats.avgScore }}</p>
                <p class="text-sm text-gray-500">平均分</p>
              </div>
              <div class="bg-white rounded-xl p-4 shadow text-center">
                <p class="text-2xl font-bold text-orange-600">{{ stats.highestScore }}</p>
                <p class="text-sm text-gray-500">最高分</p>
              </div>
            </div>
          </div>
          
          <!-- 输入画像 -->
          <div v-else-if="currentStep === 'input'" class="bg-white rounded-xl p-6 shadow">
            <div class="flex items-center mb-6">
              <button @click="currentStep = 'home'" class="text-gray-500 mr-3">← 返回</button>
              <h2 class="text-xl font-bold">老人画像设置</h2>
            </div>
            
            <div class="space-y-4">
              <div>
                <label class="block text-gray-700 mb-2">年龄</label>
                <select v-model="caseProfile.age" class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="60-70">60-70岁</option>
                  <option value="70-80">70-80岁</option>
                  <option value="80-90">80-90岁</option>
                </select>
              </div>
              
              <div>
                <label class="block text-gray-700 mb-2">性别</label>
                <select v-model="caseProfile.gender" class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="男">男</option>
                  <option value="女">女</option>
                </select>
              </div>
              
              <div>
                <label class="block text-gray-700 mb-2">疾病类型（可多选）</label>
                <div class="grid grid-cols-2 gap-2">
                  <label v-for="d in diseases" :key="d" 
                         class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                         :class="caseProfile.diseases.includes(d) ? 'border-blue-500 bg-blue-50' : ''">
                    <input type="checkbox" v-model="caseProfile.diseases" :value="d" class="mr-2">
                    {{ d }}
                  </label>
                </div>
                
                <!-- 自定义疾病输入 -->
                <div class="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p class="text-sm text-gray-600 mb-2">其他疾病（自定义）</p>
                  <div class="flex gap-2">
                    <input 
                      v-model="customDisease" 
                      @keyup.enter="addCustomDisease"
                      placeholder="输入疾病名称，回车添加"
                      class="flex-1 px-3 py-2 border rounded-lg text-sm"
                    />
                    <button 
                      @click="addCustomDisease"
                      :disabled="!customDisease.trim()"
                      class="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm disabled:bg-gray-300"
                    >
                      添加
                    </button>
                  </div>
                  <div v-if="caseProfile.customDiseases.length > 0" class="flex flex-wrap gap-2 mt-2">
                    <span v-for="d in caseProfile.customDiseases" :key="d" 
                          class="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {{ d }}
                      <button @click="removeCustomDisease(d)" class="ml-1 text-blue-500 hover:text-red-500">×</button>
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <label class="block text-gray-700 mb-2">性格特点</label>
                <select v-model="caseProfile.personality" class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="开朗健谈">开朗健谈</option>
                  <option value="内向沉默">内向沉默</option>
                  <option value="焦虑多疑">焦虑多疑</option>
                  <option value="固执保守">固执保守</option>
                </select>
              </div>
              
              <div>
                <label class="block text-gray-700 mb-2">方言偏好</label>
                <select v-model="caseProfile.dialect" class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="普通话">普通话</option>
                  <option value="山西话">山西话</option>
                  <option value="东北话">东北话</option>
                  <option value="四川话">四川话</option>
                </select>
              </div>
              
              <div>
                <label class="block text-gray-700 mb-2">居住场所</label>
                <select v-model="caseProfile.livingPlace" class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="家">家</option>
                  <option value="医院">医院</option>
                  <option value="社区">社区</option>
                  <option value="不知道">不知道</option>
                </select>
              </div>
              
              <div>
                <label class="block text-gray-700 mb-2">居住类型</label>
                <select v-model="caseProfile.livingType" class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="独居">独居</option>
                  <option value="丧偶">丧偶</option>
                  <option value="有老伴">有老伴</option>
                  <option value="无儿女">无儿女</option>
                  <option value="儿女在外地">儿女在外地</option>
                </select>
              </div>
              
              <div>
                <label class="block text-gray-700 mb-2">职业类型</label>
                <select v-model="caseProfile.occupation" class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="退休教师">退休教师</option>
                  <option value="退休工人">退休工人</option>
                  <option value="退休公务员">退休公务员</option>
                  <option value="退休农民">退休农民</option>
                </select>
              </div>
              
              <div>
                <label class="block text-gray-700 mb-2">经济类型</label>
                <select v-model="caseProfile.economicType" class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="无收入">无收入</option>
                  <option value="有退休金">有退休金</option>
                  <option value="有商业保险">有商业保险</option>
                  <option value="儿女赡养">儿女赡养</option>
                </select>
              </div>
              
              <div>
                <label class="block text-gray-700 mb-2">爱好</label>
                <select v-model="caseProfile.hobby" class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="聊天">聊天</option>
                  <option value="养花">养花</option>
                  <option value="看书">看书</option>
                  <option value="看电视">看电视</option>
                  <option value="下棋">下棋</option>
                  <option value="广场舞">广场舞</option>
                  <option value="唱歌">唱歌</option>
                </select>
              </div>
              
              <div>
                <label class="block text-gray-700 mb-2">老人称呼我为</label>
                <input 
                  v-model="caseProfile.studentTitle" 
                  placeholder="如：大夫、护士、小伙子、闺女等"
                  class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <button 
                @click="generateCase" 
                :disabled="isGenerating || (caseProfile.diseases.length === 0 && caseProfile.customDiseases.length === 0)"
                class="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
              >
                <span v-if="isGenerating" class="flex items-center justify-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  AI生成中...
                </span>
                <span v-else>生成病例</span>
              </button>
            </div>
          </div>
          
          <!-- 病例展示 -->
          <div v-else-if="currentStep === 'case'" class="space-y-4">
            <div class="flex items-center mb-2">
              <button @click="currentStep = 'input'" class="text-gray-500 mr-3">← 返回</button>
              <h2 class="text-xl font-bold">病例详情</h2>
            </div>
            
            <div class="bg-white rounded-xl p-6 shadow">
              <h3 class="text-lg font-bold text-blue-600 mb-4">{{ generatedCase.caseName }}</h3>
              
              <div class="grid gap-4">
                <div class="bg-blue-50 rounded-lg p-4">
                  <h4 class="font-medium text-blue-800 mb-2">基本信息</h4>
                  <div class="grid grid-cols-2 gap-2 text-sm">
                    <p><span class="text-gray-500">姓名：</span>{{ generatedCase.basicInfo?.name }}</p>
                    <p><span class="text-gray-500">年龄：</span>{{ generatedCase.basicInfo?.age }}岁</p>
                    <p><span class="text-gray-500">性别：</span>{{ generatedCase.basicInfo?.gender }}</p>
                    <p><span class="text-gray-500">职业：</span>{{ generatedCase.basicInfo?.occupation }}</p>
                  </div>
                  <p class="text-sm mt-2"><span class="text-gray-500">家庭情况：</span>{{ generatedCase.basicInfo?.familyStatus }}</p>
                </div>
                
                <div class="bg-orange-50 rounded-lg p-4">
                  <h4 class="font-medium text-orange-800 mb-2">病史信息</h4>
                  <p class="text-sm mb-1"><span class="text-gray-500">主诉：</span>{{ generatedCase.medicalHistory?.chiefComplaint }}</p>
                  <p class="text-sm mb-1"><span class="text-gray-500">现病史：</span>{{ generatedCase.medicalHistory?.presentIllness }}</p>
                  <p class="text-sm"><span class="text-gray-500">用药：</span>{{ generatedCase.medicalHistory?.medications?.join('、') }}</p>
                </div>
                
                <div class="bg-green-50 rounded-lg p-4">
                  <h4 class="font-medium text-green-800 mb-2">性格特点</h4>
                  <p class="text-sm"><span class="text-gray-500">特点：</span>{{ generatedCase.personality?.traits?.join('、') }}</p>
                  <p class="text-sm"><span class="text-gray-500">关注：</span>{{ generatedCase.personality?.concerns?.join('、') }}</p>
                </div>
              </div>
            </div>
            
            <button 
              @click="startChat" 
              class="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
            >
              开始对话练习 →
            </button>
          </div>
          
          <!-- 对话界面 -->
          <div v-else-if="currentStep === 'chat'" class="flex flex-col h-[calc(100vh-120px)]">
            <!-- 对话提示 -->
            <div class="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-2">
              <p class="text-sm text-yellow-700">💡 您正在与 {{ generatedCase.basicInfo?.name }} 对话，请以康养专业学生的身份进行沟通</p>
            </div>
            
            <div class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-100 rounded-t-lg">
              <div v-for="(msg, i) in messages" :key="i" 
                   :class="msg.role === 'user' ? 'text-right' : 'text-left'">
                <div class="text-xs text-gray-400 mb-1">
                  {{ msg.role === 'user' ? '我' : generatedCase.basicInfo?.name }}
                </div>
                <div class="inline-flex items-end gap-2">
                  <div :class="msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'"
                       class="max-w-[80%] px-4 py-2 rounded-lg shadow-sm">
                    {{ msg.content }}
                  </div>
                  <button v-if="msg.role === 'assistant'" 
                          @click="speak(msg.content)"
                          class="text-gray-400 hover:text-blue-500 p-1"
                          title="点击播放语音">
                    🔊
                  </button>
                </div>
              </div>
              <div v-if="isTyping" class="text-left">
                <div class="bg-white text-gray-400 px-4 py-2 rounded-lg inline-block">
                  正在输入...
                </div>
              </div>
            </div>
            
            <div class="p-4 bg-white border-t rounded-b-lg">
              <div class="flex gap-2">
                <input 
                  v-model="userInput" 
                  @keyup.enter="sendMessage"
                  placeholder="输入消息..."
                  class="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  :disabled="isTyping"
                />
                <button 
                  @click="sendMessage" 
                  :disabled="!userInput.trim() || isTyping"
                  class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  发送
                </button>
              </div>
              <button @click="endChat" class="w-full mt-3 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600">
                结束对话并评分
              </button>
            </div>
          </div>
          
          <!-- 评分报告 -->
          <div v-else-if="currentStep === 'score'" class="space-y-4">
            <div class="bg-white rounded-xl p-6 shadow text-center">
              <h2 class="text-2xl font-bold mb-2">练习完成！</h2>
              <div class="text-6xl font-bold my-6" 
                   :class="score.totalScore >= 80 ? 'text-green-600' : score.totalScore >= 60 ? 'text-blue-600' : 'text-orange-600'">
                {{ score.totalScore }}
              </div>
              <p class="text-gray-500">总分 / 100</p>
            </div>
            
            <div class="bg-white rounded-xl p-6 shadow">
              <h3 class="font-bold mb-4">各维度得分</h3>
              <div class="space-y-4">
                <div v-for="(value, key) in score.dimensions" :key="key">
                  <div class="flex justify-between mb-1">
                    <span>{{ key }}</span>
                    <span class="font-medium">{{ value }}/25</span>
                  </div>
                  <div class="bg-gray-200 rounded-full h-3">
                    <div class="bg-blue-600 h-3 rounded-full transition-all duration-500" 
                         :style="{ width: (value / 25 * 100) + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="bg-white rounded-xl p-6 shadow">
              <h3 class="font-bold mb-3">评语</h3>
              <p class="text-gray-600">{{ score.feedback }}</p>
              
              <div class="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-500 mb-2">优点</p>
                  <ul class="text-sm space-y-1">
                    <li v-for="s in score.strengths" :key="s" class="text-green-600">✓ {{ s }}</li>
                  </ul>
                </div>
                <div>
                  <p class="text-sm text-gray-500 mb-2">待改进</p>
                  <ul class="text-sm space-y-1">
                    <li v-for="i in score.improvements" :key="i" class="text-orange-600">→ {{ i }}</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <button @click="resetPractice" class="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
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
          
          <div class="grid gap-4 md:grid-cols-2">
            <!-- 创建班级 -->
            <div class="bg-white rounded-xl p-6 shadow">
              <h3 class="font-bold mb-4">创建班级</h3>
              <div class="space-y-3">
                <input 
                  v-model="newClass.name" 
                  placeholder="班级名称"
                  class="w-full px-3 py-2 border rounded-lg"
                />
                <button 
                  @click="createClass"
                  :disabled="!newClass.name"
                  class="w-full py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400"
                >
                  创建
                </button>
              </div>
              
              <div class="mt-4">
                <p class="text-sm text-gray-500 mb-2">已有班级</p>
                <div v-for="cls in classes" :key="cls.id" class="p-2 bg-gray-50 rounded mb-1 text-sm">
                  {{ cls.name }} ({{ cls.student_count || 0 }}人)
                </div>
              </div>
            </div>
            
            <!-- 学生列表 -->
            <div class="bg-white rounded-xl p-6 shadow">
              <h3 class="font-bold mb-4">添加学生</h3>
              <div class="space-y-3">
                <input 
                  v-model="newStudent.name" 
                  placeholder="学生姓名"
                  class="w-full px-3 py-2 border rounded-lg"
                />
                <select v-model="newStudent.classId" class="w-full px-3 py-2 border rounded-lg">
                  <option value="">选择班级</option>
                  <option v-for="cls in classes" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
                </select>
                <input 
                  v-model="newStudent.password" 
                  type="text"
                  placeholder="登录密码（默认123456）"
                  class="w-full px-3 py-2 border rounded-lg"
                />
                <button 
                  @click="createStudent"
                  :disabled="!newStudent.name"
                  class="w-full py-2 bg-green-600 text-white rounded-lg disabled:bg-gray-400"
                >
                  添加学生
                </button>
              </div>
            </div>
            
            <!-- 学生列表 -->
            <div class="bg-white rounded-xl p-6 shadow">
              <h3 class="font-bold mb-4">学生列表</h3>
              <div v-if="students.length === 0" class="text-gray-400 text-sm">
                暂无学生
              </div>
              <div v-else class="space-y-2 max-h-60 overflow-y-auto">
                <div v-for="student in students" :key="student.id" 
                     class="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <span class="font-medium">{{ student.name }}</span>
                    <span class="text-sm text-gray-400 ml-2">{{ student.email }}</span>
                  </div>
                  <span class="text-sm text-gray-500">{{ student.class_name }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 练习统计 -->
          <div class="bg-white rounded-xl p-6 shadow">
            <h3 class="font-bold mb-4">练习统计</h3>
            <div class="grid grid-cols-3 gap-4 text-center">
              <div class="p-4 bg-blue-50 rounded-lg">
                <p class="text-2xl font-bold text-blue-600">{{ adminStats.totalPractices }}</p>
                <p class="text-sm text-gray-500">总练习次数</p>
              </div>
              <div class="p-4 bg-green-50 rounded-lg">
                <p class="text-2xl font-bold text-green-600">{{ adminStats.avgScore }}</p>
                <p class="text-sm text-gray-500">平均分</p>
              </div>
              <div class="p-4 bg-orange-50 rounded-lg">
                <p class="text-2xl font-bold text-orange-600">{{ adminStats.activeUsers }}</p>
                <p class="text-sm text-gray-500">活跃学生</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { createClient } from '@supabase/supabase-js'

// 初始化 Supabase（直接配置，不依赖环境变量）
const supabaseUrl = 'https://todnsmeovkpmniqcwucm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvZG5zbWVvdmtwbW5pcWN3dWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0OTY0NzMsImV4cCI6MjA5MTA3MjQ3M30.7LSP7dtoRDTiGp--7gC9NXvQARd_uPh1_-i0PajluHU'
const supabase = createClient(supabaseUrl, supabaseKey)

// API 基础路径
const apiBase = '/.netlify/functions'

// 状态
const isLoggedIn = ref(false)
const currentUser = ref({})
const currentStep = ref('home')
const loginMode = ref('password')
const isLoggingIn = ref(false)
const isRegistering = ref(false)
const loginError = ref('')
const registerError = ref('')

const loginForm = reactive({
  username: '',
  password: ''
})

const registerForm = reactive({
  name: '',
  email: '',
  password: '',
  classId: ''
})

const caseProfile = reactive({
  age: '70-80',
  gender: '男',
  diseases: ['高血压'],
  customDiseases: [],
  personality: '开朗健谈',
  dialect: '普通话',
  livingPlace: '家',
  livingType: '有老伴',
  occupation: '退休工人',
  economicType: '有退休金',
  hobby: '看电视',
  studentTitle: '大夫'
})

const diseases = [
  '高血压', '糖尿病', '冠心病', '脑卒中',
  '阿尔茨海默', '帕金森', '关节炎', '骨质疏松',
  '慢性支气管炎', '肺气肿', '胃溃疡', '慢性胃炎',
  '白内障', '青光眼', '前列腺增生', '失眠症',
  '抑郁症', '焦虑症', '类风湿', '痛风',
  '高烧', '咳嗽', '高血脂', '擦伤',
  '心脏骤停', '左侧偏瘫', '右侧偏瘫', '记忆力减退'
]

const customDisease = ref('')

const generatedCase = ref({})
const messages = ref([])
const userInput = ref('')
const isGenerating = ref(false)
const isTyping = ref(false)

const score = ref({
  totalScore: 0,
  dimensions: {},
  feedback: '',
  strengths: [],
  improvements: []
})

// 班级和学生
const classes = ref([])
const students = ref([])
const newClass = reactive({ name: '' })
const newStudent = reactive({ name: '', classId: '', password: '' })

// 练习历史
const practiceHistory = ref([])

// 统计
const stats = computed(() => {
  if (practiceHistory.value.length === 0) {
    return { totalPractices: 0, avgScore: 0, highestScore: 0 }
  }
  const scores = practiceHistory.value.filter(r => r.score).map(r => r.score)
  return {
    totalPractices: practiceHistory.value.length,
    avgScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
    highestScore: scores.length ? Math.max(...scores) : 0
  }
})

const adminStats = ref({
  totalPractices: 0,
  avgScore: 0,
  activeUsers: 0
})

// 初始化
onMounted(async () => {
  // 预加载语音引擎
  if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices()
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices()
    }
  }
  
  // 检查本地存储的登录状态
  const savedUser = localStorage.getItem('currentUser')
  if (savedUser) {
    currentUser.value = JSON.parse(savedUser)
    isLoggedIn.value = true
    loadData()
  }
  
  // 加载班级列表
  if (supabase) {
    const { data } = await supabase.from('classes').select('*')
    if (data) classes.value = data
  }
})

// 加载数据
async function loadData() {
  if (!supabase) return
  
  if (currentUser.value.role === 'student') {
    // 加载练习历史
    const { data } = await supabase
      .from('practice_records')
      .select('*')
      .eq('user_id', currentUser.value.id)
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (data) practiceHistory.value = data
  } else if (currentUser.value.role === 'admin') {
    // 加载学生列表
    const { data: studentsData } = await supabase
      .from('users')
      .select('*, classes(name)')
      .eq('role', 'student')
    
    if (studentsData) {
      students.value = studentsData.map(s => ({
        ...s,
        class_name: s.classes?.name || '未分配'
      }))
    }
    
    // 加载统计
    const { count } = await supabase
      .from('practice_records')
      .select('*', { count: 'exact', head: true })
    
    adminStats.value.totalPractices = count || 0
    adminStats.value.activeUsers = students.value.length
    adminStats.value.avgScore = '--'
  }
}

// 登录
async function login() {
  loginError.value = ''
  
  // 检查是否是管理员
  if (loginForm.username === 'admin' && loginForm.password === 'admin123') {
    currentUser.value = { 
      id: 'admin', 
      username: 'admin', 
      name: '管理员', 
      role: 'admin' 
    }
    localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
    isLoggedIn.value = true
    loadData()
    return
  }
  
  // 检查是否是测试学生
  if (loginForm.username === 'student' && loginForm.password === '123456') {
    currentUser.value = { 
      id: 'test-student', 
      username: 'student', 
      name: '测试学生', 
      role: 'student',
      class_id: null
    }
    localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
    isLoggedIn.value = true
    return
  }
  
  isLoggingIn.value = true
  
  try {
    // 先尝试从 users 表查询（管理员创建的学生账号）
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*, classes(name)')
      .eq('email', loginForm.username)
      .eq('password', loginForm.password)
      .single()
    
    if (userData) {
      currentUser.value = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role || 'student',
        class_id: userData.class_id,
        class_name: userData.classes?.name
      }
      localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
      isLoggedIn.value = true
      loadData()
      return
    }
    
    // 尝试 Supabase Auth 登录（注册的用户）
    const email = loginForm.username.includes('@') 
      ? loginForm.username 
      : `${loginForm.username}@example.com`
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: loginForm.password
    })
    
    if (error) throw error
    
    // 获取用户信息
    const { data: authUserData } = await supabase
      .from('users')
      .select('*, classes(name)')
      .eq('id', data.user.id)
      .single()
    
    currentUser.value = {
      id: data.user.id,
      email: data.user.email,
      name: authUserData?.name || data.user.email,
      role: authUserData?.role || 'student',
      class_id: authUserData?.class_id,
      class_name: authUserData?.classes?.name
    }
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
    isLoggedIn.value = true
    loadData()
    
  } catch (error) {
    console.error('Login error:', error)
    loginError.value = '账号或密码错误'
  } finally {
    isLoggingIn.value = false
  }
}

// 注册
async function register() {
  registerError.value = ''
  
  if (!registerForm.name || !registerForm.email || !registerForm.password) {
    registerError.value = '请填写完整信息'
    return
  }
  
  if (registerForm.password.length < 6) {
    registerError.value = '密码至少6位'
    return
  }
  
  isRegistering.value = true
  
  try {
    if (!supabase) {
      throw new Error('数据库未配置')
    }
    
    // 创建 Supabase Auth 用户
    const { data, error } = await supabase.auth.signUp({
      email: registerForm.email,
      password: registerForm.password,
      options: {
        data: {
          name: registerForm.name
        }
      }
    })
    
    if (error) throw error
    
    // 创建用户记录
    if (data.user) {
      await supabase.from('users').insert({
        id: data.user.id,
        name: registerForm.name,
        email: registerForm.email,
        role: 'student',
        class_id: registerForm.classId || null
      })
      
      alert('注册成功！请登录')
      loginMode.value = 'password'
      loginForm.username = registerForm.email
    }
    
  } catch (error) {
    console.error('Register error:', error)
    registerError.value = error.message || '注册失败'
  } finally {
    isRegistering.value = false
  }
}

// 退出
function logout() {
  if (supabase) {
    supabase.auth.signOut()
  }
  localStorage.removeItem('currentUser')
  isLoggedIn.value = false
  currentUser.value = {}
  loginForm.username = ''
  loginForm.password = ''
}

// 添加自定义疾病
function addCustomDisease() {
  const disease = customDisease.value.trim()
  if (disease && !caseProfile.customDiseases.includes(disease)) {
    caseProfile.customDiseases.push(disease)
    customDisease.value = ''
  }
}

// 移除自定义疾病
function removeCustomDisease(disease) {
  const index = caseProfile.customDiseases.indexOf(disease)
  if (index > -1) {
    caseProfile.customDiseases.splice(index, 1)
  }
}

// 获取所有选中的疾病
function getAllDiseases() {
  return [...caseProfile.diseases, ...caseProfile.customDiseases]
}

// 生成病例
async function generateCase() {
  const allDiseases = getAllDiseases()
  if (allDiseases.length === 0) {
    alert('请至少选择或输入一种疾病')
    return
  }
  
  isGenerating.value = true
  
  try {
    const response = await fetch(`${apiBase}/generate-case`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile: { ...caseProfile },
        userId: currentUser.value.id
      })
    })
    
    const result = await response.json()
    
    if (result.success && result.data) {
      generatedCase.value = result.data
      currentStep.value = 'case'
    } else {
      throw new Error(result.error || '生成失败')
    }
    
  } catch (error) {
    console.error('Generate case error:', error)
    // 使用默认数据
    generatedCase.value = {
      caseName: `${allDiseases[0]}老年患者病例`,
      basicInfo: {
        name: caseProfile.gender === '男' ? '王大爷' : '李大妈',
        age: parseInt(caseProfile.age.split('-')[0]) + 5,
        gender: caseProfile.gender,
        occupation: caseProfile.occupation,
        familyStatus: caseProfile.livingType,
        livingPlace: caseProfile.livingPlace,
        economicType: caseProfile.economicType,
        hobby: caseProfile.hobby,
        studentTitle: caseProfile.studentTitle || '大夫'
      },
      medicalHistory: {
        chiefComplaint: '头晕、乏力1周',
        presentIllness: `患者有${allDiseases.join('、')}病史`,
        pastHistory: allDiseases.join('、'),
        medications: ['降压药']
      },
      personality: {
        traits: [caseProfile.personality],
        concerns: ['健康问题', '子女关心'],
        communicationStyle: caseProfile.dialect === '普通话' ? '标准普通话' : `带${caseProfile.dialect}口音`
      },
      openingLine: '大夫，我最近总是头晕，您帮我看看吧。'
    }
    currentStep.value = 'case'
  } finally {
    isGenerating.value = false
  }
}

// 开始对话
function startChat() {
  messages.value = [
    { role: 'assistant', content: generatedCase.value.openingLine || '你好，大夫。' }
  ]
  currentStep.value = 'chat'
}

// 发送消息
async function sendMessage() {
  if (!userInput.value.trim() || isTyping.value) return
  
  const userMsg = userInput.value.trim()
  messages.value.push({ role: 'user', content: userMsg })
  userInput.value = ''
  isTyping.value = true
  
  try {
    const response = await fetch(`${apiBase}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caseData: generatedCase.value,
        messages: messages.value,
        userInput: userMsg
      })
    })
    
    const result = await response.json()
    
    if (result.success && result.reply) {
      messages.value.push({ role: 'assistant', content: result.reply })
      // 自动播放语音
      speak(result.reply)
    } else {
      throw new Error('回复失败')
    }
    
  } catch (error) {
    console.error('Chat error:', error)
    const fallbacks = [
      '嗯，大夫你说得对。',
      '这个我不太清楚，你给我讲讲？',
      '好的，我记住了。',
      '谢谢你啊大夫。'
    ]
    messages.value.push({ 
      role: 'assistant', 
      content: fallbacks[Math.floor(Math.random() * fallbacks.length)]
    })
  } finally {
    isTyping.value = false
  }
}

// 讯飞语音配置（多个应用轮换使用）
const XUNFEI_CONFIGS = [
  { appId: 'ce9119c9', apiKey: '502bc91c27f537d1048d3763204e0a17', apiSecret: 'NDk5NjA4MTY3MDgyNzE5MGUwZjk0NTE3' },
  { appId: '0e882cfc', apiKey: '5ed75eebcc376af7d1300b3beaa36460', apiSecret: 'MGUzZTg1MzhhMTBkZjYwODFlOGZjZjFh' }
]

// 随机选择一个配置
function getXunfeiConfig() {
  return XUNFEI_CONFIGS[Math.floor(Math.random() * XUNFEI_CONFIGS.length)]
}

// 语音播放功能（讯飞语音合成）
function speak(text) {
  const gender = generatedCase.value.basicInfo?.gender || '男'
  
  // 先尝试讯飞语音，失败则降级到浏览器语音
  speakWithXunfei(text, gender).catch((err) => {
    console.log('讯飞语音失败，使用浏览器语音:', err)
    speakWithBrowser(text, gender)
  })
}

// 讯飞语音合成
async function speakWithXunfei(text, gender) {
  return new Promise(async (resolve, reject) => {
    try {
      // 随机选择一个应用配置
      const config = getXunfeiConfig()
      
      // 生成鉴权URL
      const host = 'tts-api.xfyun.cn'
      const path = '/v2/tts'
      const date = new Date().toUTCString()
      
      // 签名
      const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`
      const signature = await hmacSha256(signatureOrigin, config.apiSecret)
      const authorizationOrigin = `api_key="${config.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`
      const authorization = btoa(authorizationOrigin)
      
      const wsUrl = `wss://${host}${path}?authorization=${authorization}&date=${encodeURIComponent(date)}&host=${host}`
      
      // 选择发音人（讯飞在线语音合成发音人）
      const voiceName = gender === '女' ? 'xiaoyan' : 'xiaofeng'
      
      // 建立WebSocket连接
      const ws = new WebSocket(wsUrl)
      let audioChunks = []
      
      ws.onopen = () => {
        const request = {
          header: {
            app_id: config.appId,
            status: 2
          },
          parameter: {
            tts: {
              vcn: voiceName,
              speed: 40,
              volume: 50,
              pitch: 50,
              audio: {
                encoding: 'lame',
                sample_rate: 16000
              }
            }
          },
          payload: {
            text: {
              encoding: 'utf8',
              text: btoa(unescape(encodeURIComponent(text))),
              status: 2
            }
          }
        }
        ws.send(JSON.stringify(request))
      }
      
      ws.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data)
          
          if (response.header.code !== 0) {
            ws.close()
            reject(new Error(response.header.message))
            return
          }
          
          if (response.payload?.audio?.audio) {
            audioChunks.push(response.payload.audio.audio)
          }
          
          if (response.header.status === 2) {
            ws.close()
            playAudioFromBase64(audioChunks.join(''))
            resolve()
          }
        } catch (e) {
          ws.close()
          reject(e)
        }
      }
      
      ws.onerror = (error) => {
        reject(error)
      }
      
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close()
        }
        reject(new Error('timeout'))
      }, 30000)
      
    } catch (error) {
      reject(error)
    }
  })
}

// HMAC-SHA256
async function hmacSha256(message, secret) {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const messageData = encoder.encode(message)
  
  const key = await crypto.subtle.importKey(
    'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  
  const signature = await crypto.subtle.sign('HMAC', key, messageData)
  return btoa(String.fromCharCode(...new Uint8Array(signature)))
}

// 播放Base64音频
function playAudioFromBase64(base64Audio) {
  const binaryString = atob(base64Audio)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  
  const blob = new Blob([bytes], { type: 'audio/mp3' })
  const url = URL.createObjectURL(blob)
  const audio = new Audio(url)
  audio.play()
}

// 浏览器语音合成（降级方案）
function speakWithBrowser(text, gender) {
  if (!('speechSynthesis' in window)) return
  
  window.speechSynthesis.cancel()
  let voices = window.speechSynthesis.getVoices()
  
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'zh-CN'
  utterance.rate = 0.7
  utterance.pitch = 0.8
  utterance.volume = 1.0
  
  const zhVoices = voices.filter(v => v.lang.includes('zh'))
  
  if (zhVoices.length > 0) {
    let selectedVoice = null
    
    if (gender === '女') {
      const femaleKeywords = ['female', 'woman', 'girl', '女', '妈', '姐', 'Ting-Ting', 'Yaoyao', 'Xiaoxiao', 'Huihui']
      selectedVoice = zhVoices.find(v => 
        femaleKeywords.some(k => v.name.toLowerCase().includes(k.toLowerCase()))
      )
    } else {
      const maleKeywords = ['male', 'man', 'boy', '男', '爸', '爷', 'Grandpa', 'Daddy', 'Kangkang', 'Zhichao']
      selectedVoice = zhVoices.find(v => 
        maleKeywords.some(k => v.name.toLowerCase().includes(k.toLowerCase()))
      )
    }
    
    if (!selectedVoice && zhVoices.length > 0) {
      selectedVoice = zhVoices[0]
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice
    }
  }
  
  window.speechSynthesis.speak(utterance)
}

// 结束对话
async function endChat() {
  isTyping.value = true
  
  try {
    const response = await fetch(`${apiBase}/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caseData: generatedCase.value,
        messages: messages.value,
        userId: currentUser.value.id
      })
    })
    
    const result = await response.json()
    
    if (result.success && result.data) {
      score.value = result.data
    } else {
      throw new Error('评分失败')
    }
    
  } catch (error) {
    console.error('Score error:', error)
    // 默认评分
    const studentMsgs = messages.value.filter(m => m.role === 'user')
    score.value = {
      totalScore: Math.min(70 + studentMsgs.length * 3, 95),
      dimensions: {
        '思政素养': 18 + Math.floor(Math.random() * 5),
        '沟通技巧': 17 + Math.floor(Math.random() * 5),
        '健康宣教': 18 + Math.floor(Math.random() * 5),
        '专业能力': 17 + Math.floor(Math.random() * 5)
      },
      feedback: '整体表现良好，继续保持！',
      strengths: ['态度友善', '有耐心'],
      improvements: ['可以更深入了解老人需求']
    }
  } finally {
    isTyping.value = false
    currentStep.value = 'score'
    
    // 刷新历史
    if (currentUser.value.role === 'student') {
      loadData()
    }
  }
}

// 重置练习
function resetPractice() {
  currentStep.value = 'home'
  messages.value = []
  generatedCase.value = {}
  score.value = { totalScore: 0, dimensions: {}, feedback: '', strengths: [], improvements: [] }
}

// 创建班级
async function createClass() {
  if (!newClass.name) return
  
  const { data, error } = await supabase
    .from('classes')
    .insert({ name: newClass.name })
    .select()
  
  if (data) {
    classes.value.push(data[0])
    newClass.name = ''
    alert('班级创建成功！')
  } else if (error) {
    alert('创建失败：' + error.message)
  }
}

// 创建学生
async function createStudent() {
  if (!newStudent.name) {
    alert('请输入学生姓名')
    return
  }
  
  const password = newStudent.password || '123456'
  const email = `${Date.now()}@student.local` // 生成临时邮箱
  
  try {
    // 创建用户记录（简化版，无需Supabase Auth）
    const studentId = 'student_' + Date.now()
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: studentId,
        name: newStudent.name,
        email: email,
        role: 'student',
        class_id: newStudent.classId || null,
        password: password
      })
      .select()
    
    if (data) {
      students.value.unshift({
        id: studentId,
        name: newStudent.name,
        email: email,
        class_name: classes.value.find(c => c.id === newStudent.classId)?.name || '未分配'
      })
      alert(`学生创建成功！\n账号：${email}\n密码：${password}`)
      newStudent.name = ''
      newStudent.classId = ''
      newStudent.password = ''
    } else if (error) {
      alert('创建失败：' + error.message)
    }
  } catch (err) {
    alert('创建失败：' + err.message)
  }
}

// 查看记录
function viewRecord(record) {
  if (record.case_data) {
    generatedCase.value = record.case_data
    messages.value = record.messages || []
    score.value = {
      totalScore: record.score || 0,
      dimensions: record.dimensions || {},
      feedback: record.feedback || '',
      strengths: [],
      improvements: []
    }
    currentStep.value = 'score'
  }
}

// 格式化日期
function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
