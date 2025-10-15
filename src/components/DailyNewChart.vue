<!-- components/DailyNewChart.vue -->
<template>
  <div class="daily-new-chart-section">
    <div class="chart-container">
      <h2 class="chart-title">{{ chartTitle }}</h2>

      <!-- 日期范围选择 -->
      <div class="date-controls">
        <div class="control-group">
          <label>开始日期:</label>
          <input
              type="date"
              v-model="startDate"
              :min="minAvailableDate"
              :max="endDate"
              @change="updateDateRange"
          />
        </div>
        <div class="control-group">
          <label>结束日期:</label>
          <input
              type="date"
              v-model="endDate"
              :min="startDate"
              :max="maxAvailableDate"
              @change="updateDateRange"
          />
        </div>
        <button class="refresh-btn" @click="refreshData" :disabled="loading">
          {{ loading ? '加载中...' : '刷新' }}
        </button>
      </div>

      <!-- 数据切换按钮 -->
      <div class="chart-controls">
        <button
            class="control-btn"
            :class="{ active: showConfirmed }"
            @click="toggleData('confirmed')"
        >
          新增确诊
        </button>
        <button
            class="control-btn"
            :class="{ active: showDeaths }"
            @click="toggleData('deaths')"
        >
          新增死亡
        </button>
        <button
            class="control-btn"
            :class="{ active: showRecovered }"
            @click="toggleData('recovered')"
        >
          新增治愈
        </button>
        <button
            class="control-btn"
            :class="{ active: showAll }"
            @click="showAllData()"
        >
          全部显示
        </button>
      </div>

      <div class="chart-wrapper">
        <div ref="chartEl" class="chart"></div>
      </div>

      <div class="chart-info">
        <div class="info-item">
          <span class="info-label">当前国家:</span>
          <span class="info-value">{{ currentCountry }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">数据期间:</span>
          <span class="info-value">{{ startDate }} 至 {{ endDate }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">显示时长:</span>
          <span class="info-value">{{ displayDays }} 天</span>
        </div>
        <div class="info-item" v-if="summaryData">
          <span class="info-label">新增确诊总计:</span>
          <span class="info-value">{{ summaryData.total_new_cases?.toLocaleString() || 0 }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

// 定义props，接收从父组件传递的国家信息
interface Props {
  selectedCountry?: string
}

const props = withDefaults(defineProps<Props>(), {
  selectedCountry: 'Global'
})

// 响应式数据
const chartEl = ref<HTMLElement>()
let chart: echarts.ECharts | null = null
const loading = ref(false)
const chartData = ref<any>(null)
const summaryData = ref<any>(null)

// 显示控制
const showConfirmed = ref(true)
const showDeaths = ref(true)
const showRecovered = ref(true)

// 日期范围 - 初始显示2020.2.27-2020.11.26
const startDate = ref('2020-02-27')
const endDate = ref('2020-11-26')
const minAvailableDate = ref('2020-01-01')
const maxAvailableDate = ref('2022-12-31')

// 当前国家
const currentCountry = ref('Global')

// 计算属性
const chartTitle = computed(() => {
  return `${currentCountry.value} 每日新增疫情趋势`
})

const showAll = computed(() => {
  return showConfirmed.value && showDeaths.value && showRecovered.value
})

// 计算显示天数
const displayDays = computed(() => {
  const start = new Date(startDate.value)
  const end = new Date(endDate.value)
  const timeDiff = end.getTime() - start.getTime()
  return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1 // 包含起止日期
})

// 监听国家变化
watch(() => props.selectedCountry, (newCountry) => {
  if (newCountry && newCountry !== currentCountry.value) {
    currentCountry.value = newCountry
    updateChart()
  }
})

// 处理数据负值，取绝对值
const processNegativeValues = (data: any) => {
  if (!data || !data.trend_data) return data

  // 处理每个数据点的负值
  const processedTrendData = data.trend_data.map((item: any) => ({
    ...item,
    new_confirmed: Math.abs(item.new_confirmed || 0),
    new_deaths: Math.abs(item.new_deaths || 0),
    new_recovered: Math.abs(item.new_recovered || 0)
  }))

  // 重新计算汇总数据
  const total_new_cases = processedTrendData.reduce((sum: number, item: any) =>
      sum + item.new_confirmed, 0)

  const peak_new_cases = Math.max(...processedTrendData.map((item: any) => item.new_confirmed))

  return {
    ...data,
    trend_data: processedTrendData,
    summary: {
      ...data.summary,
      total_new_cases,
      peak_new_cases
    }
  }
}

// 从后端API获取数据
const fetchChartData = async (country: string, start: string, end: string) => {
  try {
    loading.value = true
    console.log(`请求 ${country} 的每日新增数据，期间: ${start} 至 ${end}`)

    const isGlobal = country === 'Global'
    const endpoint = isGlobal ? '/global_daily_trend' : '/country_daily_trend'

    const requestBody = {
      start_date: start,
      end_date: end,
      ...(isGlobal ? {} : { country: country })
    }

    const response = await fetch(`http://localhost:5000${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    if (result.error) {
      throw new Error(result.error)
    }

    console.log(`API原始响应数据:`, result)

    // 处理负值数据
    const processedResult = processNegativeValues(result)
    console.log(`处理负值后的数据:`, processedResult)

    // 保存汇总数据
    summaryData.value = processedResult.summary || {}

    return {
      country: country,
      dates: processedResult.trend_data?.map((item: any) => item.date) || [],
      confirmed: processedResult.trend_data?.map((item: any) => item.new_confirmed) || [],
      deaths: processedResult.trend_data?.map((item: any) => item.new_deaths) || [],
      recovered: processedResult.trend_data?.map((item: any) => item.new_recovered) || []
    }

  } catch (error) {
    console.error('API请求失败:', error)
    // 如果API请求失败，可以回退到模拟数据或显示错误信息
    throw error
  } finally {
    loading.value = false
  }
}

// 更新日期范围（只需要确保开始时间小于结束时间）
const updateDateRange = () => {
  const start = new Date(startDate.value)
  const end = new Date(endDate.value)

  // 如果开始日期大于结束日期，调整开始日期
  if (start > end) {
    const newStart = new Date(end)
    newStart.setDate(newStart.getDate() - 1) // 设为结束日期前一天
    startDate.value = newStart.toISOString().split('T')[0]
  }

  updateChart()
}

// 切换数据显示
const toggleData = (type: 'confirmed' | 'deaths' | 'recovered') => {
  switch (type) {
    case 'confirmed':
      showConfirmed.value = !showConfirmed.value
      break
    case 'deaths':
      showDeaths.value = !showDeaths.value
      break
    case 'recovered':
      showRecovered.value = !showRecovered.value
      break
  }
  updateChart()
}

// 显示所有数据
const showAllData = () => {
  showConfirmed.value = true
  showDeaths.value = true
  showRecovered.value = true
  updateChart()
}

// 刷新数据
const refreshData = () => {
  updateChart()
}

// 更新图表
const updateChart = async () => {
  if (!chart) {
    await initChart()
    return
  }

  try {
    // 获取新数据
    chartData.value = await fetchChartData(currentCountry.value, startDate.value, endDate.value)

    if (!chartData.value) {
      console.error('无法获取图表数据')
      return
    }

    // 检查数据中是否有负值（理论上已经处理过，这里作为二次确认）
    const hasNegativeValues = {
      confirmed: chartData.value.confirmed.some((val: number) => val < 0),
      deaths: chartData.value.deaths.some((val: number) => val < 0),
      recovered: chartData.value.recovered.some((val: number) => val < 0)
    }

    if (hasNegativeValues.confirmed || hasNegativeValues.deaths || hasNegativeValues.recovered) {
      console.warn('发现负值数据，进行二次处理:', hasNegativeValues)

      // 二次处理：确保所有值为非负数
      chartData.value.confirmed = chartData.value.confirmed.map((val: number) => Math.abs(val))
      chartData.value.deaths = chartData.value.deaths.map((val: number) => Math.abs(val))
      chartData.value.recovered = chartData.value.recovered.map((val: number) => Math.abs(val))
    }

    const series = []
    const legendData = []

    if (showConfirmed.value) {
      series.push({
        name: '新增确诊',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: {
          width: 2,
          color: '#ff6b6b'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255, 107, 107, 0.3)' },
            { offset: 1, color: 'rgba(255, 107, 107, 0.1)' }
          ])
        },
        data: chartData.value.confirmed
      })
      legendData.push('新增确诊')
    }

    if (showDeaths.value) {
      series.push({
        name: '新增死亡',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: {
          width: 2,
          color: '#495057'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(73, 80, 87, 0.3)' },
            { offset: 1, color: 'rgba(73, 80, 87, 0.1)' }
          ])
        },
        data: chartData.value.deaths
      })
      legendData.push('新增死亡')
    }

    if (showRecovered.value) {
      series.push({
        name: '新增治愈',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: {
          width: 2,
          color: '#51cf66'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(81, 207, 102, 0.3)' },
            { offset: 1, color: 'rgba(81, 207, 102, 0.1)' }
          ])
        },
        data: chartData.value.recovered
      })
      legendData.push('新增治愈')
    }

    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        textStyle: {
          color: '#fff',
          fontSize: 12
        },
        axisPointer: {
          type: 'line'
        },
        formatter: (params: any) => {
          let result = `<div style="margin: 5px 0;">${params[0].axisValue}</div>`
          params.forEach((param: any) => {
            const value = param.value?.toLocaleString() || 0
            const color = param.color
            result += `
              <div style="display: flex; align-items: center; margin: 3px 0;">
                <span style="display: inline-block; width: 10px; height: 10px; background: ${color}; border-radius: 50%; margin-right: 5px;"></span>
                <span style="flex: 1;">${param.seriesName}:</span>
                <span style="font-weight: bold; margin-left: 10px;">${value}</span>
              </div>
            `
          })
          return result
        }
      },
      legend: {
        data: legendData,
        textStyle: {
          color: 'rgba(255, 255, 255, 0.7)'
        },
        top: 10,
        right: 10
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '20%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: chartData.value.dates,
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.3)'
          }
        },
        axisLabel: {
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: 10,
          formatter: (value: string) => {
            const date = new Date(value)
            return `${date.getMonth() + 1}/${date.getDate()}`
          }
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.3)'
          }
        },
        axisLabel: {
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: 10,
          formatter: (value: number) => {
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + 'M'
            } else if (value >= 1000) {
              return (value / 1000).toFixed(0) + 'K'
            }
            return value.toString()
          }
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        }
      },
      series: series
    }

    chart.setOption(option, true)
    chart.resize()

  } catch (error) {
    console.error('更新图表失败:', error)
    // 可以在这里添加用户友好的错误提示
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
    // 初始化 ECharts 实例
    chart = echarts.init(chartEl.value)

    // 获取初始数据
    await updateChart()

    // 响应窗口大小变化
    const handleResize = () => {
      chart?.resize()
    }
    window.addEventListener('resize', handleResize)

  } catch (error) {
    console.error('初始化图表失败:', error)
  }
}

onMounted(() => {
  initChart()
})

onUnmounted(() => {
  if (chart) {
    chart.dispose()
  }
  window.removeEventListener('resize', () => {})
})
</script>

<style lang="scss" scoped>
.daily-new-chart-section {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  .chart-container {
    width: 95%;
    height: 95%;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 1rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;

    .chart-title {
      text-align: center;
      color: #fff;
      font-size: 1.1rem;
      margin-bottom: 0.8rem;
      font-weight: 300;
      flex-shrink: 0;
    }

    .date-controls {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 0.8rem;
      flex-shrink: 0;
      flex-wrap: wrap;

      .control-group {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        label {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.8rem;
          white-space: nowrap;
        }

        input {
          padding: 0.3rem 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          color: #fff;
          font-size: 0.8rem;
          min-width: 120px;

          &:focus {
            outline: none;
            border-color: rgba(255, 255, 255, 0.4);
          }
        }
      }

      .refresh-btn {
        padding: 0.3rem 0.8rem;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        color: rgba(255, 255, 255, 0.8);
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.3s ease;
        white-space: nowrap;

        &:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.15);
          color: #fff;
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }

    .chart-controls {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 0.8rem;
      flex-shrink: 0;
      flex-wrap: wrap;

      .control-btn {
        padding: 0.3rem 0.6rem;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 6px;
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.7rem;
        cursor: pointer;
        transition: all 0.3s ease;
        white-space: nowrap;

        &:hover {
          background: rgba(255, 255, 255, 0.15);
          color: #fff;
        }

        &.active {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.4);
          color: #fff;
        }
      }
    }

    .chart-wrapper {
      flex: 1;
      position: relative;
      min-height: 200px;

      .chart {
        width: 100%;
        height: 100%;
        min-height: 200px;
      }
    }

    .chart-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0.8rem;
      padding-top: 0.8rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      flex-shrink: 0;
      flex-wrap: wrap;
      gap: 0.5rem;

      .info-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .info-label {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.7rem;
        }

        .info-value {
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.7rem;
          font-weight: 500;
        }
      }
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .daily-new-chart-section {
    .chart-container {
      padding: 0.8rem;

      .chart-title {
        font-size: 1rem;
      }

      .date-controls {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;

        .control-group {
          width: 100%;
          justify-content: space-between;
        }
      }

      .chart-controls {
        gap: 0.3rem;

        .control-btn {
          padding: 0.2rem 0.4rem;
          font-size: 0.65rem;
        }
      }

      .chart-info {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  }
}
</style>