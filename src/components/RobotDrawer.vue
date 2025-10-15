<template>
  <div class="robot-drawer">
    <!-- 聊天窗口内容 -->
    <div class="chat-container">
      <!-- 聊天消息区域 -->
      <div class="chat-messages" ref="messagesRef">
        <div
            v-for="(message, index) in messages"
            :key="index"
            :class="['message', message.type]"
        >
          <div class="message-avatar">
            <div
                v-if="message.type === 'ai'"
                class="avatar-circle"
                :style="{ backgroundColor: dvColor[0] }"
            >
              AI
            </div>
            <div
                v-else
                class="avatar-circle user-avatar"
            >
              用户
            </div>
          </div>
          <div class="message-content">
            <div class="message-text">
              {{ message.text }}
              <span v-if="message.isStreaming" class="streaming-cursor">|</span>
            </div>
            <div class="message-time">{{ message.time }}</div>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="isLoading" class="loading-message">
          <div class="message-avatar">
            <div class="avatar-circle" :style="{ backgroundColor: dvColor[0] }">
              AI
            </div>
          </div>
          <div class="message-content">
            <div class="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="input-area">
          <el-input
              v-model="inputText"
              placeholder="请输入您关于疫情数据的问题..."
              :style="{
              border: `1px solid ${dvColor[0]}`,
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }"
              @keyup.enter="sendMessage"
              :disabled="isLoading"
          >
            <template #append>
              <el-button
                  :color="dvColor[0]"
                  @click="sendMessage"
                  :disabled="!inputText.trim() || isLoading"
                  :loading="isLoading"
              >
                {{ isLoading ? '思考中...' : '发送' }}
              </el-button>
            </template>
          </el-input>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick } from 'vue'

// 定义props
interface Props {
  dvColor?: string[]
  sysBackgroundColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  dvColor: () => ['#4fd2dd', '#235fa7'],
  sysBackgroundColor: 'rgb(255, 255, 255, .1)'
})

// 响应式数据
const messagesRef = ref<HTMLElement>()
const inputText = ref('')
const isLoading = ref(false)
const messages = ref([
  {
    type: 'ai',
    text: '您好！我是疫情数据分析助手，基于通义千问模型。我可以为您提供全球疫情数据查询、趋势分析、国家对比等服务。请问您想了解什么？',
    time: getCurrentTime(),
    isStreaming: false
  }
])

// 获取当前时间
function getCurrentTime() {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
}

// 获取当前日期（用于疫情数据查询）
function getCurrentDate() {
  const now = new Date()
  return now.toISOString().split('T')[0] // 格式：YYYY-MM-DD
}

