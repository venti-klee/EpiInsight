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

    <!-- 抽屉：恢复自带关闭按钮，移除冗余外层容器 -->
    <el-drawer
        v-model="drawerVisible"
        size="50%"
        class="custom-chat-drawer"

    >
    <!-- 头部插槽：仅保留图标和标题，关闭按钮用组件自带 -->
    <template #header>
      <div class="drawer-header">
        <el-icon :size="24" style="margin-right: 10px; color: #1a1a2e">
          <ChatDotRound/>
        </el-icon>
        <span>AI 智能助手</span>
      </div>
    </template>

    <!-- 使用边框装饰包裹聊天内容 -->
    <dv-border-box-10 :color="dvColor" class="chat-border-container">
      <RobotDrawer
          :dv-color="dvColor"
          :sys-background-color="sysBackgroundColor"
      />
    </dv-border-box-10>
    </el-drawer>
  </div>
</template>

<script setup>
import {ref, inject} from "vue";
import {ElDrawer, ElIcon} from "element-plus"; // 移除自定义关闭按钮的ElButton
import {ChatDotRound} from "@element-plus/icons-vue";
import RobotDrawer from './RobotDrawer.vue';

// 从父组件获取颜色配置
const dvColor = inject('dvColor', ['#4fd2dd', '#235fa7']);
const sysBackgroundColor = inject('sysBackgroundColor', 'rgb(255, 255, 255, .1)');

// 图片路径
const imageUrl = new URL('@/assets/robot.png', import.meta.url).href;

// 悬浮球与抽屉状态管理
const size = 120;
const drawerVisible = ref(false);
const top = ref(20);
const left = ref(20);
let isDragging = false;
let shaking = ref(false);
let wasDragging = false;
const edgeThreshold = 10;
const shakeDuration = 3000;

// 位置更新方法
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

// 拖拽相关方法
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

// 抽屉切换与悬浮球交互
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
/* 悬浮球样式 */
.floating-ball {
  position: fixed;
  background-size: cover;
  background-position: center;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
}

/* 悬浮球抖动动画 */
@keyframes shake {
  0%, 100% {
    transform: translate(0, 0);
  }
  25% {
    transform: translate(-3px, -3px);
  }
  50% {
    transform: translate(3px, 3px);
  }
  75% {
    transform: translate(-3px, 3px);
  }
}

/* 抽屉根容器样式：穿透覆盖Element Plus默认样式 */
:deep(.custom-chat-drawer .el-drawer) {
  border-radius: 12px !important; /* 圆角优化 */
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35) !important; /* 增强阴影立体感 */
  overflow: hidden !important; /* 避免内容溢出圆角 */
  margin: 0 !important;
  padding: 0 !important;
  border: none !important; /* 移除默认边框 */

}

/* 抽屉头部样式：包含自带关闭按钮 */
:deep(.custom-chat-drawer .el-drawer__header) {
  background: v-bind('sysBackgroundColor') !important; /* 继承父组件背景 */
  border-bottom: 1px solid rgba(255, 255, 255, 0.15) !important; /* 淡色分割线 */
  margin: 0 !important; /* 清除默认margin */
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
}

/* 头部标题容器样式 */
:deep(.drawer-header) {
  display: flex;
  align-items: center;

  padding: 0 !important;
}

:deep(.drawer-header span) {
  color: #8B5CF6 !important;
  font-size: 18px !important;
  font-weight: 600 !important;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
}

/* 优化自带关闭按钮样式 */
:deep(.custom-chat-drawer .el-drawer__close-btn) {
  color: #fff !important; /* 白色图标 */
  opacity: 0.8 !important; /* 初始半透明 */
  transition: all 0.2s ease !important;
  font-size: 18px !important; /* 调整图标大小 */
}

:deep(.custom-chat-drawer .el-drawer__close-btn:hover) {
  opacity: 1 !important; /*  hover时完全显示 */
  transform: scale(1.1) !important; /* 轻微放大，增强交互感 */
  background: rgba(255, 255, 255, 0.1) !important; /* 淡色背景 */
  border-radius: 50% !important; /* 圆形背景 */
  width: 32px !important;
  height: 32px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

/* 抽屉主体样式：确保无内边距，背景正常 */
:deep(.custom-chat-drawer .el-drawer__body) {
  padding: 0 !important; /* 清除默认20px内边距 */
  margin: 0 !important; /* 清除默认margin */
  background: linear-gradient(135deg, #1a2980 0%, #26d0ce 100%) !important; /* 科技感渐变背景 */
  height: calc(100% - 60px) !important; /* 减去头部高度，避免内容溢出 */
  width: 100% !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
}
/* 在组件的 <style scoped> 中添加 */
:deep(.el-drawer__header) {
  /* 覆盖默认的底部外边距（原32px导致头部与内容间距过大） */
  margin-bottom: 0 !important;
  /* 调整内边距（原使用变量，改为具体数值） */
  padding: 16px 20px !important;

  /* 保持弹性布局，但优化对齐方式 */
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important; /* 让标题和关闭按钮左右分开 */

  /* 自定义颜色和背景（解决白色背景问题） */
  color: #fff !important; /* 白色文字，适配深色背景 */
  background: linear-gradient(45deg, #fff, #8B5CF6);

  /* 添加底部边框，区分头部和内容区 */
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
}
/* DataV边框容器样式 */
:deep(.chat-border-container) {
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
}

/* DataV边框组件样式 */
:deep(.dv-border-box-10) {
  width: 100% !important;
  height: 100% !important;
  padding: 0 !important;
  margin: 0 !important;
  box-sizing: border-box !important;
  opacity: 0.92 !important; /* 微调透明度，避免过暗 */
}
</style>