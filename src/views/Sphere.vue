<!--疫情球体-->
<template>
  <div class="container" v-loading="isLoading" element-loading-background="rgba(255, 255, 255, 0.8)"
    element-loading-text="数据加载中...">
    <!--顶部标题-->
    <div class="top-div">
      <div class="name-div">
        <h2>疫情可视化</h2>
        <h4>(截止{{ allData.mtime }})</h4>
      </div>
      <div class="btn-div">
        <el-button class="btn" color="#ff656599" @click="isSphere = true" round>
          <el-icon :size="20" style="margin-right: 10px;">
            <List />
          </el-icon>
          全球数据
        </el-button>
        <el-button class="btn" color="#ff656599" @click="isChina = true" round>
          <el-icon :size="20" style="margin-right:10px;">
            <List />
          </el-icon>
          国内数据
        </el-button>
        <el-button class="btn" color="#ff656599" @click="isEchart = true;" round>
          <el-icon :size="20" style="margin-right: 10px;">
            <TrendCharts />
          </el-icon>
          国内分析
        </el-button>
      </div>
    </div>

    <!--球体盒子-->
    <div id="sphereDiv"></div>

    <!--设置按钮-->
    <div class="set-div">
      <el-icon color="#ffffff88" :size="40" @click="isDrawer = true">
        <Setting />
      </el-icon>
    </div>

    <!--全球柱状图-->
    <div class="sphereDataDiv">
      <p>累计确诊前{{sliceNum}}国家</p>
      <div class="histogramDivDiv">
        <div id="histogramDiv"></div>
      </div>
    </div>

    <!--数字盒子-->
    <div class="numDiv">
      <div class="addconDiv">
        <div class="tit">全球现存确诊</div>
        <addNumber class="certain-div" :value="certain" :time="10" :thousandSign="true" />
        <div class="day-tit">今日{{othertotal.certain_inc}}</div>
      </div>
      <div class="addcureDiv">
        <div class="tit">全球累计治愈</div>
        <addNumber class="addcure-div" :value="addcure" :time="10" :thousandSign="true" />
        <div class="day-tit">今日{{othertotal.recure_inc}}</div>
      </div>
      <div class="addDieDiv">
        <div class="tit">全球累计死亡</div>
        <addNumber class="addDie-div" :value="addDie" :time="10" :thousandSign="true" />
        <div class="day-tit">今日{{othertotal.die_inc}}</div>
      </div>
    </div>

    <div class="components">
      <!--点的标签-->
      <PointMsg :position="position" :currentPointData="currentPointData" />
      <!--设置抽屉-->
      <SetDrawer :isDrawer="isDrawer" @close="isDrawer = false" @changeSetData="changeSetData" />
      <!--全球数据表格-->
      <SphereTabDrawer :isSphere="isSphere" :sphereData="sphereData" @close="isSphere = false" />
      <!--国内数据表格-->
      <ChinaTabDrawer :allData="allData" :isChina="isChina" :list="allData.list" @close="isChina = false" />
      <!--国内图表分析-->
      <ChinaEchartDrawer :sphereData="sphereData" :daily="allData.add_daily" :jwsrTop="allData.jwsrTop"
        :isEchart="isEchart" @close="isEchart = false" :historylist="allData.historylist" :allData="allData" />
    </div>
  </div>
