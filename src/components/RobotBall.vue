<template>
  <div>
    <!-- 悬浮球 -->
    <div
        class="floating-ball"
        :style="{
        top: `${top}px`,
        left: `${left}px`,
        width: `${size}px`,
        height: `${size}px`,
        backgroundImage: `url(${imageUrl})`,
        animation: shaking ? 'shake 0.1s infinite' : 'none'
      }"
        @mousedown="startDrag"
        @touchstart="startDrag"
        @mouseenter="showFullBall"
        @mouseleave="hideBall"
        @click="toggleDrawer"
    ></div>

    <!-- 抽屉 -->
    <div style="margin-bottom: 0;padding: 0;">
    <el-drawer
        v-model="drawerVisible"
        title="聊天窗口"
        size="50%"
        class="custom-chat-drawer"
        style="margin: 0;padding: 0"

    >
      <template #header style="margin: 0">
        <div class="drawer-header"  style="margin: 0;padding: 0">
          <el-icon :size="20" style="margin-right: 10px;">
            <ChatDotRound />
          </el-icon>
          智能聊天助手
        </div>
      </template>

      <!-- 使用边框装饰包裹聊天内容 -->
      <dv-border-box-10 :color="dvColor" class="chat-border-container" style="margin: 0;padding: 0">
        <RobotDrawer
            :dv-color="dvColor"
            :sys-background-color="sysBackgroundColor"
            style="margin: 0;padding: 0"
        />
      </dv-border-box-10>
    </el-drawer>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from "vue";
import { ElDrawer } from "element-plus";
import { ChatDotRound } from '@element-plus/icons-vue';
import RobotDrawer from './RobotDrawer.vue';

// 从父组件获取颜色配置
const dvColor = inject('dvColor', ['#4fd2dd', '#235fa7']);
const sysBackgroundColor = inject('sysBackgroundColor', 'rgb(255, 255, 255, .1)');

// 图片路径
const imageUrl = new URL('@/assets/robot.png', import.meta.url).href;

const size = 120;
const drawerVisible = ref(false);
const top = ref(20);
const left = ref(20);
let isDragging = false;
let shaking = ref(false);
let wasDragging = false;
const edgeThreshold = 10;
const shakeDuration = 3000;

// ... 其他方法保持不变（startDrag, dragging, stopDrag, toggleDrawer, showFullBall, hideBall）
const updatePosition = (newLeft, newTop) => {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  if (newLeft < edgeThreshold) {
    newLeft = -size / 2;
  } else if (newLeft > windowWidth - edgeThreshold) {
    newLeft = windowWidth - size / 2;
  }

  if (newTop < edgeThreshold) {
    newTop = -size / 2;
  } else if (newTop > windowHeight - edgeThreshold) {
    newTop = windowHeight - size / 2;
  }

  left.value = newLeft;
  top.value = newTop;
};

const startDrag = (event) => {
  event.preventDefault();
  isDragging = true;
  wasDragging = false;

  document.addEventListener("mousemove", dragging);
  document.addEventListener("touchmove", dragging, {passive: false});
  document.addEventListener("mouseup", stopDrag);
  document.addEventListener("touchend", stopDrag);
};

const dragging = (event) => {
  if (!isDragging) return;

  let currentX, currentY;

  if (event.type === "touchmove") {
    currentX = event.touches[0].clientX;
    currentY = event.touches[0].clientY;
  } else {
    currentX = event.clientX;
    currentY = event.clientY;
  }

  updatePosition(currentX - size / 2, currentY - size / 2);
  wasDragging = true;
  event.preventDefault();
};

const stopDrag = () => {
  isDragging = false;

  document.removeEventListener("mousemove", dragging);
  document.removeEventListener("touchmove", dragging);
  document.removeEventListener("mouseup", stopDrag);
  document.removeEventListener("touchend", stopDrag);
};

const toggleDrawer = () => {
  if (!wasDragging) {
    drawerVisible.value = !drawerVisible.value;
  }
  wasDragging = false;
};

const showFullBall = () => {
  if (left.value < 0 || left.value > window.innerWidth - size / 2 ||
      top.value < 0 || top.value > window.innerHeight - size / 2) {
    left.value = Math.max(0, Math.min(window.innerWidth - size, left.value));
    top.value = Math.max(0, Math.min(window.innerHeight - size, top.value));
    shaking.value = true;

    setTimeout(() => {
      shaking.value = false;
    }, shakeDuration);
  }
};

const hideBall = () => {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  if (left.value < edgeThreshold) {
    left.value = -size / 2;
  } else if (left.value > windowWidth - edgeThreshold) {
    left.value = windowWidth - size / 2;
  }

  if (top.value < edgeThreshold) {
    top.value = -size / 2;
  } else if (top.value > windowHeight - edgeThreshold) {
    top.value = windowHeight - size / 2;
  }
};
</script>

<style scoped>
.floating-ball {
  position: fixed;
  background-size: cover;
  background-position: center;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.1s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

@keyframes shake {
  0%, 100% {
    transform: translate(0, 0);
  }
  25% {
    transform: translate(-5px, -5px);
  }
  50% {
    transform: translate(5px, 5px);
  }
  75% {
    transform: translate(-5px, 5px);
  }
}

/* 抽屉样式 */
:deep(.custom-chat-drawer) {
  .el-drawer__header {
    margin-bottom: 0;
    padding: 15px 20px;
    background: v-bind('sysBackgroundColor');
    border-bottom: 1px solid v-bind('dvColor[0]');

    .drawer-header {
      display: flex;
      align-items: center;
      color: #fff;
      font-weight: 900;
      font-size: 18px;
    }
  }

  .el-drawer__body {
    padding: 0;
    background: rgba(0, 0, 0, 0.9);
    height: 100%;
    overflow: hidden;
  }

  .chat-border-container {
    width: 100%;
    height: 100%;
    position: relative;
  }
}

</style>