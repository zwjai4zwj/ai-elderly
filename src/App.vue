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
            <p class="text-sm text-blue-200">{{ currentUser.name }} ({{ currentUser.role === 'admin' ? '管理员' : currentUser.role === 'teacher' ? '老师' : '学生' }})</p>
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
                  <option value="北京话">北京话</option>
                  <option value="天津话">天津话</option>
                  <option value="河北话">河北话</option>
                  <option value="山西话">山西话</option>
                  <option value="内蒙古话">内蒙古话</option>
                  <option value="东北话">东北话</option>
                  <option value="上海话">上海话</option>
                  <option value="江苏话">江苏话</option>
                  <option value="浙江话">浙江话</option>
                  <option value="安徽话">安徽话</option>
                  <option value="福建话">福建话</option>
                  <option value="江西话">江西话</option>
                  <option value="山东话">山东话</option>
                  <option value="河南话">河南话</option>
                  <option value="湖北话">湖北话</option>
                  <option value="湖南话">湖南话</option>
                  <option value="广东话">广东话</option>
                  <option value="广西话">广西话</option>
                  <option value="海南话">海南话</option>
                  <option value="四川话">四川话</option>
                  <option value="重庆话">重庆话</option>
                  <option value="贵州话">贵州话</option>
                  <option value="云南话">云南话</option>
                  <option value="西藏话">西藏话</option>
                  <option value="陕西话">陕西话</option>
                  <option value="甘肃话">甘肃话</option>
                  <option value="青海话">青海话</option>
                  <option value="宁夏话">宁夏话</option>
                  <option value="新疆话">新疆话</option>
                  <option value="台湾话">台湾话</option>
                  <option value="香港话">香港话</option>
                  <option value="澳门话">澳门话</option>
                </select>
              </div>
              
              <div>
                <label class="block text-gray-700 mb-2">居住场所</label>
                <select v-model="caseProfile.livingPlace" class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="家">家</option>
                  <option value="医院">医院</option>
                  <option value="社区">社区</option>
                  <option value="养老机构">养老机构</option>
                </select>
              </div>
              
              <div>
                <label class="block text-gray-700 mb-2">居住类型（可多选）</label>
                <div class="grid grid-cols-2 gap-2">
                  <label v-for="t in livingTypeOptions" :key="t" 
                         class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                         :class="caseProfile.livingTypes.includes(t) ? 'border-blue-500 bg-blue-50' : ''">
                    <input type="checkbox" v-model="caseProfile.livingTypes" :value="t" class="mr-2">
                    {{ t }}
                  </label>
                </div>
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
                <label class="block text-gray-700 mb-2">经济类型（可多选）</label>
                <div class="grid grid-cols-2 gap-2">
                  <label v-for="e in economicTypeOptions" :key="e" 
                         class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                         :class="caseProfile.economicTypes.includes(e) ? 'border-blue-500 bg-blue-50' : ''">
                    <input type="checkbox" v-model="caseProfile.economicTypes" :value="e" class="mr-2">
                    {{ e }}
                  </label>
                </div>
              </div>
              
              <div>
                <label class="block text-gray-700 mb-2">爱好（可多选）</label>
                <div class="grid grid-cols-2 gap-2">
                  <label v-for="h in hobbyOptions" :key="h" 
                         class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                         :class="caseProfile.hobbies.includes(h) ? 'border-blue-500 bg-blue-50' : ''">
                    <input type="checkbox" v-model="caseProfile.hobbies" :value="h" class="mr-2">
                    {{ h }}
                  </label>
                </div>
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
          <div v-else-if="currentStep === 'chat'" class="flex h-[calc(100vh-120px)] gap-4">
            <!-- 病例信息卡片（左侧） -->
            <div class="w-72 flex-shrink-0">
              <div class="bg-white rounded-xl shadow p-4 h-full overflow-y-auto">
                <h3 class="font-bold text-blue-600 mb-3 flex items-center">
                  <span>📋</span> 病例信息
                </h3>
                
                <div class="space-y-3 text-sm">
                  <!-- 基本信息 -->
                  <div class="bg-blue-50 rounded-lg p-3">
                    <p class="font-medium text-blue-800 mb-2">基本信息</p>
                    <div class="space-y-1 text-gray-700">
                      <p><span class="text-gray-500">姓名：</span>{{ generatedCase.basicInfo?.name }}</p>
                      <p><span class="text-gray-500">年龄：</span>{{ generatedCase.basicInfo?.age }}岁</p>
                      <p><span class="text-gray-500">性别：</span>{{ generatedCase.basicInfo?.gender }}</p>
                      <p><span class="text-gray-500">职业：</span>{{ generatedCase.basicInfo?.occupation }}</p>
                    </div>
                  </div>
                  
                  <!-- 病史信息 -->
                  <div class="bg-orange-50 rounded-lg p-3">
                    <p class="font-medium text-orange-800 mb-2">疾病情况</p>
                    <div class="space-y-1 text-gray-700">
                      <p><span class="text-gray-500">主诉：</span>{{ generatedCase.medicalHistory?.chiefComplaint }}</p>
                      <p><span class="text-gray-500">用药：</span>{{ Array.isArray(generatedCase.medicalHistory?.medications) ? generatedCase.medicalHistory?.medications?.join('、') : generatedCase.medicalHistory?.medications }}</p>
                    </div>
                  </div>
                  
                  <!-- 性格特点 -->
                  <div class="bg-green-50 rounded-lg p-3">
                    <p class="font-medium text-green-800 mb-2">性格特点</p>
                    <div class="space-y-1 text-gray-700">
                      <p>{{ Array.isArray(generatedCase.personality?.traits) ? generatedCase.personality?.traits?.join('、') : generatedCase.personality?.traits }}</p>
                      <p class="text-xs text-gray-500 mt-1">关注：{{ Array.isArray(generatedCase.personality?.concerns) ? generatedCase.personality?.concerns?.join('、') : generatedCase.personality?.concerns }}</p>
                    </div>
                  </div>
                  
                  <!-- 居住情况 -->
                  <div class="bg-purple-50 rounded-lg p-3">
                    <p class="font-medium text-purple-800 mb-2">居住情况</p>
                    <div class="space-y-1 text-gray-700">
                      <p><span class="text-gray-500">场所：</span>{{ generatedCase.basicInfo?.livingPlace || caseProfile.livingPlace }}</p>
                      <p><span class="text-gray-500">类型：</span>{{ generatedCase.basicInfo?.familyStatus || (Array.isArray(caseProfile.livingTypes) ? caseProfile.livingTypes?.join('、') : caseProfile.livingTypes) }}</p>
                    </div>
                  </div>
                  
                  <!-- 方言 -->
                  <div class="bg-gray-50 rounded-lg p-3">
                    <p class="font-medium text-gray-800 mb-1">方言偏好</p>
                    <p class="text-gray-600">{{ caseProfile.dialect }}</p>
                  </div>
                  
                  <!-- 爱好 -->
                  <div class="bg-gray-50 rounded-lg p-3">
                    <p class="font-medium text-gray-800 mb-1">兴趣爱好</p>
                    <p class="text-gray-600">{{ Array.isArray(generatedCase.basicInfo?.hobby) ? generatedCase.basicInfo?.hobby?.join('、') : (generatedCase.basicInfo?.hobby || (Array.isArray(caseProfile.hobbies) ? caseProfile.hobbies?.join('、') : caseProfile.hobbies)) }}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 聊天区域（右侧） -->
            <div class="flex-1 flex flex-col">
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
            </div><!-- 关闭聊天区域div -->
          </div><!-- 关闭对话界面div -->
          
          <!-- 评分报告 -->
          <div v-else-if="currentStep === 'score'" class="space-y-4">
            <div class="bg-white rounded-xl p-6 shadow text-center">
              <h2 class="text-2xl font-bold mb-2">练习完成！</h2>
              <div class="text-6xl font-bold my-6" 
                   :class="score.totalScore >= 80 ? 'text-green-600' : score.totalScore >= 60 ? 'text-blue-600' : 'text-orange-600'">
                {{ score.totalScore }}
              </div>
              <p class="text-gray-500">总分 / 100</p>
              
              <!-- 与上次对比 -->
              <div v-if="lastScore !== null" class="mt-4 p-3 rounded-lg" 
                   :class="score.totalScore >= lastScore ? 'bg-green-50' : 'bg-red-50'">
                <p class="text-sm">
                  <span v-if="score.totalScore > lastScore" class="text-green-600">
                    📈 比上次提高了 {{ score.totalScore - lastScore }} 分！继续加油！
                  </span>
                  <span v-else-if="score.totalScore < lastScore" class="text-red-600">
                    📉 比上次下降了 {{ lastScore - score.totalScore }} 分，再接再厉！
                  </span>
                  <span v-else class="text-blue-600">
                    ➡️ 与上次持平，保持稳定！
                  </span>
                </p>
                <p class="text-xs text-gray-500 mt-1">上次得分：{{ lastScore }} 分</p>
              </div>
              <div v-else class="mt-4 p-3 bg-blue-50 rounded-lg">
                <p class="text-sm text-blue-600">🎉 这是你的第一次练习！</p>
              </div>
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
              
              <div class="mt-4 space-y-4">
                <div>
                  <p class="text-sm text-gray-500 mb-2">✅ 优点</p>
                  <ul class="text-sm space-y-1">
                    <li v-for="s in score.strengths" :key="s" class="text-green-600">• {{ s }}</li>
                  </ul>
                </div>
                <div>
                  <p class="text-sm text-gray-500 mb-2">❌ 不足</p>
                  <ul class="text-sm space-y-1">
                    <li v-for="w in score.weaknesses" :key="w" class="text-red-600">• {{ w }}</li>
                  </ul>
                </div>
                <div>
                  <p class="text-sm text-gray-500 mb-2">💡 建议</p>
                  <ul class="text-sm space-y-1">
                    <li v-for="i in score.improvements" :key="i" class="text-blue-600">• {{ i }}</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <button @click="resetPractice" class="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
              开始新练习
            </button>
          </div>
        </div>
        
        <!-- 老师首页 -->
        <div v-else-if="currentUser.role === 'teacher'" class="space-y-4">
          <div class="bg-white rounded-xl p-6 shadow">
            <h2 class="text-xl font-bold mb-2">教师工作台</h2>
            <p class="text-gray-500">欢迎，{{ currentUser.name }}</p>
          </div>
          
          <!-- 我负责的班级 -->
          <div class="bg-white rounded-xl p-6 shadow">
            <h3 class="font-bold mb-4">我负责的班级</h3>
            <div v-if="!teacherClasses || teacherClasses.length === 0" class="text-gray-400 text-center py-4">
              暂未分配班级，请联系管理员分配班级
            </div>
            <div v-else class="space-y-3">
              <div v-for="cls in teacherClasses" :key="cls.id" 
                   class="border border-blue-200 rounded-lg overflow-hidden">
                <div class="p-4 bg-blue-50 cursor-pointer hover:bg-blue-100"
                     @click="selectedTeacherClass = selectedTeacherClass === cls.id ? null : cls.id">
                  <div class="flex justify-between items-center">
                    <div>
                      <p class="font-bold text-blue-800 text-lg">{{ cls.name }}</p>
                      <p class="text-sm text-gray-500">{{ (classStudentsMap[cls.id] || []).length }} 名学生</p>
                    </div>
                    <span class="text-blue-500">{{ selectedTeacherClass === cls.id ? '收起 ▲' : '展开 ▼' }}</span>
                  </div>
                </div>
                
                <!-- 班级展开后的详细分析 -->
                <div v-if="selectedTeacherClass === cls.id" class="p-4 bg-white">
                  <!-- 班级整体统计 -->
                  <div class="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                    <h4 class="font-bold text-blue-800 mb-3">📊 班级整体情况</h4>
                    <div class="grid grid-cols-4 gap-3 text-center">
                      <div class="bg-white rounded-lg p-2 shadow-sm">
                        <p class="text-2xl font-bold text-blue-600">{{ getClassStats(cls.id)?.studentCount || 0 }}</p>
                        <p class="text-xs text-gray-500">学生人数</p>
                      </div>
                      <div class="bg-white rounded-lg p-2 shadow-sm">
                        <p class="text-2xl font-bold text-green-600">{{ getClassStats(cls.id)?.totalPractices || 0 }}</p>
                        <p class="text-xs text-gray-500">练习总次数</p>
                      </div>
                      <div class="bg-white rounded-lg p-2 shadow-sm">
                        <p class="text-2xl font-bold text-orange-600">{{ getClassStats(cls.id)?.avgScore || '--' }}</p>
                        <p class="text-xs text-gray-500">班级平均分</p>
                      </div>
                      <div class="bg-white rounded-lg p-2 shadow-sm">
                        <p class="text-2xl font-bold text-purple-600">{{ getClassStats(cls.id)?.highestScore || '--' }}</p>
                        <p class="text-xs text-gray-500">最高分</p>
                      </div>
                    </div>
                  </div>
                  
                  <!-- 四维度分析 -->
                  <div v-if="getClassStats(cls.id)?.dimensionStats" class="mb-4 p-4 bg-gray-50 rounded-lg">
                    <h4 class="font-bold text-gray-700 mb-3">📈 四维度能力分析</h4>
                    <div class="grid grid-cols-2 gap-3">
                      <div class="bg-white rounded-lg p-3">
                        <div class="flex justify-between items-center">
                          <span class="text-gray-600">思政维度</span>
                          <span class="font-bold" :class="getDimensionClass(getClassStats(cls.id).dimensionStats.sizheng.avg)">
                            {{ getClassStats(cls.id).dimensionStats.sizheng.avg }}分
                          </span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div class="h-2 rounded-full" :class="getDimensionBarClass(getClassStats(cls.id).dimensionStats.sizheng.avg)"
                               :style="{width: getClassStats(cls.id).dimensionStats.sizheng.avg + '%'}"></div>
                        </div>
                      </div>
                      <div class="bg-white rounded-lg p-3">
                        <div class="flex justify-between items-center">
                          <span class="text-gray-600">心理慰藉</span>
                          <span class="font-bold" :class="getDimensionClass(getClassStats(cls.id).dimensionStats.xinli.avg)">
                            {{ getClassStats(cls.id).dimensionStats.xinli.avg }}分
                          </span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div class="h-2 rounded-full" :class="getDimensionBarClass(getClassStats(cls.id).dimensionStats.xinli.avg)"
                               :style="{width: getClassStats(cls.id).dimensionStats.xinli.avg + '%'}"></div>
                        </div>
                      </div>
                      <div class="bg-white rounded-lg p-3">
                        <div class="flex justify-between items-center">
                          <span class="text-gray-600">健康宣教</span>
                          <span class="font-bold" :class="getDimensionClass(getClassStats(cls.id).dimensionStats.jiankang.avg)">
                            {{ getClassStats(cls.id).dimensionStats.jiankang.avg }}分
                          </span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div class="h-2 rounded-full" :class="getDimensionBarClass(getClassStats(cls.id).dimensionStats.jiankang.avg)"
                               :style="{width: getClassStats(cls.id).dimensionStats.jiankang.avg + '%'}"></div>
                        </div>
                      </div>
                      <div class="bg-white rounded-lg p-3">
                        <div class="flex justify-between items-center">
                          <span class="text-gray-600">康复训练</span>
                          <span class="font-bold" :class="getDimensionClass(getClassStats(cls.id).dimensionStats.kangfu.avg)">
                            {{ getClassStats(cls.id).dimensionStats.kangfu.avg }}分
                          </span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div class="h-2 rounded-full" :class="getDimensionBarClass(getClassStats(cls.id).dimensionStats.kangfu.avg)"
                               :style="{width: getClassStats(cls.id).dimensionStats.kangfu.avg + '%'}"></div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- 分析建议 -->
                    <div class="mt-3 p-3 bg-yellow-50 rounded-lg text-sm">
                      <p class="font-medium text-yellow-800">💡 教学建议：</p>
                      <p class="text-yellow-700 mt-1">{{ getDimensionAdvice(cls.id) }}</p>
                    </div>
                  </div>
                  
                  <!-- 学生列表 -->
                  <div>
                    <h4 class="font-bold text-gray-700 mb-3">👥 学生学习情况</h4>
                    <div v-if="(classStudentsMap[cls.id] || []).length === 0" class="text-gray-400 text-center py-4">
                      该班级暂无学生
                    </div>
                    <div v-else class="space-y-2">
                      <div v-for="student in classStudentsMap[cls.id]" :key="student.id"
                           class="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                           @click="viewStudentDetail(student)">
                        <div class="flex justify-between items-center">
                          <div>
                            <p class="font-medium">{{ student.name }}</p>
                            <p class="text-xs text-gray-500">{{ student.email }}</p>
                          </div>
                          <div class="flex items-center gap-4 text-sm">
                            <div class="text-center">
                              <p class="font-bold text-blue-600">{{ getStudentStats(student.id).totalPractices }}</p>
                              <p class="text-xs text-gray-400">练习次数</p>
                            </div>
                            <div class="text-center">
                              <p class="font-bold" :class="getScoreClass(getStudentStats(student.id).avgScore)">
                                {{ getStudentStats(student.id).avgScore || '--' }}
                              </p>
                              <p class="text-xs text-gray-400">平均分</p>
                            </div>
                            <div class="text-center">
                              <p class="font-bold text-green-600">{{ getStudentStats(student.id).highestScore || '--' }}</p>
                              <p class="text-xs text-gray-400">最高分</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 学生详细记录弹窗 -->
          <div v-if="selectedStudent" class="bg-white rounded-xl p-6 shadow">
            <div class="flex justify-between items-center mb-4">
              <h3 class="font-bold">{{ selectedStudent.name }} 的学习情况</h3>
              <button @click="selectedStudent = null" class="text-gray-500 text-sm hover:text-gray-700">✕ 关闭</button>
            </div>
            
            <!-- 最高分详情 -->
            <div v-if="getStudentStats(selectedStudent.id).highestRecord" class="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-lg">🏆</span>
                <h4 class="font-bold text-green-800">最高分记录</h4>
                <span class="ml-auto text-2xl font-bold text-green-600">{{ getStudentStats(selectedStudent.id).highestScore }}分</span>
              </div>
              <p class="text-sm text-gray-600 mb-3">{{ getStudentStats(selectedStudent.id).highestRecord.case_data?.caseName || '练习记录' }} · {{ formatDate(getStudentStats(selectedStudent.id).highestRecord.created_at) }}</p>
              
              <!-- 四维度分数 -->
              <div class="grid grid-cols-2 gap-2 mb-3">
                <div class="bg-white rounded p-2 text-sm">
                  <span class="text-gray-500">思政维度:</span>
                  <span class="font-bold ml-1" :class="getDimensionClass(getStudentStats(selectedStudent.id).highestRecord.dimensions?.sizheng)">
                    {{ getStudentStats(selectedStudent.id).highestRecord.dimensions?.sizheng || '--' }}分
                  </span>
                </div>
                <div class="bg-white rounded p-2 text-sm">
                  <span class="text-gray-500">心理慰藉:</span>
                  <span class="font-bold ml-1" :class="getDimensionClass(getStudentStats(selectedStudent.id).highestRecord.dimensions?.xinli)">
                    {{ getStudentStats(selectedStudent.id).highestRecord.dimensions?.xinli || '--' }}分
                  </span>
                </div>
                <div class="bg-white rounded p-2 text-sm">
                  <span class="text-gray-500">健康宣教:</span>
                  <span class="font-bold ml-1" :class="getDimensionClass(getStudentStats(selectedStudent.id).highestRecord.dimensions?.jiankang)">
                    {{ getStudentStats(selectedStudent.id).highestRecord.dimensions?.jiankang || '--' }}分
                  </span>
                </div>
                <div class="bg-white rounded p-2 text-sm">
                  <span class="text-gray-500">康复训练:</span>
                  <span class="font-bold ml-1" :class="getDimensionClass(getStudentStats(selectedStudent.id).highestRecord.dimensions?.kangfu)">
                    {{ getStudentStats(selectedStudent.id).highestRecord.dimensions?.kangfu || '--' }}分
                  </span>
                </div>
              </div>
              
              <!-- 评语 -->
              <div v-if="getStudentStats(selectedStudent.id).highestRecord.feedback" class="bg-white rounded p-3 text-sm">
                <p class="text-gray-500 mb-1">📝 评价：</p>
                <p class="text-gray-700">{{ getStudentStats(selectedStudent.id).highestRecord.feedback }}</p>
              </div>
            </div>
            
            <!-- 所有练习记录 -->
            <h4 class="font-medium text-gray-600 mb-2">📋 全部练习记录</h4>
            <div v-if="studentRecords.length === 0" class="text-gray-400 text-center py-4">
              暂无练习记录
            </div>
            <div v-else class="space-y-2 max-h-64 overflow-y-auto">
              <div v-for="record in studentRecords" :key="record.id" class="p-3 bg-gray-50 rounded-lg">
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <p class="font-medium">{{ record.case_data?.caseName || '练习记录' }}</p>
                    <p class="text-sm text-gray-500">{{ formatDate(record.created_at) }}</p>
                  </div>
                  <p class="text-xl font-bold" :class="getScoreClass(record.score)">
                    {{ record.score }}分
                  </p>
                </div>
                <div v-if="record.dimensions" class="grid grid-cols-4 gap-1 text-xs text-center">
                  <div class="bg-white rounded p-1">
                    <p class="text-gray-400">思政</p>
                    <p class="font-bold">{{ record.dimensions.sizheng || '--' }}</p>
                  </div>
                  <div class="bg-white rounded p-1">
                    <p class="text-gray-400">心理</p>
                    <p class="font-bold">{{ record.dimensions.xinli || '--' }}</p>
                  </div>
                  <div class="bg-white rounded p-1">
                    <p class="text-gray-400">健康</p>
                    <p class="font-bold">{{ record.dimensions.jiankang || '--' }}</p>
                  </div>
                  <div class="bg-white rounded p-1">
                    <p class="text-gray-400">康复</p>
                    <p class="font-bold">{{ record.dimensions.kangfu || '--' }}</p>
                  </div>
                </div>
              </div>
            </div>
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
                <p class="text-sm text-gray-500 mb-2">已有班级（点击班级名查看学生）</p>
                <div v-for="cls in classes" :key="cls.id" class="mb-1">
                  <div class="p-2 bg-gray-50 rounded text-sm flex justify-between items-center">
                    <span class="cursor-pointer hover:text-blue-600 font-medium" @click="expandedClassId = expandedClassId === cls.id ? null : cls.id">
                      {{ cls.name }} ({{ (classStudentsMap[cls.id] || []).length }}人)
                    </span>
                    <button @click="deleteClass(cls.id)" class="text-red-500 hover:text-red-700 text-xs">删除</button>
                  </div>
                  <div v-if="expandedClassId === cls.id" class="pl-4 py-2 bg-blue-50 rounded mt-1 text-xs">
                    <div v-if="(classStudentsMap[cls.id] || []).length === 0" class="text-gray-400 py-1">暂无学生</div>
                    <div v-else>
                      <div v-for="s in classStudentsMap[cls.id]" :key="s.id" class="py-1 flex justify-between border-b border-gray-200 last:border-0">
                        <span>{{ s.name }} ({{ s.email }})</span>
                        <button @click="deleteStudent(s.id)" class="text-red-500 hover:text-red-700">删除</button>
                      </div>
                    </div>
                  </div>
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
                <input 
                  v-model="newStudent.accountName" 
                  placeholder="登录账号（姓名拼音，如zhangsan）"
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
              
              <!-- 批量导入 -->
              <div class="mt-4 pt-4 border-t">
                <h4 class="font-bold mb-2 text-sm">批量导入学生</h4>
                <select v-model="batchClassId" class="w-full px-3 py-2 border rounded-lg mb-2">
                  <option value="">选择班级</option>
                  <option v-for="cls in classes" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
                </select>
                <textarea 
                  v-model="batchStudents" 
                  placeholder="每行格式：拼音账号,姓名&#10;例如：&#10;zhangsan,张三&#10;lisi,李四"
                  class="w-full px-3 py-2 border rounded-lg h-24 text-sm"
                ></textarea>
                <button 
                  @click="batchImportStudents"
                  :disabled="!batchClassId || !batchStudents.trim()"
                  class="w-full mt-2 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400 text-sm"
                >
                  批量导入
                </button>
                <p v-if="batchImportMsg" class="text-sm mt-1" :class="batchImportSuccess ? 'text-green-600' : 'text-red-500'">
                  {{ batchImportMsg }}
                </p>
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
                  <div class="flex items-center gap-2">
                    <span class="text-sm text-gray-500">{{ student.class_name }}</span>
                    <button @click="deleteStudent(student.id)" class="text-red-500 hover:text-red-700 text-sm">删除</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 老师管理 -->
          <div class="grid gap-4 md:grid-cols-2 mt-4">
            <!-- 创建老师 -->
            <div class="bg-white rounded-xl p-6 shadow">
              <h3 class="font-bold mb-4">添加老师</h3>
              <div class="space-y-3">
                <input 
                  v-model="newTeacher.name" 
                  placeholder="老师姓名"
                  class="w-full px-3 py-2 border rounded-lg"
                />
                <input 
                  v-model="newTeacher.accountName" 
                  placeholder="登录账号（姓名拼音，如zhanglaoshi）"
                  class="w-full px-3 py-2 border rounded-lg"
                />
                <select v-model="newTeacher.classId" class="w-full px-3 py-2 border rounded-lg">
                  <option value="">选择管理的班级</option>
                  <option v-for="cls in classes" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
                </select>
                <input 
                  v-model="newTeacher.password" 
                  type="text"
                  placeholder="登录密码（默认123456）"
                  class="w-full px-3 py-2 border rounded-lg"
                />
                <button 
                  @click="createTeacher"
                  :disabled="!newTeacher.name"
                  class="w-full py-2 bg-purple-600 text-white rounded-lg disabled:bg-gray-400"
                >
                  添加老师
                </button>
              </div>
              
              <!-- 批量创建老师 -->
              <div class="mt-4 pt-4 border-t">
                <h4 class="font-bold mb-2 text-sm">批量创建老师</h4>
                <textarea 
                  v-model="batchTeachers" 
                  placeholder="每行格式：拼音账号,姓名,班级名称&#10;例如：&#10;zhanglaoshi,张老师,护理1班&#10;lilaoshi,李老师,护理2班"
                  class="w-full px-3 py-2 border rounded-lg h-24 text-sm"
                ></textarea>
                <button 
                  @click="batchImportTeachers"
                  :disabled="!batchTeachers.trim()"
                  class="w-full mt-2 py-2 bg-purple-600 text-white rounded-lg disabled:bg-gray-400 text-sm"
                >
                  批量创建老师
                </button>
                <p v-if="teacherImportMsg" class="text-sm mt-1" :class="teacherImportSuccess ? 'text-green-600' : 'text-red-500'">
                  {{ teacherImportMsg }}
                </p>
              </div>
            </div>
            
            <!-- 老师列表 -->
            <div class="bg-white rounded-xl p-6 shadow">
              <h3 class="font-bold mb-4">老师列表</h3>
              <div v-if="teachers.length === 0" class="text-gray-400 text-sm">
                暂无老师
              </div>
              <div v-else class="space-y-2 max-h-60 overflow-y-auto">
                <div v-for="teacher in teachers" :key="teacher.id" 
                     class="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <span class="font-medium">{{ teacher.name }}</span>
                    <span class="text-sm text-gray-400 ml-2">账号: {{ teacher.email }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-sm text-gray-500">{{ teacher.class_name || '未分配班级' }}</span>
                    <button @click="deleteTeacher(teacher.id)" class="text-red-500 hover:text-red-700 text-sm">删除</button>
                  </div>
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
  livingTypes: ['有老伴'],
  economicTypes: ['有退休金'],
  hobbies: ['看电视'],
  occupation: '退休工人',
  studentTitle: '大夫'
})

