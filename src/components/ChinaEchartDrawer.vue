<!--echarts对话框-->
<template>
  <div class="chinaEchart-drawer">
    <el-drawer v-model="isEchart" :with-header="false" direction="ttb" :close-on-click-modal="false"
      :before-close="handleClose" size='100%'>
      <div class="my-header">
        <span>国内分析</span>
        <el-icon :size="40" @click="handleClose" class="close-icon" color="#ffffff88">
          <CircleClose />
        </el-icon>
      </div>
      <!--图表盒子-->
      <div class="echartDiv">
        <div class="top-div">
          <!--数字盒子-->
          <div class="num-div">
            <div class="addconDiv">
              <p>国内确诊数</p>
              <addNumber class="amNum" :value="addcon" :time="10" :thousandSign="true" />
              <p class="add-p">今日{{daily.addcon_new}}</p>
            </div>
            <div class="addcureDiv">
              <p>国内治愈数</p>
              <addNumber class="amNum" :value="addcure" :time="10" :thousandSign="true" />
              <p class="add-p">今日{{daily.addcure_new}}</p>
            </div>
            <div class="addDieDiv">
              <p>国内死亡数</p>
              <addNumber class="amNum" :value="addDie" :time="10" :thousandSign="true" />
              <p class="add-p">今日{{daily.adddeath_new}}</p>
            </div>
          </div>
          <div class="china-map-div"></div>
        </div>

        <div id="historyLineDiv"></div>
        <div class="histogram-div">
          <div id="diagnosedChart"></div>
          <div id="cureChart"></div>
          <div id="dieChart"></div>
          <div id="dayAddChart"></div>
          <div id="locIncrProTopChart"></div>
          <div id="jwsrTopChart"></div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>
<script lang='ts' setup>
import { ref, computed, watch, watchEffect, onMounted } from 'vue';
import * as echarts from "echarts";
import "echarts/map/js/china.js";
import addNumber from "@/components/addNumber.vue";
let props = defineProps({
  isEchart: {
    type: Boolean,
    default: false
  },
  //国家排名
  sphereData: {
    type: Array,
    default: [],
  },
  //国内基础数据
  daily: {
    type: Object,
    default: {}
  },
  //境外输入省份前10
  jwsrTop: {
    type: Array,
    default: [],
  },
  //国内历史列表
  historylist: {
    type: Array,
    default: [],
  },
  //所有数据
  allData: {
    type: Object,
    default: {}
  },
}),
  isEchart = ref(false),
  historyLineChart: any = null,//历史折线图
  chinaMapChart: any = null,//中国地图
  diagnosedChart: any = null,//确诊图
  dieChart: any = null,//死亡图
  dayAddChart: any = null,//当日新增图
  cureChart: any = null,//治愈图
  locIncrProTopChart: any = null,//本地新增图
  jwsrTopChart: any = null,//境外输入图
  addcon: any = ref(0),//现存确诊
  addcure: any = ref(0),//国内治愈总数
  addDie: any = ref(0),//国内死亡总数
  sliceNum: number = 10,//截取数量
  //确诊数前10
  diagnosedList10 = computed(() => {
    let tempList: any = [];
    props.allData.list.forEach((l: any) => {
      tempList.push({
        name: l.name,
        value: Number(l.value)
      })
    });
    tempList = sortFun(tempList);
    return tempList.slice(0, sliceNum);
  }),
  //死亡数前10
  dieList10 = computed(() => {
    let tempList: any = [];
    props.allData.list.forEach((l: any) => {
      tempList.push({
        name: l.name,
        value: Number(l.deathNum)
      })
    });
    tempList = sortFun(tempList);
    return tempList.slice(0, sliceNum);
  }),
  //当日新增数前10
  dayAddList10 = computed(() => {
    let tempList: any = [];
    props.allData.list.forEach((l: any) => {
      tempList.push({
        name: l.name,
        value: Number(l.asymptomNum)
      })
    });
    tempList = sortFun(tempList);
    return tempList.slice(0, sliceNum);
  }),
  //治愈数前10
  cureList = computed(() => {
    let tempList: any = [];
    props.allData.list.forEach((l: any) => {
      tempList.push({
        name: l.name,
        value: Number(l.cureNum)
      })
    });
    tempList = sortFun(tempList);
    return tempList.slice(0, sliceNum);
  }),
  //本地新增前10
  locIncrProTop = computed(() => {
    let tempList: any = [];
    props.allData.locIncrProTop.forEach((l: any) => {
      tempList.push({
        name: l.name,
        value: Number(l.locIncrNum)
      })
    })
    tempList = sortFun(tempList);
    return tempList.slice(0, sliceNum);
  }),
  //境外输入前10
  jwsrTop = computed(() => {
    let tempList: any = [];
    props.jwsrTop.forEach((l: any) => {
      tempList.push({
        name: l.name,
        value: Number(l.jwsrNum)
      })
    })
    tempList = sortFun(tempList);
    return tempList.slice(0, sliceNum);
  }),
  emits = defineEmits(["close"]);

