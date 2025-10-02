<!--疫情球体-->
<template>
  <dv-border-box-1 class="container" :color="dvColor" v-loading="isLoading"
                   element-loading-background="rgba(0, 0, 0, 0.9)" element-loading-text="数据加载中...">
    <div class="isMobile-div" v-if="mobileDiv">
      <!--手机端遮罩-->
    </div>

    <!--顶部标题-->
    <topheader  :dvColor="dvColor"
                :sysBackgroundColor="sysBackgroundColor"
                :allData="allData"
                :dataType="dataType"
                @date-change="handleDateChange"
    />

    <!--球体盒子-->
    <div id="sphereDiv"></div>

    <!--全球柱状图-->
    <dv-border-box-4 :reverse="true" :color="dvColor" class="sphereDataDiv">
      <p>累计确诊前{{ sliceNum }}国家</p>
      <dv-decoration-6 :color="dvColor" style="width:80%;height:20px;margin: -20px 0px 0px 10%" />
      <div class="histogramDivDiv">
        <div id="histogramDiv"></div>
      </div>
    </dv-border-box-4>

    <!--设置按钮-->
    <div class="set-div">
      <el-icon color="#777777" :size="40" @click="isDrawer = true">
        <Setting />
      </el-icon>
    </div>

    <!--数字盒子-->
    <dv-border-box-4 :color="dvColor" class="numDiv">
      <div class="addconDiv" :style="{ backgroundColor: sysBackgroundColor }">
        <div class="tit">全球累计确诊</div>
        <addNumber class="certain-div" :value="certain" :time="10" :thousandSign="true" />
        <div class="day-tit">今日+{{ othertotal.certain_inc }}</div>
      </div>
      <div class="addcureDiv" :style="{ backgroundColor: sysBackgroundColor }">
        <div class="tit">全球累计治愈</div>
        <addNumber class="addcure-div" :value="addcure" :time="10" :thousandSign="true" />
        <div class="day-tit">今日+{{ othertotal.recure_inc }}</div>
      </div>
      <div class="addDieDiv" :style="{ backgroundColor: sysBackgroundColor }">
        <div class="tit">全球累计死亡</div>
        <addNumber class="addDie-div" :value="addDie" :time="10" :thousandSign="true" />
        <div class="day-tit">今日+{{ othertotal.die_inc }}</div>
      </div>
    </dv-border-box-4>

    <!--底部按钮-->
    <dv-decoration-1 class="btn-dv1" :reverse="true" :color="dvColor" />
    <dv-border-box-10 :color="dvColor" class="btn-div">
      <el-button class="btn" :color=dvColor[0] @click="isSphere = true">
        <el-icon :size="20" style="margin-right: 10px;">
          <List />
        </el-icon>
        全球数据
      </el-button>
      <el-button class="btn" :color=dvColor[0] @click="isChina = true">
        <el-icon :size="20" style="margin-right:10px;">
          <List />
        </el-icon>
        国内数据
      </el-button>
      <el-button class="btn" :color=dvColor[0] @click="isEchart = true;">
        <el-icon :size="20" style="margin-right: 10px;">
          <TrendCharts />
        </el-icon>
        国内分析
      </el-button>
      <el-button class="btn" :color=dvColor[0] @click="provinceAnalyze">
        <el-icon :size="20" style="margin-right: 10px;">
          <TrendCharts />
        </el-icon>
        省内分析
      </el-button>
      <el-button class="btn" :color=dvColor[0] @click="openPreview">
        <img :src="wordImg">
        生成报告
      </el-button>
    </dv-border-box-10>
    <dv-decoration-1 class="btn-dv2" :color="dvColor" />

    <div class="components">
      <!--点的标签-->
      <PointMsg :dvColor="dvColor" :position="position" :currentPointData="currentPointData" />
      <!--设置抽屉-->
      <SetDrawer :isDrawer="isDrawer" @close="isDrawer = false" @changeSetData="changeSetData" />
      <!--全球数据表格-->
      <SphereTabDrawer :dvColor="dvColor" :isSphere="isSphere" :sphereData="sphereData" @close="isSphere = false" />
      <!--国内数据表格-->
      <ChinaTabDrawer :dvColor="dvColor" :allData="allData" :isChina="isChina" :list="allData.list"
                      @close="isChina = false" />
      <!--国内图表分析-->
      <ChinaEchartDrawer :dvColor="dvColor" :sphereData="sphereData" :daily="allData.add_daily"
                         :jwsrTop="allData.jwsrTop" :isEchart="isEchart" @close="isEchart = false" :historylist="allData.historylist"
                         :allData="allData" />
      <!--省内图表分析-->
      <ProvinceEchartDrawer :dvColor="dvColor" :isProvinceEchartDrawer="isProvinceEchartDrawer"
                            @close="isProvinceEchartDrawer = false" :currentProvinceData="currentProvinceData" />
      <!--报告抽屉-->
      <ReportDrawer :isReport="isReport" :dvColor="dvColor" :reportData="reportData" @close="isReport = false" />
    </div>
  </dv-border-box-1>
</template>

<script lang='ts' setup>
import { ref, computed, watch, onMounted } from 'vue';
import * as THREE from "three";
import { MeshLine, MeshLineMaterial } from 'three.meshline';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import gsap from "gsap";
import * as echarts from "echarts";
import PK from "@/../package.json";
import jsonp from "@/utils/jsonpUtils";
import jsonp1 from "@/utils/jsonpUtils1";
import { getWordBlob } from "@/utils/getWordBlob.js";
import addNumber from "@/components/addNumber.vue";
import countryPosition from "@/assets/json/countryPosition.json";
import { dataSource1, dataSource2 } from "@/api/request";
import tempData from "@/assets/json/tempWorldData.json";
import tempProvinceData from "@/assets/json/tempProvinceData.json";
import tempIpData from "@/assets/json/tempIpData.json";
import universeImg from "@/assets/img/universe.jpg";
import starImg from "@/assets/img/star.jpg";
import earthImg from "@/assets/img/earth.jpg";
import earthNightImg from "@/assets/img/earthNight.jpg";
import ringImg from "@/assets/img/ring_explosion.jpg";
import earthGlowImg from "@/assets/img/earth-glow.jpg";
import normalImg from "@/assets/img/earthNormal.jpg";
import virusImg from "@/assets/img/virus1.png";
import earthGrayscale from "@/assets/img/map_inverted.png";
import PointMsg from "@/components/PointMsg.vue";
import ChinaEchartDrawer from "@/views/ChinaEchartDrawer.vue";
import SetDrawer from "@/components/SetDrawer.vue";
import SphereTabDrawer from "@/views/SphereTabDrawer.vue";
import ChinaTabDrawer from "@/views/ChinaTabDrawer.vue";
import ReportDrawer from "@/views/ReportDrawer.vue";
import ProvinceEchartDrawer from "@/views/ProvinceEchartDrawer.vue";
import wordImg from "@/assets/img/word.png";
import Topheader from "@/components/Topheader.vue";