const livingTypeOptions = ['独居', '丧偶', '有老伴', '无儿女', '儿女在外地']
const economicTypeOptions = ['无收入', '有退休金', '有商业保险', '儿女赡养']
const hobbyOptions = ['聊天', '养花', '看书', '看电视', '下棋', '广场舞', '唱歌']

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
  weaknesses: [],
  improvements: []
})

// 班级和学生
const classes = ref([])
const students = ref([])
const teachers = ref([])
const newClass = reactive({ name: '' })
const newStudent = reactive({ name: '', accountName: '', classId: '', password: '' })
const newTeacher = reactive({ name: '', accountName: '', classId: '', password: '' })
const batchClassId = ref('')
const batchStudents = ref('')
const batchTeachers = ref('')
const batchImportMsg = ref('')
const batchImportSuccess = ref(false)
const teacherImportMsg = ref('')
const teacherImportSuccess = ref(false)

// 班级展开状态
const expandedClassId = ref(null)

// 班级学生映射
const classStudentsMap = computed(() => {
  const map = {}
  students.value.forEach(s => {
    if (s.class_id) {
      if (!map[s.class_id]) map[s.class_id] = []
      map[s.class_id].push(s)
    }
  })
  return map
})

// 老师界面相关
const selectedTeacherClass = ref(null)
const selectedStudent = ref(null)
const studentRecords = ref([])
const allRecords = ref([]) // 所有练习记录

