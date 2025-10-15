<!-- components/PatientRatioChart.vue -->
<template>
  <div class="patient-ratio-chart-section">
    <div class="chart-container">
      <h2 class="chart-title">全球病患类型比例（2021年10月10日）</h2>

      <div class="chart-content">
        <div class="chart-wrapper">
          <div ref="chartEl" class="chart"></div>
        </div>
        <div class="legend-container">
          <div class="legend-item">
            <div class="color-indicator" style="background: #ff6b6b;"></div>
            <span class="legend-label">现存确诊</span>
          </div>
          <div class="legend-item">
            <div class="color-indicator" style="background: #495057;"></div>
            <span class="legend-label">死亡</span>
          </div>
          <div class="legend-item">
            <div class="color-indicator" style="background: #51cf66;"></div>
            <span class="legend-label">治愈</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import * as echarts from 'echarts'

const chartEl = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

// 模拟数据
const activeCases = ref(93838501)
const deathCases = ref(5064947)
const recoveredCases = ref(159481301)

// 计算属性
const totalCases = computed(() => {
  return activeCases.value + deathCases.value + recoveredCases.value
})

const chartData = computed(() => {
  const activePercent = ((activeCases.value / totalCases.value) * 100).toFixed(1)
  const deathPercent = ((deathCases.value / totalCases.value) * 100).toFixed(1)
  const recoveredPercent = ((recoveredCases.value / totalCases.value) * 100).toFixed(1)

  return [
    {
      name: '现存确诊',
      value: activeCases.value,
      percent: activePercent,
      itemStyle: {
        color: '#ff6b6b',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 2
      }
    },
    {
      name: '死亡',
      value: deathCases.value,
      percent: deathPercent,
      itemStyle: {
        color: '#495057',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 2
      }
    },
    {
      name: '治愈',
      value: recoveredCases.value,
      percent: recoveredPercent,
      itemStyle: {
        color: '#51cf66',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 2
      }
    }
  ]
})

// 从后端API获取数据
const fetchChartData = async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300))

    // 模拟数据更新
    activeCases.value = Math.round(1200000 + Math.random() * 100000)
    deathCases.value = Math.round(80000 + Math.random() * 10000)
    recoveredCases.value = Math.round(3800000 + Math.random() * 100000)

  } catch (error) {
    console.error('获取饼图数据失败:', error)
  }
}

// 初始化图表
const initChart = async () => {
  await nextTick()

  if (!chartEl.value) {
    console.error('图表容器未找到')
    return
  }

  try {
    await fetchChartData()

    chart = echarts.init(chartEl.value)

    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 1,
        textStyle: {
          color: '#fff',
          fontSize: 12
        },
        formatter: (params: any) => {
          const percent = ((params.value / totalCases.value) * 100).toFixed(1)
          return `
            <div style="font-weight: bold; margin-bottom: 8px; font-size: 13px;">${params.name}</div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin: 4px 0; font-size: 12px;">
              <span>数量:</span>
              <span style="font-weight: bold; margin-left: 15px;">${params.value.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin: 4px 0; font-size: 12px;">
              <span>占比:</span>
              <span style="font-weight: bold; margin-left: 15px; color: ${params.color}">${percent}%</span>
            </div>
          `
        }
      },
      legend: {
        show: false
      },
      series: [
        {
          name: '病患类型',
          type: 'pie',
          radius: ['50%', '75%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 6,
            borderColor: 'rgba(255, 255, 255, 0.3)',
            borderWidth: 2
          },
          label: {
            show: true,
            position: 'outside',
            formatter: (params: any) => {
              // 直接使用计算好的百分比，而不是params.percent
              const dataItem = chartData.value.find(item => item.name === params.name)
              return dataItem ? `{c|${dataItem.percent}%}` : '{c|0%}'
            },
            rich: {
              c: {
                fontSize: 11,
                color: '#fff',
                fontWeight: 'bold',
                lineHeight: 16,
                textShadow: '0 1px 2px rgba(0,0,0,0.5)'
              }
            }
          },
          labelLine: {
            show: true,
            length: 15,
            length2: 10,
            smooth: true,
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.4)',
              width: 1.2,
              type: 'solid'
            }
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 12,
              fontWeight: 'bold',
              formatter: (params: any) => {
                const dataItem = chartData.value.find(item => item.name === params.name)
                return dataItem ? `${dataItem.percent}%` : '0%'
              }
            },
            scale: true,
            scaleSize: 5
          },
          data: chartData.value.map(item => ({
            name: item.name,
            value: item.value,
            itemStyle: item.itemStyle,
            // 确保百分比数据也传递给series
            percent: item.percent
          })),
          animationType: 'scale',
          animationEasing: 'elasticOut',
          animationDelay: function (idx: number) {
            return idx * 100;
          }
        }
      ]
    }

    chart.setOption(option)
    chart.resize()

    const handleResize = () => {
      chart?.resize()
    }
    window.addEventListener('resize', handleResize)

  } catch (error) {
    console.error('初始化饼图失败:', error)
  }
}

