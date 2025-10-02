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
    <el-drawer v-model="drawerVisible" title="聊天窗口" size="50%">
      <iframe :src="embedUrl" style="width:100%; height:100%; border:none;" />
    </el-drawer>
  </div>
</template>

<script setup>
import {ref} from "vue";
import {ElDrawer} from "element-plus";
import imageUrl from "@/assets/robot.png"; // 假设 robot.png 在 src/assets 下

// 然后在 setup 中使用
// const imageUrl = imageUrl; // 已经是解析后的 URL 字符串
const size = 120; // 悬浮球大小
// const imageUrl = "@/assets/robot.png"; // 图片路径
const embedUrl = "https://kimi.moonshot.cn/chat/cv810pvftaeb3nbvc7og"; // 内嵌网页链接
const drawerVisible = ref(false);
const top = ref(20); // 初始距离顶部的距离
const left = ref(20); // 初始距离左侧的距离
let isDragging = false; // 是否处于拖拽状态
let shaking = ref(false); // 是否处于抖动状态
let wasDragging = false; // 标记是否进行了拖动操作
const edgeThreshold = 10; // 边缘吸附的阈值
const shakeDuration = 3000; // 抖动持续时间（3秒）

// 边界检查和边缘吸附逻辑
const updatePosition = (newLeft, newTop) => {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  // 边缘吸附逻辑
  if (newLeft < edgeThreshold) {
    newLeft = -size / 2; // 部分隐藏到左侧
  } else if (newLeft > windowWidth - edgeThreshold) {
    newLeft = windowWidth - size / 2; // 部分隐藏到右侧
  }

  if (newTop < edgeThreshold) {
    newTop = -size / 2; // 部分隐藏到顶部
  } else if (newTop > windowHeight - edgeThreshold) {
    newTop = windowHeight - size / 2; // 部分隐藏到底部
  }

  left.value = newLeft;
  top.value = newTop;
};

const startDrag = (event) => {
  event.preventDefault();
  isDragging = true;
  wasDragging = false; // 重置拖动标志

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

  // 更新悬浮球的位置
  updatePosition(currentX - size / 2, currentY - size / 2);

  wasDragging = true; // 标记为已经拖动
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
  // 只有在未拖动的情况下才触发点击事件
  if (!wasDragging) {
    drawerVisible.value = !drawerVisible.value;
  }
  wasDragging = false; // 重置拖动标志
};

const showFullBall = () => {
  // 如果悬浮球处于隐藏状态，则弹出完整形态并抖动
  if (left.value < 0 || left.value > window.innerWidth - size / 2 ||
      top.value < 0 || top.value > window.innerHeight - size / 2) {
    left.value = Math.max(0, Math.min(window.innerWidth - size, left.value));
    top.value = Math.max(0, Math.min(window.innerHeight - size, top.value));
    shaking.value = true;

    // 3秒后停止抖动
    setTimeout(() => {
      shaking.value = false;
    }, shakeDuration);
  }
};

const hideBall = () => {
  // 当鼠标离开时，恢复隐藏状态
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
  transition: all 0.1s ease; /* 减少过渡时间以加快响应 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

/* 抖动动画 */
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
</style>