// 老师负责的班级
const teacherClasses = computed(() => {
  if (!currentUser.value.class_id) return []
  return classes.value.filter(c => c.id === currentUser.value.class_id)
})

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

// 上次得分（用于对比，取倒数第二条记录）
const lastScore = computed(() => {
  if (practiceHistory.value.length < 1) return null
  // 如果是刚完成的评分，practiceHistory[0] 是当前记录，需要取 [1]
  // 如果是查看历史记录，取 [0] 的上一次
  return practiceHistory.value.length > 1 ? practiceHistory.value[1]?.score : null
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
  } else if (currentUser.value.role === 'teacher') {
    // 老师需要加载：学生列表、班级列表、所有练习记录
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
    
    const { data: classesData } = await supabase
      .from('classes')
      .select('*')
    
    if (classesData) {
      classes.value = classesData
    }
    
    // 加载所有练习记录
    await loadAllRecords()
  } else if (currentUser.value.role === 'admin') {
    // 加载班级列表
    const { data: classesData } = await supabase
      .from('classes')
      .select('*')
    
    if (classesData) {
      classes.value = classesData
    }
    
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
    
    // 加载老师列表
    const { data: teachersData } = await supabase
      .from('users')
      .select('*, classes(name)')
      .eq('role', 'teacher')
    
    if (teachersData) {
      teachers.value = teachersData.map(t => ({
        ...t,
        class_name: t.classes?.name || '未分配'
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
    // 构建完整的邮箱地址
    let loginEmail = loginForm.username
    
    // 如果输入的不包含@，自动补全后缀
    if (!loginEmail.includes('@')) {
      // 尝试作为学生账号
      loginEmail = `${loginForm.username}@student.local`
    }
    
    // 先尝试从 users 表查询（管理员创建的账号）
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*, classes(name)')
      .eq('email', loginEmail)
      .eq('password', loginForm.password)
      .limit(1)
    
    if (userData && userData.length > 0) {
      const user = userData[0]
      currentUser.value = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || 'student',
        class_id: user.class_id,
        class_name: user.classes?.name
      }
      localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
      isLoggedIn.value = true
      loadData()
      return
    }
    
    // 如果学生账号不存在，尝试老师账号
    if (!loginForm.username.includes('@')) {
      const teacherEmail = `${loginForm.username}@teacher.local`
      const { data: teacherData } = await supabase
        .from('users')
        .select('*, classes(name)')
        .eq('email', teacherEmail)
        .eq('password', loginForm.password)
        .limit(1)
      
      if (teacherData && teacherData.length > 0) {
        const t = teacherData[0]
        currentUser.value = {
          id: t.id,
          email: t.email,
          name: t.name,
          role: t.role || 'teacher',
          class_id: t.class_id,
          class_name: t.classes?.name
        }
        localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
        isLoggedIn.value = true
        loadData()
        return
      }
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
    // 直接调用DeepSeek API生成病例
    const prompt = `请为一个老年患者生成详细病例信息，以JSON格式返回。

患者信息：
- 年龄范围：${caseProfile.age}
- 性别：${caseProfile.gender}
- 疾病：${allDiseases.join('、')}
- 性格：${caseProfile.personality}
- 方言：${caseProfile.dialect}
- 职业：${caseProfile.occupation}
- 居住：${caseProfile.livingPlace}，${caseProfile.livingTypes.join('、')}
- 经济：${caseProfile.economicTypes.join('、')}
- 爱好：${caseProfile.hobbies.join('、')}

请返回如下JSON格式（不要有其他内容）：
{
  "caseName": "病例名称",
  "basicInfo": {
    "name": "老人姓名（根据性别起一个常见的中国老人名字）",
    "age": 年龄数字,
    "gender": "性别",
    "occupation": "职业",
    "familyStatus": "家庭状况",
    "livingPlace": "居住地",
    "economicType": "经济类型",
    "hobby": "爱好",
    "studentTitle": "护理员"
  },
  "medicalHistory": {
    "chiefComplaint": "主诉症状",
    "presentIllness": "现病史详细描述",
    "pastHistory": "既往病史",
    "medications": ["正在服用的药物"]
  },
  "personality": {
    "traits": ["性格特点"],
    "concerns": ["关心的问题"],
    "communicationStyle": "沟通风格"
  },
  "openingLine": "老人的开场白（要自然，符合老人身份和疾病情况，称呼对方为护理员）"
}

重要：studentTitle必须固定为"护理员"，openingLine中必须称呼对方为"护理员"！`

    // 使用 Supabase Edge Function 生成病例
    const response = await fetch('https://todnsmeovkpmniqcwucm.supabase.co/functions/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        mode: 'generate'
      })
    })
    
    const data = await response.json()
    const content = data.choices[0].message.content
    
    // 提取JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      generatedCase.value = JSON.parse(jsonMatch[0])
      currentStep.value = 'case'
    } else {
      throw new Error('解析失败')
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
        familyStatus: caseProfile.livingTypes.join('、') || '有老伴',
        livingPlace: caseProfile.livingPlace,
        economicType: caseProfile.economicTypes.join('、') || '有退休金',
        hobby: caseProfile.hobbies.join('、') || '看电视',
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
      openingLine: '护理员，我最近总是头晕，你帮我看看吧。'
    }
    currentStep.value = 'case'
  } finally {
    isGenerating.value = false
  }
}

