<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 急救警报音频 -->
    <audio ref="alarmAudio" preload="auto">
      <source src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" type="audio/mpeg">
    </audio>
    
    <!-- 登录页面 -->
    <div v-if="!isLoggedIn" class="login-page">
      <div class="left-banner"></div>
      <div class="right-banner"></div>
      <div class="flex items-center justify-center min-h-screen p-4">
        <div class="w-full max-w-md bg-white rounded-xl shadow-lg p-6 relative z-10">
        <h1 class="text-2xl font-bold text-center text-blue-600 mb-2">阳泉师专医康养AI实训系统</h1>
        <p class="text-gray-500 text-center mb-6">康养系 · 智能养老护理实训平台</p>
        
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
          <!-- 角色选择 -->
          <div class="flex gap-2 bg-gray-100 rounded-lg p-1">
            <button 
              @click="loginForm.role = 'student'"
              :class="loginForm.role === 'student' ? 'bg-white shadow text-blue-600' : 'text-gray-500'"
              class="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
            >
              学生
            </button>
            <button 
              @click="loginForm.role = 'teacher'"
              :class="loginForm.role === 'teacher' ? 'bg-white shadow text-blue-600' : 'text-gray-500'"
              class="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
            >
              教师
            </button>
            <button 
              @click="loginForm.role = 'admin'"
              :class="loginForm.role === 'admin' ? 'bg-white shadow text-blue-600' : 'text-gray-500'"
              class="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
            >
              管理员
            </button>
          </div>
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
            placeholder="姓名（必填）" 
            class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input 
            v-model="registerForm.email" 
            placeholder="账号（可选，默认用姓名拼音）" 
            class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input 
            v-model="registerForm.password" 
            type="password"
            placeholder="密码（至少6位，必填）" 
            class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select v-model="registerForm.classId" class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">选择班级（必选）</option>
            <option v-for="cls in classes" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
          </select>
          <p v-if="registerForm.classId === ''" class="text-xs text-orange-500 -mt-2">请选择班级才能注册</p>
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
          管理员账号：admin / admin123（选择"管理员"登录）
        </p>
      </div>
    </div>
    </div>
    
    <!-- 主界面 -->
    <div v-else class="min-h-screen">
      <!-- 顶部导航 -->
      <div class="bg-blue-600 text-white p-4">
        <div class="flex justify-between items-center max-w-4xl mx-auto">
          <!-- 左侧用户信息 -->
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 bg-blue-400 rounded-full flex items-center justify-center text-sm font-medium">
              {{ currentUser.name?.charAt(0) || 'U' }}
            </div>
            <div class="hidden sm:block">
              <p class="text-sm font-medium">{{ currentUser.name }}</p>
              <p class="text-xs text-blue-200">{{ currentUser.role === 'admin' ? '管理员' : currentUser.role === 'teacher' ? '老师' : '学生' }}</p>
            </div>
          </div>
          
          <!-- 中间系统名称 - 放大两倍 -->
          <h1 class="text-2xl md:text-3xl lg:text-4xl font-bold text-center flex-1 mx-4 tracking-wide">
            阳泉师专医康养AI实训系统 <span class="text-xs bg-yellow-500 px-1 rounded ml-2">v3.40</span>
          </h1>
          
          <!-- 右侧退出按钮 -->
          <button @click="logout" class="text-sm bg-blue-500 px-3 py-1.5 rounded hover:bg-blue-400 flex items-center gap-1">
            <span>退出</span>
          </button>
        </div>
      </div>
      
      <!-- 左侧装饰栏 - 花草书法背景 -->
      <div class="left-banner"></div>
      
      <!-- 右侧装饰栏 - 护理员推轮椅老人 -->
      <div class="right-banner"></div>
      
      <!-- 主内容区 - 居中显示 -->
      <div class="main-content">
        <div v-if="currentUser.role === 'student'">
          <!-- 步骤指示器 -->
          <div v-if="currentStep === 'home'" class="space-y-4">
            <!-- 开始练习卡片 -->
            <div class="bg-white rounded-xl p-6 shadow">
              <h2 class="text-xl font-bold mb-4">开始练习</h2>
              <p class="text-gray-500 mb-4">输入老人画像，AI将自动生成病例和对话场景</p>
              <button @click="currentStep = 'input'" class="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                开始新练习
              </button>
            </div>
            
            <!-- 案例练习 -->
            <div v-if="cases.length > 0" class="bg-white rounded-xl p-6 shadow">
              <h2 class="text-lg font-bold mb-4">📚 案例练习</h2>
              <p class="text-gray-500 mb-4">选择老师发布的案例进行练习</p>
              <div v-if="cases.length === 0" class="text-gray-400 text-center py-4">
                暂无发布的案例
              </div>
              <div v-else class="space-y-3">
                <div v-for="c in cases" :key="c.id" class="p-4 border rounded-lg">
                  <div>
                    <p class="font-bold text-lg">{{ c.name }}</p>
                    <p class="text-xs text-gray-400 mt-1">发布时间：{{ formatDate(c.created_at) }}</p>
                  </div>
                  <!-- 教学要点预览 -->
                  <div v-if="c.description" class="mt-3 p-3 bg-blue-50 rounded text-sm text-gray-700">
                    <p class="font-medium text-blue-800 mb-1">📝 教学要点：</p>
                    <p class="whitespace-pre-wrap">{{ c.description }}</p>
                  </div>
                  <button 
                    @click="selectCaseForPractice(c)"
                    class="w-full mt-3 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                  >
                    确认并生成案例
                  </button>
                </div>
              </div>
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
          
          <!-- 案例详情预览（显示教学要点） -->
          <div v-else-if="currentStep === 'case_detail_preview'" class="bg-white rounded-xl shadow">
            <div class="p-4 border-b sticky top-0 bg-white rounded-t-xl z-10">
              <div class="flex items-center">
                <button @click="currentStep = 'home'" class="text-gray-500 mr-3">← 返回</button>
                <h2 class="text-xl font-bold">案例详情</h2>
              </div>
            </div>
            
            <div class="p-6">
              <div v-if="selectedCase" class="space-y-4">
                <div>
                  <p class="font-bold text-xl text-blue-800">{{ selectedCase.name }}</p>
                  <p class="text-sm text-gray-500 mt-2">发布时间：{{ formatDate(selectedCase.created_at) }}</p>
                </div>
                
                <!-- 教学要点 -->
                <div class="mt-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <h3 class="font-bold text-blue-800 mb-3">📝 教学要点</h3>
                  <p class="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {{ selectedCase.description }}
                  </p>
                </div>
                
                <!-- 提示 -->
                <div class="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p class="text-yellow-800">
                    <span class="font-bold">💡 提示：</span>请仔细阅读以上教学要点，然后点击下方按钮，系统将根据教学要点自动生成详细的老人画像和案例。
                  </p>
                </div>
                
                <!-- 生成按钮 -->
                <button 
                  @click="generateElderProfileFromTeachingPoints"
                  :disabled="isGenerating"
                  class="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                  <span v-if="isGenerating">⏳ 正在生成老人画像...</span>
                  <span v-else>✨ 确认并生成老人画像</span>
                </button>
              </div>
            </div>
          </div>
          
          <!-- 输入画像 -->
          <div v-else-if="currentStep === 'input'" class="bg-white rounded-xl shadow">
            <div class="p-4 border-b sticky top-0 bg-white rounded-t-xl z-10">
              <div class="flex items-center">
                <button @click="currentStep = 'home'" class="text-gray-500 mr-3">← 返回</button>
                <h2 class="text-xl font-bold">老人画像设置</h2>
              </div>
            </div>
            
            <!-- 可滚动区域 -->
            <div class="p-6 space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto">
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
                <div class="grid grid-cols-3 gap-2">
                  <label v-for="d in diseases" :key="d" 
                         class="flex items-center p-2 border rounded-lg cursor-pointer hover:bg-gray-50 text-sm"
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
                <select v-model="caseProfile.personality" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
                  <option value="开朗健谈">开朗健谈</option>
                  <option value="内向沉默">内向沉默</option>
                  <option value="焦虑多疑">焦虑多疑</option>
                  <option value="固执保守">固执保守</option>
                </select>
              </div>
              
              <div>
                <label class="block text-gray-700 mb-2">方言偏好</label>
                <select v-model="caseProfile.dialect" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
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
              
              <!-- 突发事件模块 -->
              <div class="bg-red-50 rounded-lg p-4">
                <label class="block text-red-700 mb-2 font-medium">🚨 突发事件（可选）</label>
                <div class="grid grid-cols-4 gap-2">
                  <label v-for="e in emergencyOptions" :key="e" 
                         class="flex items-center p-2 border rounded-lg cursor-pointer hover:bg-red-100 text-sm bg-white"
                         :class="caseProfile.emergency === e ? 'border-red-500 bg-red-100' : ''">
                    <input type="radio" v-model="caseProfile.emergency" :value="e" class="mr-1">
                    {{ e }}
                  </label>
                </div>
                <div class="mt-2 flex gap-2">
                  <input 
                    v-model="customEmergency" 
                    placeholder="自定义突发事件..."
                    class="flex-1 px-3 py-1 border rounded-lg text-sm"
                  />
                  <button @click="addCustomEmergency" :disabled="!customEmergency.trim()"
                          class="px-3 py-1 bg-red-500 text-white rounded-lg text-sm disabled:bg-gray-300">
                    添加
                  </button>
                </div>
                <div v-if="caseProfile.customEmergency" class="mt-2 p-2 bg-white rounded text-sm">
                  <span class="text-red-600">当前选择：{{ caseProfile.customEmergency }}</span>
                  <button @click="caseProfile.customEmergency = ''" class="ml-2 text-gray-500">×</button>
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-gray-700 mb-2">居住场所</label>
                  <select v-model="caseProfile.livingPlace" class="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="家">家</option>
                    <option value="医院">医院</option>
                    <option value="社区">社区</option>
                    <option value="养老机构">养老机构</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-gray-700 mb-2">职业类型</label>
                  <select v-model="caseProfile.occupation" class="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="退休教师">退休教师</option>
                    <option value="退休工人">退休工人</option>
                    <option value="退休公务员">退休公务员</option>
                    <option value="退休农民">退休农民</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label class="block text-gray-700 mb-2">居住类型（可多选）</label>
                <div class="flex flex-wrap gap-2">
                  <label v-for="t in livingTypeOptions" :key="t" 
                         class="flex items-center px-3 py-1 border rounded-full cursor-pointer hover:bg-gray-50 text-sm"
                         :class="caseProfile.livingTypes.includes(t) ? 'border-blue-500 bg-blue-50' : ''">
                    <input type="checkbox" v-model="caseProfile.livingTypes" :value="t" class="mr-1">
                    {{ t }}
                  </label>
                </div>
              </div>
              
              <div>
                <label class="block text-gray-700 mb-2">经济类型（可多选）</label>
                <div class="flex flex-wrap gap-2">
                  <label v-for="e in economicTypeOptions" :key="e" 
                         class="flex items-center px-3 py-1 border rounded-full cursor-pointer hover:bg-gray-50 text-sm"
                         :class="caseProfile.economicTypes.includes(e) ? 'border-blue-500 bg-blue-50' : ''">
                    <input type="checkbox" v-model="caseProfile.economicTypes" :value="e" class="mr-1">
                    {{ e }}
                  </label>
                </div>
              </div>
              
              <div>
                <label class="block text-gray-700 mb-2">爱好（可多选）</label>
                <div class="flex flex-wrap gap-2">
                  <label v-for="h in hobbyOptions" :key="h" 
                         class="flex items-center px-3 py-1 border rounded-full cursor-pointer hover:bg-gray-50 text-sm"
                         :class="caseProfile.hobbies.includes(h) ? 'border-blue-500 bg-blue-50' : ''">
                    <input type="checkbox" v-model="caseProfile.hobbies" :value="h" class="mr-1">
                    {{ h }}
                  </label>
                </div>
              </div>
              
              <div>
                <label class="block text-gray-700 mb-2">老人称呼我为</label>
                <input 
                  v-model="caseProfile.studentTitle" 
                  placeholder="如：大夫、护士、小伙子、闺女等"
                  class="w-full px-4 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>
            
            <!-- 底部固定按钮 -->
            <div class="p-4 border-t sticky bottom-0 bg-white rounded-b-xl">
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
                  <!-- 用药信息详细显示 -->
                  <div v-if="generatedCase.medicalHistory?.medications?.length" class="mt-2">
                    <p class="text-sm text-gray-500 mb-1">用药：</p>
                    <div v-for="med in generatedCase.medicalHistory.medications" :key="med.disease" class="mb-2">
                      <p class="text-xs font-medium text-orange-700">{{ med.disease }}：</p>
                      <div v-for="drug in med.drugs" :key="drug.name" class="text-xs text-gray-600 ml-2">
                        • {{ drug.name }} {{ drug.spec }}，{{ drug.usage }}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="bg-green-50 rounded-lg p-4">
                  <h4 class="font-medium text-green-800 mb-2">性格特点</h4>
                  <p class="text-sm"><span class="text-gray-500">特点：</span>{{ generatedCase.personality?.traits?.join('、') }}</p>
                  <p class="text-sm"><span class="text-gray-500">关注：</span>{{ generatedCase.personality?.concerns?.join('、') }}</p>
                </div>
                
                <!-- 智能设备报警 -->
                <div v-if="generatedCase.deviceAlert" class="bg-red-50 rounded-lg p-4 border-2 border-red-300 alarm-blink">
                  <h4 class="font-medium text-red-700 mb-2">🚨 智能设备报警</h4>
                  <p class="text-sm text-red-600 font-medium">{{ generatedCase.deviceAlert }}</p>
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
              <div class="bg-white rounded-xl shadow p-3 h-full overflow-y-auto">
                <h3 class="font-bold text-blue-600 mb-2 flex items-center text-sm">
                  <span>📋</span> 病例信息
                </h3>
                
                <div class="space-y-2 text-xs">
                  <!-- 基本信息 -->
                  <div class="bg-blue-50 rounded-lg p-2">
                    <p class="font-medium text-blue-800 mb-1">基本信息</p>
                    <div class="space-y-0.5 text-gray-700">
                      <p><span class="text-gray-500">姓名：</span>{{ generatedCase.basicInfo?.name }}</p>
                      <p><span class="text-gray-500">年龄：</span>{{ generatedCase.basicInfo?.age }}岁</p>
                      <p><span class="text-gray-500">性别：</span>{{ generatedCase.basicInfo?.gender }}</p>
                      <p><span class="text-gray-500">职业：</span>{{ generatedCase.basicInfo?.occupation }}</p>
                    </div>
                  </div>
                  
                  <!-- 病史信息 -->
                  <div class="bg-orange-50 rounded-lg p-2">
                    <p class="font-medium text-orange-800 mb-1">疾病情况</p>
                    <div class="space-y-0.5 text-gray-700">
                      <p class="truncate"><span class="text-gray-500">主诉：</span>{{ generatedCase.medicalHistory?.chiefComplaint }}</p>
                      <!-- 用药信息详细显示 -->
                      <div v-if="generatedCase.medicalHistory?.medications?.length" class="mt-1">
                        <p class="text-gray-500">用药：</p>
                        <div v-for="med in generatedCase.medicalHistory.medications" :key="med.disease" class="mb-0.5">
                          <p class="font-medium text-orange-700">{{ med.disease }}：</p>
                          <div v-for="drug in med.drugs" :key="drug.name" class="text-gray-600 ml-2">
                            • {{ drug.name }} {{ drug.spec }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- 性格特点 -->
                  <div class="bg-green-50 rounded-lg p-2">
                    <p class="font-medium text-green-800 mb-1">性格特点</p>
                    <div class="text-gray-700 text-xs">
                      <p>{{ Array.isArray(generatedCase.personality?.traits) ? generatedCase.personality?.traits?.join('、') : generatedCase.personality?.traits }}</p>
                      <p class="text-gray-500 mt-0.5">关注：{{ Array.isArray(generatedCase.personality?.concerns) ? generatedCase.personality?.concerns?.join('、') : generatedCase.personality?.concerns }}</p>
                    </div>
                  </div>
                  
                  <!-- 智能设备报警 -->
                  <div v-if="generatedCase.deviceAlert" class="bg-red-50 rounded-lg p-2 border border-red-300 alarm-blink">
                    <p class="font-medium text-red-700 text-xs">🚨 设备报警</p>
                    <p class="text-red-600 text-xs">{{ generatedCase.deviceAlert }}</p>
                  </div>
                  
                  <!-- 居住情况 -->
                  <div class="bg-purple-50 rounded-lg p-2">
                    <p class="font-medium text-purple-800 mb-1">居住情况</p>
                    <div class="text-gray-700 text-xs space-y-0.5">
                      <p><span class="text-gray-500">场所：</span>{{ generatedCase.basicInfo?.livingPlace || caseProfile.livingPlace }}</p>
                      <p><span class="text-gray-500">类型：</span>{{ generatedCase.basicInfo?.familyStatus || (Array.isArray(caseProfile.livingTypes) ? caseProfile.livingTypes?.join('、') : caseProfile.livingTypes) }}</p>
                    </div>
                  </div>
                  
                  <!-- 方言 -->
                  <div class="bg-gray-50 rounded-lg p-2">
                    <p class="font-medium text-gray-800 mb-0.5">方言偏好</p>
                    <p class="text-gray-600 text-xs">{{ caseProfile.dialect }}</p>
                  </div>
                  
                  <!-- 爱好 -->
                  <div class="bg-gray-50 rounded-lg p-2">
                    <p class="font-medium text-gray-800 mb-0.5">兴趣爱好</p>
                    <p class="text-gray-600 text-xs">{{ Array.isArray(generatedCase.basicInfo?.hobby) ? generatedCase.basicInfo?.hobby?.join('、') : (generatedCase.basicInfo?.hobby || (Array.isArray(caseProfile.hobbies) ? caseProfile.hobbies?.join('、') : caseProfile.hobbies)) }}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 聊天区域（右侧） -->
            <div class="flex-1 flex flex-col">
              <!-- 对话提示 -->
              <div class="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-2">
                <p class="text-sm text-yellow-700 font-bold mb-1">💡 实训要求：</p>
                <p class="text-xs text-yellow-700">请从以下四个维度与老人进行沟通：</p>
                <ul class="text-xs text-yellow-700 mt-1 ml-4 list-disc">
                  <li><span class="font-bold">伦理操守：</span>尊重老人、关爱老人、职业道德、操作规范、守时守信、保护隐私</li>
                  <li><span class="font-bold">心理慰藉：</span>耐心倾听、情感支持、缓解焦虑、心理疏导</li>
                  <li><span class="font-bold">健康宣教：</span>用药指导、饮食建议、生活习惯、安全防护、观察能力</li>
                  <li><span class="font-bold">康复训练：</span>功能锻炼、日常活动、安全事项、预防并发症</li>
                  <li><span class="font-bold">智慧赋能：</span>智能手环、智能床垫、跌倒报警器、远程监测</li>
                </ul>
                <p class="text-xs text-orange-600 mt-2">⚠️ 简单称呼（如"你好"、"拜拜"）只能出现一次，请深入沟通！</p>
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
              <div class="flex gap-2 items-end">
                <textarea 
                  v-model="userInput" 
                  @keyup.enter.ctrl="sendMessage"
                  placeholder="输入消息...（Ctrl+Enter发送）"
                  class="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  rows="4"
                  :disabled="isTyping"
                ></textarea>
                <button 
                  @click="sendMessage" 
                  :disabled="!userInput.trim() || isTyping"
                  class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 h-full"
                >
                  发送
                </button>
              </div>
              <!-- 对话轮数提示 -->
              <div v-if="messages.filter(m => m.role === 'user').length < 5" class="mt-2 text-sm text-orange-600 text-center">
                💡 建议继续深入沟通，当前已对话 {{ messages.filter(m => m.role === 'user').length }} 轮（建议至少5轮）
              </div>
              <button 
                @click="endChat" 
                :disabled="messages.filter(m => m.role === 'user').length < 5 || isScoring"
                class="w-full mt-3 py-2 text-white rounded-lg text-sm transition-colors"
                :class="messages.filter(m => m.role === 'user').length >= 5 && !isScoring ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-400 cursor-not-allowed'">
                {{ isScoring ? '正在评分，请稍等...' : (hasSubmitted ? '本次训练已结束' : '结束对话并评分') }} {{ !hasSubmitted && messages.filter(m => m.role === 'user').length < 5 ? `（还需${5 - messages.filter(m => m.role === 'user').length}轮）` : '' }}
              </button>
            </div>
            </div><!-- 关闭聊天区域div -->
          </div><!-- 关闭对话界面div -->
        </div>
        
        <!-- 评分结果页面（对所有角色可见） -->
        <div v-if="currentStep === 'score'" class="space-y-4">
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
              <div>
                <div class="flex justify-between mb-1">
                  <span>伦理操守</span>
                  <span class="font-medium">{{ score.dimensions?.伦理操守 || score.dimensions?.lunli || 0 }}/20</span>
                </div>
                <div class="bg-gray-200 rounded-full h-3">
                  <div class="bg-blue-600 h-3 rounded-full transition-all duration-500" 
                       :style="{ width: ((score.dimensions?.伦理操守 || score.dimensions?.lunli || 0) / 20 * 100) + '%' }"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between mb-1">
                  <span>心理慰藉</span>
                  <span class="font-medium">{{ score.dimensions?.心理慰藉 || score.dimensions?.xinli || 0 }}/20</span>
                </div>
                <div class="bg-gray-200 rounded-full h-3">
                  <div class="bg-green-600 h-3 rounded-full transition-all duration-500" 
                       :style="{ width: ((score.dimensions?.心理慰藉 || score.dimensions?.xinli || 0) / 20 * 100) + '%' }"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between mb-1">
                  <span>健康宣教</span>
                  <span class="font-medium">{{ score.dimensions?.健康宣教 || score.dimensions?.jiankang || 0 }}/20</span>
                </div>
                <div class="bg-gray-200 rounded-full h-3">
                  <div class="bg-orange-600 h-3 rounded-full transition-all duration-500" 
                       :style="{ width: ((score.dimensions?.健康宣教 || score.dimensions?.jiankang || 0) / 20 * 100) + '%' }"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between mb-1">
                  <span>康复训练</span>
                  <span class="font-medium">{{ score.dimensions?.康复训练 || score.dimensions?.kangfu || 0 }}/20</span>
                </div>
                <div class="bg-gray-200 rounded-full h-3">
                  <div class="bg-purple-600 h-3 rounded-full transition-all duration-500" 
                       :style="{ width: ((score.dimensions?.康复训练 || score.dimensions?.kangfu || 0) / 20 * 100) + '%' }"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between mb-1">
                  <span>智慧赋能</span>
                  <span class="font-medium">{{ score.dimensions?.智慧赋能 || score.dimensions?.zhihui || 0 }}/20</span>
                </div>
                <div class="bg-gray-200 rounded-full h-3">
                  <div class="bg-pink-600 h-3 rounded-full transition-all duration-500" 
                       :style="{ width: ((score.dimensions?.智慧赋能 || score.dimensions?.zhihui || 0) / 20 * 100) + '%' }"></div>
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
            </div>
          </div>
          
          <!-- 建议和理想沟通参考（左右并排） -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- 建议 -->
            <div class="bg-white rounded-xl p-6 shadow">
              <p class="text-sm text-gray-500 mb-2">💡 建议</p>
              <ul class="text-sm space-y-1">
                <li v-for="i in score.improvements" :key="i" class="text-blue-600">• {{ i }}</li>
              </ul>
            </div>
            
            <!-- 参考答案 -->
            <div v-if="score.referenceanswer" class="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 shadow">
              <h3 class="font-bold mb-3 text-green-800">📚 理想沟通参考</h3>
              <p class="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{{ score.referenceanswer }}</p>
            </div>
          </div>
          
          <!-- 对话记录 -->
          <div v-if="messages && messages.length > 0" class="bg-white rounded-xl p-6 shadow">
            <h3 class="font-bold mb-4">💬 对话记录</h3>
            <div class="space-y-3 max-h-96 overflow-y-auto">
              <div v-for="(msg, index) in messages" :key="index" 
                   class="flex" 
                   :class="msg.role === 'user' ? 'justify-end' : 'justify-start'">
                <div class="max-w-[80%] p-3 rounded-lg"
                     :class="msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'">
                  <p class="text-sm whitespace-pre-wrap">{{ msg.content }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 开始新练习按钮（仅学生端显示） -->
          <button v-if="currentUser.role === 'student'" @click="resetPractice" class="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
            开始新练习
          </button>
          <button v-else @click="currentStep = 'home'" class="w-full py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700">
            返回首页
          </button>
        </div>
        
        <!-- 老师首页 -->
        <div v-else-if="currentUser.role === 'teacher'" class="space-y-4">
          <div class="bg-white rounded-xl p-6 shadow">
            <h2 class="text-xl font-bold mb-2">教师工作台</h2>
            <p class="text-gray-500">欢迎，{{ currentUser.name }}</p>
          </div>
          
          <!-- 案例管理入口 -->
          <div class="bg-white rounded-xl p-6 shadow">
            <h3 class="font-bold mb-4">📚 案例管理</h3>
            <div class="space-y-3">
              <button @click="teacherStep = 'create_case'" class="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
                + 发布新案例
              </button>
              <button @click="teacherStep = 'case_list'; loadCases()" class="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                📋 查看案例列表
              </button>
            </div>
          </div>
          
          <!-- 案例创建界面 -->
          <div v-if="teacherStep === 'create_case'" class="bg-white rounded-xl p-6 shadow">
            <div class="flex items-center mb-4">
              <button @click="teacherStep = 'home'" class="text-gray-500 mr-3">← 返回</button>
              <h2 class="text-xl font-bold">发布新案例</h2>
            </div>
            <p class="text-gray-500 mb-4">创建案例供学生练习，可以定向发布到指定班级</p>
            
            <!-- 案例基本信息 -->
            <div class="space-y-4">
              <div>
                <label class="block text-gray-700 mb-2 font-medium">案例名称</label>
                <input 
                  v-model="caseProfile.caseName" 
                  placeholder="例如：高血压老人的日常照护"
                  class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label class="block text-gray-700 mb-2 font-medium">教学要点</label>
                <textarea 
                  v-model="caseProfile.teachingPoints" 
                  placeholder="请输入本案例的教学要点，例如：
1. 重点练习血压监测和用药指导
2. 关注老人失眠和焦虑情绪
3. 加强康复训练和安全防护建议
4. 培养学生对老人情感支持和同理心"
                  class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  rows="8"
                ></textarea>
                <p class="text-sm text-gray-500 mt-1">💡 提示：这些要点将展示给学生，学生阅读后AI会自动生成详细的老人画像和病例</p>
              </div>
              
              <!-- 选择发布班级 -->
              <div>
                <label class="block text-gray-700 mb-2 font-medium">发布到班级（可多选）</label>
                <div class="grid grid-cols-2 gap-2">
                  <label v-for="cls in teacherClasses" :key="cls.id" 
                         class="flex items-center p-2 border rounded-lg cursor-pointer hover:bg-gray-50 text-sm"
                         :class="caseProfile.selectedClasses.includes(cls.id) ? 'border-blue-500 bg-blue-50' : ''">
                    <input type="checkbox" v-model="caseProfile.selectedClasses" :value="cls.id" class="mr-2">
                    {{ cls.name }}
                  </label>
                </div>
                <p v-if="teacherClasses.length === 0" class="text-sm text-orange-600 mt-2">暂无班级，请先联系管理员分配班级</p>
              </div>
              
            </div>
            
            <button 
              @click="publishCase" 
              :disabled="!caseProfile.caseName || !caseProfile.teachingPoints || caseProfile.selectedClasses.length === 0 || isPublishing"
              class="w-full mt-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400"
            >
              {{ isPublishing ? '发布中...' : '发布案例' }}
            </button>
          </div>
          
          <!-- 案例列表界面 -->
          <div v-if="teacherStep === 'case_list'" class="bg-white rounded-xl p-6 shadow">
            <div class="flex items-center mb-4">
              <button @click="teacherStep = 'home'" class="text-gray-500 mr-3">← 返回</button>
              <h2 class="text-xl font-bold">案例列表</h2>
            </div>
            
            <div v-if="cases.length === 0" class="text-gray-400 text-center py-4">
              暂无发布的案例
            </div>
            <div v-else class="space-y-3">
              <div v-for="c in cases" :key="c.id" class="p-4 border rounded-lg">
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <p class="font-bold text-lg">{{ c.name }}</p>
                    <p class="text-sm text-gray-500 mt-1">{{ c.description || '无描述' }}</p>
                    <p class="text-xs text-gray-400 mt-1">发布时间：{{ formatDate(c.created_at) }}</p>
                  </div>
                  <button 
                    @click="viewCaseDetail(c)" 
                    class="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                  >
                    查看详情
                  </button>
                </div>
                <div class="mt-2 text-sm">
                  <span class="text-gray-500">发布班级：</span>
                  <span>{{ c.classNames || '加载中...' }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 案例详情界面 -->
          <div v-if="teacherStep === 'case_detail' && selectedTeacherCase" class="bg-white rounded-xl p-6 shadow">
            <div class="flex items-center mb-4">
              <button @click="teacherStep = 'case_list'" class="text-gray-500 mr-3">← 返回列表</button>
              <h2 class="text-xl font-bold">案例详情</h2>
            </div>
            
            <div class="space-y-4">
              <div>
                <p class="font-bold text-lg">{{ selectedTeacherCase.name }}</p>
                <p class="text-sm text-gray-500 mt-2">发布时间：{{ formatDate(selectedTeacherCase.created_at) }}</p>
              </div>
              
              <!-- 教学要点 -->
              <div class="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <h3 class="font-bold text-blue-800 mb-3">📝 教学要点</h3>
                <p class="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {{ selectedTeacherCase.description }}
                </p>
              </div>
              
              <!-- 发布信息 -->
              <div class="p-4 bg-gray-50 rounded-lg">
                <p class="text-gray-500">发布班级</p>
                <p class="font-medium">{{ selectedTeacherCase.classNames || getPublishedClasses(selectedTeacherCase.class_ids) }}</p>
              </div>
              
              <div class="flex gap-2 mt-6">
                <button 
                  @click="deleteCase(selectedTeacherCase.id)" 
                  class="flex-1 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                >
                  删除案例
                </button>
                <button 
                  @click="teacherStep = 'case_analysis'" 
                  class="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  查看分析
                </button>
              </div>
            </div>
          </div>

          <!-- 案例分析界面 -->
          <div v-if="teacherStep === 'case_analysis' && selectedTeacherCase" class="bg-white rounded-xl p-6 shadow">
            <div class="flex items-center mb-4">
              <button @click="teacherStep = 'case_detail'" class="text-gray-500 mr-3">← 返回案例详情</button>
              <h2 class="text-xl font-bold">案例数据分析</h2>
            </div>

            <div class="space-y-4">
              <!-- 案例基本信息 -->
              <div class="p-4 bg-blue-50 rounded-lg">
                <h3 class="font-bold text-blue-800">{{ selectedTeacherCase.name }}</h3>
                <p class="text-sm text-gray-600 mt-1">发布时间：{{ formatDate(selectedTeacherCase.created_at) }}</p>
                <p class="text-sm text-gray-600">发布班级：{{ selectedTeacherCase.classNames || '加载中...' }}</p>
              </div>

              <!-- 案例统计概览 -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div class="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3">
                  <p class="text-2xl font-bold text-blue-600">{{ getCaseStats().studentCount }}</p>
                  <p class="text-sm text-gray-500">参与学生</p>
                </div>
                <div class="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3">
                  <p class="text-2xl font-bold text-green-600">{{ getCaseStats().totalPractices }}</p>
                  <p class="text-sm text-gray-500">练习次数</p>
                </div>
                <div class="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-3">
                  <p class="text-2xl font-bold text-orange-600">{{ getCaseStats().avgScore }}</p>
                  <p class="text-sm text-gray-500">平均分</p>
                </div>
                <div class="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-3">
                  <p class="text-2xl font-bold text-purple-600">{{ getCaseStats().highestScore }}</p>
                  <p class="text-sm text-gray-500">最高分</p>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="flex gap-2 flex-wrap">
                <button @click="exportCaseExcel" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                  📊 导出Excel
                </button>
                <button @click="generateCaseReport" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  📄 生成分析报告
                </button>
              </div>

              <!-- 横向对比：学生成绩对比 -->
              <div class="mt-6">
                <h3 class="font-bold mb-3">📊 横向对比：学生成绩对比</h3>
                <div v-if="getCaseStudents().length === 0" class="text-gray-400 text-center py-4">
                  暂无学生练习记录
                </div>
                <div v-else class="overflow-x-auto">
                  <table class="w-full text-sm border-collapse">
                    <thead>
                      <tr class="bg-gray-100">
                        <th class="border px-3 py-2 text-left">排名</th>
                        <th class="border px-3 py-2 text-left">学生</th>
                        <th class="border px-3 py-2 text-left">班级</th>
                        <th class="border px-3 py-2 text-center">练习次数</th>
                        <th class="border px-3 py-2 text-center">总分</th>
                        <th class="border px-3 py-2 text-center">最高分</th>
                        <th class="border px-3 py-2 text-center">最低分</th>
                        <th class="border px-3 py-2 text-center">思政</th>
                        <th class="border px-3 py-2 text-center">心理</th>
                        <th class="border px-3 py-2 text-center">健康</th>
                        <th class="border px-3 py-2 text-center">康复</th>
                        <th class="border px-3 py-2 text-center">趋势</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(student, index) in getCaseStudentRankings()" :key="student.id" class="hover:bg-gray-50">
                        <td class="border px-3 py-2 font-bold">{{ index + 1 }}</td>
                        <td class="border px-3 py-2">{{ student.name }}</td>
                        <td class="border px-3 py-2 text-sm text-gray-500">{{ student.class_name || '-' }}</td>
                        <td class="border px-3 py-2 text-center">{{ student.totalPractices }}</td>
                        <td class="border px-3 py-2 text-center font-bold" :class="getScoreClass(student.avgScore)">{{ student.avgScore }}</td>
                        <td class="border px-3 py-2 text-center text-green-600">{{ student.highestScore }}</td>
                        <td class="border px-3 py-2 text-center text-red-600">{{ student.lowestScore }}</td>
                        <td class="border px-3 py-2 text-center">{{ student.avgDimensions.sizheng }}</td>
                        <td class="border px-3 py-2 text-center">{{ student.avgDimensions.xinli }}</td>
                        <td class="border px-3 py-2 text-center">{{ student.avgDimensions.jiankang }}</td>
                        <td class="border px-3 py-2 text-center">{{ student.avgDimensions.kangfu }}</td>
                        <td class="border px-3 py-2 text-center">
                          <span v-if="student.trend === 'up'" class="text-green-600">↑ 改善</span>
                          <span v-else-if="student.trend === 'down'" class="text-red-600">↓ 下降</span>
                          <span v-else class="text-gray-400">→ 稳定</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- 纵向对比：成绩变化趋势 -->
              <div class="mt-6">
                <h3 class="font-bold mb-3">📈 纵向对比：成绩变化趋势</h3>
                <div v-if="getCaseStudents().length === 0" class="text-gray-400 text-center py-4">
                  暂无数据
                </div>
                <div v-else class="space-y-3">
                  <div v-for="student in getCaseStudents()" :key="student.id" class="border rounded-lg p-4">
                    <div class="flex justify-between items-center mb-3">
                      <h4 class="font-bold">{{ student.name }}</h4>
                      <span class="text-sm text-gray-500">{{ student.records.length }} 次练习</span>
                    </div>
                    <div class="space-y-2">
                      <div v-for="(record, index) in student.records" :key="record.id" class="flex items-center gap-2 text-sm">
                        <span class="w-20 text-gray-500">{{ formatDate(record.created_at).split(' ')[0] }}</span>
                        <div class="flex-1 h-6 bg-gray-100 rounded-full relative">
                          <div class="h-6 rounded-full absolute left-0" 
                               :class="getScoreBarClass(record.score)"
                               :style="{width: record.score + '%'}"></div>
                          <span class="absolute inset-0 flex items-center justify-center font-bold" :class="getScoreTextClass(record.score)">
                            {{ record.score }}分
                          </span>
                        </div>
                        <span class="text-xs text-gray-400">
                          伦理:{{ getDimensionScore(record.dimensions, 'lunli') }} 
                          心理:{{ getDimensionScore(record.dimensions, 'xinli') }} 
                          健康:{{ getDimensionScore(record.dimensions, 'jiankang') }} 
                          康复:{{ getDimensionScore(record.dimensions, 'kangfu') }}
                          智慧:{{ getDimensionScore(record.dimensions, 'zhihui') }}
                        </span>
                      </div>
                    </div>
                    <!-- 最近两次对比 -->
                    <div v-if="student.records.length >= 2" class="mt-3 p-3 bg-blue-50 rounded text-sm">
                      <p class="font-medium text-blue-800">📊 最近两次对比：</p>
                      <div class="grid grid-cols-3 gap-2 mt-2">
                        <div>
                          <span class="text-gray-500">总分变化：</span>
                          <span class="font-bold" :class="getTrendClass(student.records[0].score - student.records[1].score)">
                            {{ student.records[0].score > student.records[1].score ? '+' : '' }}{{ student.records[0].score - student.records[1].score }}分
                          </span>
                        </div>
                        <div>
                          <span class="text-gray-500">伦理操守：</span>
                          <span class="font-bold" :class="getTrendClass(getDimensionScore(student.records[0].dimensions, 'lunli') - getDimensionScore(student.records[1].dimensions, 'lunli'))">
                            {{ getDimensionScore(student.records[0].dimensions, 'lunli') > getDimensionScore(student.records[1].dimensions, 'lunli') ? '+' : '' }}{{ getDimensionScore(student.records[0].dimensions, 'lunli') - getDimensionScore(student.records[1].dimensions, 'lunli') }}
                          </span>
                        </div>
                        <div>
                          <span class="text-gray-500">心理慰藉：</span>
                          <span class="font-bold" :class="getTrendClass(getDimensionScore(student.records[0].dimensions, 'xinli') - getDimensionScore(student.records[1].dimensions, 'xinli'))">
                            {{ getDimensionScore(student.records[0].dimensions, 'xinli') > getDimensionScore(student.records[1].dimensions, 'xinli') ? '+' : '' }}{{ getDimensionScore(student.records[0].dimensions, 'xinli') - getDimensionScore(student.records[1].dimensions, 'xinli') }}
                          </span>
                        </div>
                        <div>
                          <span class="text-gray-500">健康宣教：</span>
                          <span class="font-bold" :class="getTrendClass(getDimensionScore(student.records[0].dimensions, 'jiankang') - getDimensionScore(student.records[1].dimensions, 'jiankang'))">
                            {{ getDimensionScore(student.records[0].dimensions, 'jiankang') > getDimensionScore(student.records[1].dimensions, 'jiankang') ? '+' : '' }}{{ getDimensionScore(student.records[0].dimensions, 'jiankang') - getDimensionScore(student.records[1].dimensions, 'jiankang') }}
                          </span>
                        </div>
                        <div>
                          <span class="text-gray-500">康复训练：</span>
                          <span class="font-bold" :class="getTrendClass(getDimensionScore(student.records[0].dimensions, 'kangfu') - getDimensionScore(student.records[1].dimensions, 'kangfu'))">
                            {{ getDimensionScore(student.records[0].dimensions, 'kangfu') > getDimensionScore(student.records[1].dimensions, 'kangfu') ? '+' : '' }}{{ getDimensionScore(student.records[0].dimensions, 'kangfu') - getDimensionScore(student.records[1].dimensions, 'kangfu') }}
                          </span>
                        </div>
                        <div>
                          <span class="text-gray-500">智慧赋能：</span>
                          <span class="font-bold" :class="getTrendClass(getDimensionScore(student.records[0].dimensions, 'zhihui') - getDimensionScore(student.records[1].dimensions, 'zhihui'))">
                            {{ getDimensionScore(student.records[0].dimensions, 'zhihui') > getDimensionScore(student.records[1].dimensions, 'zhihui') ? '+' : '' }}{{ getDimensionScore(student.records[0].dimensions, 'zhihui') - getDimensionScore(student.records[1].dimensions, 'zhihui') }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 五维度班级平均对比 -->
              <div class="mt-6">
                <h3 class="font-bold mb-3">🎯 五维度班级平均对比</h3>
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  <div class="border rounded-lg p-3">
                    <h4 class="font-medium text-gray-700 mb-2 text-sm">伦理操守</h4>
                    <div class="flex items-center gap-2">
                      <div class="flex-1 h-3 bg-gray-100 rounded-full">
                        <div class="h-3 rounded-full bg-blue-500" :style="{width: (getCaseStats().dimensionStats.lunli?.avg || 0) + '%'}"></div>
                      </div>
                      <span class="font-bold text-sm">{{ getCaseStats().dimensionStats.lunli?.avg || 0 }}</span>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">最高：{{ getCaseStats().dimensionStats.lunli?.max || 0 }} / 最低：{{ getCaseStats().dimensionStats.lunli?.min || 0 }}</p>
                  </div>
                  <div class="border rounded-lg p-3">
                    <h4 class="font-medium text-gray-700 mb-2 text-sm">心理慰藉</h4>
                    <div class="flex items-center gap-2">
                      <div class="flex-1 h-3 bg-gray-100 rounded-full">
                        <div class="h-3 rounded-full bg-green-500" :style="{width: getCaseStats().dimensionStats.xinli?.avg + '%'}"></div>
                      </div>
                      <span class="font-bold text-sm">{{ getCaseStats().dimensionStats.xinli?.avg || 0 }}</span>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">最高：{{ getCaseStats().dimensionStats.xinli?.max || 0 }} / 最低：{{ getCaseStats().dimensionStats.xinli?.min || 0 }}</p>
                  </div>
                  <div class="border rounded-lg p-3">
                    <h4 class="font-medium text-gray-700 mb-2 text-sm">健康宣教</h4>
                    <div class="flex items-center gap-2">
                      <div class="flex-1 h-3 bg-gray-100 rounded-full">
                        <div class="h-3 rounded-full bg-orange-500" :style="{width: getCaseStats().dimensionStats.jiankang?.avg + '%'}"></div>
                      </div>
                      <span class="font-bold text-sm">{{ getCaseStats().dimensionStats.jiankang?.avg || 0 }}</span>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">最高：{{ getCaseStats().dimensionStats.jiankang?.max || 0 }} / 最低：{{ getCaseStats().dimensionStats.jiankang?.min || 0 }}</p>
                  </div>
                  <div class="border rounded-lg p-3">
                    <h4 class="font-medium text-gray-700 mb-2 text-sm">康复训练</h4>
                    <div class="flex items-center gap-2">
                      <div class="flex-1 h-3 bg-gray-100 rounded-full">
                        <div class="h-3 rounded-full bg-purple-500" :style="{width: getCaseStats().dimensionStats.kangfu?.avg + '%'}"></div>
                      </div>
                      <span class="font-bold text-sm">{{ getCaseStats().dimensionStats.kangfu?.avg || 0 }}</span>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">最高：{{ getCaseStats().dimensionStats.kangfu?.max || 0 }} / 最低：{{ getCaseStats().dimensionStats.kangfu?.min || 0 }}</p>
                  </div>
                  <div class="border rounded-lg p-3">
                    <h4 class="font-medium text-gray-700 mb-2 text-sm">智慧赋能</h4>
                    <div class="flex items-center gap-2">
                      <div class="flex-1 h-3 bg-gray-100 rounded-full">
                        <div class="h-3 rounded-full bg-pink-500" :style="{width: (getCaseStats().dimensionStats.zhihui?.avg || 0) + '%'}"></div>
                      </div>
                      <span class="font-bold text-sm">{{ getCaseStats().dimensionStats.zhihui?.avg || 0 }}</span>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">最高：{{ getCaseStats().dimensionStats.zhihui?.max || 0 }} / 最低：{{ getCaseStats().dimensionStats.zhihui?.min || 0 }}</p>
                  </div>
                </div>
              </div>
            </div>
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
                <div v-if="selectedTeacherClass === cls.id" class="p-2 sm:p-4 bg-white">
                  <!-- 班级整体统计 -->
                  <div class="mb-4 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                    <h4 class="font-bold text-blue-800 mb-3 text-sm sm:text-base">📊 班级整体情况</h4>
                    <div class="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3 text-center">
                      <div class="bg-white rounded-lg p-2 shadow-sm">
                        <p class="text-xl sm:text-2xl font-bold text-blue-600">{{ getClassStats(cls.id)?.studentCount || 0 }}</p>
                        <p class="text-xs text-gray-500">学生人数</p>
                      </div>
                      <div class="bg-white rounded-lg p-2 shadow-sm">
                        <p class="text-xl sm:text-2xl font-bold text-green-600">{{ getClassStats(cls.id)?.totalPractices || 0 }}</p>
                        <p class="text-xs text-gray-500">练习次数</p>
                      </div>
                      <div class="bg-white rounded-lg p-2 shadow-sm">
                        <p class="text-xl sm:text-2xl font-bold text-orange-600">{{ getClassStats(cls.id)?.avgScore || '--' }}</p>
                        <p class="text-xs text-gray-500">平均分</p>
                      </div>
                      <div class="bg-white rounded-lg p-2 shadow-sm">
                        <p class="text-lg sm:text-xl font-bold text-purple-600">{{ getClassStats(cls.id)?.highestScore || '--' }}</p>
                        <p class="text-xs text-gray-500">最高分</p>
                      </div>
                      <div class="bg-white rounded-lg p-2 shadow-sm col-span-3 sm:col-span-1">
                        <p class="text-lg sm:text-xl font-bold text-red-600">{{ getClassStats(cls.id)?.lowestScore || '--' }}</p>
                        <p class="text-xs text-gray-500">最低分</p>
                      </div>
                    </div>
                  </div>
                  
                  <!-- 四维度分析 -->
                  <div v-if="getClassStats(cls.id)?.dimensionStats" class="mb-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <h4 class="font-bold text-gray-700 mb-3 text-sm sm:text-base">📈 四维度能力分析</h4>
                    <div class="grid grid-cols-2 gap-2 sm:gap-3">
                      <div class="bg-white rounded-lg p-2 sm:p-3">
                        <div class="flex justify-between items-center">
                          <span class="text-gray-600 text-xs sm:text-sm">思政维度</span>
                          <span class="font-bold text-sm sm:text-base" :class="getDimensionClass(getClassStats(cls.id).dimensionStats.sizheng.avg)">
                            {{ getClassStats(cls.id).dimensionStats.sizheng.avg }}分
                          </span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div class="h-2 rounded-full" :class="getDimensionBarClass(getClassStats(cls.id).dimensionStats.sizheng.avg)"
                               :style="{width: getClassStats(cls.id).dimensionStats.sizheng.avg + '%'}"></div>
                        </div>
                      </div>
                      <div class="bg-white rounded-lg p-2 sm:p-3">
                        <div class="flex justify-between items-center">
                          <span class="text-gray-600 text-xs sm:text-sm">心理慰藉</span>
                          <span class="font-bold text-sm sm:text-base" :class="getDimensionClass(getClassStats(cls.id).dimensionStats.xinli.avg)">
                            {{ getClassStats(cls.id).dimensionStats.xinli.avg }}分
                          </span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div class="h-2 rounded-full" :class="getDimensionBarClass(getClassStats(cls.id).dimensionStats.xinli.avg)"
                               :style="{width: getClassStats(cls.id).dimensionStats.xinli.avg + '%'}"></div>
                        </div>
                      </div>
                      <div class="bg-white rounded-lg p-2 sm:p-3">
                        <div class="flex justify-between items-center">
                          <span class="text-gray-600 text-xs sm:text-sm">健康宣教</span>
                          <span class="font-bold text-sm sm:text-base" :class="getDimensionClass(getClassStats(cls.id).dimensionStats.jiankang.avg)">
                            {{ getClassStats(cls.id).dimensionStats.jiankang.avg }}分
                          </span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div class="h-2 rounded-full" :class="getDimensionBarClass(getClassStats(cls.id).dimensionStats.jiankang.avg)"
                               :style="{width: getClassStats(cls.id).dimensionStats.jiankang.avg + '%'}"></div>
                        </div>
                      </div>
                      <div class="bg-white rounded-lg p-2 sm:p-3">
                        <div class="flex justify-between items-center">
                          <span class="text-gray-600 text-xs sm:text-sm">康复训练</span>
                          <span class="font-bold text-sm sm:text-base" :class="getDimensionClass(getClassStats(cls.id).dimensionStats.kangfu.avg)">
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
                  <span class="font-bold ml-1" :class="getDimensionClass(getDimensionScore(getStudentStats(selectedStudent.id).highestRecord.dimensions, 'sizheng'))">
                    {{ getDimensionScore(getStudentStats(selectedStudent.id).highestRecord.dimensions, 'sizheng') || '--' }}分
                  </span>
                </div>
                <div class="bg-white rounded p-2 text-sm">
                  <span class="text-gray-500">心理慰藉:</span>
                  <span class="font-bold ml-1" :class="getDimensionClass(getDimensionScore(getStudentStats(selectedStudent.id).highestRecord.dimensions, 'xinli'))">
                    {{ getDimensionScore(getStudentStats(selectedStudent.id).highestRecord.dimensions, 'xinli') || '--' }}分
                  </span>
                </div>
                <div class="bg-white rounded p-2 text-sm">
                  <span class="text-gray-500">健康宣教:</span>
                  <span class="font-bold ml-1" :class="getDimensionClass(getDimensionScore(getStudentStats(selectedStudent.id).highestRecord.dimensions, 'jiankang'))">
                    {{ getDimensionScore(getStudentStats(selectedStudent.id).highestRecord.dimensions, 'jiankang') || '--' }}分
                  </span>
                </div>
                <div class="bg-white rounded p-2 text-sm">
                  <span class="text-gray-500">康复训练:</span>
                  <span class="font-bold ml-1" :class="getDimensionClass(getDimensionScore(getStudentStats(selectedStudent.id).highestRecord.dimensions, 'kangfu'))">
                    {{ getDimensionScore(getStudentStats(selectedStudent.id).highestRecord.dimensions, 'kangfu') || '--' }}分
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
                  <div class="flex-1">
                    <p class="font-medium">{{ record.case_data?.caseName || '练习记录' }}</p>
                    <p class="text-sm text-gray-500">{{ formatDate(record.created_at) }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-xl font-bold" :class="getScoreClass(record.score)">
                      {{ record.score }}分
                    </p>
                    <button @click="viewRecord(record)" class="text-sm text-blue-500 mt-1">查看详情</button>
                  </div>
                </div>
                <div v-if="record.dimensions" class="grid grid-cols-4 gap-1 text-xs text-center">
                  <div class="bg-white rounded p-1">
                    <p class="text-gray-400">思政</p>
                    <p class="font-bold">{{ getDimensionScore(record.dimensions, 'sizheng') || '--' }}</p>
                  </div>
                  <div class="bg-white rounded p-1">
                    <p class="text-gray-400">心理</p>
                    <p class="font-bold">{{ getDimensionScore(record.dimensions, 'xinli') || '--' }}</p>
                  </div>
                  <div class="bg-white rounded p-1">
                    <p class="text-gray-400">健康</p>
                    <p class="font-bold">{{ getDimensionScore(record.dimensions, 'jiankang') || '--' }}</p>
                  </div>
                  <div class="bg-white rounded p-1">
                    <p class="text-gray-400">康复</p>
                    <p class="font-bold">{{ getDimensionScore(record.dimensions, 'kangfu') || '--' }}</p>
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
                <div v-for="cls in classes" :key="cls.id" class="mb-2">
                  <div class="p-2 bg-gray-50 rounded text-sm">
                    <div class="flex justify-between items-center">
                      <span class="cursor-pointer hover:text-blue-600 font-medium" @click="expandedClassId = expandedClassId === cls.id ? null : cls.id">
                        {{ cls.name }} ({{ (classStudentsMap[cls.id] || []).length }}人)
                      </span>
                      <div class="flex gap-2">
                        <button @click="assigningClassId = assigningClassId === cls.id ? null : cls.id" class="text-blue-500 hover:text-blue-700 text-xs">分配教师</button>
                        <button @click="deleteClass(cls.id)" class="text-red-500 hover:text-red-700 text-xs">删除</button>
                      </div>
                    </div>
                    <!-- 显示已分配的教师 -->
                    <div v-if="cls.teacher_ids && cls.teacher_ids.length > 0" class="mt-1 text-xs text-gray-500">
                      已分配教师：{{ cls.teacher_ids.map(tid => teachers.find(t => t.id === tid)?.name || '未知').join('、') }}
                    </div>
                  </div>
                  <!-- 分配教师面板 -->
                  <div v-if="assigningClassId === cls.id" class="pl-4 py-2 bg-blue-50 rounded mt-1 text-xs">
                    <p class="font-medium mb-2">选择要分配的教师：</p>
                    <div v-for="t in teachers" :key="t.id" class="py-1 flex justify-between items-center border-b border-gray-200 last:border-0">
                      <span>{{ t.name }}</span>
                      <button 
                        @click="assignTeacherToClass(cls.id, t.id)"
                        :class="cls.teacher_ids && cls.teacher_ids.includes(t.id) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'"
                        class="px-2 py-0.5 rounded text-xs"
                      >
                        {{ cls.teacher_ids && cls.teacher_ids.includes(t.id) ? '已分配 ✓' : '分配' }}
                      </button>
                    </div>
                    <div v-if="teachers.length === 0" class="text-gray-400 py-1">暂无教师，请先创建教师账号</div>
                  </div>
                  <!-- 学生列表 -->
                  <div v-if="expandedClassId === cls.id && assigningClassId !== cls.id" class="pl-4 py-2 bg-blue-50 rounded mt-1 text-xs">
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
                    <select 
                      v-if="adjustingStudentId === student.id"
                      v-model="newClassId" 
                      @change="confirmAdjustClass(student.id)"
                      class="px-2 py-1 border rounded text-sm"
                    >
                      <option value="">选择班级</option>
                      <option v-for="cls in classes" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
                    </select>
                    <span v-else class="text-sm text-gray-500">{{ student.class_name || '未分配' }}</span>
                    <button 
                      v-if="adjustingStudentId !== student.id"
                      @click="startAdjustClass(student.id, student.class_id)" 
                      class="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      调班
                    </button>
                    <button 
                      v-if="adjustingStudentId === student.id"
                      @click="cancelAdjustClass" 
                      class="text-gray-500 hover:text-gray-700 text-sm"
                    >
                      取消
                    </button>
                    <button @click="deleteStudent(student.id)" class="text-red-500 hover:text-red-700 text-sm">删除</button>
                  </div>
                </div>
              </div>
              <p class="text-xs text-gray-400 mt-2">点击"调班"可调整学生所属班级</p>
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

// 急救警报音频控制
const alarmAudio = ref(null)
const isAlarmPlaying = ref(false)

// 播放警报
function playAlarm() {
  if (alarmAudio.value) {
    alarmAudio.value.currentTime = 0
    alarmAudio.value.loop = true
    alarmAudio.value.play().catch(e => console.log('音频播放失败:', e))
    isAlarmPlaying.value = true
  }
}

// 停止警报
function stopAlarm() {
  if (alarmAudio.value) {
    alarmAudio.value.pause()
    alarmAudio.value.currentTime = 0
    isAlarmPlaying.value = false
  }
}

const loginForm = reactive({
  username: '',
  password: '',
  role: 'student' // 默认学生
})

const registerForm = reactive({
  name: '',
  email: '',
  password: '',
  classId: ''
})

const caseProfile = reactive({
  // 案例发布相关
  caseName: '',
  caseDescription: '',
  selectedClasses: [],
  
  // 老人画像相关
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
  studentTitle: '护理员',
  emergency: '',
  customEmergency: ''
})

const customEmergency = ref('')
const emergencyOptions = ['噎食', '心脏骤停', '跌倒', '走失', '擦伤', '褥疮', '高烧', '痰液窒息']

// 突发疾病标记（无法正常说话，需要急救）
const emergencyDiseases = ['噎食', '心脏骤停', '痰液窒息']

// 各突发疾病的急救关键词
const emergencyKeywords = {
  '噎食': ['海姆立克', '海姆力克', '异物排出', '异物已排出', '拍背', '腹部冲击', '冲击', '急救', '已排出', '吐出来了', '咳出来了', '卡出来了', '没事了'],
  '心脏骤停': ['心肺复苏', 'CPR', '胸外按压', '人工呼吸', '心跳恢复', '自主呼吸', '除颤', '抢救成功', '救过来了'],
  '痰液窒息': ['吸痰', '拍背', '排痰', '气道', '异物', '急救', '痰已排出', '痰吸出来了']
}

// 紧急状态追踪（是否已完成急救）
const emergencyCompleted = ref(false)

const livingTypeOptions = ['独居', '丧偶', '有老伴', '无儿女', '儿女在外地']
const economicTypeOptions = ['无收入', '有退休金', '有商业保险', '儿女赡养']
const hobbyOptions = ['聊天', '养花', '看书', '看电视', '下棋', '广场舞', '唱歌']

const diseases = [
  '高血压', '糖尿病', '冠心病', '脑卒中',
  '阿尔茨海默', '帕金森', '关节炎', '骨质疏松',
  '慢性支气管炎', '肺气肿', '胃溃疡', '慢性胃炎',
  '白内障', '青光眼', '前列腺增生', '失眠症',
  '抑郁症', '焦虑症', '类风湿', '痛风',
  '咳嗽', '高血脂',
  '心脏骤停', '左侧偏瘫', '右侧偏瘫', '记忆力减退'
]

const customDisease = ref('')

const generatedCase = ref({})
const messages = ref([])
const userInput = ref('')
const isGenerating = ref(false)
const isTyping = ref(false)

// 防止重复提交标记
const hasSubmitted = ref(false)  // 本次练习是否已提交
const isScoring = ref(false)  // 正在评分中

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

// 调班功能
const adjustingStudentId = ref(null)
const newClassId = ref('')

// 班级展开状态
const expandedClassId = ref(null)

// 班级学生映射
const classStudentsMap = computed(() => {
  console.log('📋 classStudentsMap 计算中...')
  console.log('📋 students.value:', students.value)
  console.log('📋 classes.value:', classes.value)
  
  const map = {}
  students.value.forEach(s => {
    // 转换为字符串进行比较，确保类型一致
    const studentClassId = String(s.class_id)
    console.log('📋 学生:', s.name, 'class_id:', s.class_id, '类型:', typeof s.class_id)
    
    if (studentClassId && studentClassId !== 'null' && studentClassId !== 'undefined') {
      // 查找匹配的班级
      const matchedClass = classes.value.find(c => String(c.id) === studentClassId || c.id == studentClassId)
      console.log('📋 匹配班级:', matchedClass ? matchedClass.name : '未找到')
      
      if (matchedClass) {
        if (!map[matchedClass.id]) map[matchedClass.id] = []
        map[matchedClass.id].push(s)
      }
    }
  })
  console.log('📋 classStudentsMap 结果:', map)
  return map
})

// 老师界面相关
const selectedTeacherClass = ref(null)
const selectedStudent = ref(null)
const studentRecords = ref([])
const allRecords = ref([]) // 所有练习记录
const assigningClassId = ref(null) // 正在分配教师的班级ID

// 案例库相关
const cases = ref([]) // 教师发布的案例
const selectedCase = ref(null) // 学生选择的案例
const teacherStep = ref('home') // 教师端步骤：home(首页)、create_case(创建案例)、case_analysis(案例分析)
const selectedTeacherCase = ref(null) // 教师查看的案例


// 老师负责的班级（支持多个教师管理同一个班级）
const teacherClasses = computed(() => {
  console.log('📋 teacherClasses 计算中...')
  console.log('📋 currentUser.value.id:', currentUser.value.id)
  console.log('📋 classes.value:', classes.value)
  
  if (!currentUser.value.id) return []
  // 检查班级的 teacher_ids 数组是否包含当前教师ID
  const result = classes.value.filter(c => {
    // 兼容旧数据：如果班级有 teacher_ids 字段，检查数组
    if (c.teacher_ids && Array.isArray(c.teacher_ids)) {
      return c.teacher_ids.includes(currentUser.value.id)
    }
    // 兼容旧数据：如果教师有 class_id 字段
    if (currentUser.value.class_id && c.id === currentUser.value.class_id) {
      return true
    }
    return false
  })
  console.log('📋 teacherClasses 结果:', result)
  return result
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
    try {
      const parsed = JSON.parse(savedUser)
      if (parsed && parsed.id && parsed.role) {
        currentUser.value = parsed
        isLoggedIn.value = true
        console.log('✅ 已恢复登录状态:', parsed.name, parsed.role)
        loadData()
      }
    } catch (e) {
      console.error('解析登录状态失败:', e)
      localStorage.removeItem('currentUser')
    }
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
    // 加载练习历史（包含所有字段）
    const { data } = await supabase
      .from('practice_records')
      .select('*, strengths, weaknesses, improvements, referenceanswer, messages')
      .eq('user_id', currentUser.value.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (data) {
      practiceHistory.value = data
      console.log('✅ 加载练习记录成功，数量:', data.length)
      if (data.length > 0) {
        console.log('最新记录 strengths:', data[0].strengths)
        console.log('最新记录 improvements:', data[0].improvements)
        console.log('最新记录 referenceanswer:', data[0].referenceanswer)
        console.log('最新记录 messages 数量:', data[0].messages?.length || 0)
      }
    }

    // 加载发布到自己班级的案例
    if (currentUser.value.class_id) {
      const { data: classCases } = await supabase
        .from('cases')
        .select('*')
        .contains('class_ids', [currentUser.value.class_id])
        .order('created_at', { ascending: false })
      if (classCases) {
        cases.value = classCases
        console.log('✅ 加载班级案例数量:', classCases.length)
      }
    } else {
      cases.value = []
      console.log('⚠️ 学生未分配班级，无法加载案例')
    }
  } else if (currentUser.value.role === 'teacher') {
    console.log('🔄 教师开始加载数据...')
    let classMap = {}
    
    if (!classes.value || classes.value.length === 0) {
      const { data: classesData } = await supabase.from('classes').select('*')
      if (classesData) {
        classes.value = classesData
        classesData.forEach(c => { classMap[c.id] = c.name })
      }
    } else {
      classes.value.forEach(c => { classMap[c.id] = c.name })
    }
    
    const { data: studentsData } = await supabase.from('users').select('*').eq('role', 'student')
    if (studentsData) {
      students.value = studentsData.map(s => ({
        ...s,
        class_name: classMap[s.class_id] || '未分配'
      }))
    }
    
    // 加载所有练习记录
    await loadAllRecords()
    
    // 加载教师发布的案例
    await loadCases()
  } else if (currentUser.value.role === 'admin') {
    console.log('📋 管理员加载数据...')
    
    // 加载班级列表
    const { data: classesData } = await supabase
      .from('classes')
      .select('*')
    
    const classMap = {}
    if (classesData) {
      classes.value = classesData
      classesData.forEach(c => { classMap[c.id] = c.name })
      console.log('✅ 班级数量:', classesData.length)
    }
    
    // 加载学生列表（简化查询，不用join）
    const { data: studentsData, error: studentError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'student')
    
    if (studentError) {
      console.error('❌ 查询学生失败:', studentError)
    } else if (studentsData) {
      students.value = studentsData.map(s => ({
        ...s,
        class_name: classMap[s.class_id] || '未分配'
      }))
      console.log('✅ 学生数量:', studentsData.length, studentsData.map(s => s.name).join(', '))
    }
    
    // 加载老师列表（简化查询，不用join）
    const { data: teachersData, error: teacherError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'teacher')
    
    if (teacherError) {
      console.error('❌ 查询教师失败:', teacherError)
    } else if (teachersData) {
      teachers.value = teachersData.map(t => ({
        ...t,
        class_name: classMap[t.class_id] || '未分配'
      }))
      console.log('✅ 教师数量:', teachersData.length, teachersData.map(t => t.name).join(', '))
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
    console.log('🔐 管理员登录中...')
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
    
    // 如果输入的不包含@，根据角色自动补全后缀
    if (!loginEmail.includes('@')) {
      if (loginForm.role === 'teacher') {
        loginEmail = `${loginForm.username}@teacher.local`
      } else if (loginForm.role === 'admin') {
        // 管理员直接用用户名
        loginEmail = `${loginForm.username}@system`
      } else {
        loginEmail = `${loginForm.username}@student.local`
      }
    }
    
    // 从 users 表查询
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
        role: user.role || loginForm.role,
        class_id: user.class_id,
        class_name: user.classes?.name
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
  
  if (!registerForm.name || !registerForm.password) {
    registerError.value = '请填写姓名和密码'
    return
  }
  
  if (registerForm.password.length < 6) {
    registerError.value = '密码至少6位'
    return
  }
  
  if (!registerForm.classId) {
    registerError.value = '请选择班级'
    return
  }
  
  isRegistering.value = true
  
  try {
    if (!supabase) {
      throw new Error('数据库未配置')
    }
    
    // 自动生成邮箱（用姓名拼音或时间戳）
    let accountName = registerForm.name.toLowerCase().replace(/\s+/g, '')
    let email = registerForm.email || `${accountName}@student.local`
    
    // 如果用户输入了邮箱，直接使用
    if (registerForm.email && !registerForm.email.includes('@')) {
      email = `${registerForm.email}@student.local`
      accountName = registerForm.email
    }
    
    // 检查账号是否已存在
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .limit(1)
    
    if (existing && existing.length > 0) {
      // 自动加数字后缀
      let suffix = 1
      while (true) {
        email = `${accountName}${suffix}@student.local`
        const { data: check } = await supabase
          .from('users')
          .select('id')
          .eq('email', email)
          .limit(1)
        if (!check || check.length === 0) break
        suffix++
      }
      accountName = `${accountName}${suffix}`
    }
    
    // 检查姓名是否已存在（同名学生不能重复注册）
    const { data: sameName } = await supabase
      .from('users')
      .select('id, name')
      .eq('name', registerForm.name)
      .eq('role', 'student')
      .limit(1)
    
    if (sameName && sameName.length > 0) {
      isRegistering.value = false
      registerError.value = '该姓名已存在，请与管理员联系'
      return
    }
    
    // 直接创建用户记录（简化注册，不走 Supabase Auth）
    const userId = 'student_' + Date.now()
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        name: registerForm.name,
        email: email,
        role: 'student',
        class_id: registerForm.classId || null,
        password: registerForm.password
      })
      .select()
    
    if (error) throw error
    
    if (data) {
      alert(`注册成功！\n姓名：${registerForm.name}\n账号：${accountName}\n密码：${registerForm.password}\n\n（直接输入 ${accountName} 即可登录）`)
      loginMode.value = 'password'
      loginForm.username = accountName
      registerForm.name = ''
      registerForm.email = ''
      registerForm.password = ''
      registerForm.classId = ''
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

// 添加自定义突发事件
function addCustomEmergency() {
  if (customEmergency.value.trim()) {
    caseProfile.customEmergency = customEmergency.value.trim()
    customEmergency.value = ''
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
  
  // 获取突发事件
  const currentEmergency = caseProfile.customEmergency || caseProfile.emergency || ''
  
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
${currentEmergency ? `- 突发事件：${currentEmergency}` : ''}

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
    "medications": [
      {
        "disease": "对应的疾病名称",
        "drugs": [
          {
            "name": "药品名称",
            "spec": "规格（如30mg/片）",
            "usage": "用法用量（如每日1次，每次1片，口服）"
          }
        ]
      }
    ]
  },
  "personality": {
    "traits": ["性格特点"],
    "concerns": ["关心的问题"],
    "communicationStyle": "沟通风格"
  },
  "deviceAlert": "${currentEmergency ? `智能设备报警内容（模拟智能手环或监控设备向平台发送的报警信息，如：'检测到老人${currentEmergency}，位置：客厅，时间：14:32'）` : '普通日常情况，无需设备报警，返回空字符串'}",
  "openingLine": "老人的开场白（要自然，符合老人身份和疾病情况，称呼对方为护理员${currentEmergency ? '，如果是突发事件场景，开场白要体现紧急情况' : ''}）"
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
      // 如果有突发事件，播放警报
      if (currentEmergency) {
        playAlarm()
      }
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
        studentTitle: caseProfile.studentTitle || '护理员'
      },
      medicalHistory: {
        chiefComplaint: '头晕、乏力1周',
        presentIllness: `患者有${allDiseases.join('、')}病史`,
        pastHistory: allDiseases.join('、'),
        medications: [
          {
            disease: allDiseases[0] || '高血压',
            drugs: [
              { name: '硝苯地平控释片', spec: '30mg/片', usage: '每日1次，每次1片，口服' }
            ]
          }
        ]
      },
      personality: {
        traits: [caseProfile.personality],
        concerns: ['健康问题', '子女关心'],
        communicationStyle: caseProfile.dialect === '普通话' ? '标准普通话' : `带${caseProfile.dialect}口音`
      },
      deviceAlert: currentEmergency ? `检测到老人${currentEmergency}，位置：客厅，时间：14:32` : '',
      openingLine: currentEmergency ? `护理员，我好像${currentEmergency}了，快来帮帮我！` : `护理员，我最近总是头晕，你帮我看看吧。`
    }
    currentStep.value = 'case'
    // 如果有突发事件，播放警报
    if (currentEmergency) {
      playAlarm()
    }
  } finally {
    isGenerating.value = false
  }
}

// 选择案例进行练习
function selectCaseForPractice(c) {
  selectedCase.value = c
  
  // 跳转到案例详情页面（显示教学要点）
  currentStep.value = 'case_detail_preview'
}

// 基于教学要点生成老人画像
async function generateElderProfileFromTeachingPoints() {
  if (!selectedCase.value) return
  
  const teachingPoints = selectedCase.value.description || ''
  
  // 调用AI生成老人画像
  const prompt = `根据以下教学要点，生成一个老人画像案例。

教学要点：
${teachingPoints}

请直接返回一个简短的JSON（不要markdown代码块），只需包含以下核心字段：
{
  "age": "年龄范围",
  "gender": "性别（男/女）",
  "diseases": ["疾病1", "疾病2"],
  "personality": "性格特点",
  "dialect": "方言",
  "emergency": "突发情况"
}

直接返回JSON，不要其他文字。`

  try {
    isGenerating.value = true
    console.log('📤 开始生成老人画像，教学要点:', teachingPoints.substring(0, 100))

    const response = await fetch('https://todnsmeovkpmniqcwucm.supabase.co/functions/v1/chat?t=' + Date.now(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: prompt }
        ],
        mode: 'generate_case'
      })
    })

    console.log('📥 响应状态:', response.status)
    console.log('📥 响应状态文本:', response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ HTTP错误:', response.status, errorText)
      alert('生成失败：服务器错误 ' + response.status)
      return
    }

    const data = await response.json()
    console.log('📥 响应数据:', data)

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ 响应格式错误:', data)
      alert('生成失败：服务器返回格式错误')
      return
    }

    const content = data.choices[0].message.content
    console.log('📥 AI返回内容（长度:', content.length, '）:', content.substring(0, 300))

    // 去除Markdown代码块标记
    let cleanedContent = content.replace(/```json\s*/g, '').replace(/```\s*/g, '')
    console.log('📥 清理后内容:', cleanedContent)

    // 解析JSON
    const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('❌ 无法从返回内容中提取JSON')
      alert('生成失败：无法解析老人画像数据')
      return
    }

    const elderProfile = JSON.parse(jsonMatch[0])
    console.log('✅ 解析成功:', elderProfile)

    // 填充老人画像（核心字段）
    caseProfile.age = elderProfile.age || '70-80'
    caseProfile.gender = elderProfile.gender || '女'
    caseProfile.diseases = elderProfile.diseases || ['高血压']
    caseProfile.personality = elderProfile.personality || '温和'
    caseProfile.dialect = elderProfile.dialect || '普通话'
    caseProfile.emergency = elderProfile.emergency || ''

    // 其他字段使用默认值
    caseProfile.livingPlace = '城市社区'
    caseProfile.livingTypes = ['独居']
    caseProfile.occupation = '退休工人'
    caseProfile.economicTypes = ['退休金']
    caseProfile.hobbies = ['看电视', '听广播']
    caseProfile.studentTitle = '护理员'
    caseProfile.customEmergency = ''
    
    // 生成病例
    await generateCase()
    
    // 跳转到输入页面
    currentStep.value = 'input'
    
  } catch (error) {
    console.error('生成老人画像失败:', error)
    alert('生成老人画像失败，请重试')
  } finally {
    isGenerating.value = false
  }
}


