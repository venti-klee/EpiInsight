<!--echarts对话框-->
<template>
  <el-dialog v-model="isEchart" :fullscreen="true" :close-on-click-modal="false" :before-close="handleClose"
    :show-close="false" :destroy-on-close="true"
    style="--el-dialog-bg-color: #ffffff55;--el-dialog-padding-primary:0px;">
    <div class="my-header">
      <span>图表分析</span>
      <el-icon :size="40" @click="handleClose" class="close-icon" color="#fff">
        <CircleClose />
      </el-icon>
    </div>

    <div class="echartDiv">
      <div id="histogramDiv"></div>
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
  sortList: {
    type: Array,
    default: [],
  },
  daily: {
    type: Object,
    default: {}
  },
  jwsrTop: {
    type: Array,
    default: [],
  },
})

let isEchart = ref(false),
  histogramChart: any = null;//柱状图

//watch可监听指定属性watchEffect不能
watch(
  () => props.isEchart,
  async (val) => {
    if (val) {
      await (isEchart.value = val);
      initChart(props.sortList.slice(0, 5)); //取出前五个，初始化图表  
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
function initChart(list: any) {
  let chartDom = document.getElementById("histogramDiv");
  // (histogramChart) && (histogramChart.dispose());//销毁实例
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
}
</style>