// 引入fetch API来调用Flask后端
const fetchCovidData = async (date: string) => {
  try {
    const response = await fetch('http://localhost:5000/get_covid_stats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ date }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('获取COVID-19数据失败:', error);
    return null;
  }
};

const fetchAvailableDates = async () => {
  try {
    const response = await fetch('http://localhost:5000/get_available_dates', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.available_dates;
  } catch (error) {
    console.error('获取可用日期失败:', error);
    return [];
  }
};

let version: any = ref(PK.version),//系统版本号
    mobileDiv: any = ref(true),//手机端遮罩
    scene: any = null, //场景(频繁变更的对象放置在vue的data中会导致卡顿)
    camera: any = null, //相机
    dom: any = null, //需要使用canvas的dom
    renderer: any = null, //渲染器
    orbitControls: any = null, //鼠标控件
    mouse = new THREE.Vector2(), //鼠标的二维平面
    raycaster = new THREE.Raycaster(), //光线投射器(用于鼠标点击时获取坐标)
    earthGroup: any = new THREE.Group(),//球体组
    earthSize: any = 100, //地球尺寸
    positionData = countryPosition, //国家位置数据
    isSphere = ref(false),//全球数据对话框状态
    isChina = ref(false),//国内数据对话框状态
    isEchart = ref(false),//图表分析对话框状态
    isReport = ref(false),//报告对话框状态
    anId = ref(0), //动画id
    isLoading = ref(false), //加载状态
    allData: any = ref({}), //疫情所有数据
    othertotal: any = ref({}),//全球基本数据
    sphereData: any = ref([]), //球体数据
    currentPointData: any = ref({}), //当前选中点的数据
    position = ref({ x: "", y: "" }), //标签位置
    isDrawer = ref(false),//设置抽屉状态
    histogramChart: any = null,//柱状图
    sliceNum: number = 50,//柱状图截取数量
    certain = ref(0),//全球累计确诊
    addcure = ref(0),//全球累计治愈数
    addDie = ref(0),//全球累计死亡数
    userMsg: any = ref({}),//使用者信息
    currentProvinceData: any = ref({}),//当前省数据
    isProvinceEchartDrawer = ref(false),//省内图表对话框
    dvColor: any = ref([]),//系统配色
    sysBackgroundColor: any = 'rgb(255, 255, 255, .1)',//系统背景主题色
    reportData: any = ref({ blobData: null, fileName: null }),//报告数据
    dataType: any = ref(null),//数据来源
    dotLineRingMesh: any = null,//点线组
    flylineMesh: any = null,//飞线组
    expandRingMesh: any = null;//放大环组
const currentSelectedDate = ref(''); // 用于存储选中的日期

onMounted(() => {
  judgeDevice();//判断设备
})

//当allData数据获取完成后开始获取用户ip信息
watch(
    () => allData.value,
    (val) => {
      if (val.times) {
        getLocationMsg();//获取用户ip信息
      }
    }
)

//判断设备
function judgeDevice() {
  let isMobile = navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i);
  if (isMobile) {
    alert("当前项目暂未适配移动端，请在pc端打开！");
  } else {
    mobileDiv.value = false;//关闭手机端遮罩
    dvColor.value = JSON.parse(sessionStorage.getItem("config") as any).sysColor;//获取系统配色
    getCOVID19Data(); //获取疫情数据
  }
};

//设置切换
function changeSetData(type: string, setData: any) {
  (type == "sphereType") && (destroyScene(), init(sphereData.value));//球体类型切换
  (type == "autoRotate") && (orbitControls.autoRotate = setData.value.autoRotate);//自转切换
  (type == "isDrag") && (orbitControls.enableRotate = setData.value.isDrag);//鼠标拖拽旋转
  (type == "isZoom") && (orbitControls.enableZoom = setData.value.isZoom);//鼠标缩放
  (type == "rotateSpeed") && (orbitControls.autoRotateSpeed = setData.value.rotateSpeed / 10);//自转速度
  (type == "dataType") && (location.reload());//刷新页面重新获取数据源
};

//销毁场景
function destroyScene() {
  earthGroup.translateY(8);//还原球体组的平移
  clearGroup(earthGroup);//清除组
  cancelAnimationFrame(anId.value); //根据动画id停止动画渲染
  renderer.forceContextLoss(); //强制失去上下文
  renderer.dispose();
  scene.clear();
  scene = null;
  camera = null;
  orbitControls = null;
  dom.innerHTML = null;
  renderer = null;
};

//销毁组数据
function clearGroup(group: any) {
  //清除缓存
  const clearCache = (item: any) => {
    item.geometry.dispose();//必须对组中的material与geometry进行dispose，清除占用的缓存
    item.material.dispose();
  };
  //移除模型
  const removeObj = (obj: any) => {
    let arr = obj.children.filter((x: any) => x);
    arr.forEach((item: any) => {
      if (item.children.length) {
        removeObj(item);
      } else {
        clearCache(item);
        item.clear();
      }
    });
    obj.clear();
    arr = null;
  };
  removeObj(group);
};

//解码返回的unicode
function decodingStr(str: any) {
  let repStr: any = str.replace(/\\/g, "%");//用%替换\
  let str1 = repStr.split("jsoncallback(")[1]
  let str2 = str1.split(");")[0]//截取出需要的字符串
  let unStr = unescape(str2);//解码出汉字(方法弃用)
  let jsonObj = JSON.parse(unStr);//转换成json对象
  return jsonObj;
};

// 处理日期变化的函数
const handleDateChange = async (date: string) => {
  console.log('原始日期:', date);

  try {
    const dateObj = new Date(date);
    // 使用本地时间的年、月、日
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    console.log('转换后日期:', formattedDate);
    currentSelectedDate.value = formattedDate;

    await getCOVID19Data(formattedDate);
  } catch (error) {
    console.error('日期处理错误:', error);
    // 使用当前日期作为默认值
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const defaultDate = `${year}-${month}-${day}`;
    await getCOVID19Data(defaultDate);
  }
};
// 获取COVID-19数据的函数
async function getCOVID19Data(selectedDate?: string) {
  isLoading.value = true;
  console.log(`开始获取COVID-19数据，日期: ${selectedDate || '最新日期'}`);

  // 安全地获取配置数据，提供默认值以避免类型错误
  let configData;
  try {
    const configStr = sessionStorage.getItem("config");
    configData = configStr ? JSON.parse(configStr) : { dataType: "实时" };
  } catch (error) {
    console.error("解析配置数据失败:", error);
    configData = { dataType: "实时" }; // 默认配置
  }

  dataType.value = configData.dataType;

  // 默认使用Flask API，如果离线则使用tempData
  if (dataType.value !== "离线") {
    try {
      let targetDate: string;

      // 如果传入了特定日期，则使用该日期，否则获取最新日期
      if (selectedDate) {
        targetDate = selectedDate;
      } else {
        const availableDates = await fetchAvailableDates();
        if (availableDates.length > 0) {
          targetDate = availableDates[availableDates.length - 1];
          console.log(`使用最新可用日期: ${targetDate}`);
        } else {
          throw new Error("无可用日期");
        }
      }

      const data = await fetchCovidData(targetDate);

      if (data && validateDataStructure(data)) {
        console.log("成功从Flask获取数据", {
          日期: data.date,
          累计确诊: data.global_stats.total_confirmed,
          累计治愈: data.global_stats.total_recovered,
          累计死亡: data.global_stats.total_deaths,
          国家数量: data.top_50_countries.length
        });

        structureFlaskData(data, targetDate);
      } else {
        console.error("从Flask获取的数据格式不正确", data);
        useTempData();
      }
    } catch (error) {
      console.error("从Flask获取数据失败:", error);
      useTempData();
    }
  } else {
    console.log("使用离线数据模式");
    useTempData();
  }
}

function useTempData() {
  console.log("使用tempData数据");
  allData.value = tempData.data;
  structureData(allData.value); //构造数据
  isLoading.value = false;
}

// 数据验证函数
function validateDataStructure(data: any) {
  if (!data || !data.global_stats) {
    console.error("数据格式错误: 缺少global_stats字段");
    return false;
  }

  const requiredFields = ['total_confirmed', 'total_recovered', 'total_deaths'];
  const missingFields = requiredFields.filter(field => !(field in data.global_stats));

  if (missingFields.length > 0) {
    console.error(`数据格式错误: 缺少字段 ${missingFields.join(', ')}`);
    return false;
  }

  console.log("数据结构验证通过");
  return true;
}

// 重构Flask返回的数据结构以适应现有代码
function structureFlaskData(flaskData: any, date: string) {
  if (!validateDataStructure(flaskData)) {
    console.error("数据结构验证失败，使用备用数据");
    useTempData();
    return;
  }

  // Flask返回格式:
  // {
  //   date: "2023-04-15",
  //   top_50_countries: [{country: "US", confirmed: 1000000, ...}, ...],
  //   global_stats: {total_confirmed: 500000000, ...}
  // }

  // 重新构造为原代码期望的格式
  const worldlist = flaskData.top_50_countries.map((item: any) => ({
    name: item.country,
    value: item.confirmed, // 累计确诊
    deathNum: item.deaths,
    cureNum: item.recovered,
    active: item.active,
    position: getCountryPosition(item.country)
  })).filter((item: any) => item.position); // 过滤掉没有位置信息的国家

  // 模拟获取国家位置
  function getCountryPosition(countryName: string) {
    const positionMap: Record<string, [number, number]> = {
      "US": [ -98.5795, 39.8283 ],
      "India": [ 78.9629, 20.5937 ],
      "Brazil": [ -51.9253, -14.2350 ],
      "Russia": [ 105.3188, 61.5240 ],
      "United Kingdom": [ -3.4360, 55.3781 ],
      "Turkey": [ 35.2433, 38.9637 ],
      "Italy": [ 12.5674, 41.8719 ],
      "Spain": [ -3.7038, 40.4168 ],
      "Germany": [ 10.4515, 51.1657 ],
      "France": [ 2.2137, 46.6034 ],
      "Iran": [ 53.6880, 32.4279 ],
      "Colombia": [ -74.2973, 4.5709 ],
      "Poland": [ 19.1451, 51.9194 ],
      "Argentina": [ -63.6167, -38.4161 ],
      "Ukraine": [ 31.1656, 48.3794 ],
      "South Africa": [ 22.9375, -30.5595 ],
      "Mexico": [ -102.5528, 23.6345 ],
      "Japan": [ 138.2529, 36.2048 ],
      "Indonesia": [ 113.9213, -0.7893 ],
      "Netherlands": [ 5.2913, 52.1326 ],
      "Malaysia": [ 101.9758, 4.2105 ],
      "Thailand": [ 100.9925, 15.8700 ],
      "Philippines": [ 121.7740, 12.8797 ],
      "Belgium": [ 4.4699, 50.5039 ],
      "Peru": [ -75.0152, -9.1900 ],
      "Switzerland": [ 8.2275, 46.8182 ],
      "Chile": [ -71.5430, -35.6751 ],
      "Iraq": [ 43.6793, 33.2232 ],
      "Bangladesh": [ 90.3563, 23.6850 ],
      "Pakistan": [ 69.3451, 30.3753 ],
      "Israel": [ 34.8516, 31.0461 ],
      "Austria": [ 13.3455, 47.5162 ],
      "Czechia": [ 15.4730, 49.8175 ],
      "Ecuador": [ -78.1834, -1.8312 ],
      "Canada": [ -106.3468, 56.1304 ],
      "Sweden": [ 18.6435, 60.1282 ],
      "Egypt": [ 30.8418, 26.8206 ],
      "Portugal": [ -7.8537, 39.3999 ],
      "Saudi Arabia": [ 45.0792, 23.8859 ],
      "Romania": [ 24.9668, 45.9432 ],
      "Jordan": [ 36.2828, 30.5852 ],
      "Denmark": [ 9.5018, 56.2639 ],
      "Singapore": [ 103.8198, 1.3521 ],
      "Serbia": [ 21.0080, 44.0165 ],
      "Finland": [ 25.7482, 61.9241 ],
      "Lebanon": [ 35.8623, 33.8547 ],
      "Norway": [ 8.4689, 60.4720 ],
      "Australia": [ 133.7751, -25.2744 ],
      "Greece": [ 21.8243, 39.0742 ]
    };

    return positionMap[countryName] || null;
  }

  // 构造allData格式
  const reconstructedData = {
    times: date,
    worldlist: worldlist,
    othertotal: {
      certain: flaskData.global_stats.total_confirmed,    // 累计确诊
      recure: flaskData.global_stats.total_recovered,     // 累计治愈
      die: flaskData.global_stats.total_deaths,           // 累计死亡
      econNum: flaskData.global_stats.total_active ||     // 现存确诊（活跃病例）
          (flaskData.global_stats.total_confirmed - flaskData.global_stats.total_recovered - flaskData.global_stats.total_deaths),
      // 新增字段 - 单日新增数据
      certain_inc: flaskData.global_stats.new_confirmed || 0,  // 单日新增确诊
      recure_inc: flaskData.global_stats.new_recovered || 0,   // 单日新增治愈
      die_inc: flaskData.global_stats.new_deaths || 0          // 单日新增死亡
    },
    list: [] // 国内数据暂时为空，或从其他API获取
  };

  allData.value = reconstructedData;
  structureData(allData.value);
  isLoading.value = false;
}

//jsonp方式获取数据
function jsonpGetData() {
  let jsonpUrl: any = process.env.VUE_APP_1;//获取环境变量中的url地址
  let callBackName = "jsoncallback";//回调名
  jsonp(jsonpUrl, (res: any) => {
    if (res.status.msg = "success") {
      console.log("jsonp获取数据");
      allData.value = res.data; //记录所有数据
    } else {
      console.log("使用tempData数据");
      allData.value = tempData.data;
    }
    structureData(allData.value); //构造数据
    isLoading.value = false;
  }, callBackName)
};

//构造球体数据
function structureData(COVID19Data: any) {
  let worldlist = JSON.parse(JSON.stringify(COVID19Data.worldlist));
  worldlist.forEach((w: any) => {
    for (let key in positionData) {
      if (w.name == key) {
        w.position = positionData[key];
      }
    }
    //国外数据类型转换
    w.value = Number(w.value);//字符串转换为数字类型
    w.deathNum = Number(w.deathNum);
    w.cureNum = Number(w.cureNum);
  });
  sphereData.value = worldlist;
  othertotal.value = allData.value.othertotal;
  //国内省份数据类型转换
  if (allData.value.list && allData.value.list.forEach) {
    allData.value.list.forEach((l: any) => {
      l.value = Number(l.value);
      l.econNum = Number(l.econNum);
      l.deathNum = Number(l.deathNum);
      l.cureNum = Number(l.cureNum);
      l.asymptomNum = Number(l.asymptomNum);
      l.jwsrNum = Number(l.jwsrNum);
      //市/区数据类型转换
      if (l.city && l.city.length !== 0) {
        l.city.forEach((c: any) => {
          c.conNum = Number(c.conNum);
          c.econNum = Number(c.econNum);
          c.deathNum = Number(c.deathNum);
          c.cureNum = Number(c.cureNum);
          c.asymptomNum = Number(c.asymptomNum);
          c.zerodays = Number(c.zerodays);
        })
      }
    })
  }
  init(sphereData.value); //初始化
  setTimeout(() => {
    initEchart();//初始化图表
  }, 500);
};

//初始化球体
function init(data: any) {
  dom = document.getElementById("sphereDiv"); //获取dom
  let width = dom.clientWidth;
  let height = dom.clientHeight;
  scene = new THREE.Scene(); //场景场景
  camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000); //创建透视相机(视场、长宽比、近面、远面)
  camera.position.set(0, 50, 350); //设置相机位置
  camera.lookAt(0, 0, 0);
  //创建渲染器
  renderer = new THREE.WebGLRenderer({
    antialias: true, //抗锯齿
    alpha: true, //透明
  });
  renderer.setClearColor(0x000000, 0.1); //设置场景透明度
  renderer.setSize(width, height); //设置渲染区域尺寸
  dom.appendChild(renderer.domElement); //将渲染器添加到dom中形成canvas
  createUniverse(); //创建宇宙
  createStars(); //创建星辰
  createLight(); //创建光源
  createSphere(data); //创建球体
  createOrbitControls();
  render();
  window.addEventListener('resize', onWindowResize, false);
};

