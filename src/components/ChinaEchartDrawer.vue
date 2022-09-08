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
        <!--数字盒子-->
        <div class="num-div">
          <div class="addconDiv">
            <p>国内确诊数</p>
            <p class="amNum">{{addcon}}</p>
            <p class="add-p">今日{{daily.addcon_new}}</p>
          </div>
          <div class="addcureDiv">
            <p>国内治愈数</p>
            <p class="amNum">{{addcure}}</p>
            <p class="add-p">今日{{daily.addcure_new}}</p>
          </div>
          <div class="addDieDiv">
            <p>国内死亡数</p>
            <p class="amNum">{{addDie}}</p>
            <p class="add-p">今日{{daily.adddeath_new}}</p>
          </div>
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
let props: any = defineProps({
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
})

let isEchart = ref(false),
  historyLineChart: any = null,//历史折线图
  diagnosedChart: any = null,//确诊图
  dieChart: any = null,//死亡图
  dayAddChart: any = null,//当日新增图
  cureChart: any = null,//治愈图
  locIncrProTopChart: any = null,//本地新增图
  jwsrTopChart: any = null,//境外输入图
  addcon: any = ref(0),//现存确诊
  addcure: any = ref(0),//国内治愈总数
  addDie: any = ref(0),//国内死亡总数
  sliceNum: number = 10;//截取数量

//确诊数前10
let diagnosedList10 = computed(() => {
  let tempList: any = [];
  props.allData.list.forEach((l: any) => {
    tempList.push({
      name: l.name,
      value: Number(l.value)
    })
  });
  tempList = sortFun(tempList);
  return tempList.slice(0, sliceNum);
})

//死亡数前10
let dieList10 = computed(() => {
  let tempList: any = [];
  props.allData.list.forEach((l: any) => {
    tempList.push({
      name: l.name,
      value: Number(l.deathNum)
    })
  });
  tempList = sortFun(tempList);
  return tempList.slice(0, sliceNum);
})

//当日新增数前10
let dayAddList10 = computed(() => {
  let tempList: any = [];
  props.allData.list.forEach((l: any) => {
    tempList.push({
      name: l.name,
      value: Number(l.asymptomNum)
    })
  });
  tempList = sortFun(tempList);
  return tempList.slice(0, sliceNum);
})

//治愈数前10
let cureList = computed(() => {
  let tempList: any = [];
  props.allData.list.forEach((l: any) => {
    tempList.push({
      name: l.name,
      value: Number(l.cureNum)
    })
  });
  tempList = sortFun(tempList);
  return tempList.slice(0, sliceNum);
})

//本地新增前10
let locIncrProTop = computed(() => {
  let tempList: any = [];
  props.allData.locIncrProTop.forEach((l: any) => {
    tempList.push({
      name: l.name,
      value: Number(l.locIncrNum)
    })
  })
  tempList = sortFun(tempList);
  return tempList.slice(0, sliceNum);
})

//境外输入前10
let jwsrTop = computed(() => {
  let tempList: any = [];
  props.jwsrTop.forEach((l: any) => {
    tempList.push({
      name: l.name,
      value: Number(l.jwsrNum)
    })
  })
  tempList = sortFun(tempList);
  return tempList.slice(0, sliceNum);
})

let emits = defineEmits(["close"])