// 开始对话
function startChat() {
  // 进入交流界面后停止警报
  stopAlarm()
  
  // 重置简单称呼计数
  simpleGreetingCount.value = 0
  
  // 检查是否是突发疾病场景（噎食、心脏骤停、痰液窒息）
  const currentEmergency = caseProfile.customEmergency || caseProfile.emergency || ''
  const isEmergency = emergencyDiseases.includes(currentEmergency)
  
  // 重置紧急状态
  emergencyCompleted.value = false
  
  if (isEmergency) {
    // 突发疾病场景：不发送开场白，显示提示
    messages.value = []
  } else {
    // 正常场景：发送开场白
    messages.value = [
      { role: 'assistant', content: generatedCase.value.openingLine || '你好，护理员。' }
    ]
  }
  
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
  
  // 检测无效/恶性词语
  const validationResult = validateUserMessage(userMsg)
  if (!validationResult.valid) {
    // 显示警告提示
    messages.value.push({ role: 'assistant', content: validationResult.warning })
    userInput.value = ''
    return
  }
  
  // 检测是否与案例场景相关
  const sceneCheck = checkSceneRelevance(userMsg)
  if (!sceneCheck.relevant) {
    messages.value.push({ role: 'assistant', content: sceneCheck.warning })
    userInput.value = ''
    return
  }
  
  messages.value.push({ role: 'user', content: userMsg })
  userInput.value = ''
  isTyping.value = true
  
  try {
    // 获取当前紧急情况
    const currentEmergency = caseProfile.customEmergency || caseProfile.emergency || ''
    const isEmergency = emergencyDiseases.includes(currentEmergency)
    
    // 检查用户输入中是否包含急救关键词
    let hasEmergencyKeywords = false
    if (isEmergency && emergencyKeywords[currentEmergency]) {
      hasEmergencyKeywords = emergencyKeywords[currentEmergency].some(keyword => 
        userMsg.includes(keyword)
      )
      
      // 如果检测到急救关键词，标记急救已完成
      if (hasEmergencyKeywords) {
        console.log('✅ 检测到急救关键词，急救完成')
        emergencyCompleted.value = true
      }
    }
    
    // 如果是突发疾病且急救未完成，不调用AI，直接返回提示
    if (isEmergency && !emergencyCompleted.value) {
      const warningMsg = '老人无法回应，需要立即采取急救措施。'
      messages.value.push({ role: 'assistant', content: warningMsg })
      isTyping.value = false
      return
    }
    
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
    
    // 检查是否是突发疾病场景，如果是，添加相应的系统提示
    let emergencyPrompt = ''
    if (isEmergency && emergencyCompleted.value) {
      const currentEmergency = caseProfile.customEmergency || caseProfile.emergency || ''
      if (currentEmergency === '噎食') {
        emergencyPrompt = '\n\n【重要背景】\n- 你刚才吃东西不小心噎住了，护理员及时用海姆立克急救法帮你把异物排出来了\n- 现在异物已经排出，你感觉好多了，能正常呼吸和说话了\n- 你应该感谢护理员，表达劫后余生的心情'
      } else if (currentEmergency === '心脏骤停') {
        emergencyPrompt = '\n\n【重要背景】\n- 你刚才突然心脏骤停，护理员及时做了心肺复苏把你救回来了\n- 现在你已经恢复意识，心跳正常\n- 你应该感谢护理员，表达后怕和感激的心情'
      } else if (currentEmergency === '痰液窒息') {
        emergencyPrompt = '\n\n【重要背景】\n- 你刚才痰液窒息，护理员及时帮你拍背排痰，把痰液吸出来了\n- 现在气道通畅，你能正常呼吸和说话了\n- 你应该感谢护理员，表达感激的心情'
      }
    }
    
    const systemPrompt = `你是${name}，一位${age}岁${gender}老人。

【你的情况】
- 患有${disease}
- 住${livingPlace}，${livingType}
- 以前是${occupation}
- 平时爱${hobbies}
${emergencyPrompt}
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
  if (isScoring.value) return  // 防止重复点击
  console.log('🔴 开始评分，isScoring 设为 true')
  isScoring.value = true
  isTyping.value = true
  
  // 添加评分加载提示
  messages.value.push({ 
    role: 'assistant', 
    content: '⏳ 正在评分，请稍等...' 
  })
  
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

评分维度（每项满分20分，共100分）：
1. 伦理操守：是否尊重老人、关爱老人、遵守职业道德和操作规范、仪表端正、态度亲和、守时守信、保护隐私
2. 心理慰藉：是否耐心倾听、理解老人情绪、给予情感支持、缓解焦虑、提供心理疏导
3. 健康宣教：日常照护知识是否准确（用药指导、饮食建议、生活习惯、安全防护）、是否善于观察老人面色和行为变化
4. 康复训练：是否指导老人进行安全的功能锻炼、日常活动、预防并发症、注意安全事项
5. 智慧赋能：是否能结合智能设备（智能手环、智能床垫、跌倒报警器、远程监测等）进行健康管理

评分要求：
- 严格根据对话内容评分，不要随意给高分
- 如果某维度完全没有涉及，该维度得0分，并在improvements中建议"建议加强XX维度的沟通"
- 对话轮数较少时，在feedback中体现"沟通不够充分"
- 优点和不足要具体，结合对话内容
- 建议要实用，针对不足提出

请返回如下JSON格式（不要有其他内容）：
{
  "totalScore": 总分(0-100),
  "dimensions": {
    "伦理操守": 分数(0-20),
    "心理慰藉": 分数(0-20),
    "健康宣教": 分数(0-20),
    "康复训练": 分数(0-20),
    "智慧赋能": 分数(0-20)
  },
  "feedback": "整体评价（50字以内）",
  "strengths": ["具体优点1", "具体优点2"],
  "weaknesses": ["具体不足1", "具体不足2"],
  "improvements": ["具体建议1", "具体建议2"],
  "referenceanswer": "针对该老人情况的理想沟通参考答案，包含五个维度的合理化建议、智慧化设备（如智能手环、智能床垫、跌倒报警器等）的使用建议，以及预约下次照护时间（如：'明天下午我再来看您'、'后天上午我来进行康复指导'），350字以内"
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
        '伦理操守': 15 + Math.floor(Math.random() * 5),
        '心理慰藉': 14 + Math.floor(Math.random() * 5),
        '健康宣教': 15 + Math.floor(Math.random() * 5),
        '康复训练': 14 + Math.floor(Math.random() * 5),
        '智慧赋能': 12 + Math.floor(Math.random() * 5)
      },
      feedback: '整体表现一般，建议加强各维度能力',
      strengths: ['态度友善', '有耐心沟通'],
      weaknesses: ['缺少针对性指导', '心理疏导不足'],
      improvements: ['加强对老人的情感关怀', '提供更专业的健康指导']
    }
  } finally {
    isTyping.value = false
    // 评分完成后不立即重置 isScoring，保持按钮禁用状态，直到开始新训练
    console.log('🟢 评分完成，isScoring 保持 true，hasSubmitted 将设为 true')
    
    // 移除评分加载提示
    messages.value = messages.value.filter(m => m.content !== '⏳ 正在评分，请稍等...')
    
    currentStep.value = 'score'
    
    // 保存评分结果到数据库
    if (currentUser.value.role === 'student' && supabase) {
      try {
        // 将中文键名转换为英文键名
        const dimensions = score.value.dimensions || {}
        const normalizedDimensions = {
          lunli: dimensions['伦理操守'] || dimensions.lunli || 0,
          xinli: dimensions['心理慰藉'] || dimensions.xinli || 0,
          jiankang: dimensions['健康宣教'] || dimensions.jiankang || 0,
          kangfu: dimensions['康复训练'] || dimensions.kangfu || 0,
          zhihui: dimensions['智慧赋能'] || dimensions.zhihui || 0
        }
        
        const { error: insertError } = await supabase.from('practice_records').insert({
          user_id: currentUser.value.id,
          user_name: currentUser.value.name || '未知学生',
          case_name: selectedCase.value?.name || generatedCase.value.caseName || '练习记录',
          case_id: selectedCase.value?.id || null,
          score: score.value.totalScore,
          dimensions: normalizedDimensions,
          feedback: score.value.feedback,
          strengths: score.value.strengths || [],
          weaknesses: score.value.weaknesses || [],
          improvements: score.value.improvements || [],
          referenceanswer: score.value.referenceanswer || '',
          case_data: generatedCase.value,
          messages: messages.value,
          created_at: new Date().toISOString()
        })
        
        if (insertError) {
          console.error('保存失败:', insertError)
          alert('保存失败：' + insertError.message)
        } else {
          console.log('✅ 评分记录保存成功')
        }
        
        // 标记已提交
  hasSubmitted.value = true
  console.log('评分记录已保存，案例ID:', selectedCase.value?.id)
        console.log('保存的 strengths:', score.value.strengths)
        console.log('保存的 improvements:', score.value.improvements)
        console.log('保存的 referenceanswer:', score.value.referenceanswer)
        console.log('保存的 messages 数量:', messages.value?.length || 0)
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
  hasSubmitted.value = false  // 重置提交状态
  isScoring.value = false  // 重置评分状态
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
      student_count: 0,
      teacher_ids: [] // 支持多个教师管理
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

// 分配教师到班级
async function assignTeacherToClass(classId, teacherId) {
  const cls = classes.value.find(c => c.id === classId)
  if (!cls) return
  
  // 获取当前的 teacher_ids，如果没有则初始化为空数组
  let teacherIds = cls.teacher_ids || []
  
  // 如果教师已经在列表中，则移除；否则添加
  if (teacherIds.includes(teacherId)) {
    teacherIds = teacherIds.filter(id => id !== teacherId)
  } else {
    teacherIds = [...teacherIds, teacherId]
  }
  
  const { error } = await supabase
    .from('classes')
    .update({ teacher_ids: teacherIds })
    .eq('id', classId)
  
  if (!error) {
    // 更新本地数据
    const index = classes.value.findIndex(c => c.id === classId)
    if (index !== -1) {
      classes.value[index].teacher_ids = teacherIds
    }
  } else {
    alert('分配失败：' + error.message)
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

// 开始调整班级
function startAdjustClass(studentId, currentClassId) {
  adjustingStudentId.value = studentId
  newClassId.value = currentClassId || ''
}

// 确认调整班级
async function confirmAdjustClass(studentId) {
  if (!newClassId.value) {
    alert('请选择班级')
    return
  }
  
  const { error } = await supabase
    .from('users')
    .update({ class_id: newClassId.value || null })
    .eq('id', studentId)
  
  if (error) {
    alert('调整班级失败：' + error.message)
  } else {
    // 更新本地数据
    const student = students.value.find(s => s.id === studentId)
    if (student) {
      student.class_id = newClassId.value || null
      student.class_name = classes.value.find(c => c.id === newClassId.value)?.name || ''
    }
    // 同时更新 classStudentsMap
    await loadClassStudents()
  }
  
  adjustingStudentId.value = null
  newClassId.value = ''
}

// 取消调整
function cancelAdjustClass() {
  adjustingStudentId.value = null
  newClassId.value = ''
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
  let accountName = newStudent.accountName || newStudent.name
  
  try {
    // 自动生成邮箱
    let email = `${accountName}@student.local`
    
    // 检查账号是否已存在
    let { data: existing } = await supabase
      .from('users')
      .select('id, name')
      .eq('email', email)
      .limit(1)
    
    // 如果重名，自动加数字后缀
    if (existing && existing.length > 0) {
      let suffix = 1
      while (true) {
        email = `${accountName}${suffix}@student.local`
        const { data: check } = await supabase
          .from('users')
          .select('id')
          .eq('email', email)
          .limit(1)
        
        if (!check || check.length === 0) break
        suffix++
      }
      accountName = `${accountName}${suffix}`
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
      alert(`学生创建成功！\n姓名：${newStudent.name}\n账号：${accountName}\n密码：${password}\n\n（直接输入 ${accountName} 即可登录）`)
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
  let accountName = newTeacher.accountName || newTeacher.name
  let email = `${accountName}@teacher.local`
  
  try {
    // 检查账号是否已存在
    let { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .limit(1)
    
    // 如果重名，自动加数字后缀
    if (existing && existing.length > 0) {
      let suffix = 1
      while (true) {
        email = `${accountName}${suffix}@teacher.local`
        const { data: check } = await supabase
          .from('users')
          .select('id')
          .eq('email', email)
          .limit(1)
        
        if (!check || check.length === 0) break
        suffix++
      }
      accountName = `${accountName}${suffix}`
    }
    
    const teacherId = 'teacher_' + Date.now()
    
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
      alert(`老师创建成功！\n姓名：${newTeacher.name}\n账号：${accountName}\n密码：${password}\n\n（直接输入 ${accountName} 即可登录）`)
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
    console.log('📋 查看记录:', record.case_name)
    console.log('  - strengths:', record.strengths)
    console.log('  - improvements:', record.improvements)
    console.log('  - referenceanswer:', record.referenceanswer)
    console.log('  - messages 数量:', record.messages?.length || 0)
    
    generatedCase.value = record.case_data
    messages.value = record.messages || []
    
    // 恢复完整的评分信息
    score.value = {
      totalScore: record.score || 0,
      dimensions: record.dimensions || {},
      feedback: record.feedback || '',
      strengths: record.strengths || [],
      weaknesses: record.weaknesses || [],
      improvements: record.improvements || [],
      referenceanswer: record.referenceanswer || ''
    }
    
    console.log('恢复后的 score.value:', score.value)
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

// 获取发布的班级名称（异步版本，确保班级数据已加载）
async function getPublishedClassesAsync(classIds) {
  if (!classIds || classIds.length === 0) return '未发布'
  
  console.log('📋 getPublishedClassesAsync 被调用')
  console.log('  - classIds:', classIds, '类型:', typeof classIds[0])
  
  // 如果班级数据未加载，主动加载
  if (!classes.value || classes.value.length === 0) {
    console.log('📋 班级数据未加载，主动加载...')
    const { data: classesData } = await supabase.from('classes').select('*')
    if (classesData) {
      classes.value = classesData
      console.log('✅ 班级数据加载成功:', classesData.length, '个')
    }
  }
  
  console.log('  - classes.value:', classes.value)
  
  if (!classes.value || classes.value.length === 0) {
    console.log('⚠️ 班级数据加载失败')
    return '加载失败'
  }
  
  console.log('  - 班级ID类型:', classes.value[0].id, '类型:', typeof classes.value[0].id)
  
  const names = classIds.map(id => {
    // 使用宽松比较
    const cls = classes.value.find(c => c.id == id)
    console.log('  - 查找 id:', id, '(类型:', typeof id, ')', '结果:', cls ? cls.name : '未找到')
    return cls ? cls.name : '未知班级'
  })
  return names.join('、')
}

// 同步版本（用于模板，已废弃，改用异步版本）
function getPublishedClasses(classIds) {
  if (!classIds || classIds.length === 0) return '未发布'
  if (!classes.value || classes.value.length === 0) return '加载中...'
  
  const names = classIds.map(id => {
    const cls = classes.value.find(c => c.id == id)
    return cls ? cls.name : '未知班级'
  })
  return names.join('、')
}

// 发布案例
const isPublishing = ref(false)
async function publishCase() {
  console.log('🚀 publishCase 被调用!')
  console.log('📋 caseProfile.selectedClasses:', caseProfile.selectedClasses)
  console.log('📋 caseProfile.selectedClasses 长度:', caseProfile.selectedClasses.length)
  
  if (!caseProfile.caseName || !caseProfile.teachingPoints || caseProfile.selectedClasses.length === 0) {
    console.log('⚠️ 发布条件不满足：')
    console.log('  - caseName:', caseProfile.caseName)
    console.log('  - teachingPoints:', caseProfile.teachingPoints)
    console.log('  - selectedClasses:', caseProfile.selectedClasses)
    return
  }
  
  console.log('🚀 publishCase 开始发布...')
  console.log('📋 selectedClasses:', caseProfile.selectedClasses, '类型:', typeof caseProfile.selectedClasses[0])
  
  isPublishing.value = true
  
  try {
    console.log('📋 插入数据库的 class_ids:', caseProfile.selectedClasses)
    const { error } = await supabase.from('cases').insert({
      name: caseProfile.caseName,
      description: caseProfile.teachingPoints, // 使用教学要点
      // 以下字段提供默认值（向后兼容）
      age: '70-80',
      gender: '男',
      diseases: ['高血压'],
      personality: '温和',
      dialect: '普通话',
      living_place: '城市社区',
      living_types: ['独居'],
      occupation: '退休工人',
      economic_types: ['退休金'],
      hobbies: ['看电视', '听广播'],
      student_title: '护理员',
      emergency: '',
      custom_emergency: '',
      teacher_id: currentUser.value.id,
      class_ids: caseProfile.selectedClasses
    })
    
    if (error) {
      alert('发布失败：' + error.message)
    } else {
      alert('案例发布成功！')
      // 重置表单
      caseProfile.caseName = ''
      caseProfile.teachingPoints = ''
      caseProfile.selectedClasses = []
      // 重新加载案例列表
      await loadCases()
      // 返回案例列表
      teacherStep.value = 'case_list'
    }
  } catch (error) {
    alert('发布失败：' + error.message)
  } finally {
    isPublishing.value = false
  }
}

// 查看案例详情
function viewCaseDetail(c) {
  selectedTeacherCase.value = c
  teacherStep.value = 'case_detail'
}

// 删除案例
async function deleteCase(caseId) {
  if (!confirm('确定要删除这个案例吗？')) return
  
  try {
    const { error } = await supabase.from('cases').delete().eq('id', caseId)
    
    if (error) {
      alert('删除失败：' + error.message)
    } else {
      alert('删除成功！')
      // 重新加载案例列表
      await loadCases()
      // 返回案例列表
      teacherStep.value = 'case_list'
    }
  } catch (error) {
    alert('删除失败：' + error.message)
  }
}

// 获取案例统计数据
function getCaseStats() {
  if (!selectedTeacherCase.value || !allRecords.value) {
    return {
      studentCount: 0,
      totalPractices: 0,
      avgScore: '--',
      highestScore: '--',
      lowestScore: '--',
      dimensionStats: {
        lunli: { avg: 0, max: 0, min: 0 },
        xinli: { avg: 0, max: 0, min: 0 },
        jiankang: { avg: 0, max: 0, min: 0 },
        kangfu: { avg: 0, max: 0, min: 0 },
        zhihui: { avg: 0, max: 0, min: 0 }
      }
    }
  }

  // 同时通过 case_id 和 case_name 匹配
  const caseRecords = allRecords.value.filter(r =>
    r.case_id === selectedTeacherCase.value.id ||
    r.case_name === selectedTeacherCase.value.name
  )
  const studentIds = [...new Set(caseRecords.map(r => r.user_id))]
  const scores = caseRecords.filter(r => r.score !== null && r.score !== undefined).map(r => r.score)

  // 计算各维度数据
  const dimensionStats = {
    lunli: { values: [], avg: 0, max: 0, min: 0 },
    xinli: { values: [], avg: 0, max: 0, min: 0 },
    jiankang: { values: [], avg: 0, max: 0, min: 0 },
    kangfu: { values: [], avg: 0, max: 0, min: 0 },
    zhihui: { values: [], avg: 0, max: 0, min: 0 }
  }

  caseRecords.forEach(record => {
    if (record.dimensions) {
      const ll = getDimensionScore(record.dimensions, 'lunli')
      const xl = getDimensionScore(record.dimensions, 'xinli')
      const jk = getDimensionScore(record.dimensions, 'jiankang')
      const kf = getDimensionScore(record.dimensions, 'kangfu')
      const zh = getDimensionScore(record.dimensions, 'zhihui')
      if (ll !== null) dimensionStats.lunli.values.push(ll)
      if (xl !== null) dimensionStats.xinli.values.push(xl)
      if (jk !== null) dimensionStats.jiankang.values.push(jk)
      if (kf !== null) dimensionStats.kangfu.values.push(kf)
      if (zh !== null) dimensionStats.zhihui.values.push(zh)
    }
  })

  Object.keys(dimensionStats).forEach(key => {
    const values = dimensionStats[key].values
    if (values.length > 0) {
      dimensionStats[key].avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length)
      dimensionStats[key].max = Math.max(...values)
      dimensionStats[key].min = Math.min(...values)
    }
  })

  return {
    studentCount: studentIds.length,
    totalPractices: caseRecords.length,
    avgScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : '--',
    highestScore: scores.length ? Math.max(...scores) : '--',
    lowestScore: scores.length ? Math.min(...scores) : '--',
    dimensionStats
  }
}

// 获取参与该案例的学生列表
function getCaseStudents() {
  if (!selectedTeacherCase.value) {
    console.log('⚠️ getCaseStudents: selectedTeacherCase.value 为空')
    return []
  }
  if (!allRecords.value) {
    console.log('⚠️ getCaseStudents: allRecords.value 为空')
    return []
  }

  console.log('🔍 查找案例学生:', {
    selectedCaseId: selectedTeacherCase.value.id,
    selectedCaseName: selectedTeacherCase.value.name,
    totalRecords: allRecords.value.length,
    recordCaseIds: allRecords.value.map(r => ({ case_id: r.case_id, case_name: r.case_name })).slice(0, 3)
  })

  // 同时通过 case_id 和 case_name 匹配
  const caseRecords = allRecords.value.filter(r =>
    r.case_id === selectedTeacherCase.value.id ||
    r.case_name === selectedTeacherCase.value.name
  )
  
  console.log('📊 匹配的记录数:', caseRecords.length)
  
  const studentMap = {}

  caseRecords.forEach(record => {
    if (!studentMap[record.user_id]) {
      studentMap[record.user_id] = {
        id: record.user_id,
        name: record.display_name || record.user_name || record.student_name || '未知学生',
        class_name: record.student_class || '未知班级',
        records: []
      }
    }
    studentMap[record.user_id].records.push(record)
  })

  // 按创建时间排序（最新的在前）
  Object.keys(studentMap).forEach(key => {
    studentMap[key].records.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  })

  const result = Object.values(studentMap)
  console.log('📊 找到学生数:', result.length, result.map(s => ({ name: s.name, class: s.class_name })))
  return result
}

// 获取学生排名（按平均分）
function getCaseStudentRankings() {
  const students = getCaseStudents()
  
  const rankings = students.map(student => {
    const scores = student.records.filter(r => r.score !== null && r.score !== undefined).map(r => r.score)
    const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0

    // 计算各维度平均分
    const avgDimensions = {
      sizheng: 0,
      xinli: 0,
      jiankang: 0,
      kangfu: 0
    }

    const dimensionCounts = { sizheng: 0, xinli: 0, jiankang: 0, kangfu: 0 }

    student.records.forEach(record => {
      if (record.dimensions) {
        const sz = getDimensionScore(record.dimensions, 'sizheng')
        const xl = getDimensionScore(record.dimensions, 'xinli')
        const jk = getDimensionScore(record.dimensions, 'jiankang')
        const kf = getDimensionScore(record.dimensions, 'kangfu')
        if (sz !== null) { avgDimensions.sizheng += sz; dimensionCounts.sizheng++ }
        if (xl !== null) { avgDimensions.xinli += xl; dimensionCounts.xinli++ }
        if (jk !== null) { avgDimensions.jiankang += jk; dimensionCounts.jiankang++ }
        if (kf !== null) { avgDimensions.kangfu += kf; dimensionCounts.kangfu++ }
      }
    })

    Object.keys(avgDimensions).forEach(key => {
      avgDimensions[key] = dimensionCounts[key] > 0 ? Math.round(avgDimensions[key] / dimensionCounts[key]) : 0
    })

    // 计算趋势（比较最近两次记录）
    let trend = 'stable'
    if (student.records.length >= 2) {
      const recent = student.records[0]
      const previous = student.records[1]
      if (recent.score > previous.score) trend = 'up'
      else if (recent.score < previous.score) trend = 'down'
    }

    return {
      ...student,
      totalPractices: student.records.length,
      avgScore,
      highestScore: scores.length ? Math.max(...scores) : 0,
      lowestScore: scores.length ? Math.min(...scores) : 0,
      avgDimensions,
      trend
    }
  })

  // 按平均分降序排序
  return rankings.sort((a, b) => b.avgScore - a.avgScore)
}

// 导出案例Excel
async function exportCaseExcel() {
  if (!selectedTeacherCase.value) return

  try {
    const students = getCaseStudentRankings()
    if (students.length === 0) {
      alert('暂无数据可导出')
      return
    }

    // 构建CSV内容
    let csvContent = '\uFEFF' // BOM for UTF-8
    csvContent += '排名,学生姓名,练习次数,平均分,最高分,最低分,思政维度,心理慰藉,健康宣教,康复训练,趋势\n'

    students.forEach((student, index) => {
      const trendText = student.trend === 'up' ? '↑ 改善' : student.trend === 'down' ? '↓ 下降' : '→ 稳定'
      csvContent += `${index + 1},"${student.name}",${student.totalPractices},${student.avgScore},${student.highestScore},${student.lowestScore},${student.avgDimensions.sizheng},${student.avgDimensions.xinli},${student.avgDimensions.jiankang},${student.avgDimensions.kangfu},${trendText}\n`
    })

    // 添加详细记录
    csvContent += '\n\n详细记录\n学生姓名,练习时间,总分,思政维度,心理慰藉,健康宣教,康复训练\n'

    students.forEach(student => {
      student.records.forEach(record => {
        const dateStr = formatDate(record.created_at)
        const sz = getDimensionScore(record.dimensions, 'sizheng') || '--'
        const xl = getDimensionScore(record.dimensions, 'xinli') || '--'
        const jk = getDimensionScore(record.dimensions, 'jiankang') || '--'
        const kf = getDimensionScore(record.dimensions, 'kangfu') || '--'
        csvContent += `"${student.name}","${dateStr}",${record.score || 0},${sz},${xl},${jk},${kf}\n`
      })
    })

    // 下载文件
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${selectedTeacherCase.value.name}_数据分析_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    alert('Excel导出成功！')
  } catch (error) {
    console.error('Export error:', error)
    alert('导出失败：' + error.message)
  }
}

// 生成案例分析报告
async function generateCaseReport() {
  if (!selectedTeacherCase.value) return

  try {
    const stats = getCaseStats()
    const students = getCaseStudentRankings()

    if (students.length === 0) {
      alert('暂无数据可生成报告')
      return
    }

    let reportHtml = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${selectedTeacherCase.value.name} - 数据分析报告</title>
  <style>
    body { font-family: 'Microsoft YaHei', Arial, sans-serif; margin: 20px; line-height: 1.6; color: #333; }
    h1 { text-align: center; color: #1e40af; border-bottom: 3px solid #1e40af; padding-bottom: 10px; }
    h2 { color: #1e40af; margin-top: 30px; border-left: 4px solid #1e40af; padding-left: 10px; }
    .header { text-align: center; margin-bottom: 30px; color: #666; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
    .stat-card { padding: 20px; text-align: center; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .stat-blue { background: linear-gradient(135deg, #dbeafe, #bfdbfe); }
    .stat-green { background: linear-gradient(135deg, #dcfce7, #bbf7d0); }
    .stat-orange { background: linear-gradient(135deg, #ffedd5, #fed7aa); }
    .stat-purple { background: linear-gradient(135deg, #ede9fe, #ddd6fe); }
    .stat-number { font-size: 32px; font-weight: bold; }
    .stat-label { color: #666; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th { background: #f3f4f6; padding: 12px; text-align: left; font-weight: bold; }
    td { border: 1px solid #e5e7eb; padding: 10px; }
    .trend-up { color: #16a34a; font-weight: bold; }
    .trend-down { color: #dc2626; font-weight: bold; }
    .trend-stable { color: #6b7280; }
    .dimension-bars { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 20px; }
    .dimension-card { padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; }
    .dimension-bar { height: 30px; background: #f3f4f6; border-radius: 15px; margin-top: 10px; overflow: hidden; }
    .dimension-fill { height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
    .footer { text-align: center; margin-top: 50px; color: #999; font-size: 12px; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <h1>${selectedTeacherCase.value.name}</h1>
  <div class="header">
    <p>发布时间：${formatDate(selectedTeacherCase.value.created_at)}</p>
    <p>发布班级：${selectedTeacherCase.value.classNames || '未知'}</p>
    <p>生成时间：${new Date().toLocaleString()}</p>
  </div>

  <h2>📊 数据概览</h2>
  <div class="stats-grid">
    <div class="stat-card stat-blue">
      <div class="stat-number" style="color: #1e40af;">${stats.studentCount}</div>
      <div class="stat-label">参与学生</div>
    </div>
    <div class="stat-card stat-green">
      <div class="stat-number" style="color: #16a34a;">${stats.totalPractices}</div>
      <div class="stat-label">练习次数</div>
    </div>
    <div class="stat-card stat-orange">
      <div class="stat-number" style="color: #ea580c;">${stats.avgScore}</div>
      <div class="stat-label">平均分</div>
    </div>
    <div class="stat-card stat-purple">
      <div class="stat-number" style="color: #7c3aed;">${stats.highestScore}</div>
      <div class="stat-label">最高分</div>
    </div>
  </div>

  <h2>📈 学生成绩排名</h2>
  <table>
    <thead>
      <tr>
        <th>排名</th>
        <th>学生姓名</th>
        <th>练习次数</th>
        <th>平均分</th>
        <th>最高分</th>
        <th>最低分</th>
        <th>思政维度</th>
        <th>心理慰藉</th>
        <th>健康宣教</th>
        <th>康复训练</th>
        <th>趋势</th>
      </tr>
    </thead>
    <tbody>
`

    students.forEach((student, index) => {
      const trendClass = student.trend === 'up' ? 'trend-up' : student.trend === 'down' ? 'trend-down' : 'trend-stable'
      const trendText = student.trend === 'up' ? '↑ 改善' : student.trend === 'down' ? '↓ 下降' : '→ 稳定'
      
      reportHtml += `
      <tr>
        <td>${index + 1}</td>
        <td>${student.name}</td>
        <td>${student.totalPractices}</td>
        <td><strong>${student.avgScore}</strong></td>
        <td>${student.highestScore}</td>
        <td>${student.lowestScore}</td>
        <td>${student.avgDimensions.sizheng}</td>
        <td>${student.avgDimensions.xinli}</td>
        <td>${student.avgDimensions.jiankang}</td>
        <td>${student.avgDimensions.kangfu}</td>
        <td class="${trendClass}">${trendText}</td>
      </tr>
`
    })

    reportHtml += `
    </tbody>
  </table>

  <h2>🎯 四维度能力分析</h2>
  <div class="dimension-bars">
    <div class="dimension-card">
      <h3>思政维度</h3>
      <div class="dimension-bar">
        <div class="dimension-fill" style="width: ${stats.dimensionStats.sizheng.avg}%; background: #ef4444;">
          ${stats.dimensionStats.sizheng.avg}
        </div>
      </div>
      <p style="font-size: 12px; margin-top: 5px; color: #666;">最高：${stats.dimensionStats.sizheng.max} / 最低：${stats.dimensionStats.sizheng.min}</p>
    </div>
    <div class="dimension-card">
      <h3>心理慰藉</h3>
      <div class="dimension-bar">
        <div class="dimension-fill" style="width: ${stats.dimensionStats.xinli.avg}%; background: #f97316;">
          ${stats.dimensionStats.xinli.avg}
        </div>
      </div>
      <p style="font-size: 12px; margin-top: 5px; color: #666;">最高：${stats.dimensionStats.xinli.max} / 最低：${stats.dimensionStats.xinli.min}</p>
    </div>
    <div class="dimension-card">
      <h3>健康宣教</h3>
      <div class="dimension-bar">
        <div class="dimension-fill" style="width: ${stats.dimensionStats.jiankang.avg}%; background: #22c55e;">
          ${stats.dimensionStats.jiankang.avg}
        </div>
      </div>
      <p style="font-size: 12px; margin-top: 5px; color: #666;">最高：${stats.dimensionStats.jiankang.max} / 最低：${stats.dimensionStats.jiankang.min}</p>
    </div>
    <div class="dimension-card">
      <h3>康复训练</h3>
      <div class="dimension-bar">
        <div class="dimension-fill" style="width: ${stats.dimensionStats.kangfu.avg}%; background: #3b82f6;">
          ${stats.dimensionStats.kangfu.avg}
        </div>
      </div>
      <p style="font-size: 12px; margin-top: 5px; color: #666;">最高：${stats.dimensionStats.kangfu.max} / 最低：${stats.dimensionStats.kangfu.min}</p>
    </div>
  </div>

  <h2>📝 教学建议</h2>
  <div style="padding: 20px; background: #fef9c3; border-radius: 8px; margin-top: 15px;">
`

    // 根据数据生成教学建议
    const suggestions = []
    if (stats.dimensionStats.sizheng.avg < 80) suggestions.push('• 思政维度需要加强，建议在教学中强调关爱老人和尊重老人价值观的重要性')
    if (stats.dimensionStats.xinli.avg < 80) suggestions.push('• 心理慰藉能力有待提升，建议增加情感支持和缓解焦虑的沟通技巧训练')
    if (stats.dimensionStats.jiankang.avg < 80) suggestions.push('• 健康宣教环节需要强化，建议重点训练用药提醒、饮食指导和生活习惯建议能力')
    if (stats.dimensionStats.kangfu.avg < 80) suggestions.push('• 康复训练指导需要完善，建议增加康复训练方法和日常活动指导的实践训练')
    
    const lowPerformers = students.filter(s => s.avgScore < 70)
    if (lowPerformers.length > 0) {
      suggestions.push(`• 共有 ${lowPerformers.length} 名学生平均分低于70分，建议进行针对性辅导：${lowPerformers.map(s => s.name).join('、')}`)
    }

    const improvingStudents = students.filter(s => s.trend === 'up')
    if (improvingStudents.length > 0) {
      suggestions.push(`• 有 ${improvingStudents.length} 名学生成绩呈上升趋势，表现积极：${improvingStudents.map(s => s.name).join('、')}`)
    }

    if (suggestions.length === 0) {
      suggestions.push('• 整体表现良好，四维度能力均衡，建议继续保持现有教学方式')
    }

    suggestions.forEach(suggestion => {
      reportHtml += `<p>${suggestion}</p>`
    })

    reportHtml += `
  </div>

  <div class="footer">
    <p>报告生成时间：${new Date().toLocaleString()}</p>
    <p>阳泉师专康养系AI老人实训系统</p>
  </div>
</body>
</html>
`

    // 打开新窗口显示报告
    const reportWindow = window.open('', '_blank')
    reportWindow.document.write(reportHtml)
    reportWindow.document.close()

  } catch (error) {
    console.error('Generate report error:', error)
    alert('生成报告失败：' + error.message)
  }
}