//窗口尺寸改变重设渲染器
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;//修改相机宽高比
  camera.updateProjectionMatrix();// 更新投影的变换矩阵
  renderer.setSize(window.innerWidth, window.innerHeight);//设置渲染器尺寸
  initEchart();//初始化图表
};

//创建宇宙(球形宇宙)
function createUniverse() {
  let universeGeometry = new THREE.SphereGeometry(500, 100, 100);
  let universeMaterial = new THREE.MeshLambertMaterial({
    //高光材质
    map: new THREE.TextureLoader().load(universeImg),
    side: THREE.DoubleSide, //双面显示
  });
  //宇宙网格
  let universeMesh = new THREE.Mesh(universeGeometry, universeMaterial);
  universeMesh.name = "宇宙";
  scene.add(universeMesh);
};

//创建星辰
function createStars() {
  const positions = [];
  const colors = [];
  //星辰几何体
  const starsGeometry = new THREE.BufferGeometry();
  //添加星辰的颜色与位置
  for (let i = 0; i < 1000; i++) {
    let vertex = new THREE.Vector3();
    vertex.x = Math.random() * 2 - 1;
    vertex.y = Math.random() * 2 - 1;
    vertex.z = Math.random() * 2 - 1;
    positions.push(vertex.x, vertex.y, vertex.z);
    let color = new THREE.Color();
    color.setRGB(255, 255, 255);
    colors.push(color.r, color.g, color.b);
  }
  starsGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
  );
  starsGeometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(colors, 3)
  );
  //星辰材质
  let starsMaterial = new THREE.PointsMaterial({
    map: new THREE.TextureLoader().load(starImg),
    size: 4,
    blending: THREE.AdditiveBlending,
    fog: true,
    depthTest: false, //(不能与blending一起使用)
  });
  //星辰的集合
  let starsMesh = new THREE.Points(starsGeometry, starsMaterial);
  starsMesh.scale.set(1000, 1000, 1000); //设置集合体范围
  starsMesh.name = "星辰";
  scene.add(starsMesh);
};