// 开始对话
function startChat() {
  messages.value = [
    { role: 'assistant', content: generatedCase.value.openingLine || '你好，护理员。' }
  ]
  currentStep.value = 'chat'
}

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
}

// Supabase Edge Function URL
const EDGE_FUNCTION_URL = 'https://todnsmeovkpmniqcwucm.supabase.co/functions/v1/chat'

// 版本标识，用于调试
const CODE_VERSION = 'v2.0-' + Date.now()
console.log('🔄 前端代码版本:', CODE_VERSION)

// 发送消息
async function sendMessage() {
  if (!userInput.value.trim() || isTyping.value) return
  
  const userMsg = userInput.value.trim()
  messages.value.push({ role: 'user', content: userMsg })
  userInput.value = ''
  isTyping.value = true
  
  try {
    const caseInfo = generatedCase.value
    const name = caseInfo.basicInfo?.name || '王大爷'
    const age = caseInfo.basicInfo?.age || 75
    const gender = caseInfo.basicInfo?.gender || '男'
    const disease = caseInfo.medicalHistory?.pastHistory || '高血压'
    const livingPlace = caseInfo.basicInfo?.livingPlace || caseProfile.livingPlace || '家里'
    // 处理 livingType：可能是字符串或数组
    const livingTypeRaw = caseInfo.basicInfo?.familyStatus || caseProfile.livingTypes || ['独居']
    const livingType = Array.isArray(livingTypeRaw) ? livingTypeRaw.join('、') : livingTypeRaw
    const occupation = caseInfo.basicInfo?.occupation || caseProfile.occupation || '普通工人'
    // 处理 hobbies：可能是字符串或数组
    const hobbiesRaw = caseInfo.basicInfo?.hobby || caseProfile.hobbies || ['看电视']
    const hobbies = Array.isArray(hobbiesRaw) ? hobbiesRaw.join('、') : hobbiesRaw
    const studentTitle = caseInfo.basicInfo?.studentTitle || caseProfile.studentTitle || '大夫'
    const dialect = caseProfile.dialect || '普通话'
    const dialectTip = dialectTips[dialect] || '用普通话'
    
    // 居住类型约束
    let livingConstraint = ''
    if (livingType.includes('独居')) {
      livingConstraint = '- 你是独居老人，没有老伴在身边，绝不能提到老伴或老伴在干什么'
    } else if (livingType.includes('丧偶')) {
      livingConstraint = '- 你是丧偶老人，老伴已经去世，绝不能说老伴在世或老伴在干什么，只能说"老伴走了X年了"'
    } else if (livingType.includes('有老伴')) {
      livingConstraint = '- 你有老伴在身边，可以提到老伴的情况'
    }
    if (livingType.includes('无儿女')) {
      livingConstraint += '\n- 你没有儿女，绝不能提到儿女或孙子孙女'
    } else if (livingType.includes('儿女在外地')) {
      livingConstraint += '\n- 你的儿女在外地工作，不在身边，可以提到想念他们'
    }
    
    const systemPrompt = `你是${name}，一位${age}岁${gender}老人。

【你的情况】
- 患有${disease}
- 住${livingPlace}，${livingType}
- 以前是${occupation}
- 平时爱${hobbies}

【居住类型约束 - 极其重要】
${livingConstraint || '- 按照你的居住情况如实回答'}

【对话规则】
你现在是真实的老人，学生问什么就答什么！
- 问"你好/您好" → 热情回应，如"哎哟，护理员来了啊，快坐快坐"
- 问血压 → 直接说具体数值，如"今早量了，145/90"
- 问吃药 → 说吃了没，偶尔会忘
- 问身体 → 说哪里不舒服
- 问心情 → 说心里话，想孩子、担心病
- 问睡眠 → 说睡眠问题
- 问饮食 → 说吃饭情况

【说话风格】
${dialectTip}
称呼学生为"${studentTitle}"
像跟邻居唠嗑一样自然，可以啰嗦，可以带情绪（担心、高兴、抱怨、想念）

【绝对禁止】
× 不要说"好的我记住了"
× 不要说"我不清楚你给我讲讲"
× 不要用书面语
× 每次回复必须不一样`

    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.value.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }))
    ]
    
    // 调用Supabase Edge Function（加时间戳防止缓存）
    const url = EDGE_FUNCTION_URL + '?t=' + Date.now()
    console.log('🚀 调用Edge Function:', url)
    console.log('📤 发送消息:', chatMessages.slice(-1))
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: chatMessages })
    })
    
    console.log('📥 响应状态:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('响应数据:', data)
      if (data.choices && data.choices[0]) {
        const reply = data.choices[0].message.content
        messages.value.push({ role: 'assistant', content: reply })
        speak(reply)
      } else if (data.error) {
        console.error('API错误:', data.error)
        useFallbackReply(userMsg, { name, disease, studentTitle, dialect })
      } else {
        console.error('格式错误:', data)
        useFallbackReply(userMsg, { name, disease, studentTitle, dialect })
      }
    } else {
      const errorText = await response.text()
      console.error('HTTP错误:', response.status, errorText)
      useFallbackReply(userMsg, { name, disease, studentTitle, dialect })
    }
    
  } catch (error) {
    console.error('Chat error:', error)
    const name = generatedCase.value.basicInfo?.name || '老人'
    const studentTitle = caseProfile.studentTitle || '大夫'
    useFallbackReply(userMsg, { name, disease: '老毛病', studentTitle, dialect: '普通话' })
  } finally {
    isTyping.value = false
  }
}