//watch可监听指定属性watchEffect不能
watch(
  () => props.isEchart,
  (val) => {
    if (val) {
      (isEchart.value = val);
      initChart();//初始化图表
    }
  },
)

//柱状图数据
function histogramOption(list: any, titName: string, color: string) {
  let option: any = {
    title: {
      text: titName + sliceNum,
      left: "center",
      textStyle: {
        color: "#fff",
      },
    },
    tooltip: {
      backgroundColor: "rgba(0,0,0,.5)",
      borderWidth: "0",
      trigger: 'axis',
      textStyle: {
        color: "#fff",
        fontWeight: "bolder"
      },
    },
    grid: {
      top: "10%",
      left: "10%",
      right: "10%",
      bottom: "0%",
    },
    xAxis: {
      type: 'value',
      show: false,
    },
    yAxis: {
      type: 'category',
      axisLabel: {
        color: "#fff",
      },
      data: [],
    },
    series: [
      {
        data: [],
        type: 'bar',
        showBackground: true,
        backgroundStyle: {
          color: 'rgba(180, 180, 180, 0.2)'
        },
        itemStyle: {
          color: color,
        },
        label: {
          color: "#fff",
          fontWeight: "bolder",
          show: true,
          align: "left",
          formatter: "{c}",
        },
      }
    ]
  };
  list.forEach((l: any) => {
    option.yAxis.data.push(l.name);
    option.series[0].data.push(l.value);
  });
  option.yAxis.data.reverse();
  option.series[0].data.reverse();
  return option;
}