//创建光源
function createLight() {
  let lightColor = new THREE.Color(0xffffff);
  let ambient = new THREE.AmbientLight(lightColor); //环境光
  ambient.name = "环境光";
  scene.add(ambient);
  let directionalLight1 = new THREE.DirectionalLight(lightColor);
  directionalLight1.position.set(0, 0, 1000);
  scene.add(directionalLight1); //平行光源添加到场景中
  let directionalLight2 = new THREE.DirectionalLight(lightColor);
  directionalLight2.position.set(0, 0, -1000);
  scene.add(directionalLight2); //平行光源添加到场景中
  let directionalLight3 = new THREE.DirectionalLight(lightColor);
  directionalLight3.position.set(1000, 0, 0);
  scene.add(directionalLight3); //平行光源添加到场景中
  let directionalLight4 = new THREE.DirectionalLight(lightColor);
  directionalLight4.position.set(-1000, 0, 0);
  scene.add(directionalLight4); //平行光源添加到场景中
  let directionalLight5 = new THREE.DirectionalLight(lightColor);
  directionalLight5.position.set(0, 1000, 0);
  scene.add(directionalLight5); //平行光源添加到场景中
  let directionalLight6 = new THREE.DirectionalLight(lightColor);
  directionalLight6.position.set(0, -1000, 0);
  scene.add(directionalLight6); //平行光源添加到场景中
};

//创建球体
async function createSphere(data: any) {
  let sphereType = JSON.parse(sessionStorage.getItem("config") as any).sphereType;//获取球体类型
  sphereType == "粒子" ? createSpotSphere() : createWBSphere(sphereType);//判断需要创建的球体类型
  earthGroup.name = "地球组";
  createVirus(data, earthSize); //创建球面病毒
  scene.add(earthGroup);//将球体组添加到场景中
  await earthGroup.translateY(-8);//平移球体组位置
};

