<!--echarts对话框-->
<template>
  <el-dialog v-model="isEchart" width="94%" :close-on-click-modal="false" :show-close="false"
    :before-close="handleClose" :destroy-on-close="true" style="--el-dialog-bg-color: #ffffff55;">
    <template #header="{ close, titleId, titleClass }">
      <div class="my-header">
        <span :id="titleId" :class="titleClass">图表分析</span>
        <el-icon :size="40" @click="close" class="close-icon" color="#fff">
          <CircleClose />
        </el-icon>
      </div>
    </template>
    <div class="echartDiv">
      <div id="histogramDiv"></div>
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
  }
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
      text: "累计病例数前五",
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
  display: flex;
  justify-content: space-between;

  span {
    font-weight: 900;
    font-size: 25px;
    color: #fff;
  }

  .close-icon {
    &:hover {
      color: #f00;
      cursor: pointer;
    }
  }
}

.echartDiv {


  #histogramDiv {
    height: 200px;
    width: 400px;
  }
}
</style>