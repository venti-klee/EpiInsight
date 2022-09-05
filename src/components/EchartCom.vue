<!--echarts图表-->
<template>
  <div id="echartDiv">
  </div>
</template>
<script lang='ts' setup>
import { ref, computed, watch, onMounted } from 'vue';
import * as echarts from "echarts";
let props: any = defineProps({
  sortList: {
    type: Array,
    default: [],
  }
})

//watch可监听指定属性watchEffect不能
watch(
  () => props.sortList,
  (val) => {
    if (val.length !== 0) {
      initChart(val.slice(0, 5)); //取出前五个，初始化图表
    }
  },
  { deep: true }
)

//初始化图表
function initChart(list: any) {
  let chartDom = document.getElementById("echartDiv");
  let myChart = echarts.init(chartDom);
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
          color: "rgba(255, 185, 185,.5)",
        },
        itemStyle: {
          color: "rgba(255, 0, 0,.5)",
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
  option && myChart.setOption(option);
}

</script>
<style scoped lang='scss'>
#echartDiv {
  height: 200px;
  width: 400px;
}
</style>