//创建白昼黑夜球体
async function createWBSphere(sphereType: any) {
  let earthGeometry = new THREE.SphereGeometry(earthSize, 100, 100); //地球几何体
  let nightColor = new THREE.Color(0x999999);
  let dayColor = new THREE.Color(0x444444);
  //地球材质
  let earthMaterial = new THREE.MeshPhongMaterial({
    map: new THREE.TextureLoader().load(
        sphereType == "白昼" ? earthImg : earthNightImg //区分昼夜纹理
    ),
    color: sphereType == "白昼" ? dayColor : nightColor,
    normalScale: new THREE.Vector2(0, 5), //凹凸深度
    normalMap: new THREE.TextureLoader().load(normalImg), //法线贴图
  });
  let earthMesh = new THREE.Mesh(earthGeometry, earthMaterial); //地球网格
  earthMesh.name = "地球";
  await earthGroup.add(earthMesh); //将地球网格添加到地球组中
};

//创建斑点球体
async function createSpotSphere() {
  let globeBufferGeometry = new THREE.SphereGeometry(earthSize - 3, 50, 50);//球体几何体
  let globeInnerMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(dvColor.value[0]),//颜色
    transparent: true,//透明
    opacity: .4,//不透明度
    fog: new THREE.Fog(0x050505, 2000, 3500),

  });
  let globeInnerMesh = new THREE.Mesh(
      globeBufferGeometry,
      globeInnerMaterial
  );
  earthGroup.add(globeInnerMesh); //将网格放入地球组
  createSpot();//创建球面斑点
};

//创建球面斑点
function createSpot() {
  let img = new Image();
  img.src = earthGrayscale; //黑白地图
  //图片加载后绘制斑点至球面
  img.onload = () => {
    let canvas = document.createElement("canvas");
    canvas.width = img.width; //使得canvas尺寸与图片尺寸相同
    canvas.height = img.height;
    (canvas.getContext("2d") as any).drawImage(img, 0, 0, img.width, img.height);//canvas绘制图片
    let canData = (canvas.getContext("2d") as any).getImageData(0, 0, canvas.width, canvas.height);//获取画布像素数据
    let globeCloudBufferGeometry = new THREE.BufferGeometry(); //设置缓冲几何体
    let globeCloudVerticesArray = []; //地球云缓冲几何体顶点
    let o = null; //数组处理时的计数
    for (o = 0; o < canData.data.length; o += 4) {
      let r = (o / 4) % canvas.width,
          i = (o / 4 - r) / canvas.width;
      if ((o / 4) % 2 == 1 && i % 2 == 1)
        if (0 === canData.data[o]) {
          let n = r,
              longitude = (i / (canvas.height / 180) - 90) / -1, //经度
              latitude = n / (canvas.width / 360) - 180; //维度
          let s = latLongToVector3(longitude, latitude, earthSize, .1); //经纬度变换
          globeCloudVerticesArray.push(s); //将变换后的顶点放入数组
        }
    }
    let l = new Float32Array(3 * globeCloudVerticesArray.length); //创建顶点数组长度
    for (o = 0; o < globeCloudVerticesArray.length; o++) {
      l[3 * o] = globeCloudVerticesArray[o].x;//设置顶点数组数据
      l[3 * o + 1] = globeCloudVerticesArray[o].y;
      l[3 * o + 2] = globeCloudVerticesArray[o].z;
    }
    let positionVal = new THREE.BufferAttribute(l, 3); //设置缓冲区属性值
    globeCloudBufferGeometry.setAttribute("position", positionVal); //给缓冲几何体添加位置属性
    let globeCloudMaterial = new THREE.PointsMaterial({
      color: new THREE.Color(dvColor.value[1]),//颜色
      fog: true,
      size: 1.5,
      transparent: false,
    });//球面斑点材质
    let d = new Float32Array(3 * globeCloudVerticesArray.length), c = [];
    for (o = 0; o < globeCloudVerticesArray.length; o++) {
      c[o] = new THREE.Color(dvColor.value[1]);//球面斑点颜色
      d[3 * o] = c[o].r;//设置地球云数组rgb颜色
      d[3 * o + 1] = c[o].g;
      d[3 * o + 2] = c[o].b;
    }
    let color_val = new THREE.BufferAttribute(d, 3);
    globeCloudBufferGeometry.setAttribute("color", color_val);//给缓冲几何体添加颜色属性,修改颜色直接修改globeCloudBufferGeometry的setAttribute
    let globeCloud = new THREE.Points(//球面的象素点
        globeCloudBufferGeometry,
        globeCloudMaterial,
    );
    globeCloud.name = "globeCloud";
    earthGroup.add(globeCloud); //将地球云添加到地球对象中
  };
};

//经纬度坐标变换（传入e:纬度、a经度、t球半径、o球额外距离）
function latLongToVector3(e: any, a: any, t: any, o: any) {
  let r = (e * Math.PI) / 180,
      i = ((a - 180) * Math.PI) / 180,
      n = -(t + o) * Math.cos(r) * Math.cos(i),
      s = (t + o) * Math.sin(r),
      l = (t + o) * Math.cos(r) * Math.sin(i);
  return new THREE.Vector3(n, s, l); //计算三维向量
};

//创建病毒
function createVirus(data: any, earthSize: any) {
  let colors = [
    new THREE.Color(0xf9b8b8),
    new THREE.Color(0xfe4242),
    new THREE.Color(0xff0000),
  ]; //病毒颜色列表
  let virSize = 0; //病毒大小
  let list = JSON.parse(JSON.stringify(data));
  list.forEach((e: { value: number; color: any; position: any[]; }) => {
    e.value >= 10000000 && (e.color = colors[2]); //根据病毒数赋予不同颜色
    e.value >= 500000 && e.value < 10000000 && (e.color = colors[1]);
    e.value < 500000 && (e.color = colors[0]);
    if (e.position) {
      let virusMaterial = new THREE.SpriteMaterial({
        color: e.color,
        map: new THREE.TextureLoader().load(virusImg),
        transparent: true,
        depthWrite: true,
        fog: true,
      }); //病毒材质
      let Sprite = new THREE.Sprite(virusMaterial); //点精灵材质
      Sprite.scale.set(virSize, virSize, 1); //点大小
      let lat = e.position[1]; //纬度
      let lon = e.position[0]; //经度
      let s = latLongToVector3(lat, lon, earthSize, 1); //坐标转换
      Sprite.position.set(s.x, s.y, s.z); //设置点的位置
      Sprite.dotData = e; //将点的数据添加到dotData属性中
      Sprite.name = "病毒";
      earthGroup.add(Sprite); //将病毒添加进球体组中
    }
  });
  createRings();
};