// 前端智能回复（降级方案）
function useFallbackReply(userMsg, elder) {
  const reply = generateSmartReply(userMsg, elder)
  messages.value.push({ role: 'assistant', content: reply })
  speak(reply)
}

// 智能回复生成函数
function generateSmartReply(userMsg, elder) {
  const { name, age, gender, disease, studentTitle, dialect } = elder
  const msg = userMsg.toLowerCase()
  
  // 方言口语
  const dialectWords = {
    '东北话': ['哎呀妈呀', '咋整', '那必须的', '嘎哈', '嗯呐'],
    '四川话': ['要得', '巴适', '撒', '啷个', '晓得咯'],
    '河南话': ['中', '弄啥嘞', '可得劲', '中不中'],
    '山东话': ['俺', '中', '杠杠的', '好好好'],
    '广东话': ['冇问题', '靓仔', '好得', '系啊'],
    '陕西话': ['额', '么麻达', '嘹咋咧', '好着呢'],
    '天津话': ['介是嘛', '嘛呢', '倍儿', '好好好']
  }
  
  const slang = dialectWords[dialect] ? 
    dialectWords[dialect][Math.floor(Math.random() * dialectWords[dialect].length)] + ' ' : ''
  
  // 问候
  if (msg.match(/你好|您好|哈喽|hi|hello/)) {
    return `${slang}哎哟，${studentTitle}来了啊！快坐快坐，我这老腰正好想找人唠唠。`
  }
  
  // 血压
  if (msg.includes('血压')) {
    const sys = 120 + Math.floor(Math.random() * 40)
    const dia = 70 + Math.floor(Math.random() * 30)
    const status = sys > 140 ? '有点高' : sys < 120 ? '还行' : '还可以'
    return `${slang}今早量了，${sys}/${dia}，${status}，${studentTitle}你看这数值咋样？药一直在吃呢。`
  }
  
  // 吃药
  if (msg.includes('药') || msg.includes('吃药')) {
    const replies = [
      `${slang}药啊，今早吃了，降压药、降糖药一把一把的，都成药罐子了。`,
      `${slang}吃了吃了，有时候会忘，岁数大了记性不行。`,
      `${slang}今天还没吃呢，你不说我都忘了，${studentTitle}你提醒得对。`,
      `${slang}药是吃了，可这病啊，吃着药也不见好多少，老了就这样。`
    ]
    return replies[Math.floor(Math.random() * replies.length)]
  }
  
  // 身体/健康
  if (msg.match(/身体|怎么样|舒服|难受|感觉/)) {
    const replies = [
      `${slang}身体啊，老毛病了，${disease}这么多年，时好时坏的。`,
      `${slang}还能咋样，老了就这样，这儿疼那儿酸的，习惯了。`,
      `${slang}腿脚不行了，下楼买菜都费劲，爬个三楼得歇两回。`,
      `${slang}这几天还行，就是晚上睡不好，老醒，可能是想孩子们了。`
    ]
    return replies[Math.floor(Math.random() * replies.length)]
  }
  
  // 睡眠
  if (msg.match(/睡|觉|失眠/)) {
    const replies = [
      `${slang}睡觉啊，晚上老醒，一宿能醒四五次，可能是岁数大了。`,
      `${slang}睡不好，躺床上两三个小时才能睡着，睡着了还老做梦。`,
      `${slang}我这觉啊，越来越少了，早上四五点就醒，睡不着了。`
    ]
    return replies[Math.floor(Math.random() * replies.length)]
  }
  
  // 饮食
  if (msg.match(/吃|饭|饮食|胃口/)) {
    const replies = [
      `${slang}吃饭还行，就是牙不行了，硬的咬不动，就喝点粥吃点软的。`,
      `${slang}一个人住，懒得做，有时候就凑合一口。`,
      `${slang}护理员说少吃盐少吃油，可我这嘴吧，吃清淡了没滋味啊。`
    ]
    return replies[Math.floor(Math.random() * replies.length)]
  }
  
  // 子女
  if (msg.match(/孩子|子女|儿女|想/)) {
    const replies = [
      `${slang}孩子们啊，都忙，一年也就回来一两回，过年能见见面。`,
      `${slang}能不想吗？我闺女在外地，儿子也忙，电话倒是常打。`,
      `${slang}想是想，可不想打扰他们，他们工作忙，有家有孩子的。`,
      `${slang}有时候做梦梦到他们小时候，醒来枕巾都湿了。`
    ]
    return replies[Math.floor(Math.random() * replies.length)]
  }
  
  // 心情
  if (msg.match(/心情|高兴|开心|烦/)) {
    const replies = [
      `${slang}心情啊，还行吧，有时候想孩子们了会难过，习惯了。`,
      `${slang}今天你来了，心里高兴，有人陪着说说话挺好的。`,
      `${slang}有时候会烦躁，觉得自己老了，没用了，成了孩子们的负担。`
    ]
    return replies[Math.floor(Math.random() * replies.length)]
  }
  
  // 运动
  if (msg.match(/运动|活动|锻炼|散步|走/)) {
    const replies = [
      `${slang}运动啊，有时候下楼走走，腿脚不好也走不远。`,
      `${slang}在家做做操，甩甩手踢踢腿的，也不敢剧烈运动。`,
      `${slang}小区里有些老伙伴，有时候一起遛弯，聊聊家常。`
    ]
    return replies[Math.floor(Math.random() * replies.length)]
  }
  
  // 疼痛
  if (msg.match(/疼|痛|不舒服/)) {
    const parts = ['腰', '腿', '膝盖', '肩膀', '后背']
    const part = parts[Math.floor(Math.random() * parts.length)]
    const replies = [
      `${slang}${part}疼，老毛病了，贴了膏药也不管用。`,
      `${slang}这几天${part}不太舒服，可能是变天了。`,
      `${slang}这儿那儿都疼，老了零件都老化了，${studentTitle}你说正常不？`
    ]
    return replies[Math.floor(Math.random() * replies.length)]
  }
  
  // 疾病相关
  if (msg.includes(disease) || msg.includes('病')) {
    const replies = [
      `${slang}${disease}啊，好多年了，一直在吃药控制。`,
      `${slang}这病吧，时好时坏，也没啥好办法，就这样熬着呗。`,
      `${slang}护理员说要注意饮食，可我这嘴吧，管不住。`
    ]
    return replies[Math.floor(Math.random() * replies.length)]
  }
  
  // 默认回复
  const defaults = [
    `${slang}嗯，${studentTitle}你说得对，我记住了。`,
    `${slang}这个啊，我还真没想过，你给我讲讲？`,
    `${slang}哦，是这样啊，活到老学到老嘛。`,
    `${slang}行，我知道了，${studentTitle}你真细心。`,
    `${slang}嗯嗯，我听着呢，你继续说。`
  ]
  return defaults[Math.floor(Math.random() * defaults.length)]
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
  console.log('准备播放语音:', text.substring(0, 20), '性别:', gender)
  
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
      console.log('使用讯飞应用:', config.appId)
      
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
      
      // 选择发音人（讯飞老年音色）
      // x4_xiuying 老年女声(秀英), x4_lingbosong 老年男声(聆伯松)
      const voiceName = gender === '女' ? 'x4_xiuying' : 'x4_lingbosong'
      
      console.log('讯飞语音参数:', { voiceName, appId: config.appId })
      
      // 建立WebSocket连接
      const ws = new WebSocket(wsUrl)
      let audioChunks = []
      let hasError = false
      
      ws.onopen = () => {
        console.log('讯飞WebSocket已连接')
        const request = {
          header: {
            app_id: config.appId,
            status: 2
          },
          parameter: {
            tts: {
              vcn: voiceName,
              speed: 85,  // 语速较快，更自然流畅
              volume: 60,
              pitch: 45,  // 音调稍低，更像老人
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
      
      ws.onerror = (err) => {
        console.error('讯飞WebSocket错误:', err)
        hasError = true
        reject(new Error('WebSocket连接失败'))
      }
      
      ws.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data)
          
          if (response.header.code !== 0) {
            console.error('讯飞返回错误:', response.header)
            hasError = true
            ws.close()
            reject(new Error(response.header.message || '讯飞API错误'))
            return
          }
          
          if (response.payload?.audio?.audio) {
            audioChunks.push(response.payload.audio.audio)
          }
          
          if (response.header.status === 2) {
            ws.close()
            if (!hasError && audioChunks.length > 0) {
              console.log('讯飞语音合成成功，开始播放')
              playAudioFromBase64(audioChunks.join(''))
              resolve()
            } else {
              reject(new Error('音频数据为空'))
            }
          }
        } catch (e) {
          console.error('解析讯飞响应失败:', e)
          hasError = true
          ws.close()
          reject(e)
        }
      }
      
      // 超时处理
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close()
          reject(new Error('讯飞连接超时'))
        }
      }, 10000)
      
    } catch (error) {
      console.error('讯飞语音初始化失败:', error)
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
    // 直接调用DeepSeek API进行评分
    const caseInfo = generatedCase.value
    const name = caseInfo.basicInfo?.name || '老人'
    const disease = caseInfo.medicalHistory?.pastHistory || '疾病'
    
    const chatHistory = messages.value.map(m => 
      `${m.role === 'user' ? '学生' : name}: ${m.content}`
    ).join('\n')

    const prompt = `请对以下学生与老人的对话进行专业评分，以JSON格式返回。

老人信息：
- 姓名：${name}
- 疾病：${disease}

对话记录：
${chatHistory}

评分维度（每项满分25分）：
1. 思政维度：是否体现关爱老人、尊重老人价值观，是否具备护理员职业道德和人文关怀精神
2. 心理慰藉：是否给予情感支持、缓解焦虑，是否耐心倾听、理解老人情绪、提供心理疏导
3. 健康宣教：日常照护知识是否准确易懂，包括用药提醒、饮食指导、生活习惯建议、安全防护意识
4. 康复训练：是否掌握康复训练方法，能否指导老人进行日常活动、功能锻炼，注意安全事项

评分要求：
- 严格根据对话内容评分，不要随意给高分
- 如果某维度完全没有涉及，该维度得0分
- 优点和不足要具体，结合对话内容
- 建议要实用，针对不足提出

请返回如下JSON格式（不要有其他内容）：
{
  "totalScore": 总分(0-100),
  "dimensions": {
    "思政维度": 分数(0-25),
    "心理慰藉": 分数(0-25),
    "健康宣教": 分数(0-25),
    "康复训练": 分数(0-25)
  },
  "feedback": "整体评价（50字以内）",
  "strengths": ["具体优点1", "具体优点2"],
  "weaknesses": ["具体不足1", "具体不足2"],
  "improvements": ["具体建议1", "具体建议2"]
}`

    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        mode: 'score'
      })
    })
    
    const data = await response.json()
    const content = data.choices[0].message.content
    
    // 提取JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      score.value = JSON.parse(jsonMatch[0])
    } else {
      throw new Error('解析失败')
    }
    
  } catch (error) {
    console.error('Score error:', error)
    // 默认评分
    const studentMsgs = messages.value.filter(m => m.role === 'user')
    score.value = {
      totalScore: Math.min(60 + studentMsgs.length * 2, 85),
      dimensions: {
        '思政维度': 15 + Math.floor(Math.random() * 5),
        '心理慰藉': 14 + Math.floor(Math.random() * 5),
        '健康宣教': 15 + Math.floor(Math.random() * 5),
        '康复训练': 14 + Math.floor(Math.random() * 5)
      },
      feedback: '整体表现一般，建议加强各维度能力',
      strengths: ['态度友善', '有耐心沟通'],
      weaknesses: ['缺少针对性指导', '心理疏导不足'],
      improvements: ['加强对老人的情感关怀', '提供更专业的健康指导']
    }
  } finally {
    isTyping.value = false
    currentStep.value = 'score'
    
    // 保存评分结果到数据库
    if (currentUser.value.role === 'student' && supabase) {
      try {
        await supabase.from('practice_records').insert({
          user_id: currentUser.value.id,
          case_name: generatedCase.value.caseName || '练习记录',
          score: score.value.totalScore,
          dimensions: score.value.dimensions,
          feedback: score.value.feedback,
          case_data: generatedCase.value,
          created_at: new Date().toISOString()
        })
        console.log('评分记录已保存')
        // 重新加载数据以更新统计和对比
        await loadData()
      } catch (e) {
        console.error('保存评分记录失败:', e)
      }
    }
  }
}