</template>
<script lang='ts' setup>
import { ref, computed, watch, onMounted, getCurrentInstance, toRef } from 'vue';
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as echarts from "echarts";
import jsonp from "@/utils/jsonpUtils";
import addNumber from "@/components/addNumber.vue";
import countryPosition from "@/assets/json/countryPosition.json";
import { dataSource1, dataSource2 } from "@/api/request";
import tempData from "@/assets/json/tempData.json";
import universeImg from "@/assets/img/universe.jpg";
import starImg from "@/assets/img/star.jpg";
import earthImg from "@/assets/img/earth.jpg";
import earthNightImg from "@/assets/img/earthNight.jpg";
import normalImg from "@/assets/img/earthNormal.jpg";
import earthCloudsImg from "@/assets/img/earthClouds.jpg";
import virusImg from "@/assets/img/virus.png";
import PointMsg from "@/components/PointMsg.vue";
import ChinaEchartDrawer from "@/components/ChinaEchartDrawer.vue";
import SetDrawer from "@/components/SetDrawer.vue";
import SphereTabDrawer from "@/components/SphereTabDrawer.vue";
import ChinaTabDrawer from "@/components/ChinaTabDrawer.vue";
let scene: any = null, //场景(频繁变更的对象放置在vue的data中会导致卡顿)
  camera: any = null, //相机
  dom: any = null, //需要使用canvas的dom
  renderer: any = null, //渲染器
  orbitControls: any = null, //鼠标控件
  mouse = new THREE.Vector2(), //鼠标的二维平面
  raycaster = new THREE.Raycaster(), //光线投射器(用于鼠标点击时获取坐标)
  positionData = countryPosition, //国家位置数据
  isDay = false,//昼夜切换
  isTag = true,//标签显示
  isSphere = ref(false),//全球数据对话框状态
  isChina = ref(false),//国内数据对话框状态
  isEchart = ref(false),//图表分析对话框状态
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
  certain = ref(0),//全球现存确诊
  addcure = ref(0),//全球治愈数
  addDie = ref(0);//全球死亡数

onMounted(() => {
  getCOVID19Data(); //获取疫情数据
  getLocationMsg();//获取用户ip信息
})

//设置切换
function changeSetData(type: string, setData: any) {
  //昼夜切换
  if (type == "isDay") {
    isDay = setData.value.isDay;
    destroyScene(); //销毁
    init(sphereData.value); //重新初始化
  }
  (type == "isDrag") && (orbitControls.enableRotate = setData.value.isDrag);//鼠标旋转
  (type == "isZoom") && (orbitControls.enableZoom = setData.value.isZoom);//鼠标缩放
  (type == "isTag") && (isTag = setData.value.isTag);//标签显示
  (type == "autoRotate") && (orbitControls.autoRotate = setData.value.autoRotate);//自转切换
  (type == "rotateSpeed") && (orbitControls.autoRotateSpeed = setData.value.rotateSpeed / 50)//自转速度
};