//创建环
function createRings() {
  createEquatorSolidRing(earthSize + 20);//创建赤道实线环
  createEquatorFlyline(earthSize + 30);//创建赤道飞线环
  createEquatorDottedLineRing(earthSize + 35);//创建赤道虚线环
  createSpikes(earthSize + 40);//创建赤道尖刺
  createUpDownRing(earthSize - 50, earthSize - 40);//创建上下环
  createExpandRing();//创建扩大动画的环
  createSphereGlow();//创建球体发光环
};

//创建赤道实线环
function createEquatorSolidRing(r: any) {
  //创建里层的环
  let ringGeometry = new THREE.RingGeometry(r - 2, r + 2, 100);
  let ringMaterial = new THREE.MeshBasicMaterial({
    color: dvColor.value[0],
    opacity: .3,
    side: THREE.DoubleSide,
    fog: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  let ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
  ringMesh.rotation.x = 90 * Math.PI / 180;
  earthGroup.add(ringMesh);
};

//创建赤道飞线
function createEquatorFlyline(r: any) {
  const geometry = new THREE.BufferGeometry();
  const path = new THREE.Path();
  path.arc(0, 0, r, 0, Math.PI * 2);
  const points = path.getPoints(100);//切割段数
  geometry.setFromPoints(points);
  const line = new MeshLine();
  // 设置几何体
  line.setGeometry(geometry)
  const material = new MeshLineMaterial({
    color: dvColor.value[0],
    lineWidth: 1, // 线条的宽度
    dashArray: .5, // 该数值倒数为线段数量
    dashRatio: .5, // 不可见与可见比例
    transparent: true, // 设置透明度
  })
  flylineMesh = new THREE.Mesh(line.geometry, material);
  flylineMesh.rotation.x = 90 * Math.PI / 180;
  earthGroup.add(flylineMesh);
};

//创建赤道虚线环
function createEquatorDottedLineRing(r: any) {
  const positions = [];
  let ringPointGeometry = new THREE.BufferGeometry(); //环形点几何体
  let pointNum = 50;//点的数量
  let ringPointAngle = (2 * Math.PI) / pointNum; //环形点角度
  for (let o = 0; o < 500; o++) {
    let n = new THREE.Vector3(); //点的向量
    n.x = r * Math.cos(ringPointAngle * o); //计算点的角度
    n.y = 0;
    n.z = r * Math.sin(ringPointAngle * o);
    positions.push(n.x, n.y, n.z);
  }
  ringPointGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
  );//设置位置属性
  let ringPointMaterial = new THREE.PointsMaterial({
    //环形点材质
    size: 3,
    transparent: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  dotLineRingMesh = new THREE.Points(
      ringPointGeometry,
      ringPointMaterial
  );
  dotLineRingMesh.name = "赤道虚线";
  earthGroup.add(dotLineRingMesh);
};

//创建赤道尖刺
function createSpikes(spikeRadius: any) {
  let spikesVerticesArray = [];
  let spikesObject = new THREE.Group(); //创建尖刺的组
  spikesObject.name = "赤道尖刺";
  earthGroup.add(spikesObject); //将尖刺组添加到旋转组中
  //创建尖刺
  let spikeNum = 400;//尖刺数量
  let o = (2 * Math.PI) / spikeNum;
  for (let s = 0; s < spikeNum; s++) {
    let r = new THREE.Vector3();
    r.x = spikeRadius * Math.cos(o * s);
    r.y = 0;
    r.z = spikeRadius * Math.sin(o * s);
    r.normalize();//归一化，将该向量转化为向量单位
    r.multiplyScalar(spikeRadius);
    let i = r.clone(); //克隆r至i
    (s % 10 == 1) ? i.multiplyScalar(1.1) : i.multiplyScalar(1.05);//每10个计算一次向量与标量相乘
    spikesVerticesArray.push(r); //将向量存入尖刺顶点列表
    spikesVerticesArray.push(i);
  }
  let n = new Float32Array(3 * spikesVerticesArray.length); //创建顶点数组
  for (let s = 0; s < spikesVerticesArray.length; s++) {
    n[3 * s] = spikesVerticesArray[s].x;//给顶点数组设置坐标
    n[3 * s + 1] = spikesVerticesArray[s].y;
    n[3 * s + 2] = spikesVerticesArray[s].z;
  }
  //尖刺材质
  let spikesMaterial = new THREE.LineBasicMaterial({
    color: dvColor.value[0],
    transparent: true,
    opacity: .5
  });
  let spikesBufferGeometry = new THREE.BufferGeometry(); //创建尖刺几何体
  spikesBufferGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(n, 3)
  ); //添加位置属性
  let spikesMesh = new THREE.LineSegments(
      spikesBufferGeometry,
      spikesMaterial
  );
  spikesObject.add(spikesMesh); //将网格放进组
};

//创建上下环
function createUpDownRing(r1: any, r2: any) {
  let ringsObject = new THREE.Group(); //创建环的组
  ringsObject.name = "南北极环";
  earthGroup.add(ringsObject); //将环添加到场景中
  //创建内环
  let a = new THREE.RingGeometry(r1, r1 - 2, 100); //圆环几何体(内半径,外半径,分段数)
  let ringsOuterMaterial = new THREE.MeshBasicMaterial({
    color: dvColor.value[0],
    transparent: true,
    opacity: .3,
    side: THREE.DoubleSide,
    fog: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  let o = new THREE.Mesh(a, ringsOuterMaterial);
  o.rotation.x = 90 * Math.PI / 180; //设置旋转
  let r = o.clone(); //克隆外环网格o至r
  o.position.y = 95; //设置位置
  r.position.y = -95;
  ringsObject.add(o);
  ringsObject.add(r);
  //创建外环
  let t = new THREE.RingGeometry(r2, r2 - 2, 100);
  let ringsInnerMaterial = new THREE.MeshBasicMaterial({
    color: dvColor.value[0],
    transparent: true,
    opacity: .3,
    side: THREE.DoubleSide,
    fog: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  let i = new THREE.Mesh(t, ringsInnerMaterial);
  i.rotation.x = 90 * Math.PI / 180;
  let n = i.clone();
  i.position.y = 100;
  n.position.y = -100;
  ringsObject.add(i);
  ringsObject.add(n);
};

//创建渐变环
function createExpandRing() {
  let ringMaterial = new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load(ringImg),
    color: new THREE.Color(dvColor.value[0]),//颜色
    transparent: true,
    opacity: 1,
    side: THREE.DoubleSide,
    fog: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  let ringGeometry = new THREE.PlaneGeometry(earthSize * 2, earthSize * 2, 10, 10);
  expandRingMesh = new THREE.Mesh(ringGeometry, ringMaterial);
  expandRingMesh.name = "放大环";
  expandRingMesh.rotation.x = 90 * Math.PI / 180;
  earthGroup.add(expandRingMesh);
};

//创建渐变环动画
function createExpandRingAnimation() {
  gsap.isTweening(expandRingMesh.scale) ||//环动画
  (gsap.fromTo(
      expandRingMesh.scale,//缩放渐变
      { x: 1, y: 1, },
      { x: 2.7, y: 2.7, duration: 1.5 }
  ),
      gsap.fromTo(
          expandRingMesh.material,//材质的透明度渐变
          { opacity: 1, },
          { opacity: 0, duration: 1.5 }
      ))
};

//创建球体发光环
function createSphereGlow() {
  //SpriteMaterial材质始终朝向平面
  let glowMaterial = new THREE.SpriteMaterial({
    map: new THREE.TextureLoader().load(earthGlowImg),
    color: new THREE.Color(dvColor.value[0]),//颜色
    transparent: true,
    opacity: 1,
    side: THREE.DoubleSide,
    fog: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  let glowSprite = new THREE.Sprite(glowMaterial);
  glowSprite.scale.set(earthSize * 3.2, earthSize * 3.2, 1); //点大小
  earthGroup.add(glowSprite);
};

//创建鼠标控件
function createOrbitControls() {
  let { autoRotate, isDrag, isZoom, rotateSpeed } = JSON.parse(sessionStorage.getItem("config") as any);//从sessionStorage中获取配置
  orbitControls = new OrbitControls(camera, renderer.domElement);
  orbitControls.autoRotate = autoRotate; //自转(相机)
  orbitControls.enableRotate = isDrag;//鼠标左键控制旋转
  orbitControls.enableZoom = isZoom; //鼠标缩放
  orbitControls.autoRotateSpeed = rotateSpeed / 10; //自转速度
  orbitControls.enablePan = false; //右键平移拖拽
  orbitControls.enableDamping = true; //滑动阻尼
  orbitControls.dampingFactor = 0.05; //(默认.25)
  orbitControls.minDistance = 250; //相机距离目标最小距离
  orbitControls.maxDistance = 400; //相机距离目标最大距离
};

//渲染
function render() {
  anId.value = requestAnimationFrame(render);
  document.getElementById("sphereDiv") &&
  document
      .getElementById("sphereDiv")!
      .addEventListener("mousemove", onMousemove, false);
  orbitControls.update(); //鼠标控件实时更新
  dotLineRingMesh && (dotLineRingMesh.rotation.y += 5);//虚线环自转
  flylineMesh && (flylineMesh.rotation.z -= .15);//飞线自转
  createExpandRingAnimation();//渐变环动画
  renderer.render(scene, camera);
};

//鼠标移动事件(光线投射器不要放在vue的data中，会卡顿)
function onMousemove(e: any) {
  let dom = document.getElementById("sphereDiv");
  let width = dom!.clientWidth; //窗口宽度
  let height = dom!.clientHeight; //窗口高度
  //将鼠标点击位置的屏幕坐标转换成threejs中的标准坐标
  mouse.x = (e.offsetX / width) * 2 - 1;
  mouse.y = -(e.offsetY / height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera); //通过鼠标点的位置和当前相机的矩阵计算出raycaster
  let intersects = raycaster.intersectObjects(scene.children); // 获取raycaster直线与网格列表相交的集合
  if (intersects.length !== 0 && intersects[0].object.name == "病毒") {
    (JSON.parse(sessionStorage.getItem("config") as any).isTag) && (currentPointData.value = intersects[0].object.dotData); //intersects列表是按照距离屏幕距离排序的，第一个距屏幕最近
    dom!.style.cursor = "pointer"; //光标样式
    position.value = {
      x: e.pageX + 20 + "px",
      y: e.pageY + "px",
    }; //获取标签位置
  } else {
    currentPointData.value = {}; //置空标签数据
    dom!.style.cursor = "move"; //光标样式
  }
};

//初始化图表
function initEchart() {
  let sortList: any = sortFun(sphereData.value);//球体数据排序
  histogramChartFun(sortList.slice(0, sliceNum)); //绘制国家排名柱状图

  // 使用累计数据
  certain.value = Number(allData.value.othertotal.certain);     // 累计确诊
  addcure.value = Number(allData.value.othertotal.recure);     // 累计治愈
  addDie.value = Number(allData.value.othertotal.die);         // 累计死亡

  console.log("数据显示:", {
    累计确诊: certain.value,
    累计治愈: addcure.value,
    累计死亡: addDie.value,
    单日新增确诊: allData.value.othertotal.certain_inc,
    单日新增治愈: allData.value.othertotal.recure_inc,
    单日新增死亡: allData.value.othertotal.die_inc
  });
}

//排序(冒泡法)
function sortFun(arr: any) {
  arr.forEach((a: any, index: number) => {
    for (let j = 0; j < arr.length - 1 - index; j++) {
      if (Number(arr[j].value) < Number(arr[j + 1].value)) {
        let tmp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = tmp;
      }
    }
  });
  return arr;
};

//国家排名柱状图
function histogramChartFun(list: any) {
  let chartDom = document.getElementById("histogramDiv");
  (histogramChart) && (histogramChart.dispose());//之前有则销毁实例
  histogramChart = echarts.init(chartDom);
  let option: any = {
    backgroundColor: "",
    title: {
      left: "center",
      top: "3%",
      textStyle: {
        color: "#fff",
      },
    },
    grid: {
      top: "0%",
      left: "25%",
      right: "5%",
      bottom: "0%",
    },
    xAxis: {
      type: "value",
      show: false,
    },
    yAxis: {
      type: "category",
      axisLabel: {
        color: "#fff",
      },
      data: [],
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      backgroundColor: "rgba(0,0,0,.5)",
      textStyle: {
        color: "#fff",
        fontWeight: "bolder"
      },
      borderWidth: "0",
    },
    series: [
      {
        data: [],
        type: "bar",
        animationDuration: 2000,//动画时间
        animationEasing: "cubicInOut",//动画类型
        showBackground: true,
        backgroundStyle: {
          color: sysBackgroundColor,
        },
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 1, 1, 1, [
            {
              offset: 0,
              color: dvColor.value[0]
            },
            {
              offset: 1,
              color: "#555"
            }
          ])
        },
        label: {
          color: "#fff",
          fontWeight: "bolder",
          show: true,
          align: "left",
          formatter: "{c}",
        },
      },
    ],
  };
  list.forEach((l: any) => {
    option.yAxis.data.push(l.name);
    option.series[0].data.push(l.value);
  });
  option.yAxis.data.reverse();
  option.series[0].data.reverse();
  option && histogramChart.setOption(option);
}

//获取用户ip信息
function getLocationMsg() {
  if (dataType.value == "在线") {
    let jsonpUrl: any = process.env.VUE_APP_3;
    jsonp(jsonpUrl, (res: any) => {
      userMsg.value = res;
      getProvinceData();//获取当前省份数据
    })
  } else {
    userMsg.value = tempIpData;
    getProvinceData();//获取当前省份数据
  };

};

//获取当前省数据
function getProvinceData() {
  let pro = userMsg.value.pro;//当前省中文名
  let ePro = "";//英文省名
  if (dataType.value == "在线") {
    allData.value.list.forEach((l: any) => {
      if (pro.search(l.name) >= 0) {
        ePro = l.ename;//遍历获取到英文名
      }
    })
    jsonp1(
        process.env.VUE_APP_5,
        (res: any) => {
          currentProvinceData.value = res.data;//获取到当前省数据
        },
        "val1",
        "mod=province&province=" + ePro
    );
  } else {
    currentProvinceData.value = tempProvinceData.data;
  }
}

//点击省内分析
function provinceAnalyze() {
  isProvinceEchartDrawer.value = true;
}

//预览疫情报告
async function openPreview() {
  isLoading.value = true;
  let tempData: any = {};//当前省的临时数据
  await (tempData = JSON.parse(JSON.stringify(currentProvinceData.value)));
  let currentDate: any = currentProvinceData.value.cachetime.split(" ")[0];//当前时间
  let wordData: any = {
    wordName: "",//文件名
    hasCityData: true,//是否有当前城市
    currentDate: currentDate,//文件生成时间
    version: version.value,//系统版本
    currentCityData: {},//当前城市数据
    overviewData: {
      name: tempData.province,
      contotal: tempData.contotal,//累计数
      econNum: tempData.econNum,//现存数
      curetotal: tempData.curetotal,//治愈数
      deathtotal: tempData.deathtotal,//死亡数
      conadd: tempData.conadd ? tempData.conadd : 0//新增数
    },
    tabData: [],//表格数据
    sourceUrl: window.location.href//来源url
  };
  await tempData.city.forEach((c: any, index: any) => {
    c.index = index + 1;//添加序号
    wordData.tabData.push(c);//添加表格数据
    if (userMsg.value.city.search(c.name) !== -1) {
      wordData.hasCityData = true;
      wordData.currentCityData = c;//获取当前数据城市
      wordData.wordName = c.name;//获取文件名
    }
  })
  //城市名未找到时将省名添加到文件名中
  if (!wordData.wordName) {
    wordData.hasCityData = false;
    wordData.wordName = wordData.overviewData.name;
  }
  await getWordBlob("docx/word.docx", wordData).
  then((res: any) => {
    isLoading.value = false;
    reportData.value = {
      fileName: wordData.wordName + "疫情报告.docx",//设置文件名
      blobData: res,//获取blob数据
    };
    isReport.value = true;//打开报告抽屉
  })
};
// 组件挂载时获取初始数据
getCOVID19Data();
</script>

<style scoped lang='scss'>
.container {
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;

  .isMobile-div {
    position: absolute;
    height: 100vh;
    width: 100vw;
    top: 0px;
    right: 0px;
    z-index: 30;
    background-color: #000;
  }

  .top-div {
    pointer-events: none;
    width: 98%;
    margin: 0px 1%;
    position: absolute;
    right: 0;
    z-index: 5;
    color: #fff;

    .name-div {
      margin: 15px 0px 0px 0px;
      display: flex;
      justify-content: center;
      align-items: center;

      .name-dv {
        width: 20vw;
        height: 40px;
      }

      .sys-name {
        height: 60px;
        width: 250px;
        font-size: 25px;
        font-weight: 900;
        margin: 0px 10vw;
      }
    }

    .sys-msg {
      height: 100%;
      font-weight: 900;
      margin: 0px auto;

      span {
        margin: 0px 20px;
      }
    }
  }

  #sphereDiv {
    position: absolute;
    top: 15px;
    margin: 0px 1%;
    height: calc(100% - 25px);
    width: 98%;
    cursor: move;
  }

  .sphereDataDiv {
    text-align: center;
    pointer-events: none;
    position: absolute;
    z-index: 5;
    height: 74vh;
    min-width: 250px;
    width: 25vw;
    margin: 15vh 0px 0px 5px;

    p {
      font-size: 20px;
      font-weight: 900;
      margin-top: 10px;
      margin-bottom: 30px;
    }

    .histogramDivDiv {
      height: calc(100% - 100px);
      width: 100%;
      overflow: auto;
      pointer-events: auto;

      #histogramDiv {
        height: 1500px;
        width: 100%;
      }
    }
  }

  .set-div {
    position: absolute;
    bottom: 0px;
    z-index: 5;
    margin: 30px;

    i {
      font-size: 40px;
      transition: all 0.3s linear;

      &:hover {
        transform: rotateZ(180deg);
        color: #fff;
      }
    }

  }

  .numDiv {
    pointer-events: none;
    position: absolute;
    right: 10px;
    z-index: 5;
    min-width: 300px;
    width: 20vw;
    height: 74vh;
    margin: 15vh 0px 0px 0px;
    display: flex;
    padding-left: 20px;

    .addconDiv,
    .addcureDiv,
    .addDieDiv {
      height: 31%;
      margin: auto 0px;
      text-align: center;
      color: #fff;
      font-weight: 900;

      .tit {
        font-size: 20px;
      }

      .certain-div,
      .addDie-div,
      .addcure-div {
        font-size: 30px;
      }

      .day-tit {
        font-size: 20px;
      }
    }

    .addconDiv {
      border-top-left-radius: 30px;
      display: flex;
      flex-direction: column;
      padding-top: 5vh;

      .tit,
      .day-tit,
      .certain-div {
        margin: 5px 20px;
        padding-right: 10px;
        color: #ffd889;
      }
    }

    .addDieDiv {
      border-bottom-left-radius: 30px;
      display: flex;
      flex-direction: column;

      .tit,
      .day-tit,
      .addDie-div {
        margin: 5px 20px;
        padding-right: 10px;
        color: #ff6a6a;
      }
    }

    .addcureDiv {
      display: flex;
      flex-direction: column;

      .tit,
      .day-tit,
      .addcure-div {
        margin: 5px 20px;
        padding-right: 10px;
        color: #66f68f;
      }
    }
  }

  .btn-dv1 {
    pointer-events: none;
    width: 15vw;
    height: 30px;
    position: absolute;
    bottom: 10px;
    left: 10vw;
  }

  .btn-dv2 {
    pointer-events: none;
    width: 15vw;
    height: 30px;
    position: absolute;
    bottom: 10px;
    right: 10vw;
  }

  .btn-div {
    position: absolute;
    bottom: 10px;
    z-index: 5;
    width: 50%;
    height: auto;
    text-align: center;
    margin: 0px 25%;

    .btn {
      color: #fff;
      margin: 10px;
      border-radius: 0px;

      img {
        height: 20px;
        margin-right: 10px;
      }
    }
  }

}
</style>