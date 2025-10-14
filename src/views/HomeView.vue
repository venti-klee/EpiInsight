<!-- HomeView.vue -->
<template>
  <div class="home" ref="homeContainer">
    <!-- 球形组件 - 第一屏 -->
    <section class="screen sphere-section">
      <Sphere />
    </section>

    <!-- 世界地图组件 - 第二屏 -->
    <section class="screen map-section">
      <WorldMap />
    </section>

    <!-- 折线图组件 - 第三屏 -->
    <section class="screen chart-section">
      <!-- 每日新增图 - 左上角 -->
      <div class="chart-left-top">
        <DailyNewChart />
      </div>

      <!-- 每日新增图 - 右上角 -->
      <div class="chart-right-top">
        <PatientRatioChart />
      </div>

      <!-- 国家趋势图 - 左下角 -->
      <div class="chart-left-bottom">
        <CountryTrendChart />
      </div>

      <!-- 国家排名图 - 右下角 -->
      <div class="chart-right-bottom">
        <CountryRankingChart />
      </div>
    </section>

    <!-- 导航指示器 -->
    <div class="nav-indicator">
      <div
          v-for="(screen, index) in screens"
          :key="index"
          class="indicator-dot"
          :class="{ active: currentScreen === index }"
          @click="scrollToScreen(index)"
      ></div>
    </div>

    <!-- 滚动提示 -->
    <div class="scroll-hint" v-show="currentScreen < 2">
      <div class="scroll-arrow"></div>
      <span>向下滚动</span>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Sphere from './Sphere.vue';
import WorldMap from "@/components/WorldMap.vue";
import DailyNewChart from "@/components/DailyNewChart.vue";
import CountryTrendChart from "@/components/CountryTrendChart.vue";
import CountryRankingChart from "@/components/CountryRankingChart.vue";
import PatientRatioChart from "@/components/PatientRatioChart.vue"; // 导入新组件

const homeContainer = ref<HTMLElement>();
const currentScreen = ref(0);
const screens = [0, 1, 2]; // 三屏

// 滚动到指定屏幕
const scrollToScreen = (index: number) => {
  if (homeContainer.value) {
    const screenHeight = window.innerHeight;
    homeContainer.value.scrollTo({
      top: index * screenHeight,
      behavior: 'smooth'
    });
  }
};

// 处理滚动事件
const handleScroll = () => {
  if (homeContainer.value) {
    const scrollTop = homeContainer.value.scrollTop;
    const screenHeight = window.innerHeight;
    currentScreen.value = Math.round(scrollTop / screenHeight);
  }
};

// 处理键盘事件
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    const nextScreen = Math.min(currentScreen.value + 1, screens.length - 1);
    scrollToScreen(nextScreen);
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    const prevScreen = Math.max(currentScreen.value - 1, 0);
    scrollToScreen(prevScreen);
  }
};

// 处理窗口大小变化
const handleResize = () => {
  // 窗口大小变化时重新计算位置
  scrollToScreen(currentScreen.value);
};

onMounted(() => {
  if (homeContainer.value) {
    homeContainer.value.addEventListener('scroll', handleScroll);
  }
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  if (homeContainer.value) {
    homeContainer.value.removeEventListener('scroll', handleScroll);
  }
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('resize', handleResize);
});
</script>

