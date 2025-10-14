<!-- components/CountryRankingChart.vue -->
<template>
  <div class="country-ranking-chart-section">
    <div class="chart-container">
      <h2 class="chart-title">国家疫情数据排名</h2>

      <!-- 数据切换按钮 -->
      <div class="chart-controls">
        <button
            class="control-btn"
            :class="{ active: activeDataType === 'confirmed' }"
            @click="switchDataType('confirmed')"
        >
          累计确诊
        </button>
        <button
            class="control-btn"
            :class="{ active: activeDataType === 'recovered' }"
            @click="switchDataType('recovered')"
        >
          累计治愈
        </button>
        <button
            class="control-btn"
            :class="{ active: activeDataType === 'deaths' }"
            @click="switchDataType('deaths')"
        >
          累计死亡
        </button>
      </div>

      <!-- 缩小后的区间选择滑轨 -->
      <div class="range-slider-container">
        <div class="range-info">
          <span class="range-label">国家区间选择</span>
          <span class="range-value">{{ getRangeDisplay() }}</span>
        </div>
        <div class="range-track">
          <div class="track-background"></div>
          <div class="track-progress" :style="progressStyle"></div>
          <input
              type="range"
              v-model.number="startIndex"
              :min="0"
              :max="totalCountries - 1"
              step="1"
              class="range-slider start-slider"
              @input="handleSliderChange"
          />
          <input
              type="range"
              v-model.number="endIndex"
              :min="0"
              :max="totalCountries - 1"
              step="1"
              class="range-slider end-slider"
              @input="handleSliderChange"
          />
        </div>
        <div class="range-labels">
          <span class="range-label-min">{{ getCountryName(0) }}</span>
          <span class="range-label-max">{{ getCountryName(totalCountries - 1) }}</span>
        </div>
      </div>

      <div class="chart-wrapper">
        <div ref="chartEl" class="chart"></div>
      </div>

      <div class="chart-info">
        <div class="info-item">
          <span class="info-label">数据类型:</span>
          <span class="info-value">{{ getDataTypeText() }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">显示国家:</span>
          <span class="info-value">{{ getCurrentRangeCount() }} 个国家</span>
        </div>
        <div class="info-item" v-if="globalTotals">
          <span class="info-label">全球总计:</span>
          <span class="info-value">{{ getGlobalTotal() }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

// 响应式数据
const chartEl = ref<HTMLElement>()
let chart: echarts.ECharts | null = null
const loading = ref(false)
const chartData = ref<any>(null)
const globalTotals = ref<any>(null)

// 显示控制
const activeDataType = ref<'confirmed' | 'recovered' | 'deaths'>('confirmed')
const startIndex = ref(0)
const endIndex = ref(19) // 默认显示前20个国家

// 防抖处理
let updateTimeout: NodeJS.Timeout | null = null

// 国家列表和相关数据
const availableCountries = ref<string[]>([])
const confirmedRanking = ref<any[]>([])
const recoveredRanking = ref<any[]>([])
const deathsRanking = ref<any[]>([])

// 计算属性
const totalCountries = computed(() => availableCountries.value.length)

// 进度条样式
const progressStyle = computed(() => {
  if (totalCountries.value === 0) return { left: '0%', width: '0%' }
  const startPercent = (startIndex.value / (totalCountries.value - 1)) * 100
  const endPercent = (endIndex.value / (totalCountries.value - 1)) * 100
  return {
    left: `${Math.min(startPercent, endPercent)}%`,
    width: `${Math.abs(endPercent - startPercent)}%`
  }
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

// 获取国家名称
const getCountryName = (index: number) => {
  if (index >= 0 && index < availableCountries.value.length) {
    const countryName = availableCountries.value[index]
    const displayName = countryNameMap[countryName] || countryName
    return displayName.length > 6 ? displayName.substring(0, 5) + '...' : displayName
  }
  return ''
}

// 获取区间显示文本
const getRangeDisplay = () => {
  const startName = getCountryName(startIndex.value)
  const endName = getCountryName(endIndex.value)
  return `${startName} - ${endName}`
}

// 获取当前显示国家数量
const getCurrentRangeCount = () => {
  return Math.abs(endIndex.value - startIndex.value) + 1
}

// 获取数据类型文本
const getDataTypeText = () => {
  const map = {
    'confirmed': '累计确诊',
    'recovered': '累计治愈',
    'deaths': '累计死亡'
  }
  return map[activeDataType.value]
}

// 获取全球总计
const getGlobalTotal = () => {
  if (!globalTotals.value) return '0'

  switch (activeDataType.value) {
    case 'confirmed':
      return globalTotals.value.total_confirmed?.toLocaleString() || '0'
    case 'recovered':
      return globalTotals.value.total_recovered?.toLocaleString() || '0'
    case 'deaths':
      return globalTotals.value.total_deaths?.toLocaleString() || '0'
    default:
      return '0'
  }
}

// 从后端API获取数据
const fetchChartData = async () => {
  try {
    loading.value = true
    console.log('请求国家排名数据...')

    const response = await fetch('http://localhost:5000/country_rankings')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    if (result.error) {
      throw new Error(result.error)
    }

    console.log('获取到国家排名数据:', result)

    // 保存全局总计
    globalTotals.value = result.global_totals

    // 保存排名数据
    confirmedRanking.value = result.confirmed_ranking || []
    recoveredRanking.value = result.recovered_ranking || []
    deathsRanking.value = result.deaths_ranking || []

    // 构建国家列表（从确诊排名中获取）
    availableCountries.value = confirmedRanking.value.map(item => item.country)

    // 更新滑块范围
    if (availableCountries.value.length > 0) {
      endIndex.value = Math.min(19, availableCountries.value.length - 1)
    }

    return {
      confirmed: confirmedRanking.value,
      recovered: recoveredRanking.value,
      deaths: deathsRanking.value
    }

  } catch (error) {
    console.error('API请求失败:', error)
    throw error
  } finally {
    loading.value = false
  }
}

// 切换数据类型
const switchDataType = (type: 'confirmed' | 'recovered' | 'deaths') => {
  activeDataType.value = type
  updateChartByRange()
}

// 处理滑块变化
const handleSliderChange = () => {
  // 确保索引在有效范围内
  if (availableCountries.value.length === 0) return

  startIndex.value = Math.max(0, Math.min(startIndex.value, availableCountries.value.length - 1))
  endIndex.value = Math.max(0, Math.min(endIndex.value, availableCountries.value.length - 1))

  // 防抖处理，避免频繁更新
  if (updateTimeout) {
    clearTimeout(updateTimeout)
  }
  updateTimeout = setTimeout(() => {
    updateChartByRange()
  }, 100)
}

// 根据区间更新图表
const updateChartByRange = async () => {
  if (!chart) {
    await initChart()
    return
  }

  if (!chartData.value || availableCountries.value.length === 0) return

  // 确保startIndex <= endIndex
  if (startIndex.value > endIndex.value) {
    const temp = startIndex.value
    startIndex.value = endIndex.value
    endIndex.value = temp
  }

  // 限制显示国家数量，避免图表过于拥挤
  const maxDisplayCountries = 30
  const actualEndIndex = Math.min(endIndex.value, startIndex.value + maxDisplayCountries - 1)

  if (endIndex.value !== actualEndIndex) {
    endIndex.value = actualEndIndex
  }

  // 获取当前数据类型的排名数据
  let currentRanking: any[] = []
  switch (activeDataType.value) {
    case 'confirmed':
      currentRanking = confirmedRanking.value
      break
    case 'recovered':
      currentRanking = recoveredRanking.value
      break
    case 'deaths':
      currentRanking = deathsRanking.value
      break
  }

  // 获取当前区间的国家
  const currentRangeCountries = availableCountries.value.slice(startIndex.value, endIndex.value + 1)

  // 获取当前区间的数据
  const rangeData = currentRangeCountries.map(country => {
    const rankingItem = currentRanking.find(item => item.country === country)
    return {
      country,
      value: rankingItem ? rankingItem[activeDataType.value] : 0,
      rank: rankingItem ? rankingItem.rank : 0
    }
  }).sort((a, b) => b.value - a.value) // 按值降序排列

  // 提取国家名称和数据值
  const countryNames = rangeData.map(item => countryNameMap[item.country] || item.country)
  const dataValues = rangeData.map(item => item.value)

  // 根据数据类型设置颜色
  let color = '#ff6b6b'
  switch (activeDataType.value) {
    case 'confirmed':
      color = '#ff6b6b'
      break
    case 'recovered':
      color = '#51cf66'
      break
    case 'deaths':
      color = '#495057'
      break
  }

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      textStyle: { color: '#fff', fontSize: 12 },
      formatter: (params: any) => {
        const data = params[0]
        const dataIndex = params[0].dataIndex
        const rankingItem = rangeData[dataIndex]
        return `
          <div style="font-weight: bold; margin-bottom: 5px; font-size: 11px;">${data.name}</div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin: 2px 0; font-size: 10px;">
            <span>排名:</span>
            <span style="font-weight: bold; margin-left: 10px;">#${rankingItem.rank}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin: 2px 0; font-size: 10px;">
            <span>${getDataTypeText()}:</span>
            <span style="font-weight: bold; margin-left: 10px;">${data.value?.toLocaleString()}</span>
          </div>
        `
      }
    },
    grid: {
      left: '15%',
      right: '10%',
      bottom: '15%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: countryNames,
      axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.3)' } },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 9,
        interval: 0,
        rotate: 45,
        formatter: (value: string) => value.length > 8 ? value.substring(0, 6) + '...' : value
      },
      axisTick: { alignWithLabel: true }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.3)' } },
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
      splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } }
    },
    series: [{
      name: getDataTypeText(),
      type: 'bar',
      data: dataValues,
      itemStyle: { color: color, borderRadius: [4, 4, 0, 0] },
      emphasis: { itemStyle: { color: color, shadowBlur: 10, shadowColor: color } },
      label: {
        show: false
      }
    }]
  }

  chart.setOption(option, true)
}

