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
      <div id="histogramDiv"></div>
      <div id="historyLineDiv"></div>
      <p>国内累计总数：{{ props.daily.addcon }}</p>
      <p>国内死亡总数：{{ props.daily.adddeath }}</p>
      <p>国内治愈总数：{{ props.daily.addcure }}</p>
      <p>国内现存确诊：{{ props.daily.addecon_new }}</p>
      <p>境外输入前十省份{{ props.jwsrTop }}</p>
    </div>
  </el-dialog>

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
  sortList: {
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
  }
})

let isEchart = ref(false),
  histogramChart: any = null,//柱状图
  historyLineChart: any = null;//历史折线图

//watch可监听指定属性watchEffect不能
watch(
  () => props.isEchart,
  async (val) => {
    if (val) {
      await (isEchart.value = val);
      initChart();
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
  histogramChartFun(props.sortList.slice(0, 5)); //取出前五个，绘制国家排名柱状图
  historyLineChartFun(props.historylist);//绘制历史折线图
}

//国家排名柱状图
function histogramChartFun(list: any) {
  let chartDom = document.getElementById("histogramDiv");
  (histogramChart) && (histogramChart.dispose());//销毁实例
  histogramChart = echarts.init(chartDom);
  let option: any = {
    backgroundColor: "",
    title: {
      text: "全球累计数前五国家",
      left: "center",
      top: "3%",
      textStyle: {
        color: "#fff",
      },
    },
    grid: {
      top: "15%",
      left: "10%",
      right: "5%",
      bottom: "10%",
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
    },
    series: [
      {
        data: [],
        type: "bar",
        showBackground: true,
        backgroundStyle: {
          color: "rgba(255, 185, 185,1)",
        },
        itemStyle: {
          color: "rgba(255, 0, 0,1)",
        },
        label: {
          show: true,
          position: "inside",
          formatter: "{c}",
        },
      },
    ],
  };
  list.forEach((l: any) => {
    option.yAxis.data.push(l.name);
    option.series[0].data.push(l.value);
  });
  option.series[0].data.reverse();
  option && histogramChart.setOption(option);
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

  #histogramDiv {
    height: 200px;
    width: 400px;
  }

  #historyLineDiv {
    height: 400px;
    width: 800px;
  }
}
</style>