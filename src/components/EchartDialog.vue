<!--echarts对话框-->
<template>
  <el-dialog v-model="isEchart" :fullscreen="true" :close-on-click-modal="false" :before-close="handleClose"
    :show-close="false" style="--el-dialog-bg-color: #ffffff55;--el-dialog-padding-primary:0px;">
    <div class="my-header">
      <span>图表分析</span>
      <el-icon :size="40" @click="handleClose" class="close-icon" color="#fff">
        <CircleClose />
      </el-icon>
    </div>

    <div class="echartDiv">
      <div class="addconDiv">
        <p>国内现存确诊</p>
        <h1>{{addcon}}</h1>
        <span>今日{{daily.addcon_new}}</span>
      </div>
      <div class="addcureDiv">
        <p>国内治愈总数</p>
        <h1>{{addcure}}</h1>
        <span>今日{{daily.addcure_new}}</span>
      </div>
      <div class="addDieDiv">
        <p>国内死亡总数</p>
        <h1>{{addDie}}</h1>
        <span>今日{{daily.adddeath_new}}</span>
      </div>

      <div id="historyLineDiv"></div>
      <p>国内死亡总数：{{ props.daily.adddeath }}</p>
      <p>境外输入前十省份{{ props.jwsrTop }}</p>
    </div>
  </el-dialog>

</template>
<script lang='ts' setup>
import { ref, computed, watch, watchEffect, onMounted } from 'vue';
import * as echarts from "echarts";
import { number } from 'echarts';
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
  addcon: any = ref(0),//现存确诊
  addcure: any = ref(0),//国内治愈总数
  addDie: any = ref(0);//国内死亡总数

//watch可监听指定属性watchEffect不能
watch(
  () => props.isEchart,
  async (val) => {
    if (val) {
      await (isEchart.value = val);
      setTimeout(() => {
        initChart();
      }, 500);
    }
  },
)

let emits = defineEmits(["close"])

//关闭对话框
function handleClose() {
  isEchart.value = false;
  emits("close")
};

//初始化图表
function initChart() {
  historyLineChartFun(props.historylist);//绘制历史折线图
  (addcon.value !== 0) && (addcon.value = 0);//置空
  addconAnimation();//现存确诊动画
  (addcure.value !== 0) && (addcure.value = 0);//置空
  addcureAnimation();//治愈人数动画
  (addDie.value !== 0) && (addDie.value = 0);//置空
  addDieAnimation();//死亡人数动画
}

//历史折线图
function historyLineChartFun(list: any) {
  let lineData = JSON.parse(JSON.stringify(list));
  lineData.reverse();
  let chartDom = document.getElementById("historyLineDiv");
  (historyLineChart) && (historyLineChart.dispose());//销毁实例
  historyLineChart = echarts.init(chartDom);
  let option: any = {
    backgroundColor: "#000000aa",
    title: {
      text: '国内历史数据',
      left: "center",
      textStyle: {
        color: "#fff",
      },
    },
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      // left: '5%',
      // right: '15%',
      // bottom: '10%'
    },
    xAxis: {
      data: lineData.map(function (item: any) {
        return item.ymd;
      }),
    },
    yAxis: {
      textStyle: {
        color: "#fff",
      },
    },
    // toolbox: {
    //   right: 10,
    //   feature: {
    //     dataZoom: {
    //       yAxisIndex: 'none'
    //     },
    //     restore: {},
    //     saveAsImage: {}
    //   }
    // },
    dataZoom: [
      {
        startValue: '2.10',
      },
      {
        type: 'inside'
      }
    ],
    series: {
      name: '累计数',
      type: 'line',
      lineStyle: {
        color: '#f00'
      },
      data: lineData.map(function (item: any) {
        return item.cn_conNum;
      }),
      zlevel: 1,
      z: 1,
      markLine: {
        lineStyle: {
          color: '#fff'
        },
        data: [
          {
            yAxis: 100000
          },
          {
            yAxis: 500000
          },
          {
            yAxis: 1000000
          },
          {
            yAxis: 2000000
          },
          {
            yAxis: 3000000
          },
          {
            yAxis: 4000000
          },
          {
            yAxis: 5000000
          },
          {
            yAxis: 6000000
          },
          {
            yAxis: 7000000
          },
        ]
      },
    }
  };
  option && historyLineChart.setOption(option);
};

//现存确诊动画
function addconAnimation() {
  let animationTime = 2 * 60;//动画时间
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
  let animationTime = 2 * 60;//动画时间
  let toNum = Number(props.allData.deathtotal);
  let step = Math.round(toNum / animationTime);//增加步长
  (toNum - addDie.value) <= step && (step = 1);//判断剩余数字
  addDie.value = addDie.value + step;//更新响应式数据
  if (addDie.value == toNum) { return; }
  requestAnimationFrame(addDieAnimation);
}

</script>
<style scoped lang='scss'>
.my-header {
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
      color: #f00;
      cursor: pointer;
    }
  }
}

.echartDiv {
  color: #fff;
  height: calc(100vh - 80px);
  overflow: auto;

  .addconDiv,
  .addcureDiv,
  .addDieDiv {
    margin: 10px;
    // width: 300px;
    background-color: rgba(0, 0, 0, .6);
    text-align: center;
    padding: 5px 20px;

    h1 {
      color: #f4c25e;
      margin: 0px;
      font-size: 50px;
    }
  }

  .addcureDiv {
    h1 {
      color: #48c56b;
    }
  }

  .addDieDiv {
    h1 {
      color: #f00;
    }
  }

  #historyLineDiv {
    height: 400px;
    width: 800px;
  }
}
</style>