//初始化柱状图
async function initHistogram() {
  await (diagnosedChart) && (diagnosedChart.dispose());//销毁实例
  await (diagnosedChart = echarts.init(document.getElementById("diagnosedChart")));//确诊图
  await diagnosedChart.setOption(histogramOption(diagnosedList10.value, "确诊数前", "#ffaa00"));
  await (dieChart) && (dieChart.dispose());//销毁实例
  await (dieChart = echarts.init(document.getElementById("dieChart")));//死亡图
  await dieChart.setOption(histogramOption(dieList10.value, "死亡数前", "#ff6a6a"));
  await (dayAddChart) && (dayAddChart.dispose());//销毁实例
  await (dayAddChart = echarts.init(document.getElementById("dayAddChart")));//当日新增图
  await dayAddChart.setOption(histogramOption(dayAddList10.value, "当日新增前", "#ba4c03"));
  await (cureChart) && (cureChart.dispose());//销毁实例
  await (cureChart = echarts.init(document.getElementById("cureChart")));//治愈图
  await cureChart.setOption(histogramOption(cureList.value, "治愈数前", "#48c56b"));
  await (locIncrProTopChart) && (locIncrProTopChart.dispose());//销毁实例
  await (locIncrProTopChart = echarts.init(document.getElementById("locIncrProTopChart")));//本地新增图
  await locIncrProTopChart.setOption(histogramOption(locIncrProTop.value, "本地新增前", "#ff5900"));
  await (jwsrTopChart) && (jwsrTopChart.dispose());//销毁实例
  await (jwsrTopChart = echarts.init(document.getElementById("jwsrTopChart")));//境外输入图
  await jwsrTopChart.setOption(histogramOption(jwsrTop.value, "境外输入前", "#8903ba"));
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

//关闭对话框
function handleClose() {
  isEchart.value = false;
  emits("close")
};

//初始化图表
function initChart() {
  addcon.value = Number(props.allData.gntotal);
  addcure.value = Number(props.allData.curetotal);
  addDie.value = Number(props.allData.deathtotal);
  historyLineChartFun(props.historylist);//绘制历史折线图
  initHistogram();//绘制柱状图
  chinaMapInit();//初始化中国地图
}

//历史折线图
async function historyLineChartFun(list: any) {
  let lineData = JSON.parse(JSON.stringify(list));
  await lineData.reverse();
  await (historyLineChart) && (historyLineChart.dispose());//销毁实例
  await (historyLineChart = echarts.init(document.getElementById("historyLineDiv")));
  let option: any = {
    // backgroundColor: "",
    grid: {
      // top: "15%",
      left: "8%",
      // right: "5%",
      // bottom: "10%",
    },
    title: {
      text: '国内历史数据',
      left: "center",
      top: '5%',
      textStyle: {
        color: "#fff",
      },
    },
    tooltip: {
      backgroundColor: "rgba(0,0,0,.5)",
      borderWidth: "0",
      trigger: 'axis',
      textStyle: {
        color: "#fff",
        fontWeight: "bolder"
      },
      axisPointer: {
        type: 'cross'
      },
    },
    legend: {
      data: ['确诊数', '治愈数', '死亡数', '境外输入'],
      textStyle: {
        color: "#fff"
      },
      orient: "vertical",
      top: "15%",
      right: "2%"
    },
    xAxis: {
      data: lineData.map(function (item: any) {
        return item.ymd;
      }),
      axisLabel: {
        color: "#fff",
      },
      textStyle: {
        color: "#fff"
      }
    },
    yAxis: {
      axisLabel: {
        color: "#fff",
      },
      textStyle: {
        color: "#fff",
      },
    },
    dataZoom: [
      {
        startValue: ''
      },
      {
        type: 'inside'
      }
    ],
    series: [
      {
        name: '确诊数',
        type: 'line',
        lineStyle: {
          color: '#f4c25e'
        },
        itemStyle: {
          color: '#f4c25e'
        },
        data: lineData.map(function (item: any) {
          return item.cn_conNum;
        }),
        zlevel: 1,
        z: 1,
      },
      {
        name: '治愈数',
        type: 'line',
        lineStyle: {
          color: '#48c56b'
        },
        itemStyle: {
          color: '#48c56b'
        },
        data: lineData.map(function (item: any) {
          return item.cn_cureNum;
        }),
        zlevel: 1,
        z: 1,
      },
      {
        name: '死亡数',
        type: 'line',
        lineStyle: {
          color: '#f00'
        },
        itemStyle: {
          color: '#f00'
        },
        data: lineData.map(function (item: any) {
          return item.cn_deathNum;
        }),
        zlevel: 1,
        z: 1
      },
      {
        name: '境外输入',
        type: 'line',
        lineStyle: {
          color: '#8903ba'
        },
        itemStyle: {
          color: '#8903ba'
        },
        data: lineData.map(function (item: any) {
          return item.cn_jwsrNum;
        }),
        zlevel: 1,
        z: 1
      }
    ]
  };
  await (option && historyLineChart.setOption(option));
};

//中国地图初始化
async function chinaMapInit() {
  let list = JSON.parse(JSON.stringify(props.allData.list));//获取省份数据
  let echartData: any = [];
  await list.forEach((l: any) => {
    echartData.push({
      name: l.name,
      value: l.econNum,//现存数
      allNum: l.value,//累计数
      deathNum: l.deathNum,//死亡数
      cureNum: l.cureNum,//治愈数
      asymptomNum: l.asymptomNum,//较昨日新增
      jwsrNum: l.jwsrNum//境外输入
    })
  })
  await echartData.push({
    name: "南海诸岛"
  })//添加南海诸岛，防止报错
  await (chinaMapChart) && (chinaMapChart.dispose());//销毁实例
  await (chinaMapChart = echarts.init(document.getElementsByClassName("china-map-div")[0]));
  let option: any = {
    title: {
      text: '国内各省现存分布',
      left: "center",
      top: '1%',
      textStyle: {
        color: "#fff",
      },
    },
    visualMap: {
      min: 0,
      max: 500,
      left: '5%',
      bottom: '5%',
      text: ['高', '低'],
      textStyle: {
        color: '#fff',
      },
      calculable: true,
      inRange: {
        color: ['#fff', '#f00'],//颜色范围
      },
    },
    tooltip: {
      padding: 10,
      enterable: true,
      transitionDuration: 0,//动画时间
      backgroundColor: "rgb(0,0,0,.8)",
      borderRadius: 20,
      textStyle: {
        color: '#fff',
      },
      formatter: function (params: any) {
        let tipString = "";
        if (params.data.value) {
          tipString =
            "<div style='font-size:25px;font-weight:900;margin:10px 0px'>" + params.data.name + "</div>" +
            "<div style='color:#f00;font-weight:900;'>现存：" + params.data.value + "</div>" +
            "<div style='color:#888;font-weight:900;'>累计：" + params.data.allNum + "</div>" +
            "<div style='color:#888;font-weight:900;'>死亡：" + params.data.deathNum + "</div>" +
            "<div style='color:#888;font-weight:900;'>治愈：" + params.data.cureNum + "</div>" +
            "<div style='color:#888;font-weight:900;'>较昨日新增：" + params.data.asymptomNum + "</div>" +
            "<div style='color:#888;font-weight:900;'>境外输入：" + params.data.jwsrNum + "</div>"
        }
        return tipString;
      }
    },
    series: [{
      name: '接入医院数量',
      type: 'map',
      mapType: 'china',
      zoom: 1.2,
      roam: true,//缩放
      scaleLimit: {
        min: 1.2,//缩放限制
        max: 2
      },
      itemStyle: {
        normal: {
          label: {
            show: true
          }
        },
        emphasis: {
          show: true,
          areaColor: '#6eb5ff',//鼠标滑过区域颜色
          label: {
            show: true
          }
        }
      },
      label: {
        normal: { //静态的时候展示样式
          show: true, //是否显示地图省份得名称
          textStyle: {
            color: "#000",
            fontSize: 12
          }
        },
        emphasis: { //动态展示的样式
          color: '#fff',
        },
      },
      data: []
    }]
  };
  await (option.series[0].data = echartData);//设置数据
  await (option && chinaMapChart.setOption(option));
}

</script>
<style scoped lang='scss'>
.chinaEchart-drawer {
  --el-bg-color: rbba(0, 0, 0, 0);

  .my-header {
    padding: 0px 10px;
    height: 50px;
    display: flex;
    justify-content: space-between;
    background-color: #000;

    span {
      margin: auto 0px;
      font-weight: 900;
      font-size: 25px;
      color: #fff;
    }

    .close-icon {
      margin: auto 0px;

      &:hover {
        color: #fff;
        cursor: pointer;
      }
    }
  }

  .echartDiv {
    background-color: rgba(255, 255, 255, .7);
    color: #fff;
    height: calc(100vh - 100px);
    overflow: auto;

    .top-div {
      display: flex;
      height: 500px;
      width: 99%;
      margin: 10px auto;

      .china-map-div {
        border-radius: 50px;
        background-color: rgba(0, 0, 0, .8);
        width: 62%;
        height: 100%;
        margin: 0px;
      }

      .num-div {
        display: flex;
        flex-direction: column;
        width: 37%;
        margin: auto;
        height: 100%;

        .addconDiv,
        .addcureDiv,
        .addDieDiv {
          border-radius: 50px;
          margin: auto 0px;
          width: 100%;
          background-color: rgba(0, 0, 0, .8);
          text-align: center;
          padding: 15px 0px;

          p {
            margin: 5px;
            font-weight: 900;
            color: #ffd889;
          }

          .amNum {
            color: #ffd889;
            font-size: 50px;
            font-weight: 900;
          }
        }

        .addcureDiv {
          p {
            color: #48c56b;
          }

          .amNum {
            font-size: 50px;
            color: #48c56b;
            font-weight: 900;
          }
        }

        .addDieDiv {
          p {
            color: #ff6a6a;
          }

          .amNum {
            font-size: 50px;
            color: #ff6a6a;
            font-weight: 900;
          }
        }
      }

    }


    #historyLineDiv {
      border-radius: 50px;
      background-color: rgba(0, 0, 0, .8);
      height: 300px;
      width: 99%;
      margin: 10px auto;
    }

    .histogram-div {
      border-radius: 50px;
      background-color: rgba(0, 0, 0, .8);
      display: flex;
      flex-wrap: wrap;
      width: 98%;
      margin: 10px auto;
      padding: 10px 0px;

      div {
        margin: 10px auto;
        height: 200px;
        width: 32%;
      }
    }

  }
}
</style>
<style scoped>
::-webkit-scrollbar-thumb {
  /*滑块*/
  background-color: rgba(255, 0, 0, .5) !important;
}
</style>