// 更新图表数据
const updateChart = () => {
  if (!chart) return

  const option = {
    series: [{
      data: chartData.value.map(item => ({
        name: item.name,
        value: item.value,
        itemStyle: item.itemStyle,
        percent: item.percent
      }))
    }]
  }

  chart.setOption(option)
}

// 定期更新数据
let updateInterval: NodeJS.Timeout | null = null

onMounted(() => {
  initChart()

  updateInterval = setInterval(async () => {
    await fetchChartData()
    updateChart()
  }, 30000)
})

onUnmounted(() => {
  if (chart) {
    chart.dispose()
  }
  if (updateInterval) {
    clearInterval(updateInterval)
  }
  window.removeEventListener('resize', () => {})
})
</script>

<style lang="scss" scoped>
.patient-ratio-chart-section {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  .chart-container {
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    padding: 1.2rem;
    box-shadow:
        0 8px 32px rgba(0, 0, 0, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg,
          transparent 0%,
          rgba(255, 255, 255, 0.2) 50%,
          transparent 100%);
    }

    .chart-title {
      text-align: center;
      color: #fff;
      font-size: 1.1rem;
      margin-bottom: 1rem;
      font-weight: 400;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
      letter-spacing: 0.5px;
      flex-shrink: 0;
    }

    .chart-content {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      min-height: 0;

      .chart-wrapper {
        flex: 1;
        position: relative;
        min-height: 180px;
        height: 100%;

        .chart {
          width: 100%;
          height: 100%;
          min-height: 180px;
        }
      }

      .legend-container {
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
        padding: 0.8rem;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        min-width: 100px;

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.4rem 0.6rem;
          border-radius: 6px;
          transition: all 0.3s ease;
          cursor: pointer;

          &:hover {
            background: rgba(255, 255, 255, 0.08);
            transform: translateX(2px);
          }

          .color-indicator {
            width: 14px;
            height: 14px;
            border-radius: 50%;
            border: 2px solid rgba(255, 255, 255, 0.4);
            flex-shrink: 0;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }

          .legend-label {
            color: rgba(255, 255, 255, 0.9);
            font-size: 0.75rem;
            font-weight: 500;
            white-space: nowrap;
          }
        }
      }
    }
  }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .patient-ratio-chart-section {
    .chart-container {
      .chart-content {
        flex-direction: column;
        gap: 0.8rem;

        .legend-container {
          flex-direction: row;
          justify-content: center;
          min-width: auto;
          width: 100%;

          .legend-item {
            flex: 1;
            justify-content: center;
            padding: 0.3rem 0.5rem;

            .legend-label {
              font-size: 0.7rem;
            }
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .patient-ratio-chart-section {
    .chart-container {
      padding: 1rem;
      border-radius: 12px;

      .chart-title {
        font-size: 1rem;
        margin-bottom: 0.8rem;
      }

      .chart-content {
        gap: 0.6rem;

        .legend-container {
          gap: 0.4rem;
          padding: 0.6rem;

          .legend-item {
            padding: 0.25rem 0.4rem;

            .color-indicator {
              width: 12px;
              height: 12px;
            }

            .legend-label {
              font-size: 0.65rem;
            }
          }
        }
      }
    }
  }
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chart-container {
  animation: fadeInUp 0.6s ease-out;
}
</style>