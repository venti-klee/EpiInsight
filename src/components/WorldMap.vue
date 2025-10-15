<!-- WorldMap.vue -->
<template>
  <div class="world-map-container">
    <div class="map-controls">
      <div class="control-group">
        <label>数据日期:</label>
        <input
            type="date"
            v-model="selectedDate"
            :min="minAvailableDate"
            :max="maxAvailableDate"
            @change="handleDateChange"
        />
        <span v-if="dateError" class="error-message">{{ dateError }}</span>
      </div>
      <div class="control-group">
        <label>数据模式:</label>
        <select v-model="dataMode" @change="handleDataModeChange">
          <option value="cumulative">累计数据</option>
          <option value="daily_new">新增数据</option>
          <option value="active">当前确诊</option>
        </select>
      </div>
      <div class="control-group" v-if="dataMode !== 'active'">
        <label>数据类型:</label>
        <select v-model="dataType" @change="updateChart">
          <option value="confirmed">确诊</option>
          <option value="deaths">死亡</option>
          <option value="recovered">治愈</option>
        </select>
      </div>
      <div class="control-group" v-else>
        <label>数据类型:</label>
        <span class="disabled-type">当前确诊</span>
      </div>
      <div class="control-group">
        <button @click="refreshData" :disabled="loading">
          {{ loading ? '加载中...' : '刷新数据' }}
        </button>
      </div>
      <div class="control-group">
        <button @click="resetToGlobal" class="reset-btn" :disabled="selectedCountry === 'Global'">
          重置为全球
        </button>
      </div>
    </div>
    <div ref="chartContainer" class="chart-container"></div>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-if="useMockData" class="mock-warning">
      <span>⚠️ 使用模拟数据演示 - 后端服务未启动</span>
      <button @click="retryConnection" class="retry-btn">重试连接</button>
    </div>
    <div v-if="selectedCountry !== 'Global'" class="selected-country">
      当前选择: {{ getCountryChineseName(selectedCountry) }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import type { ECharts, EChartsOption } from 'echarts'
import * as echarts from 'echarts'
import 'echarts/map/js/world'

// 定义 emits
const emit = defineEmits<{
  countryClick: [country: string]
}>()

// 响应式数据
const chartContainer = ref<HTMLElement>()
const chart = ref<ECharts>()
const loading = ref(false)
const dataMode = ref<'cumulative' | 'daily_new' | 'active'>('cumulative')
const dataType = ref<'confirmed' | 'deaths' | 'recovered'>('confirmed')
const selectedDate = ref('2022-02-02')
const useMockData = ref(false)
const availableDates = ref<string[]>([])
const minAvailableDate = ref('')
const maxAvailableDate = ref('')
const dateError = ref('')
const selectedCountry = ref('Global')

// API 配置 - 使用正确的端口 5000
const API_BASE_URL = 'http://localhost:5000'

// 地图数据接口
interface CountryData {
  cumulative: {
    confirmed: number
    deaths: number
    recovered: number
  }
  daily_new: {
    confirmed: number
    deaths: number
    recovered: number
  }
}

interface MapResponse {
  date: string
  countries_count: number
  countries_data: {
    [country: string]: CountryData
  }
  global_total?: {
    confirmed: number
    deaths: number
    recovered: number
  }
}

interface AvailableDatesResponse {
  available_dates: string[]
  error?: string
}

// 国家名称映射（英文到中文）
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

// 获取国家中文名称
const getCountryChineseName = (englishName: string): string => {
  return countryNameMap[englishName] || englishName
}

// 计算当前确诊人数（活跃病例）
const calculateActiveCases = (cumulativeData: any): number => {
  const confirmed = cumulativeData.confirmed || 0
  const deaths = cumulativeData.deaths || 0
  const recovered = cumulativeData.recovered || 0
  return Math.max(0, confirmed - deaths - recovered)
}

// 处理地图点击事件
const handleMapClick = (params: any) => {
  if (params.data) {
    const countryName = params.data.englishName || params.name
    selectedCountry.value = countryName
    console.log(`点击国家: ${countryName}`)

    // 触发事件，通知父组件
    emit('countryClick', countryName)
  }
}

// 重置为全球视图
const resetToGlobal = () => {
  selectedCountry.value = 'Global'
  console.log('重置为全球视图')

  // 触发事件，通知父组件
  emit('countryClick', 'Global')
}

// 处理数据模式变化
const handleDataModeChange = () => {
  // 当选择"当前确诊"模式时，不需要数据类型选择
  // 当切换回其他模式时，重置数据类型为"确诊"
  if (dataMode.value !== 'active' && dataType.value === 'active') {
    dataType.value = 'confirmed'
  }
  updateChart()
}

// 获取可用日期列表
const fetchAvailableDates = async (): Promise<void> => {
  try {
    console.log('获取可用日期列表...')

    const response = await fetch(`${API_BASE_URL}/get_available_dates`)

    if (!response.ok) {
      throw new Error(`网络响应不正常: ${response.status} ${response.statusText}`)
    }

    const data: AvailableDatesResponse = await response.json()

    if (data.error) {
      throw new Error(`服务器返回错误: ${data.error}`)
    }

    availableDates.value = data.available_dates || []

    if (availableDates.value.length > 0) {
      minAvailableDate.value = availableDates.value[0]
      maxAvailableDate.value = availableDates.value[availableDates.value.length - 1]

      // 设置默认日期为最新日期
      selectedDate.value = maxAvailableDate.value

      console.log(`可用日期范围: ${minAvailableDate.value} 到 ${maxAvailableDate.value}`)
      console.log(`共 ${availableDates.value.length} 个可用日期`)
    } else {
      console.warn('没有可用的日期数据')
    }
  } catch (error) {
    console.error('获取可用日期失败:', error)
    // 如果获取失败，使用默认日期范围
    minAvailableDate.value = '2020-01-01'
    maxAvailableDate.value = '2022-12-31'
  }
}

// 检查日期是否在可用范围内
const isDateValid = (date: string): boolean => {
  if (!availableDates.value.length) return true // 如果没有可用日期数据，不进行验证

  return availableDates.value.includes(date)
}

// 处理日期变化
const handleDateChange = () => {
  dateError.value = ''

  if (!isDateValid(selectedDate.value)) {
    dateError.value = `该日期无数据，请选择 ${minAvailableDate.value} 到 ${maxAvailableDate.value} 之间的日期`
    return
  }

  updateChart()
}

// 获取地图数据
const fetchMapData = async (): Promise<MapResponse> => {
  try {
    loading.value = true
    useMockData.value = false

    console.log(`请求全球地图数据，日期: ${selectedDate.value}`)

    const response = await fetch(`${API_BASE_URL}/get_global_map_data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date: selectedDate.value
      })
    })

    if (!response.ok) {
      throw new Error(`网络响应不正常: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // 检查是否有错误信息
    if (data.error) {
      throw new Error(`服务器返回错误: ${data.error}`)
    }

    console.log(`成功获取 ${data.countries_count} 个国家/地区的数据`)
    return data
  } catch (error) {
    console.error('获取地图数据失败:', error)
    console.log('切换到模拟数据模式')
    useMockData.value = true
    // 返回模拟数据用于演示
    return getMockData()
  } finally {
    loading.value = false
  }
}

// 重试连接
const retryConnection = () => {
  useMockData.value = false
  updateChart()
}

// 模拟数据（当接口不可用时使用）
const getMockData = (): MapResponse => {
  const mockData: MapResponse = {
    date: selectedDate.value,
    countries_count: 50,
    countries_data: {},
    global_total: {
      confirmed: 0,
      deaths: 0,
      recovered: 0
    }
  }

  // 主要国家列表
  const majorCountries = [
    "China", "United States", "India", "Brazil", "Russia",
    "France", "Germany", "Japan", "United Kingdom", "Italy",
    "South Korea", "Canada", "Australia", "Spain", "Mexico",
    "Argentina", "South Africa", "Egypt", "Nigeria", "Pakistan"
  ]

  let totalConfirmed = 0
  let totalDeaths = 0
  let totalRecovered = 0

  majorCountries.forEach(country => {
    const confirmed = Math.floor(Math.random() * 10000000) + 100000
    const deaths = Math.floor(confirmed * 0.02) + 1000 // 死亡数约为确诊的2%
    const recovered = Math.floor(confirmed * 0.85) + 50000 // 治愈数约为确诊的85%

    totalConfirmed += confirmed
    totalDeaths += deaths
    totalRecovered += recovered

    mockData.countries_data[country] = {
      cumulative: {
        confirmed,
        deaths,
        recovered
      },
      daily_new: {
        confirmed: Math.floor(Math.random() * 10000) + 100,
        deaths: Math.floor(Math.random() * 200) + 10,
        recovered: Math.floor(Math.random() * 8000) + 50
      }
    }
  })

  mockData.global_total = {
    confirmed: totalConfirmed,
    deaths: totalDeaths,
    recovered: totalRecovered
  }

  return mockData
}

// 初始化图表
const initChart = async () => {
  await nextTick()

  if (!chartContainer.value) {
    console.error('图表容器未找到')
    setTimeout(initChart, 100)
    return
  }

  try {
    // 先获取可用日期
    await fetchAvailableDates()

    chart.value = echarts.init(chartContainer.value)

    // 添加点击事件监听
    chart.value.on('click', handleMapClick)

    await updateChart()
    window.addEventListener('resize', handleResize)
  } catch (error) {
    console.error('初始化图表失败:', error)
  }
}

// 更新图表
const updateChart = async () => {
  if (!chart.value) {
    console.warn('图表实例未初始化')
    return
  }

  try {
    const mapData = await fetchMapData()

    const chartData = Object.entries(mapData.countries_data).map(([country, data]) => {
      const chineseName = countryNameMap[country] || country

      // 根据数据模式计算对应的值
      let value: number
      if (dataMode.value === 'active') {
        // 当前确诊 = 累计确诊 - 累计死亡 - 累计治愈
        value = calculateActiveCases(data.cumulative)
      } else {
        value = data[dataMode.value][dataType.value]
      }

      return {
        name: chineseName,
        value: value,
        originalData: data,
        englishName: country
      }
    })

    const option: EChartsOption = {
      title: {
        text: `全球疫情${getDataModeText()}分布 (${mapData.date})${useMockData.value ? ' - 模拟数据' : ''}`,
        left: 'center',
        textStyle: {
          color: '#fff',
          fontSize: 18
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: function(params: any) {
          const data = params.data
          if (!data) return params.name

          const modeText = dataMode.value === 'cumulative' ? '累计' :
              dataMode.value === 'daily_new' ? '新增' : '当前'

          // 计算当前确诊人数
          const activeCases = calculateActiveCases(data.originalData.cumulative)

          return `
            <div style="font-weight: bold; margin-bottom: 8px;">${params.name}</div>
            <div style="margin-bottom: 4px;">累计确诊: ${data.originalData.cumulative.confirmed?.toLocaleString() || 0}</div>
            <div style="margin-bottom: 4px;">累计死亡: ${data.originalData.cumulative.deaths?.toLocaleString() || 0}</div>
            <div style="margin-bottom: 4px;">累计治愈: ${data.originalData.cumulative.recovered?.toLocaleString() || 0}</div>
            ${dataMode.value === 'daily_new' ? `
              <div style="margin-bottom: 4px; color: #ff6a6a;">新增确诊: ${data.originalData.daily_new.confirmed?.toLocaleString() || 0}</div>
              <div style="margin-bottom: 4px; color: #ff6a6a;">新增死亡: ${data.originalData.daily_new.deaths?.toLocaleString() || 0}</div>
              <div style="margin-bottom: 4px; color: #ff6a6a;">新增治愈: ${data.originalData.daily_new.recovered?.toLocaleString() || 0}</div>
            ` : ''}
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #ccc; color: #ff6a6a; font-weight: bold;">
              ${modeText}${getDataTypeText()}: ${data.value?.toLocaleString() || 0}
            </div>
            ${dataMode.value === 'active' ? `
              <div style="margin-top: 4px; font-size: 12px; color: #ccc;">
                (确诊 ${data.originalData.cumulative.confirmed?.toLocaleString() || 0} - 死亡 ${data.originalData.cumulative.deaths?.toLocaleString() || 0} - 治愈 ${data.originalData.cumulative.recovered?.toLocaleString() || 0})
              </div>
            ` : ''}
          `
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#777',
        textStyle: { color: '#fff' }
      },
      visualMap: {
        type: 'piecewise',
        pieces: [
          { min: 1000000, label: '> 100万', color: '#8B0000' },
          { min: 100000, max: 999999, label: '10万 - 100万', color: '#FF4500' },
          { min: 10000, max: 99999, label: '1万 - 10万', color: '#FFA500' },
          { min: 1000, max: 9999, label: '1千 - 1万', color: '#FFFF00' },
          { min: 1, max: 999, label: '1 - 999', color: '#ADFF2F' },
          { min: 0, max: 0, label: '0', color: '#FFFFFF' }
        ],
        left: 'left',
        top: 'bottom',
        textStyle: { color: '#fff' },
        itemWidth: 20,
        itemHeight: 14
      },
      series: [
        {
          name: '疫情数据',
          type: 'map',
          map: 'world',
          roam: true,
          emphasis: {
            label: {
              show: true,
              color: '#fff',
              fontSize: 12
            },
            itemStyle: {
              areaColor: '#389BB7',
              borderColor: '#fff',
              borderWidth: 1
            }
          },
          itemStyle: {
            borderColor: '#555',
            borderWidth: 0.5
          },
          data: chartData,
          nameMap: countryNameMap
        }
      ],
      backgroundColor: '#000'
    }

    chart.value.setOption(option, true)
  } catch (error) {
    console.error('更新图表失败:', error)
  }
}

// 获取数据模式文本
const getDataModeText = (): string => {
  const modeMap = {
    cumulative: '累计',
    daily_new: '新增',
    active: '当前确诊'
  }
  return modeMap[dataMode.value]
}

// 获取数据类型文本
const getDataTypeText = (): string => {
  if (dataMode.value === 'active') {
    return '确诊'
  }
  const typeMap = {
    confirmed: '确诊',
    deaths: '死亡',
    recovered: '治愈'
  }
  return typeMap[dataType.value]
}

// 刷新数据
const refreshData = () => {
  updateChart()
}

// 处理窗口大小变化
const handleResize = () => {
  chart.value?.resize()
}

// 生命周期
onMounted(() => {
  initChart()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chart.value?.dispose()
})
</script>

<style lang="scss" scoped>
.world-map-container {
  height: 100vh;
  width: 100vw;
  background: #000;
  position: relative;
  display: flex;
  flex-direction: column;

  .map-controls {
    padding: 20px;
    display: flex;
    gap: 20px;
    align-items: center;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);

    .control-group {
      display: flex;
      align-items: center;
      gap: 10px;
      position: relative;

      label {
        color: #fff;
        font-size: 14px;
        font-weight: bold;
        white-space: nowrap;
      }

      select, button, input {
        padding: 8px 12px;
        border: 1px solid #555;
        border-radius: 4px;
        background: #333;
        color: #fff;
        cursor: pointer;
        font-size: 14px;

        &:hover {
          background: #444;
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }

      input[type="date"] {
        min-width: 150px;
      }

      .error-message {
        position: absolute;
        top: 100%;
        left: 0;
        color: #ff6a6a;
        font-size: 12px;
        margin-top: 4px;
        white-space: nowrap;
      }

      .disabled-type {
        padding: 8px 12px;
        border: 1px solid #555;
        border-radius: 4px;
        background: #444;
        color: #ccc;
        font-size: 14px;
        min-width: 80px;
        text-align: center;
      }

      .reset-btn {
        background: #495057;

        &:hover:not(:disabled) {
          background: #5a6268;
        }
      }
    }
  }

  .chart-container {
    flex: 1;
    width: 100%;
    min-height: 0;
  }

  .loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #fff;
    font-size: 18px;
    background: rgba(0, 0, 0, 0.8);
    padding: 20px 40px;
    border-radius: 8px;
    z-index: 10;
  }

  .mock-warning {
    position: absolute;
    top: 80px;
    right: 20px;
    color: #ff6a6a;
    background: rgba(0, 0, 0, 0.9);
    padding: 12px 16px;
    border-radius: 6px;
    font-size: 12px;
    z-index: 10;
    border: 1px solid #ff6a6a;
    display: flex;
    align-items: center;
    gap: 10px;

    .retry-btn {
      padding: 4px 8px;
      background: #ff6a6a;
      color: white;
      border: none;
      border-radius: 3px;
      cursor: pointer;
      font-size: 11px;

      &:hover {
        background: #ff5252;
      }
    }
  }

  .selected-country {
    position: absolute;
    top: 80px;
    left: 20px;
    color: #51cf66;
    background: rgba(0, 0, 0, 0.8);
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    z-index: 10;
    border: 1px solid #51cf66;
  }
}
</style>