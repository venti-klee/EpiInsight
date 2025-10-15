<!-- components/CountryTrendChart.vue -->
<template>
  <div class="country-trend-chart-section">
    <div class="chart-container">
      <h2 class="chart-title">{{ chartTitle }}</h2>

      <!-- 日期范围选择 -->
      <div class="date-controls">
        <div class="control-group">
          <label>开始时间:</label>
          <input
              type="date"
              v-model="startDate"
              :min="minAvailableDate"
              :max="maxAvailableDate"
              @change="validateAndEmitDateRange"
          />
        </div>
        <div class="control-group">
          <label>结束时间:</label>
          <input
              type="date"
              v-model="endDate"
              :min="minAvailableDate"
              :max="maxAvailableDate"
              @change="validateAndEmitDateRange"
          />
        </div>
        <button class="refresh-btn" @click="refreshData" :disabled="loading">
          {{ loading ? '加载中...' : '刷新' }}
        </button>
      </div>

      <!-- 国家选择 -->
      <div class="control-group country-select-group">
        <label>选择国家:</label>
        <select v-model="selectedCountry" @change="updateChart" class="country-select">
          <option value="">请选择国家</option>
          <option v-for="country in availableCountries"
                  :key="country"
                  :value="country">
            {{ getCountryDisplayName(country) }}
          </option>
        </select>

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
      </div>

      <div class="chart-wrapper">
        <div ref="chartEl" class="chart"></div>
      </div>

      <div class="chart-info">
        <div class="info-item">
          <span class="info-label">当前国家:</span>
          <span class="info-value">{{ getCountryDisplayName(selectedCountry) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">数据期间:</span>
          <span class="info-value">{{ startDate }} 至 {{ endDate }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">显示天数:</span>
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
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import * as echarts from 'echarts'

// 响应式数据
const chartEl = ref<HTMLElement>()
let chart: echarts.ECharts | null = null
const loading = ref(false)
const chartData = ref<any>(null)
const summaryData = ref<any>(null)
const availableCountries = ref<string[]>([])

// 国家选择
const selectedCountry = ref('China')

// 显示控制
const showConfirmed = ref(true)
const showDeaths = ref(true)
const showRecovered = ref(true)

// 日期范围 - 修改为初始值 2020-02-27 到 2020-11-26
const startDate = ref('2020-02-27')
const endDate = ref('2020-11-26')

// 可选择区间
const minAvailableDate = ref('2020-01-22')
const maxAvailableDate = ref('2023-03-10')

// 计算属性
const chartTitle = computed(() => {
  return `${getCountryDisplayName(selectedCountry.value)} 疫情新增趋势`
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

// 国家名称映射
const countryNameMap: { [key: string]: string } = {
  "Somalia": "索马里",
  "Liechtenstein": "列支敦士登",
  "Morocco": "摩洛哥",
  "W. Sahara": "西撒哈拉",
  "Serbia": "塞尔维亚",
  "Afghanistan": "阿富汗",
  "Angola": "安哥拉",
  "Albania": "阿尔巴尼亚",
  "Andorra": "安道尔共和国",
  "United Arab Emirates": "阿拉伯联合酋长国",
  "Argentina": "阿根廷",
  "Armenia": "亚美尼亚",
  "Australia": "澳大利亚",
  "Austria": "奥地利",
  "Azerbaijan": "阿塞拜疆",
  "Burundi": "布隆迪",
  "Belgium": "比利时",
  "Benin": "贝宁",
  "Burkina Faso": "布基纳法索",
  "Bangladesh": "孟加拉国",
  "Bulgaria": "保加利亚",
  "Bahrain": "巴林",
  "Bahamas": "巴哈马",
  "Bosnia and Herz.": "波斯尼亚和黑塞哥维那",
  "Belarus": "白俄罗斯",
  "Belize": "伯利兹",
  "Bermuda": "百慕大",
  "Bolivia": "玻利维亚",
  "Brazil": "巴西",
  "Barbados": "巴巴多斯",
  "Brunei": "文莱",
  "Bhutan": "不丹",
  "Botswana": "博茨瓦纳",
  "Central African Rep.": "中非",
  "Canada": "加拿大",
  "Switzerland": "瑞士",
  "Chile": "智利",
  "China": "中国",
  "Côte d'Ivoire": "科特迪瓦",
  "Cameroon": "喀麦隆",
  "Dem. Rep. Congo": "刚果民主共和国",
  "Congo": "刚果",
  "Colombia": "哥伦比亚",
  "Cape Verde": "佛得角",
  "Costa Rica": "哥斯达黎加",
  "Cuba": "古巴",
  "N. Cyprus": "北塞浦路斯",
  "Cyprus": "塞浦路斯",
  "Czech Rep.": "捷克",
  "Germany": "德国",
  "Djibouti": "吉布提",
  "Denmark": "丹麦",
  "Dominican Rep.": "多米尼加",
  "Algeria": "阿尔及利亚",
  "Ecuador": "厄瓜多尔",
  "Egypt": "埃及",
  "Eritrea": "厄立特里亚",
  "Spain": "西班牙",
  "Estonia": "爱沙尼亚",
  "Ethiopia": "埃塞俄比亚",
  "Finland": "芬兰",
  "Fiji": "斐济",
  "France": "法国",
  "Gabon": "加蓬",
  "United Kingdom": "英国",
  "Georgia": "格鲁吉亚",
  "Ghana": "加纳",
  "Guinea": "几内亚",
  "Gambia": "冈比亚",
  "Guinea-Bissau": "几内亚比绍",
  "Eq. Guinea": "赤道几内亚",
  "Greece": "希腊",
  "Grenada": "格林纳达",
  "Greenland": "格陵兰",
  "Guatemala": "危地马拉",
  "Guam": "关岛",
  "Guyana": "圭亚那",
  "Honduras": "洪都拉斯",
  "Croatia": "克罗地亚",
  "Haiti": "海地",
  "Hungary": "匈牙利",
  "Indonesia": "印度尼西亚",
  "India": "印度",
  "Br. Indian Ocean Ter.": "英属印度洋领土",
  "Ireland": "爱尔兰",
  "Iran": "伊朗",
  "Iraq": "伊拉克",
  "Iceland": "冰岛",
  "Israel": "以色列",
  "Italy": "意大利",
  "Jamaica": "牙买加",
  "Jordan": "约旦",
  "Japan": "日本",
  "Siachen Glacier": "锡亚琴冰川",
  "Kazakhstan": "哈萨克斯坦",
  "Kenya": "肯尼亚",
  "Kyrgyzstan": "吉尔吉斯坦",
  "Cambodia": "柬埔寨",
  "Korea": "韩国",
  "Kuwait": "科威特",
  "Lao PDR": "老挝",
  "Lebanon": "黎巴嫩",
  "Liberia": "利比里亚",
  "Libya": "利比亚",
  "Sri Lanka": "斯里兰卡",
  "Lesotho": "莱索托",
  "Lithuania": "立陶宛",
  "Luxembourg": "卢森堡",
  "Latvia": "拉脱维亚",
  "Moldova": "摩尔多瓦",
  "Madagascar": "马达加斯加",
  "Mexico": "墨西哥",
  "Macedonia": "马其顿",
  "Mali": "马里",
  "Malta": "马耳他",
  "Myanmar": "缅甸",
  "Montenegro": "黑山",
  "Mongolia": "蒙古",
  "Mozambique": "莫桑比克",
  "Mauritania": "毛里塔尼亚",
  "Mauritius": "毛里求斯",
  "Malawi": "马拉维",
  "Malaysia": "马来西亚",
  "Namibia": "纳米比亚",
  "New Caledonia": "新喀里多尼亚",
  "Niger": "尼日尔",
  "Nigeria": "尼日利亚",
  "Nicaragua": "尼加拉瓜",
  "Netherlands": "荷兰",
  "Norway": "挪威",
  "Nepal": "尼泊尔",
  "New Zealand": "新西兰",
  "Oman": "阿曼",
  "Pakistan": "巴基斯坦",
  "Panama": "巴拿马",
  "Peru": "秘鲁",
  "Philippines": "菲律宾",
  "Papua New Guinea": "巴布亚新几内亚",
  "Poland": "波兰",
  "Puerto Rico": "波多黎各",
  "Dem. Rep. Korea": "朝鲜",
  "Portugal": "葡萄牙",
  "Paraguay": "巴拉圭",
  "Palestine": "巴勒斯坦",
  "Qatar": "卡塔尔",
  "Romania": "罗马尼亚",
  "Russia": "俄罗斯",
  "Rwanda": "卢旺达",
  "Saudi Arabia": "沙特阿拉伯",
  "Sudan": "苏丹",
  "S. Sudan": "南苏丹",
  "Senegal": "塞内加尔",
  "Singapore": "新加坡",
  "Solomon Is.": "所罗门群岛",
  "Sierra Leone": "塞拉利昂",
  "El Salvador": "萨尔瓦多",
  "Suriname": "苏里南",
  "Slovakia": "斯洛伐克",
  "Slovenia": "斯洛文尼亚",
  "Sweden": "瑞典",
  "Swaziland": "斯威士兰",
  "Seychelles": "塞舌尔",
  "Syria": "叙利亚",
  "Chad": "乍得",
  "Togo": "多哥",
  "Thailand": "泰国",
  "Tajikistan": "塔吉克斯坦",
  "Turkmenistan": "土库曼斯坦",
  "Timor-Leste": "东帝汶",
  "Tonga": "汤加",
  "Trinidad and Tobago": "特立尼达和多巴哥",
  "Tunisia": "突尼斯",
  "Turkey": "土耳其",
  "Tanzania": "坦桑尼亚",
  "Uganda": "乌干达",
  "Ukraine": "乌克兰",
  "Uruguay": "乌拉圭",
  "United States": "美国",
  "Uzbekistan": "乌兹别克斯坦",
  "Venezuela": "委内瑞拉",
  "Vietnam": "越南",
  "Vanuatu": "瓦努阿图",
  "Yemen": "也门",
  "South Africa": "南非",
  "Zambia": "赞比亚",
  "Zimbabwe": "津巴布韦",
  "Aland": "奥兰群岛",
  "American Samoa": "美属萨摩亚",
  "Fr. S. Antarctic Lands": "南极洲",
  "Antigua and Barb.": "安提瓜和巴布达",
  "Comoros": "科摩罗",
  "Curaçao": "库拉索岛",
  "Cayman Is.": "开曼群岛",
  "Dominica": "多米尼加",
  "Falkland Is.": "马尔维纳斯群岛（福克兰）",
  "Faeroe Is.": "法罗群岛",
  "Micronesia": "密克罗尼西亚",
  "Heard I. and McDonald Is.": "赫德岛和麦克唐纳群岛",
  "Isle of Man": "曼岛",
  "Jersey": "泽西岛",
  "Kiribati": "基里巴斯",
  "Saint Lucia": "圣卢西亚",
  "N. Mariana Is.": "北马里亚纳群岛",
  "Montserrat": "蒙特塞拉特",
  "Niue": "纽埃",
  "Palau": "帕劳",
  "Fr. Polynesia": "法属波利尼西亚",
  "S. Geo. and S. Sandw. Is.": "南乔治亚岛和南桑威奇群岛",
  "Saint Helena": "圣赫勒拿",
  "St. Pierre and Miquelon": "圣皮埃尔和密克隆群岛",
  "São Tomé and Principe": "圣多美和普林西比",
  "Turks and Caicos Is.": "特克斯和凯科斯群岛",
  "St. Vin. and Gren.": "圣文森特和格林纳丁斯",
  "U.S. Virgin Is.": "美属维尔京群岛",
  "Samoa": "萨摩亚"
}

// 获取国家中文名
const getCountryDisplayName = (country: string) => {
  return countryNameMap[country] || country
}

// 从后端获取国家列表
const fetchCountries = async () => {
  try {
    const response = await fetch('http://localhost:5000/get_countries')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = await response.json()
    if (result.countries) {
      availableCountries.value = result.countries
      console.log(`获取到 ${result.countries.length} 个国家列表`)
    }
  } catch (error) {
    console.error('获取国家列表失败:', error)
    // 如果API失败，使用默认的国家列表
    availableCountries.value = Object.keys(countryNameMap)
  }
}

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

    const requestBody = {
      start_date: start,
      end_date: end,
      country: country
    }

    const response = await fetch('http://localhost:5000/country_daily_trend', {
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
    throw error
  } finally {
    loading.value = false
  }
}

// 验证并处理日期范围
const validateAndEmitDateRange = () => {
  const start = new Date(startDate.value)
  const end = new Date(endDate.value)

  // 确保开始时间不晚于结束时间
  if (start > end) {
    endDate.value = startDate.value
  }

  // 确保结束时间不早于开始时间
  if (end < start) {
    startDate.value = endDate.value
  }

  // 确保日期在可用范围内
  if (start < new Date(minAvailableDate.value)) {
    startDate.value = minAvailableDate.value
  }
  if (end > new Date(maxAvailableDate.value)) {
    endDate.value = maxAvailableDate.value
  }

  // 更新图表
  updateChart()
}

// 切换数据显示
const toggleData = (type: 'confirmed' | 'deaths' | 'recovered') => {
  switch (type) {
    case 'confirmed': showConfirmed.value = !showConfirmed.value; break
    case 'deaths': showDeaths.value = !showDeaths.value; break
    case 'recovered': showRecovered.value = !showRecovered.value; break
  }
  updateChart()
}

// 显示全部
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
  if (!selectedCountry.value) {
    console.warn('请先选择国家')
    return
  }

  if (!chart) await initChart()

  try {
    chartData.value = await fetchChartData(selectedCountry.value, startDate.value, endDate.value)
    if (!chartData.value) return

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
        lineStyle: { width: 2, color: '#ff6b6b' },
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
        lineStyle: { width: 2, color: '#495057' },
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
        lineStyle: { width: 2, color: '#51cf66' },
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
        backgroundColor: 'rgba(0,0,0,0.8)',
        borderColor: 'rgba(255,255,255,0.2)',
        textStyle: { color: '#fff', fontSize: 12 },
        axisPointer: { type: 'line' },
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
        textStyle: { color: 'rgba(255,255,255,0.7)' },
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
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.3)' } },
        axisLabel: {
          color: 'rgba(255,255,255,0.7)',
          fontSize: 10,
          formatter: (value: string) => {
            const date = new Date(value)
            return `${date.getMonth() + 1}/${date.getDate()}`
          }
        }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.3)' } },
        axisLabel: {
          color: 'rgba(255,255,255,0.7)',
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
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
      },
      series
    }

    chart?.setOption(option, true)
    chart?.resize()

  } catch (error) {
    console.error('更新图表失败:', error)
  }
}

// 初始化图表
const initChart = async () => {
  await nextTick()
  if (!chartEl.value) return

  chart = echarts.init(chartEl.value)

  // 获取国家列表
  await fetchCountries()

  // 初始更新图表
  if (selectedCountry.value) {
    await updateChart()
  }

  const handleResize = () => chart?.resize()
  window.addEventListener('resize', handleResize)

  onUnmounted(() => {
    if (chart) chart.dispose()
    window.removeEventListener('resize', handleResize)
  })
}

onMounted(() => {
  initChart()
})
</script>

<style lang="scss" scoped>
/* CSS 样式保持不变 */
.country-trend-chart-section {
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

    .country-select-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.8rem;
      flex-shrink: 0;

      label {
        color: rgba(255, 255, 255, 0.8);
        font-size: 0.8rem;
        white-space: nowrap;
      }

      .country-select {
        padding: 0.3rem 0.5rem;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        color: #fff;
        font-size: 0.8rem;
        min-width: 200px;
        cursor: pointer;

        &:focus {
          outline: none;
          border-color: rgba(255, 255, 255, 0.4);
        }

        option {
          background: #2a2a2a;
          color: #fff;
        }
      }
    }

    .chart-controls {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 0rem;
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

@media (max-width: 768px) {
  .country-trend-chart-section {
    .chart-container {
      padding: 0.8rem;

      .chart-title { font-size: 1rem; }

      .date-controls,
      .country-select-group {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;

        .control-group, .country-select-group {
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