// 获取分数条样式类
function getScoreBarClass(score) {
  if (score >= 90) return 'bg-green-500'
  if (score >= 80) return 'bg-blue-500'
  if (score >= 70) return 'bg-yellow-500'
  return 'bg-red-500'
}

// 获取分数文本样式类
function getScoreTextClass(score) {
  if (score >= 90) return 'text-green-600'
  if (score >= 80) return 'text-blue-600'
  if (score >= 70) return 'text-yellow-600'
  return 'text-red-600'
}

// 获取趋势样式类
function getTrendClass(value) {
  if (value > 0) return 'text-green-600'
  if (value < 0) return 'text-red-600'
  return 'text-gray-500'
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
    return { totalPractices: 0, avgScore: 0, highestScore: 0, lowestScore: 0, studentCount: classStudents.length, dimensionStats: null, highestScoreStudent: '', lowestScoreStudent: '' }
  }
  
  const scores = classRecords.map(r => r.score).filter(s => s)
  const highestScore = scores.length ? Math.max(...scores) : 0
  const lowestScore = scores.length ? Math.min(...scores) : 0
  
  // 找到最高分和最低分的学生姓名
  const highestRecord = classRecords.find(r => r.score === highestScore)
  const lowestRecord = classRecords.find(r => r.score === lowestScore)
  
  const highestScoreStudent = highestRecord ? (classStudents.find(s => s.id === highestRecord.user_id)?.name || '未知') : ''
  const lowestScoreStudent = lowestRecord ? (classStudents.find(s => s.id === lowestRecord.user_id)?.name || '未知') : ''
  
  // 四维度统计（兼容中文和英文键名）
  const dimensionStats = { sizheng: [], xinli: [], jiankang: [], kangfu: [] }
  classRecords.forEach(r => {
    if (r.dimensions) {
      // 兼容中文键名和英文键名
      const sizheng = r.dimensions.sizheng || r.dimensions['思政维度']
      const xinli = r.dimensions.xinli || r.dimensions['心理慰藉']
      const jiankang = r.dimensions.jiankang || r.dimensions['健康宣教']
      const kangfu = r.dimensions.kangfu || r.dimensions['康复训练']
      
      if (sizheng) dimensionStats.sizheng.push(sizheng)
      if (xinli) dimensionStats.xinli.push(xinli)
      if (jiankang) dimensionStats.jiankang.push(jiankang)
      if (kangfu) dimensionStats.kangfu.push(kangfu)
    }
  })
  
  const avgDimension = (arr) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0
  
  return {
    totalPractices: classRecords.length,
    avgScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
    highestScore: highestScore,
    lowestScore: lowestScore,
    studentCount: classStudents.length,
    highestScoreStudent: highestScoreStudent,
    lowestScoreStudent: lowestScoreStudent,
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

// 加载教师发布的案例
async function loadCases() {
  console.log('🚀 loadCases 被调用!')
  const { data } = await supabase
    .from('cases')
    .select('*')
    .eq('teacher_id', currentUser.value.id)
    .order('created_at', { ascending: false })
  cases.value = data || []
  console.log('✅ 加载案例数量:', cases.value?.length || 0)
  
  // 加载班级数据用于显示班级名称
  if (!classes.value || classes.value.length === 0) {
    console.log('📋 加载班级数据...')
    const { data: classesData } = await supabase.from('classes').select('*')
    if (classesData) {
      classes.value = classesData
      console.log('✅ 班级数据加载成功:', classesData.length, '个')
    }
  }
  
  // 为每个案例设置班级名称
  if (cases.value.length > 0) {
    console.log('📋 开始设置案例班级名称，班级数据:', classes.value)
    cases.value.forEach(c => {
      if (c.class_ids && c.class_ids.length > 0) {
        console.log('📋 案例:', c.name, 'class_ids:', c.class_ids, '类型:', typeof c.class_ids[0])
        console.log('📋 班级数据示例:', classes.value[0])
        const names = c.class_ids.map(id => {
          // 转换为数字进行比较
          const numId = Number(id)
          console.log('📋 查找班级ID:', id, '->', numId)
          const cls = classes.value.find(cls => cls.id === numId || cls.id == numId)
          console.log('📋 查找结果:', cls ? cls.name : '未找到')
          return cls ? cls.name : '未知班级'
        })
        c.classNames = names.join('、')
        console.log('📋 案例班级名称:', c.name, '->', c.classNames)
      } else {
        c.classNames = '未发布'
      }
    })
  }
}

// 加载所有练习记录（老师用）
async function loadAllRecords() {
  console.log('🔍 开始加载所有练习记录...')
  
  // 加载所有练习记录
  const { data, error } = await supabase
    .from('practice_records')
    .select('*, strengths, weaknesses, improvements, referenceanswer, messages')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('❌ 加载练习记录失败:', error)
    allRecords.value = []
    return
  }
  
  // 加载所有学生信息用于关联
  const { data: usersData } = await supabase
    .from('users')
    .select('id, name, class_id')
    .eq('role', 'student')
  
  // 加载所有班级信息
  const { data: classesData } = await supabase
    .from('classes')
    .select('id, name')
  
  const userMap = {}
  if (usersData) {
    usersData.forEach(u => { userMap[u.id] = u })
  }
  
  const classMap = {}
  if (classesData) {
    classesData.forEach(c => { classMap[c.id] = c.name })
  }
  
  // 为每条记录补充学生姓名和班级信息
  if (data) {
    data.forEach(record => {
      const user = userMap[record.user_id]
      record.display_name = user?.name || record.user_name || '未知学生'
      record.student_class = user?.class_id ? (classMap[user.class_id] || '未知班级') : '未分配'
      record.student_name = record.display_name  // 兼容用
    })
  }
  
  console.log('✅ 加载练习记录成功，总数:', data?.length || 0)
  if (data && data.length > 0) {
    console.log('📋 记录示例:', JSON.stringify({
      id: data[0].id,
      user_id: data[0].user_id,
      display_name: data[0].display_name,
      student_class: data[0].student_class,
      case_id: data[0].case_id,
      case_name: data[0].case_name,
      score: data[0].score
    }))
  }
  
  allRecords.value = data || []
  console.log('📊 allRecords.value 长度:', allRecords.value.length)
}