// 重置练习
function resetPractice() {
  currentStep.value = 'home'
  messages.value = []
  generatedCase.value = {}
  score.value = { totalScore: 0, dimensions: {}, feedback: '', strengths: [], weaknesses: [], improvements: [] }
}

// 创建班级
async function createClass() {
  if (!newClass.name) return
  
  // 生成班级代码
  const code = Math.random().toString(36).substr(2, 6).toUpperCase()
  
  const { data, error } = await supabase
    .from('classes')
    .insert({ 
      name: newClass.name,
      code: code,
      student_count: 0
    })
    .select()
  
  if (data) {
    classes.value.push(data[0])
    alert(`班级创建成功！\n班级名称：${newClass.name}\n班级代码：${code}`)
    newClass.name = ''
  } else if (error) {
    alert('创建失败：' + error.message)
  }
}

// 删除班级
async function deleteClass(classId) {
  if (!confirm('确定要删除这个班级吗？班级内的学生将变为未分配状态。')) return
  
  const { error } = await supabase
    .from('classes')
    .delete()
    .eq('id', classId)
  
  if (!error) {
    classes.value = classes.value.filter(c => c.id !== classId)
    // 刷新学生列表，更新班级名称
    loadData()
  } else {
    alert('删除失败：' + error.message)
  }
}