// 初始化图表
const initChart = async () => {
  await nextTick()

  if (!chartEl.value) {
    console.error('图表容器未找到')
    return
  }

  try {
    chart = echarts.init(chartEl.value)
    chartData.value = await fetchChartData()

    if (!chartData.value) {
      console.error('无法获取图表数据')
      return
    }

    updateChartByRange()

    const handleResize = () => chart?.resize()
    window.addEventListener('resize', handleResize)

  } catch (error) {
    console.error('初始化图表失败:', error)
  }
}

onMounted(() => {
  initChart()
})

onUnmounted(() => {
  if (chart) chart.dispose()
  if (updateTimeout) clearTimeout(updateTimeout)
  window.removeEventListener('resize', () => {})
})
</script>

<style lang="scss" scoped>
/* CSS 样式保持不变 */
.country-ranking-chart-section {
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

    .range-slider-container {
      margin-bottom: 0.6rem;
      padding: 0.3rem;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 4px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      flex-shrink: 0;

      .range-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.3rem;

        .range-label {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.65rem;
          font-weight: 500;
        }

        .range-value {
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.65rem;
          font-weight: 500;
        }
      }

      .range-track {
        position: relative;
        width: 100%;
        height: 16px;
        display: flex;
        align-items: center;

        .track-background {
          position: absolute;
          width: 100%;
          height: 3px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 1.5px;
        }

        .track-progress {
          position: absolute;
          height: 3px;
          background: linear-gradient(90deg, #51cf66, #ff6b6b);
          border-radius: 1.5px;
          transition: all 0.3s ease;
          z-index: 1;
        }

        .range-slider {
          position: absolute;
          width: 100%;
          height: 100%;
          background: transparent;
          outline: none;
          -webkit-appearance: none;
          margin: 0;
          z-index: 2;
          pointer-events: none;

          &::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 10px;
            height: 10px;
            background: #fff;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.2s ease;
            border: 2px solid;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
            pointer-events: auto;

            &:hover {
              transform: scale(1.1);
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
            }
          }

          &::-moz-range-thumb {
            width: 10px;
            height: 10px;
            background: #fff;
            border-radius: 50%;
            cursor: pointer;
            border: 2px solid;
            transition: all 0.2s ease;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
            pointer-events: auto;

            &:hover {
              transform: scale(1.1);
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
            }
          }
        }

        .start-slider {
          &::-webkit-slider-thumb {
            border-color: #51cf66;
          }
          &::-moz-range-thumb {
            border-color: #51cf66;
          }
        }

        .end-slider {
          &::-webkit-slider-thumb {
            border-color: #ff6b6b;
          }
          &::-moz-range-thumb {
            border-color: #ff6b6b;
          }
        }
      }

      .range-labels {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 0.2rem;

        .range-label-min,
        .range-label-max {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.55rem;
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
  .country-ranking-chart-section {
    .chart-container {
      padding: 0.8rem;

      .chart-title {
        font-size: 1rem;
      }

      .chart-controls {
        gap: 0.3rem;

        .control-btn {
          padding: 0.2rem 0.4rem;
          font-size: 0.65rem;
        }
      }

      .range-slider-container {
        padding: 0.25rem;
        margin-bottom: 0.5rem;

        .range-info {
          flex-direction: column;
          gap: 0.15rem;
          align-items: flex-start;

          .range-label,
          .range-value {
            font-size: 0.6rem;
          }
        }

        .range-track {
          height: 14px;
        }

        .range-labels {
          .range-label-min,
          .range-label-max {
            font-size: 0.5rem;
          }
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