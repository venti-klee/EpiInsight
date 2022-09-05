<template>
  <div id="echartDiv"></div>
</template>
<script>
import * as echarts from "echarts";
export default {
  name: "",
  components: {},
  props: {
    sortList: {
      type: Array,
      default: [],
    },
  },
  data() {
    return {};
  },
  computed: {},
  watch: {
    sortList(val) {
      let listData = this.sortList.slice(0, 5);
      this.initChart(listData); //初始化图表
    },
  },
  created() {},
  mounted() {},
  methods: {
    //初始化图表
    initChart(list) {
      let chartDom = document.getElementById("echartDiv");
      let myChart = echarts.init(chartDom);
      let option = {
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
      list.forEach((l) => {
        option.yAxis.data.push(l.name);
        option.series[0].data.push(l.value);
      });
      option.series[0].data.reverse();
      option && myChart.setOption(option);
    },
  },
};
</script>
<style scoped lang='scss'>
#echartDiv {
  height: 200px;
  width: 400px;
  //   background-color: rgba(0, 0, 0, 0.5);
}
</style>