// 删除学生
async function deleteStudent(studentId) {
  if (!confirm('确定要删除这个学生吗？')) return
  
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', studentId)
  
  if (!error) {
    students.value = students.value.filter(s => s.id !== studentId)
  } else {
    alert('删除失败：' + error.message)
  }
}

// 删除老师
async function deleteTeacher(teacherId) {
  if (!confirm('确定要删除这个老师吗？')) return
  
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', teacherId)
  
  if (!error) {
    teachers.value = teachers.value.filter(t => t.id !== teacherId)
  } else {
    alert('删除失败：' + error.message)
  }
}

// 创建学生
async function createStudent() {
  if (!newStudent.name) {
    alert('请输入学生姓名')
    return
  }
  
  const password = newStudent.password || '123456'
  // 使用姓名拼音作为账号（用户需要输入拼音账号）
  const accountName = newStudent.accountName || newStudent.name
  const email = `${accountName}@student.local`
  
  try {
    // 检查账号是否已存在
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .limit(1)
    
    if (existing && existing.length > 0) {
      alert(`账号已存在：${email}\n请更换账号名！`)
      return
    }
    
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
        class_id: newStudent.classId || null,
        class_name: classes.value.find(c => c.id === newStudent.classId)?.name || '未分配'
      })
      alert(`学生创建成功！\n账号：${email}\n密码：${password}`)
      newStudent.name = ''
      newStudent.accountName = ''
      newStudent.classId = ''
      newStudent.password = ''
    } else if (error) {
      alert('创建失败：' + error.message)
    }
  } catch (err) {
    alert('创建失败：' + err.message)
  }
}

// 批量导入学生
async function batchImportStudents() {
  if (!batchClassId.value || !batchStudents.value.trim()) {
    batchImportMsg.value = '请选择班级并输入学生信息'
    batchImportSuccess.value = false
    return
  }
  
  const lines = batchStudents.value.trim().split('\n').map(n => n.trim()).filter(n => n)
  if (lines.length === 0) {
    batchImportMsg.value = '请输入至少一个学生信息'
    batchImportSuccess.value = false
    return
  }
  
  batchImportMsg.value = '正在导入...'
  
  try {
    const className = classes.value.find(c => c.id === batchClassId.value)?.name || ''
    let successCount = 0
    let skipCount = 0
    
    for (const line of lines) {
      const parts = line.split(',').map(p => p.trim())
      let accountName, name
      
      if (parts.length >= 2) {
        // 格式：拼音账号,姓名
        accountName = parts[0]
        name = parts[1]
      } else {
        // 格式：姓名（兼容旧格式）
        name = parts[0]
        accountName = name
      }
      
      const email = `${accountName}@student.local`
      
      // 检查账号是否已存在
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .limit(1)
      
      if (existing && existing.length > 0) {
        skipCount++
        continue // 跳过已存在的账号
      }
      
      const studentId = 'student_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: studentId,
          name: name,
          email: email,
          role: 'student',
          class_id: batchClassId.value,
          password: '123456'
        })
        .select()
      
      if (data) {
        students.value.unshift({
          id: studentId,
          name: name,
          email: email,
          class_id: batchClassId.value,
          class_name: className
        })
        successCount++
      }
    }
    
    let msg = `成功导入 ${successCount} 名学生`
    if (skipCount > 0) {
      msg += `，跳过 ${skipCount} 个重复账号`
    }
    msg += `，默认密码：123456`
    batchImportMsg.value = msg
    batchImportSuccess.value = true
    batchStudents.value = ''
    
    // 更新班级学生数
    const { data: classData } = await supabase
      .from('classes')
      .update({ student_count: successCount })
      .eq('id', batchClassId.value)
    
  } catch (err) {
    batchImportMsg.value = '导入失败：' + err.message
    batchImportSuccess.value = false
  }
}

// 创建老师
async function createTeacher() {
  if (!newTeacher.name) {
    alert('请输入老师姓名')
    return
  }
  
  const password = newTeacher.password || '123456'
  const teacherId = 'teacher_' + Date.now()
  const accountName = newTeacher.accountName || newTeacher.name
  const email = `${accountName}@teacher.local`
  
  try {
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: teacherId,
        name: newTeacher.name,
        email: email,
        role: 'teacher',
        class_id: newTeacher.classId || null,
        password: password
      })
      .select()
    
    if (data) {
      const className = classes.value.find(c => c.id === newTeacher.classId)?.name || '未分配'
      teachers.value.unshift({
        id: teacherId,
        name: newTeacher.name,
        email: email,
        class_name: className,
        class_id: newTeacher.classId
      })
      alert(`老师创建成功！\n姓名：${newTeacher.name}\n账号：${email}\n密码：${password}`)
      newTeacher.name = ''
      newTeacher.accountName = ''
      newTeacher.classId = ''
      newTeacher.password = ''
    } else if (error) {
      alert('创建失败：' + error.message)
    }
  } catch (err) {
    alert('创建失败：' + err.message)
  }
}

