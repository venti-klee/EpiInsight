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

      <div class="echartDiv">
        <div class="top-div">
          <div class="num-div">
            <div class="addconDiv">
              <p>国内现存确诊</p>
              <p class="amNum">{{addcon}}</p>
              <p class="add-p">今日{{daily.addcon_new}}</p>
            </div>
            <div class="addcureDiv">
              <p>国内治愈总数</p>
              <p class="amNum">{{addcure}}</p>
              <p class="add-p">今日{{daily.addcure_new}}</p>
            </div>
            <div class="addDieDiv">
              <p>国内死亡总数</p>
              <p class="amNum">{{addDie}}</p>
              <p class="add-p">今日{{daily.adddeath_new}}</p>
            </div>
          </div>
          <div id="historyLineDiv"></div>
        </div>

        <!-- <p>境外输入前十省份{{ props.jwsrTop }}</p> -->
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
        initChart();//初始化图表
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
    backgroundColor: "",
    title: {
      text: '国内历史数据',
      left: "center",
      top: '5%',
      textStyle: {
        color: "#fff",
      },
    },
    tooltip: {
      trigger: 'axis',
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

    .top-div {
      width: 100%;
      height: 400px;
      display: flex;

      .num-div {
        width: 25%;
        height: 100%;
        display: inline-block;
        margin: 10px 10px;

        .addconDiv,
        .addcureDiv,
        .addDieDiv {
          height: 31%;
          margin: 1% 0px;
          width: 100%;
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
        display: inline-block;
        height: 100%;
        width: calc(75% - 30px);
        margin: 10px auto;
      }

    }

  }
}
</style>