<style lang="scss" scoped>
.home {
  height: 100vh;
  width: 100vw;
  color: #fff;
  background-color: #000;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;

  /* 隐藏滚动条但保持滚动功能 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */

  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari and Opera */
  }

  /* 每个屏幕的通用样式 */
  .screen {
    height: 100vh;
    width: 100vw;
    scroll-snap-align: start;
    scroll-snap-stop: always;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* 球体部分 - 第一屏 */
  .sphere-section {
    z-index: 1;
    background: linear-gradient(135deg, #000000 0%, #1a1a2e 50%, #16213e 100%);
  }

  /* 地图部分 - 第二屏 */
  .map-section {
    z-index: 1;
    background: linear-gradient(135deg, #000000 0%, #0f3460 50%, #1a1a2e 100%);

    /* 确保地图容器正确显示 */
    :deep(.world-map-container) {
      width: 100%;
      height: 100%;
      position: relative;
    }
  }

  /* 折线图部分 - 第三屏 */
  .chart-section {
    z-index: 1;
    background: linear-gradient(135deg, #000000 0%, #16213e 50%, #0f3460 100%);
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    grid-template-areas:
      "left-top right-top"
      "left-bottom right-bottom";
    gap: 20px;
    padding: 20px;
    box-sizing: border-box;
    align-items: stretch;
    justify-items: stretch;

    /* 确保图表容器正确显示 */
    :deep(.chart-container) {
      width: 100%;
      height: 100%;
    }
  }

  /* 累计趋势图 - 左上角 */
  .chart-left-top {
    grid-area: left-top;
    position: relative;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    overflow: hidden;
  }

  /* 每日新增图 - 右上角 */
  .chart-right-top {
    grid-area: right-top;
    position: relative;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    overflow: hidden;
  }

  /* 国家趋势图 - 左下角 */
  .chart-left-bottom {
    grid-area: left-bottom;
    position: relative;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    overflow: hidden;

    /* 确保国家趋势图表容器正确显示 */
    :deep(.country-trend-chart-section) {
      width: 100%;
      height: 100%;
    }

    :deep(.chart-container) {
      width: 100%;
      height: 100%;
    }
  }

  /* 右下角区域 */
  .chart-right-bottom {
    grid-area: right-bottom;
    position: relative;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.8);
    overflow: hidden;

    .placeholder {
      text-align: center;
      padding: 20px;

      h3 {
        margin-bottom: 10px;
        font-size: 1.5rem;
        font-weight: 300;
        color: rgba(255, 255, 255, 0.9);
      }

      p {
        font-size: 1rem;
        color: rgba(255, 255, 255, 0.6);
      }
    }
  }

  /* 导航指示器 */
  .nav-indicator {
    position: fixed;
    right: 30px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 15px;

    .indicator-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      cursor: pointer;
      transition: all 0.3s ease;
      border: 2px solid transparent;

      &:hover {
        background: rgba(255, 255, 255, 0.6);
        transform: scale(1.2);
      }

      &.active {
        background: rgba(255, 255, 255, 0.9);
        transform: scale(1.3);
        border-color: rgba(255, 255, 255, 0.5);
      }
    }
  }

  /* 滚动提示 */
  .scroll-hint {
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
    animation: bounce 2s infinite;

    .scroll-arrow {
      width: 20px;
      height: 20px;
      border-right: 2px solid rgba(255, 255, 255, 0.7);
      border-bottom: 2px solid rgba(255, 255, 255, 0.7);
      transform: rotate(45deg);
      margin-bottom: 5px;
    }
  }

  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateX(-50%) translateY(0);
    }
    40% {
      transform: translateX(-50%) translateY(-10px);
    }
    60% {
      transform: translateX(-50%) translateY(-5px);
    }
  }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .home {
    .chart-section {
      padding: 15px;
      gap: 15px;
    }

    .nav-indicator {
      right: 20px;
    }
  }
}

@media (max-width: 768px) {
  .home {
    .chart-section {
      grid-template-columns: 1fr;
      grid-template-rows: 1fr 1fr 1fr 1fr;
      grid-template-areas:
        "left-top"
        "right-top"
        "left-bottom"
        "right-bottom";
      padding: 10px;
      gap: 10px;
    }

    .nav-indicator {
      right: 15px;
      gap: 12px;

      .indicator-dot {
        width: 10px;
        height: 10px;
      }
    }

    .scroll-hint {
      font-size: 0.8rem;
      bottom: 20px;
    }
  }
}

@media (max-width: 480px) {
  .home {
    .chart-section {
      padding: 8px;
      gap: 8px;
    }

    .nav-indicator {
      right: 10px;
      gap: 10px;

      .indicator-dot {
        width: 8px;
        height: 8px;
      }
    }

    .scroll-hint {
      font-size: 0.7rem;
      bottom: 15px;
    }
  }
}
</style>