// 批量创建老师
async function batchImportTeachers() {
  if (!batchTeachers.value.trim()) {
    teacherImportMsg.value = '请输入老师信息'
    teacherImportSuccess.value = false
    return
  }
  
  const lines = batchTeachers.value.trim().split('\n').map(l => l.trim()).filter(l => l)
  if (lines.length === 0) {
    teacherImportMsg.value = '请输入至少一个老师信息'
    teacherImportSuccess.value = false
    return
  }
  
  teacherImportMsg.value = '正在创建...'
  
  try {
    let successCount = 0
    
    for (const line of lines) {
      const parts = line.split(',').map(p => p.trim())
      if (parts.length < 1) continue
      
      let accountName, name, className
      
      if (parts.length >= 3) {
        // 格式：拼音账号,姓名,班级名称
        accountName = parts[0]
        name = parts[1]
        className = parts[2]
      } else if (parts.length === 2) {
        // 格式：姓名,班级名称
        name = parts[0]
        accountName = name
        className = parts[1]
      } else {
        // 格式：姓名
        name = parts[0]
        accountName = name
        className = ''
      }
      
      const cls = classes.value.find(c => c.name === className)
      
      const teacherId = 'teacher_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      const email = `${accountName}@teacher.local`
      const password = '123456'
      
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: teacherId,
          name: name,
          email: email,
          role: 'teacher',
          class_id: cls?.id || null,
          password: password
        })
        .select()
      
      if (data) {
        teachers.value.unshift({
          id: teacherId,
          name: name,
          email: email,
          class_name: className || '未分配',
          class_id: cls?.id || null
        })
        successCount++
      }
    }
    
    teacherImportMsg.value = `成功创建 ${successCount} 名老师，默认密码：123456`
    teacherImportSuccess.value = true
    batchTeachers.value = ''
    
  } catch (err) {
    teacherImportMsg.value = '创建失败：' + err.message
    teacherImportSuccess.value = false
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

// 获取学生统计数据
function getStudentStats(studentId) {
  const records = allRecords.value.filter(r => r.user_id === studentId)
  if (records.length === 0) return { totalPractices: 0, avgScore: 0, highestScore: 0, lowestScore: 0, highestRecord: null }
  const scores = records.map(r => r.score).filter(s => s)
  const highestScore = scores.length ? Math.max(...scores) : 0
  const highestRecord = records.find(r => r.score === highestScore) || null
  return {
    totalPractices: records.length,
    avgScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
    highestScore: highestScore,
    lowestScore: scores.length ? Math.min(...scores) : 0,
    highestRecord: highestRecord
  }
}

// 获取班级整体统计
function getClassStats(classId) {
  const classStudents = classStudentsMap.value[classId] || []
  if (classStudents.length === 0) return null
  
  const studentIds = classStudents.map(s => s.id)
  const classRecords = allRecords.value.filter(r => studentIds.includes(r.user_id))
  
  if (classRecords.length === 0) {
    return { totalPractices: 0, avgScore: 0, highestScore: 0, lowestScore: 0, studentCount: classStudents.length, dimensionStats: null }
  }
  
  const scores = classRecords.map(r => r.score).filter(s => s)
  
  // 四维度统计
  const dimensionStats = { sizheng: [], xinli: [], jiankang: [], kangfu: [] }
  classRecords.forEach(r => {
    if (r.dimensions) {
      if (r.dimensions.sizheng) dimensionStats.sizheng.push(r.dimensions.sizheng)
      if (r.dimensions.xinli) dimensionStats.xinli.push(r.dimensions.xinli)
      if (r.dimensions.jiankang) dimensionStats.jiankang.push(r.dimensions.jiankang)
      if (r.dimensions.kangfu) dimensionStats.kangfu.push(r.dimensions.kangfu)
    }
  })
  
  const avgDimension = (arr) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0
  
  return {
    totalPractices: classRecords.length,
    avgScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
    highestScore: scores.length ? Math.max(...scores) : 0,
    lowestScore: scores.length ? Math.min(...scores) : 0,
    studentCount: classStudents.length,
    dimensionStats: {
      sizheng: { avg: avgDimension(dimensionStats.sizheng), count: dimensionStats.sizheng.length },
      xinli: { avg: avgDimension(dimensionStats.xinli), count: dimensionStats.xinli.length },
      jiankang: { avg: avgDimension(dimensionStats.jiankang), count: dimensionStats.jiankang.length },
      kangfu: { avg: avgDimension(dimensionStats.kangfu), count: dimensionStats.kangfu.length }
    }
  }
}

// 查看学生详情
async function viewStudentDetail(student) {
  selectedStudent.value = student
  studentRecords.value = allRecords.value.filter(r => r.user_id === student.id)
}

// 加载所有练习记录（老师用）
async function loadAllRecords() {
  const { data } = await supabase
    .from('practice_records')
    .select('*')
    .order('created_at', { ascending: false })
  allRecords.value = data || []
}

// 分数颜色类
function getScoreClass(score) {
  if (!score) return 'text-gray-400'
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-orange-600'
  return 'text-red-600'
}

// 维度分数颜色类
function getDimensionClass(score) {
  if (!score) return 'text-gray-400'
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-orange-600'
  return 'text-red-600'
}

// 维度进度条颜色类
function getDimensionBarClass(score) {
  if (!score) return 'bg-gray-300'
  if (score >= 80) return 'bg-green-500'
  if (score >= 60) return 'bg-orange-500'
  return 'bg-red-500'
}

// 维度分析建议
function getDimensionAdvice(classId) {
  const stats = getClassStats(classId)
  if (!stats || !stats.dimensionStats) return '暂无数据'
  
  const dims = [
    { name: '思政维度', avg: stats.dimensionStats.sizheng.avg, key: 'sizheng' },
    { name: '心理慰藉', avg: stats.dimensionStats.xinli.avg, key: 'xinli' },
    { name: '健康宣教', avg: stats.dimensionStats.jiankang.avg, key: 'jiankang' },
    { name: '康复训练', avg: stats.dimensionStats.kangfu.avg, key: 'kangfu' }
  ].filter(d => d.avg > 0)
  
  if (dims.length === 0) return '暂无数据'
  
  const sorted = [...dims].sort((a, b) => a.avg - b.avg)
  const lowest = sorted[0]
  const highest = sorted[sorted.length - 1]
  
  const advice = []
  
  // 优势分析
  if (highest.avg >= 80) {
    advice.push(`✅ "${highest.name}"表现突出，平均${highest.avg}分，是班级优势`)
  } else if (highest.avg >= 60) {
    advice.push(`👍 "${highest.name}"表现良好，平均${highest.avg}分`)
  }
  
  // 薄弱分析
  if (lowest.avg < 60) {
    advice.push(`⚠️ "${lowest.name}"平均${lowest.avg}分，低于及格线，需要重点强化`)
  } else if (lowest.avg < 70) {
    advice.push(`💡 "${lowest.name}"平均${lowest.avg}分，相对偏弱，建议加强训练`)
  }
  
  // 差距分析
  const gap = highest.avg - lowest.avg
  if (gap >= 20) {
    advice.push(`📊 各维度发展不均衡，"${highest.name}"领先"${lowest.name}"${gap}分`)
  }
  
  // 总体数据
  const totalStudents = stats.studentCount
  const totalPractices = stats.totalPractices
  const avgScore = stats.avgScore
  
  if (totalStudents > 0 && avgScore > 0) {
    advice.push(`📈 班级${totalStudents}名学生，共${totalPractices}次练习，平均分${avgScore}分`)
  }
  
  // 特定维度改进建议
  dims.forEach(d => {
    if (d.avg < 70 && d.name === '思政维度') {
      advice.push(`🎯 思政教育需加强，建议结合案例强化价值观引导`)
    } else if (d.avg < 70 && d.name === '心理慰藉') {
      advice.push(`🤝 沟通技巧训练不足，建议加强同理心和情感表达`)
    } else if (d.avg < 70 && d.name === '康复训练') {
      advice.push(`💪 康复指导需更专业，建议结合实际案例演示`)
    }
  })
  
  return advice.length > 0 ? advice.join('\n') : '暂无足够数据生成分析'
}

</script>
// 强制刷新版本 Wed Apr  8 00:35:35 CST 2026
