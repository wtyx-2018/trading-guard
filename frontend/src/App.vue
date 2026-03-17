<script setup>
import { ref, computed } from 'vue'
import { marked } from 'marked'

// 1. 定义响应式状态
const fomoScore = ref(50)
const anxietyScore = ref(50)
const intendedAction = ref('')
const aiModel = ref('gemini') // 默认换成你截图里选的 Gemini

const loading = ref(false)
const aiAdvice = ref('')

// 将 AI 返回的 Markdown 文本实时解析为 HTML
const parsedAdvice = computed(() => {
  if (!aiAdvice.value) return ''
  return marked.parse(aiAdvice.value)
})

// 2. 提交数据的函数
const handleAnalyze = async () => {
  if (!intendedAction.value.trim()) {
    alert('请先输入你打算做什么交易！')
    return
  }

  loading.value = true
  aiAdvice.value = '' // 清空上次的结果

  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/trading/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fomoScore: fomoScore.value,
        anxietyScore: anxietyScore.value,
        intendedAction: intendedAction.value,
        aiModel: aiModel.value
      }),
    })

    const result = await response.json()

    if (result.success) {
      aiAdvice.value = result.data.aiAdvice
    } else {
      alert('后端报错了: ' + result.error)
    }
  } catch (error) {
    alert('网络请求失败，请检查后端服务是否在运行')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="app-wrapper">
    <div class="container">
      <h1 class="title">🛑 交易冷静器</h1>
      
      <div class="form-group center-label">
        <label>🔥 贪婪/FOMO 指数: {{ fomoScore }}</label>
        <input type="range" min="0" max="100" v-model.number="fomoScore" class="full-width slider" />
      </div>

      <div class="form-group center-label">
        <label>😰 恐慌/焦虑 指数: {{ anxietyScore }}</label>
        <input type="range" min="0" max="100" v-model.number="anxietyScore" class="full-width slider" />
      </div>

      <div class="form-group center-label">
        <label>你想做什么交易操作？</label>
        <textarea 
          rows="3" 
          v-model="intendedAction"
          placeholder="例如：我要满仓 100 倍做多比特币..."
          class="full-width p-2 dark-input"
        ></textarea>
      </div>

      <div class="form-group center-label">
        <label>选择骂醒你的 AI：</label>
        <select v-model="aiModel" class="ml-2 dark-select">
          <option value="gemini">Gemini (严谨)</option>
          <option value="deepseek">DeepSeek (犀利)</option>
        </select>
      </div>

      <button 
        @click="handleAnalyze" 
        :disabled="loading"
        class="submit-btn"
        :class="{ 'btn-disabled': loading }"
      >
        {{ loading ? 'AI 正在准备大记忆恢复术...' : '评估我的冲动！' }}
      </button>

      <div v-if="aiAdvice" class="result-box">
        <h3 class="result-title">👨‍⚖️ 纪律委员判决：</h3>
        <div class="advice-text" v-html="parsedAdvice"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 全局暗黑背景包裹器 */
.app-wrapper {
  min-height: 100vh;
  background-color: #1a1a1b; /* 还原截图的深灰背景 */
  color: #e5e7eb;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 50px;
}

.container {
  width: 100%;
  max-width: 500px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  padding: 0 20px;
}

.title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 40px;
  color: #ffffff;
}

.center-label {
  text-align: center;
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  font-size: 1.1rem;
  color: #d1d5db;
}

.full-width {
  width: 100%;
  display: block;
  margin-top: 15px;
}

/* 滑块基础样式 */
.slider {
  accent-color: #60a5fa; /* 还原截图里的蓝色滑块 */
  cursor: pointer;
}

.p-2 {
  padding: 12px;
  box-sizing: border-box;
}

.ml-2 {
  margin-left: 8px;
}

/* 输入框和下拉框暗黑适配 */
.dark-input, .dark-select {
  background-color: #2d2d30;
  border: 1px solid #4b5563;
  color: #ffffff;
  border-radius: 6px;
  font-size: 1rem;
}

.dark-input:focus, .dark-select:focus {
  outline: none;
  border-color: #ef4444;
}

.submit-btn {
  width: 100%;
  padding: 16px;
  background-color: #ef4444; /* 还原截图里的红色按钮 */
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.submit-btn:hover:not(:disabled) {
  background-color: #dc2626;
  transform: translateY(-2px);
}

.btn-disabled {
  background-color: #4b5563 !important;
  color: #9ca3af !important;
  cursor: not-allowed;
  transform: none;
}

/* 结果面板 */
.result-box {
  margin-top: 40px;
  padding: 25px;
  background-color: #fee2e2; /* 还原截图里的淡粉色底 */
  color: #1f2937; /* 里面的文字用深灰色保证阅读体验 */
  border-left: 6px solid #ef4444;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.result-title {
  margin-top: 0;
  color: #991b1b;
  font-size: 1.3rem;
  text-align: center;
  margin-bottom: 20px;
}

.advice-text {
  line-height: 1.8;
  font-size: 1.1rem;
}

/* ⚠️ 核心魔法：使用 :deep 穿透修改 marked 生成的 HTML 标签样式 */
.advice-text :deep(strong) {
  color: #b91c1c; /* 让 AI 强调的词变成深红色 */
  font-weight: 900;
  background-color: #fecaca;
  padding: 2px 4px;
  border-radius: 4px;
}

.advice-text :deep(p) {
  margin-bottom: 1em;
}
</style>