//销毁场景
function destroyScene() {
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

//解码返回的unicode
function decodingStr(str: any) {
  let repStr: any = str.replace(/\\/g, "%");//用%替换\
  let str1 = repStr.split("jsoncallback(")[1]
  let str2 = str1.split(");")[0]//截取出需要的字符串
  let unStr = unescape(str2);//解码出汉字(方法弃用)
  let jsonObj = JSON.parse(unStr);//转换成json对象
  return jsonObj;
};

//获取数据
//开发环境用本地tempData数据
//生产环境用vue代理dataSource1获取api数据
//代理获取失败则使用jsonp获取api数据
function getCOVID19Data() {
  isLoading.value = true;
  if (process.env.NODE_ENV !== "development") {
    dataSource1()
      .then((res) => {
        console.log("vue代理dataSource1获取数据");
        let decodingObj = decodingStr(res.data);//解码unicode
        allData.value = decodingObj.data; //记录所有数据
        structureData(allData.value); //构造数据  
        isLoading.value = false;
      })
      .catch((err) => {
        jsonpGetData();
      });
  } else {
    console.log("使用tempData数据");
    allData.value = tempData.data;
    structureData(allData.value); //构造数据  
    isLoading.value = false;
  }
};

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
  allData.value.list.forEach((l: any) => {
    l.value = Number(l.value);
    l.econNum = Number(l.econNum);
    l.deathNum = Number(l.deathNum);
    l.cureNum = Number(l.cureNum);
    l.asymptomNum = Number(l.asymptomNum);
    l.jwsrNum = Number(l.jwsrNum);
    //市/区数据类型转换
    if (l.city.length !== 0) {
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
  init(sphereData.value); //初始化
  setTimeout(() => {
    initEchart();//初始化图表
  }, 1000);
};

//初始化球体
function init(data: any) {
  dom = document.getElementById("sphereDiv"); //获取dom
  let width = dom.clientWidth;
  let height = dom.clientHeight;
  scene = new THREE.Scene(); //场景场景
  camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000); //创建透视相机(视场、长宽比、近面、远面)
  camera.position.set(0, 0, 270); //设置相机位置
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
    // depthWrite: false, //(深度写入)防止星辰在球体前面出现黑块
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
  //   let pointLight = new THREE.PointLight(lightColor, 2, 1, 0); //点光源
  //   pointLight.visible = true;
  //   pointLight.position.set(0, 0, 1000); //点光源在原点充当太阳
  //   pointLight.name = "点光源";
  //   scene.add(pointLight); //点光源添加到场景中
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
function createSphere(data: any) {
  let earthSize = 100; //地球尺寸
  let earthGroup = new THREE.Group(); //地球的组
  let earthGeometry = new THREE.SphereGeometry(earthSize, 100, 100); //地球几何体
  let nightColor = new THREE.Color(0x999999);
  let dayColor = new THREE.Color(0x444444);
  //地球材质
  let earthMaterial = new THREE.MeshPhongMaterial({
    map: new THREE.TextureLoader().load(
      isDay ? earthImg : earthNightImg //区分昼夜纹理
    ),
    color: isDay ? dayColor : nightColor,
    // metalness: 1, //生锈的金属外观(MeshStandardMaterial材质时使用)
    // roughness: 0.5, // 材料的粗糙程度(MeshStandardMaterial材质时使用)
    normalScale: new THREE.Vector2(0, 5), //凹凸深度
    normalMap: new THREE.TextureLoader().load(normalImg), //法线贴图
  });
  let earthMesh = new THREE.Mesh(earthGeometry, earthMaterial); //地球网格
  earthMesh.name = "地球";
  earthGroup.add(earthMesh); //将地球网格添加到地球组中
  //地球云层几何体
  let earthCloudsGeometry = new THREE.SphereGeometry(
    earthSize + 10,
    100,
    100
  );
  //地球云层材质
  let earthCloudsMaterial = new THREE.MeshLambertMaterial({
    color: new THREE.Color(0xffffff),
    transparent: true,
    opacity: 0.2,
    map: new THREE.TextureLoader().load(earthCloudsImg),
    side: THREE.DoubleSide,
  });
  //地球云层网格
  let earthCloudsMesh = new THREE.Mesh(
    earthCloudsGeometry,
    earthCloudsMaterial
  );
  //   earthGroup.add(earthCloudsMesh); //将地球云层网格添加到地球组中
  earthGroup.name = "地球组";
  scene.add(earthGroup);
  createVirus(data, earthSize); //创建球面病毒
};

//经纬度坐标变换（传入e:纬度、a经度、t球半径、o球额外距离）
function latLongToVector3(e: any, a: any, t: any, o: any) {
  var r = (e * Math.PI) / 180,
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
  let virSize = 4; //病毒大小
  let pointsGroup = new THREE.Group(); //点的组
  let list = JSON.parse(JSON.stringify(data));
  list.forEach((e: { value: number; color: any; position: any[]; }) => {
    e.value >= 10000000 && (e.color = colors[2]); //根据病毒数赋予不同颜色
    e.value >= 500000 && e.value < 10000000 && (e.color = colors[1]);
    e.value < 500000 && (e.color = colors[0]);
    if (e.position) {
      let virusMaterial = new THREE.SpriteMaterial({
        color: e.color,
        map: new THREE.TextureLoader().load(virusImg),
        side: THREE.FrontSide, //只显示前面
      }); //病毒材质
      let Sprite = new THREE.Sprite(virusMaterial); //点精灵材质
      Sprite.scale.set(virSize, virSize, 1); //点大小
      let lat = e.position[1]; //纬度
      let lon = e.position[0]; //经度
      let s = latLongToVector3(lat, lon, earthSize, 1); //坐标转换
      Sprite.position.set(s.x, s.y, s.z); //设置点的位置
      Sprite.dotData = e; //将点的数据添加到dotData属性中
      Sprite.name = "病毒";
      pointsGroup.add(Sprite); //添加进点的组中
    }
  });
  pointsGroup.name = "病毒组";
  scene.add(pointsGroup); //点的组添加到旋转组中
};

//创建鼠标控件
function createOrbitControls() {
  orbitControls = new OrbitControls(camera, renderer.domElement);
  orbitControls.enablePan = false; //右键平移拖拽
  orbitControls.enableZoom = true; //鼠标缩放
  orbitControls.enableDamping = true; //滑动阻尼
  orbitControls.dampingFactor = 0.05; //(默认.25)
  orbitControls.minDistance = 150; //相机距离目标最小距离
  orbitControls.maxDistance = 500; //相机距离目标最大距离
  orbitControls.autoRotate = true; //自转(相机)
  orbitControls.autoRotateSpeed = 1; //自转速度
  orbitControls.enableRotate = true;//鼠标左键控制旋转
};

//渲染
function render() {
  anId.value = requestAnimationFrame(render);
  document.getElementById("sphereDiv") &&
    document
      .getElementById("sphereDiv")!
      .addEventListener("mousemove", onMousemove, false);

  orbitControls.update(); //鼠标控件实时更新
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
    (isTag) && (currentPointData.value = intersects[0].object.dotData); //intersects列表是按照距离屏幕距离排序的，第一个距屏幕最近
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
  certain.value = Number(allData.value.othertotal.certain);//获取确诊值
  addcure.value = Number(allData.value.othertotal.recure);///获取治愈值
  addDie.value = Number(allData.value.othertotal.die);///获取死亡值
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
  (histogramChart) && (histogramChart.dispose());//销毁实例
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
        showBackground: true,
        backgroundStyle: {
          color: "rgba(255, 185, 185,.1)",
        },
        itemStyle: {
          color: "#ff6a6a",
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

//获取位置信息
function getLocationMsg() {
  let jsonpUrl: any = process.env.VUE_APP_3;
  jsonp(jsonpUrl, (res: any) => {
    console.log("userMsg:", res);
  })
};

</script>
<style scoped lang='scss'>
.container {
  user-select: none;
  height: 100%;
  width: 100%;

  .top-div {
    width: 100%;
    height: 50px;
    position: absolute;
    background-color: rgba(255, 255, 255, .2);
    display: flex;
    justify-content: space-between;

    .name-div {
      margin-left: 10px;

      h2,
      h4 {
        display: inline-block;
        margin: 10px 5px;
      }
    }

    .btn-div {
      margin: 10px;

      .btn {
        border: none;
        color: #fff
      }
    }

  }

  #sphereDiv {
    height: 100%;
    width: 100%;
    cursor: move;
  }

  .sphereDataDiv {
    pointer-events: none;
    position: absolute;
    top: 50px;
    left: 0px;
    height: calc(100vh - 150px);
    width: 300px;
    text-align: center;

    p {
      font-size: 20px;
      font-weight: 900;
    }

    .histogramDivDiv {
      height: calc(100% - 50px);
      width: 100%;
      overflow: auto;
      pointer-events: auto;

      #histogramDiv {
        height: 1500px;
        width: 100%;
      }
    }

  }

  .numDiv {
    position: absolute;
    top: 50px;
    right: 0px;
    pointer-events: none;
    height: calc(100% - 50px);
    display: flex;
    flex-direction: column;

    .addconDiv,
    .addcureDiv,
    .addDieDiv {
      background-color: rgba(255, 255, 255, .1);
      margin: auto 0px;
      text-align: right;
      color: #fff;
      font-weight: 900;
      padding: 10px 30px;
      border-bottom-left-radius: 100px;
      border-top-left-radius: 100px;

      .tit {
        font-size: 20px;
      }

      .certain-div,
      .addDie-div,
      .addcure-div {
        font-size: 45px;
      }

      .day-tit {
        font-size: 20px;
      }
    }

    .addconDiv {
      background-color: rgb(255, 216, 137, .2);

      .tit,
      .day-tit,
      .certain-div {
        color: #ffd889;
      }
    }

    .addDieDiv {
      background-color: rgb(255, 106, 106, .2);

      .tit,
      .day-tit,
      .addDie-div {
        color: #ff6a6a;
      }
    }

    .addcureDiv {
      background-color: rgb(102, 246, 143, .2);

      .tit,
      .day-tit,
      .addcure-div {
        color: #66f68f;
      }
    }
  }

  .set-div {
    position: absolute;
    bottom: 0px;
    margin: 0px 0px 20px 20px;

    i:hover {
      cursor: pointer;
      color: #fff;
    }
  }

}
</style>