// 从Flask后端获取疫情数据
async function fetchCovidData(date?: string) {
  try {
    const targetDate = date || getCurrentDate()
    const response = await fetch('http://localhost:5000/get_covid_stats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ date: targetDate })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('获取疫情数据失败:', error)
    return null
  }
}

// 获取可用日期列表
async function fetchAvailableDates() {
  try {
    const response = await fetch('http://localhost:5000/get_available_dates')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('获取可用日期失败:', error)
    return { available_dates: [] }
  }
}

// 获取国家排名
async function fetchCountryRankings() {
  try {
    const response = await fetch('http://localhost:5000/country_rankings')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('获取国家排名失败:', error)
    return null
  }
}

// 获取全球趋势数据
async function fetchGlobalTrend(startDate: string, endDate: string) {
  try {
    const response = await fetch('http://localhost:5000/global_daily_trend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ start_date: startDate, end_date: endDate })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('获取全球趋势失败:', error)
    return null
  }
}

// 获取国家趋势数据
async function fetchCountryTrend(country: string, startDate: string, endDate: string) {
  try {
    const response = await fetch('http://localhost:5000/country_daily_trend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        country: country,
        start_date: startDate,
        end_date: endDate
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('获取国家趋势失败:', error)
    return null
  }
}

// 调用通义千问API
async function callTongyiAPI(userInput: string, covidData?: any) {
  try {
    // 构建系统提示词，包含疫情数据上下文
    const systemPrompt = `你是一个专业的疫情数据分析助手。基于用户的问题和提供的疫情数据，给出准确、专业的回答。

可用数据：
${covidData ? JSON.stringify(covidData, null, 2) : '暂无数据'}

回答要求：
1. 基于提供的数据回答问题
2. 如果数据不足，请说明
3. 用中文回答，保持专业且友好
4. 可以给出趋势分析和建议`

    const response = await fetch('http://localhost:5000/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userInput }
        ]
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.response || '抱歉，我暂时无法回答这个问题。'
  } catch (error) {
    console.error('调用通义API失败:', error)
    // 如果API调用失败，使用本地生成的回复
    return generateLocalResponse(userInput, covidData)
  }
}

// 本地生成的回复（备用）
function generateLocalResponse(input: string, covidData?: any) {
  const lowerInput = input.toLowerCase()

  if (lowerInput.includes('确诊') || lowerInput.includes('病例')) {
    if (covidData?.global_stats) {
      const stats = covidData.global_stats
      return `根据最新数据（${covidData.date}）：
• 全球累计确诊：${stats.total_confirmed?.toLocaleString() || '未知'} 例
• 今日新增确诊：${stats.new_confirmed?.toLocaleString() || '未知'} 例
• 累计死亡：${stats.total_deaths?.toLocaleString() || '未知'} 例
• 累计治愈：${stats.total_recovered?.toLocaleString() || '未知'} 例

疫情形势依然需要关注，建议继续做好防护措施。`
    }
    return '目前无法获取最新的确诊数据，请稍后再试。'
  }

  if (lowerInput.includes('趋势') || lowerInput.includes('变化')) {
    return '我可以为您分析全球或特定国家的疫情趋势。请告诉我您想了解哪个国家或地区，以及具体的时间范围。'
  }

  if (lowerInput.includes('国家') || lowerInput.includes('排名')) {
    if (covidData?.top_50_countries) {
      const topCountries = covidData.top_50_countries.slice(0, 5)
      let response = '累计确诊前5名的国家：\n'
      topCountries.forEach((country: any, index: number) => {
        response += `${index + 1}. ${country.country}: ${country.confirmed?.toLocaleString() || '未知'} 例\n`
      })
      return response
    }
    return '目前无法获取国家排名数据。'
  }

  if (lowerInput.includes('防护') || lowerInput.includes('建议')) {
    return `疫情防控建议：
1. 勤洗手，使用肥皂或含酒精的洗手液
2. 佩戴口罩，特别是在公共场所
3. 保持社交距离
4. 避免触摸眼、鼻、口
5. 如有症状及时就医
6. 接种疫苗，增强免疫力`
  }

  return '我主要专注于疫情数据分析，可以为您提供：\n1. 全球疫情数据查询\n2. 国家/地区对比\n3. 趋势分析\n4. 防控建议\n\n请告诉我您具体想了解什么？'
}

// 分析用户意图并获取相关数据
async function analyzeIntentAndFetchData(userInput: string) {
  const lowerInput = userInput.toLowerCase()

  // 获取基础数据
  const covidData = await fetchCovidData()

  // 根据用户意图获取更详细的数据
  if (lowerInput.includes('趋势') || lowerInput.includes('变化')) {
    // 计算最近30天的趋势
    const endDate = getCurrentDate()
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    if (lowerInput.includes('美国') || lowerInput.includes('usa')) {
      const trendData = await fetchCountryTrend('US', startDate, endDate)
      return { ...covidData, us_trend: trendData }
    } else if (lowerInput.includes('中国') || lowerInput.includes('china')) {
      const trendData = await fetchCountryTrend('China', startDate, endDate)
      return { ...covidData, china_trend: trendData }
    } else {
      const trendData = await fetchGlobalTrend(startDate, endDate)
      return { ...covidData, global_trend: trendData }
    }
  }

  if (lowerInput.includes('排名') || lowerInput.includes('前') || lowerInput.includes('top')) {
    const rankings = await fetchCountryRankings()
    return { ...covidData, rankings }
  }

  return covidData
}

// 发送消息
const sendMessage = async () => {
  if (!inputText.value.trim() || isLoading.value) return

  const userInput = inputText.value
  inputText.value = ''
  isLoading.value = true

  // 添加用户消息
  const userMessage = {
    type: 'user',
    text: userInput,
    time: getCurrentTime(),
    isStreaming: false
  }
  messages.value.push(userMessage)

  // 滚动到底部
  await nextTick()
  scrollToBottom()

  try {
    // 分析用户意图并获取相关数据
    const covidData = await analyzeIntentAndFetchData(userInput)

    // 添加AI消息（初始为空，用于流式显示）
    const aiMessageIndex = messages.value.length
    messages.value.push({
      type: 'ai',
      text: '',
      time: getCurrentTime(),
      isStreaming: true
    })

    // 调用通义API
    const response = await callTongyiAPI(userInput, covidData)

    // 模拟流式显示效果
    await typewriterEffect(response, aiMessageIndex)

  } catch (error) {
    console.error('发送消息失败:', error)
    messages.value.push({
      type: 'ai',
      text: '抱歉，我暂时无法处理您的请求。请稍后再试。',
      time: getCurrentTime(),
      isStreaming: false
    })
  } finally {
    isLoading.value = false
    await nextTick()
    scrollToBottom()
  }
}

// 打字机效果
const typewriterEffect = async (text: string, messageIndex: number) => {
  return new Promise<void>((resolve) => {
    let index = 0
    const speed = 20 // 打字速度（毫秒）

    const timer = setInterval(() => {
      if (index < text.length) {
        messages.value[messageIndex].text += text.charAt(index)
        index++
        scrollToBottom()
      } else {
        clearInterval(timer)
        messages.value[messageIndex].isStreaming = false
        resolve()
      }
    }, speed)
  })
}

// 滚动到底部
const scrollToBottom = () => {
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  }
}

// 组件挂载时滚动到底部
onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped lang="scss">
.robot-drawer {
  height: 100% !important;
  width: 100% !important;
  background: rgba(0, 0, 0, 0.9);
  margin: 0 !important;
  padding: 0 !important;
  box-sizing: border-box;

  .chat-container {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;

    .chat-messages {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      height: 100%;
      margin: 0;
      box-sizing: border-box;

      .message {
        display: flex;
        margin-bottom: 20px;
        animation: fadeIn 0.3s ease-in;

        &.user {
          flex-direction: row-reverse;

          .message-content {
            align-items: flex-end;
            margin-right: 15px;
            margin-left: 0;
          }

          .message-text {
            background: v-bind('dvColor[0]');
            color: #fff;
          }
        }

        &.ai {
          .message-content {
            align-items: flex-start;
            margin-left: 15px;
            margin-right: 0;
          }

          .message-text {
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
            white-space: pre-line;
          }
        }

        .message-avatar {
          flex-shrink: 0;
        }

        .avatar-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 12px;
          font-weight: bold;

          &.user-avatar {
            background-color: #409EFF;
          }
        }

        .message-content {
          display: flex;
          flex-direction: column;
          max-width: 70%;
        }

        .message-text {
          padding: 12px 16px;
          border-radius: 18px;
          line-height: 1.4;
          word-break: break-word;
          position: relative;
        }

        .streaming-cursor {
          animation: blink 1s infinite;
          color: v-bind('dvColor[0]');
          font-weight: bold;
        }

        .message-time {
          font-size: 12px;
          color: #999;
          margin-top: 5px;
        }
      }

      .loading-message {
        display: flex;
        margin-bottom: 20px;

        .message-avatar {
          flex-shrink: 0;
        }

        .message-content {
          margin-left: 15px;
        }

        .loading-dots {
          display: flex;
          gap: 4px;

          span {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: v-bind('dvColor[0]');
            animation: bounce 1.4s infinite ease-in-out;

            &:nth-child(1) { animation-delay: -0.32s; }
            &:nth-child(2) { animation-delay: -0.16s; }
          }
        }
      }

      .input-area {
        margin-top: auto;
        padding-top: 20px;

        :deep(.el-input-group__append) {
          background: v-bind('dvColor[0]');
          border: none;

          .el-button {
            color: #fff;
            border: none;
          }
        }
      }
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

/* 滚动条样式 */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.chat-messages::-webkit-scrollbar-thumb {
  background: v-bind('dvColor[0]');
  border-radius: 3px;
}
</style>