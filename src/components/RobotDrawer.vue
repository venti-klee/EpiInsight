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
            <div class="message-text">{{ message.text }}</div>
            <div class="message-time">{{ message.time }}</div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="input-area">
          <el-input
              v-model="inputText"
              placeholder="请输入您的问题..."
              :style="{
              border: `1px solid ${dvColor[0]}`,
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }"
              @keyup.enter="sendMessage"
          >
            <template #append>
              <el-button
                  :color="dvColor[0]"
                  @click="sendMessage"
                  :disabled="!inputText.trim()"
              >
                发送
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
const messages = ref([
  {
    type: 'ai',
    text: '您好！我是疫情数据分析助手，可以为您提供全球疫情数据查询、趋势分析、国家对比等服务。请问您想了解什么？',
    time: getCurrentTime()
  }
])

// 获取当前时间
function getCurrentTime() {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
}

// 发送消息
const sendMessage = async () => {
  if (!inputText.value.trim()) return

  // 添加用户消息
  const userMessage = {
    type: 'user',
    text: inputText.value,
    time: getCurrentTime()
  }
  messages.value.push(userMessage)

  const userInput = inputText.value
  inputText.value = ''

  // 滚动到底部
  await nextTick()
  scrollToBottom()

  // 模拟AI回复
  setTimeout(() => {
    const aiResponse = generateAIResponse(userInput)
    messages.value.push({
      type: 'ai',
      text: aiResponse,
      time: getCurrentTime()
    })

    nextTick(() => {
      scrollToBottom()
    })
  }, 1000)
}

// 滚动到底部
const scrollToBottom = () => {
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  }
}

// 生成AI回复（模拟）
const generateAIResponse = (input: string) => {
  const responses = {
    '疫情': '根据最新数据，全球累计确诊病例持续关注中。您想了解哪个国家或地区的具体数据？',
    '美国': '美国疫情数据显示累计确诊数量较高，建议关注疫苗接种率和防控措施。',
    '中国': '中国疫情防控成效显著，采取了一系列有效措施控制疫情传播。',
    '趋势': '全球疫情趋势显示部分地区出现波动，建议持续关注官方数据更新。',
    '疫苗': '疫苗接种是防控疫情的重要手段，各国正在积极推进接种工作。',
    '默认': '我主要专注于疫情数据分析，可以为您提供：\n1. 全球疫情数据查询\n2. 国家/地区对比\n3. 趋势分析\n4. 防控建议\n\n请告诉我您具体想了解什么？'
  }

  const lowerInput = input.toLowerCase()
  if (lowerInput.includes('美国') || lowerInput.includes('usa')) return responses.美国
  if (lowerInput.includes('中国') || lowerInput.includes('china')) return responses.中国
  if (lowerInput.includes('趋势') || lowerInput.includes('trend')) return responses.趋势
  if (lowerInput.includes('疫苗') || lowerInput.includes('vaccine')) return responses.疫苗
  if (lowerInput.includes('疫情') || lowerInput.includes('covid')) return responses.疫情

  return responses.默认
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
          white-space: pre-line;
          word-break: break-word;
        }

        .message-time {
          font-size: 12px;
          color: #999;
          margin-top: 5px;
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