// 分数颜色类
function getScoreClass(score) {
  if (!score) return 'text-gray-400'
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-orange-600'
  return 'text-red-600'
}

// 获取维度分数（兼容中英文键名）
function getDimensionScore(dimensions, key) {
  if (!dimensions) return 0
  const keyMap = {
    'lunli': ['lunli', '伦理操守'],
    'sizheng': ['sizheng', '思政维度', '伦理操守'],
    'xinli': ['xinli', '心理慰藉'],
    'jiankang': ['jiankang', '健康宣教'],
    'kangfu': ['kangfu', '康复训练'],
    'zhihui': ['zhihui', '智慧赋能']
  }
  const keys = keyMap[key] || [key]
  for (const k of keys) {
    if (dimensions[k] !== undefined) return dimensions[k]
  }
  return 0
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

// 简单称呼和无意义词组检测
const simpleGreetingCount = ref(0)
const simpleGreetings = ['你好', '您好', '再见', '拜拜']
const meaninglessWords = ['嗯', '好的', '哦', '啊', '嗯嗯']
const abusiveWords = ['我打你', '骂你', '去死', '滚', '笨蛋', '傻瓜', '白痴', '废物', '垃圾', '猪', '狗']

function validateUserMessage(msg) {
  const trimmedMsg = msg.trim()
  
  // 统一提示
  const dimensionTip = '❌ 请从思政、心理慰藉、健康宣教、康复训练四个维度与老人进行有效沟通！'
  
  // 检测纯数字
  if (/^\d+$/.test(trimmedMsg)) {
    return { valid: false, warning: dimensionTip }
  }
  
  // 检测过于简短的回复（少于2个汉字）
  const chineseCharCount = (trimmedMsg.match(/[\u4e00-\u9fa5]/g) || []).length
  if (chineseCharCount < 2 && chineseCharCount > 0) {
    return { valid: false, warning: dimensionTip }
  }
  
  // 检测侮辱性/恶性词语
  if (abusiveWords.some(word => trimmedMsg.includes(word))) {
    return { valid: false, warning: dimensionTip }
  }
  
  // 检测无意义词组（只能连续出现2次）
  const isMeaningless = meaninglessWords.some(word => trimmedMsg.includes(word))
  if (isMeaningless) {
    const lastWasMeaningless = simpleGreetingCount.value === 1
    simpleGreetingCount.value++
    if (simpleGreetingCount.value > 2) {
      return { valid: false, warning: dimensionTip }
    }
  } else {
    // 如果不是无意义词组，重置计数
    if (simpleGreetingCount.value > 0) {
      simpleGreetingCount.value = 0
    }
  }
  
  // 检测简单称呼（只能连续出现2次）
  const isSimpleGreeting = simpleGreetings.some(word => trimmedMsg.includes(word))
  if (isSimpleGreeting) {
    simpleGreetingCount.value++
    if (simpleGreetingCount.value > 2) {
      return { valid: false, warning: dimensionTip }
    }
  }
  
  return { valid: true }
}

// 检测消息是否与案例场景相关
function checkSceneRelevance(userMsg) {
  const caseInfo = generatedCase.value
  if (!caseInfo || !caseInfo.basicInfo) {
    return { relevant: true }  // 没有案例信息，不做检测
  }
  
  const userMsgLower = userMsg.toLowerCase()
  
  // 提取案例相关关键词
  const keywords = []
  
  // 从老人信息提取关键词
  if (caseInfo.basicInfo.name) {
    keywords.push(caseInfo.basicInfo.name.replace(/[^a-zA-Z\u4e00-\u9fa5]/g, ''))
  }
  if (caseInfo.medicalHistory) {
    const history = typeof caseInfo.medicalHistory === 'object' 
      ? Object.values(caseInfo.medicalHistory).join(' ') 
      : caseInfo.medicalHistory
    // 提取疾病关键词
    const diseaseKeywords = history.match(/[\u4e00-\u9fa5]{2,}/g) || []
    keywords.push(...diseaseKeywords)
  }
  
  // 从 caseProfile 提取关键词
  if (caseProfile.value) {
    if (caseProfile.value.emergency) {
      keywords.push(caseProfile.value.emergency)
    }
    if (caseProfile.value.description) {
      const descKeywords = caseProfile.value.description.match(/[\u4e00-\u9fa5]{2,}/g) || []
      keywords.push(...descKeywords)
    }
    if (caseProfile.value.teachingPoints) {
      const points = caseProfile.value.teachingPoints
      if (Array.isArray(points)) {
        points.forEach(p => {
          if (typeof p === 'string') {
            const ptKeywords = p.match(/[\u4e00-\u9fa5]{2,}/g) || []
            keywords.push(...ptKeywords)
          }
        })
      }
    }
  }
  
  // 通用养老场景关键词
  const sceneKeywords = [
    // 照护相关
    '护理', '照护', '照顾', '护理员', '护工', '大夫', '医生', '护士',
    // 健康相关
    '身体', '健康', '血压', '血糖', '吃药', '服药', '药', '不舒服', '难受', 
    '头疼', '头晕', '腿疼', '膝盖', '关节', '睡眠', '休息', '饮食', '吃饭',
    // 紧急情况
    '急救', '噎食', '摔', '跌', '卡住', '窒息', '心肺复苏', '海姆立克',
    // 心理相关
    '心情', '情绪', '想', '担心', '害怕', '寂寞', '孤独', '聊天', '说话',
    // 康复相关
    '康复', '锻炼', '运动', '练习', '活动', '走路', '起床', '按摩',
    // 日常相关
    '生活', '起居', '洗澡', '吃饭', '喝水', '上厕所', '大小便',
    // 设备相关
    '手环', '床垫', '血压计', '血糖仪', '报警器', '智能',
    // 家庭相关
    '家人', '儿女', '孩子', '老伴', '老伴儿', '老伴儿',
    // 问候相关
    '您好', '你好', '大爷', '奶奶', '爷爷', '叔叔', '阿姨'
  ]
  keywords.push(...sceneKeywords)
  
  // 检测是否有任意关键词匹配
  let hasMatch = false
  for (const keyword of keywords) {
    if (keyword.length >= 2 && userMsgLower.includes(keyword.toLowerCase())) {
      hasMatch = true
      break
    }
  }
  
  if (!hasMatch) {
    return { 
      relevant: false, 
      warning: '⚠️ 请根据案例场景交流，否则将收到批评。请结合老人的病情、需求和紧急情况进行有效沟通。' 
    }
  }
  
  return { relevant: true }
}

</script>

<style>
/* v3.28 使用用户提供的左右装饰图片进行布局优化 */

/* ===== 闪烁动画 ===== */
@keyframes alarmBlink {
  0%, 100% {
    background-color: #fef2f2; /* red-50 */
    border-color: #fca5a5; /* red-300 */
  }
  50% {
    background-color: #fee2e2; /* red-100 */
    border-color: #ef4444; /* red-500 */
  }
}

.alarm-blink {
  animation: alarmBlink 1s ease-in-out infinite;
}
/* 左侧：花草+书法字 | 右侧：护理员推轮椅老人 */
/* ===== 登录页面容器 ===== */
.login-page {
  position: relative;
  min-height: 100vh;
}

/* ===== 登录页面两侧装饰栏 ===== */
.login-page .left-banner,
.login-page .right-banner {
  position: fixed;
  top: 0;
  height: 100vh;
  width: 300px;
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  opacity: 0.95;
  z-index: 0;
}
.login-page .left-banner {
  left: 0;
  background-image: url('/left-banner.png');
}
.login-page .right-banner {
  right: 0;
  background-image: url('/right-banner.png');
}


/* ===== 左侧装饰栏 ===== */
.left-banner {
  position: fixed;
  left: 0;
  top: 72px;
  height: calc(100vh - 72px);
  width: 300px;
  background-image: url('/left-banner.png');
  background-size: cover; /* 自然拉伸填充 */
  background-position: center center; /* 书法字居中显示 */
  background-repeat: no-repeat;
  opacity: 0.95;
  z-index: 0;
}

/* ===== 右侧装饰栏 ===== */
.right-banner {
  position: fixed;
  right: 0;
  top: 72px;
  height: calc(100vh - 72px);
  width: 300px;
  background-image: url('/right-banner.png');
  background-size: cover; /* 跟左侧一样，填充整个区域 */
  background-position: center center;
  background-repeat: no-repeat;
  opacity: 0.95;
  z-index: 0;
}

/* ===== 主内容区 ===== */
.main-content {
  position: relative;
  z-index: 1;
}

/* ===== 响应式布局 - 自适应百分比 ===== */

/* 手机端（<=768px）：隐藏左右装饰栏，主内容全宽 */
@media (max-width: 768px) {
  .left-banner,
  .right-banner {
    display: none;
  }
  
  .main-content {
    padding: 16px;
    width: 100%;
  }
}

/* 平板端（769-1024px）：装饰栏占屏幕12%和14% */
@media (min-width: 769px) and (max-width: 1024px) {
  .left-banner {
    width: 12vw;
    top: 64px;
    height: calc(100vh - 64px);
  }
  .right-banner {
    width: 14vw;
    top: 64px;
    height: calc(100vh - 64px);
  }
  
  .main-content {
    margin-left: calc(12vw + 10px);
    margin-right: calc(14vw + 10px);
    padding: 20px;
  }
}

/* 电脑端（>1024px）：装饰栏按比例自适应 */
@media (min-width: 1025px) {
  .left-banner {
    width: 18vw; /* 屏幕宽度的18% */
  }
  .right-banner {
    width: 22vw; /* 屏幕宽度的22% */
  }
  
  .main-content {
    margin-left: calc(18vw + 10px);
    margin-right: calc(22vw + 10px);
    padding: 24px;
    max-width: calc(100% - 40vw - 20px);
  }
}

/* 大屏幕（>1440px）：装饰栏适当调整 */
@media (min-width: 1441px) {
  .left-banner {
    width: 15vw;
  }
  .right-banner {
    width: 18vw;
  }
  
  .main-content {
    margin-left: calc(15vw + 20px);
    margin-right: calc(18vw + 20px);
    max-width: calc(100% - 33vw - 40px);
  }
}
</style>