//watch可监听指定属性watchEffect不能
watch(
  () => props.isEchart,
  async (val) => {
    if (val) {
      await (isEchart.value = val);
      setTimeout(() => {
        initChart();//初始化图表
      }, 500);
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
function initHistogram() {
  (diagnosedChart) && (diagnosedChart.dispose());//销毁实例
  diagnosedChart = echarts.init(document.getElementById("diagnosedChart"));//确诊图
  diagnosedChart.setOption(histogramOption(diagnosedList10.value, "确诊数前", "#ffaa00"));
  (dieChart) && (dieChart.dispose());//销毁实例
  dieChart = echarts.init(document.getElementById("dieChart"));//死亡图
  dieChart.setOption(histogramOption(dieList10.value, "死亡数前", "#f00"));
  (dayAddChart) && (dayAddChart.dispose());//销毁实例
  dayAddChart = echarts.init(document.getElementById("dayAddChart"));//当日新增图
  dayAddChart.setOption(histogramOption(dayAddList10.value, "当日新增前", "#ba4c03"));
  (cureChart) && (cureChart.dispose());//销毁实例
  cureChart = echarts.init(document.getElementById("cureChart"));//治愈图
  cureChart.setOption(histogramOption(cureList.value, "治愈数前", "#48c56b"));
  (locIncrProTopChart) && (locIncrProTopChart.dispose());//销毁实例
  locIncrProTopChart = echarts.init(document.getElementById("locIncrProTopChart"));//本地新增图
  locIncrProTopChart.setOption(histogramOption(locIncrProTop.value, "本地新增前", "#ff5900"));
  (jwsrTopChart) && (jwsrTopChart.dispose());//销毁实例
  jwsrTopChart = echarts.init(document.getElementById("jwsrTopChart"));//境外输入图
  jwsrTopChart.setOption(histogramOption(jwsrTop.value, "境外输入前", "#8903ba"));
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
  if (1) {
    addcon.value = Number(props.allData.gntotal);
  } else {
    (addcon.value !== 0) && (addcon.value = 0);//置空
    addconAnimation();//现存确诊动画(数字位数过多会动画异常)
  }
  (addcure.value !== 0) && (addcure.value = 0);//置空
  addcureAnimation();//治愈人数动画
  (addDie.value !== 0) && (addDie.value = 0);//置空
  addDieAnimation();//死亡人数动画
  historyLineChartFun(props.historylist);//绘制历史折线图
  initHistogram();//绘制柱状图
}

//历史折线图
function historyLineChartFun(list: any) {
  let lineData = JSON.parse(JSON.stringify(list));
  lineData.reverse();
  let chartDom = document.getElementById("historyLineDiv");
  (historyLineChart) && (historyLineChart.dispose());//销毁实例
  historyLineChart = echarts.init(chartDom);
  let option: any = {
    backgroundColor: "",
    grid: {
      // top: "15%",
      // left: "5%",
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
      textStyle: {
        color: "#fff"
      }
    },
    yAxis: {
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
  option && historyLineChart.setOption(option);
};

//现存确诊动画
function addconAnimation() {
  let animationTime = 1 * 60;//动画时间
  let toNum = Number(props.allData.gntotal);
  let step = Math.round(toNum / animationTime);//增加步长
  (toNum - addcon.value) <= step && (step = 1);//判断剩余数字
  addcon.value = addcon.value + step;//更新响应式数据
  if (addcon.value == toNum) { return; }
  requestAnimationFrame(addconAnimation)
}

//治愈人数动画
function addcureAnimation() {
  let animationTime = 3 * 60;//动画时间
  let toNum = Number(props.allData.curetotal);
  let step = Math.round(toNum / animationTime);//增加步长
  (toNum - addcure.value) <= step && (step = 1);//判断剩余数字
  addcure.value = addcure.value + step;//更新响应式数据
  if (addcure.value == toNum) { return; }
  requestAnimationFrame(addcureAnimation)
}

//死亡人数动画
function addDieAnimation() {
  let animationTime = 5 * 60;//动画时间
  let toNum = Number(props.allData.deathtotal);
  let step = Math.round(toNum / animationTime);//增加步长
  (toNum - addDie.value) <= step && (step = 1);//判断剩余数字
  addDie.value = addDie.value + step;//更新响应式数据
  if (addDie.value == toNum) { return; }
  requestAnimationFrame(addDieAnimation);
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

    .num-div {
      width: 100%;
      display: flex;
      margin: 10px 0px 0px 0px;

      .addconDiv,
      .addcureDiv,
      .addDieDiv {
        margin: 0px auto;
        width: 32%;
        background-color: rgba(0, 0, 0, .8);
        text-align: center;
        padding: 2px 0px;

        p {
          margin: 5px;
          font-weight: 900;
        }

        .amNum {
          color: #f4c25e;
          font-size: 40px;
        }

        .add-p {
          color: #666
        }
      }

      .addcureDiv {
        .amNum {
          font-size: 40px;
          color: #48c56b;
        }
      }

      .addDieDiv {
        .amNum {
          font-size: 40px;
          color: #f00;
        }
      }
    }

    #historyLineDiv {
      background-color: rgba(0, 0, 0, .8);
      height: 300px;
      width: 99%;
      margin: 10px auto;
    }

    .histogram-div {
      background-color: rgba(0, 0, 0, .8);
      display: flex;
      flex-wrap: wrap;
      width: 98%;
      margin: 0px auto;
      margin-top: 0px;

      div {
        margin: 10px auto;
        height: 200px;
        width: 32%;
      }
    }

  }
}
</style>