<!--省内图表分析-->
<template>
    <div class='provinceEchart-div'>
        <el-drawer v-model="isProvinceEchartDrawer" :with-header="false" direction="ttb" :close-on-click-modal="false"
            :before-close="handleClose" size='100%'>
            <div class="my-header">
                <span>省内分析</span>
                <el-icon :size="40" @click="handleClose" class="close-icon" color="#ffffff88">
                    <CircleClose />
                </el-icon>
            </div>
            <div class="provinceEchartDiv">
                <div class="top-div">
                    <!--省份基本信息-->
                    <div class="baseMsg-div">
                        <div class="provinceName">
                            <h1>{{provinceBaseData.province}}</h1>
                        </div>
                        <div class="provinceNum">
                            <h3 class="all-num">累计：
                                <addNumber :value="provinceBaseData.contotal" :time="10" :thousandSign="true" />
                                (今日{{provinceBaseData.conadd}})
                            </h3>
                            <h3 class="now-num">现存：
                                <addNumber :value="provinceBaseData.econNum" :time="10" :thousandSign="true" />
                                (今日{{provinceBaseData.econadd}})
                            </h3>
                            <h3 class="ok-num">治愈：
                                <addNumber :value="provinceBaseData.curetotal" :time="10" :thousandSign="true" />
                                (今日{{provinceBaseData.cureadd}})
                            </h3>
                            <h3>较昨日新增：
                                <addNumber :value="provinceBaseData.asymptomtotal" :time="10" :thousandSign="true" />
                            </h3>
                            <!-- <h3>本土新增：
                                <addNumber :value="provinceBaseData.locIncrNum" :time="10" :thousandSign="true" />
                            </h3> -->
                            <h3 class="death-num">死亡：
                                <addNumber :value="provinceBaseData.deathtotal" :time="10" :thousandSign="true" />
                            </h3>
                        </div>
                    </div>
                    <!--右侧图表-->
                    <div class="rightEchart-div">
                    </div>
                </div>
                <!--历史数据图表-->
                <div class="historyEchart-div"></div>
            </div>
        </el-drawer>
    </div>
</template>

<script lang='ts' setup>
import { ref, computed, watch, onMounted } from 'vue';
import * as echarts from "echarts";
import addNumber from "@/components/addNumber.vue";
onMounted(() => { });

let props = defineProps({
    //省图表对话框状态
    isProvinceEchartDrawer: {
        type: Boolean,
        default: false
    },
    //省图表对话框数据
    currentProvinceData: {
        type: Object,
        default: {}
    }
}),
    isProvinceEchartDrawer = ref(false),//对话框状态
    provinceBaseData: any = ref({}),//省份基础数据
    provinceData: any = ref({}),//省份面积堆叠图数据
    areaEchart: any = null,//面积堆叠图表
    historylist: any = ref([]),//省份历史数据
    historyEchart: any = null,//历史图表
    emits = defineEmits(["close"]);

watch(
    () => props.isProvinceEchartDrawer,
    async (val) => {
        if (val) {
            (isProvinceEchartDrawer.value = val);
            //获取省份基础数据
            provinceBaseData.value = {
                province: props.currentProvinceData.province,
                contotal: Number(props.currentProvinceData.contotal),
                econNum: Number(props.currentProvinceData.econNum),
                curetotal: Number(props.currentProvinceData.curetotal),
                deathtotal: Number(props.currentProvinceData.deathtotal),
                locIncrNum: Number(props.currentProvinceData.locIncrNum),
                asymptomtotal: Number(props.currentProvinceData.asymptomtotal),
                econadd: props.currentProvinceData.adddaily.econadd,
                cureadd: props.currentProvinceData.adddaily.cureadd,
                conadd: props.currentProvinceData.adddaily.conadd,
            };
            provinceData.value = props.currentProvinceData.city;//获取省份的城市数据
            await provinceData.value.forEach((t: any) => {
                t.conNum = Number(t.conNum);//累计数
                t.econNum = Number(t.econNum);//确诊数
                t.deathNum = Number(t.deathNum);//死亡数
                t.cureNum = Number(t.cureNum);//治愈数
                t.asymptomNum = Number(t.asymptomNum);//较昨日新增
            });
            await (historylist.value = props.currentProvinceData.historylist);//获取到省份的历史数据
            await initEchart();//初始化图表
        }
    },
);

//关闭对话框
function handleClose() {
    isProvinceEchartDrawer.value = false;
    emits("close");
};

//初始化图表
async function initEchart() {
    let areaEchartData: any = { cityName: [], conNum: [], econNum: [], deathNum: [], cureNum: [], asymptomNum: [] };
    await provinceData.value.forEach((p: any) => {
        areaEchartData.cityName.push(p.name);
        areaEchartData.conNum.push(p.conNum);
        areaEchartData.econNum.push(p.econNum);
        areaEchartData.deathNum.push(p.deathNum);
        areaEchartData.cureNum.push(p.cureNum);
        areaEchartData.asymptomNum.push(p.asymptomNum);
    })
    areaEchartFun(areaEchartData);
    let historyEchartData: any = { time: [], conNum: [], econNum: [], deathNum: [], cureNum: [], asymptomNum: [] };
    let histData = JSON.parse(JSON.stringify(historylist.value));
    await histData.reverse();
    await histData.forEach((h: any) => {
        historyEchartData.time.push(h.ymd);
        historyEchartData.conNum.push(h.conNum);
        historyEchartData.econNum.push(h.econNum);
        historyEchartData.deathNum.push(h.deathNum);
        historyEchartData.cureNum.push(h.cureNum);
        historyEchartData.asymptomNum.push(h.asymptomNum);
    })
    historyEchartFun(historyEchartData);
};

//柱状图
function areaEchartFun(echatrData: any) {
    let option = {
        title: {
            text: provinceBaseData.value.province + "各地数据",
            left: "center",
            top: '5%',
            textStyle: {
                color: "#fff",
            },
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {
            data: ['死亡数', '确诊数', '较昨日新增', '治愈数', '累计数'],
            orient: "vertical",
            top: "15%",
            right: "2%",
            textStyle: {
                color: "#fff"
            },
        },
        grid: {
            left: '3%',
            right: '15%',
            bottom: '10%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: echatrData.cityName,
            axisLabel: {
                interval: 0,
                rotate: 50,
                color: "#fff"
            },
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                color: "#fff",
            },
        },
        series: [
            {
                name: '死亡数',
                type: 'bar',
                stack: 'total',
                label: {
                    show: true
                },
                emphasis: {
                    focus: 'series'
                },
                itemStyle: {
                    color: '#ff6a6a'
                },
                data: echatrData.deathNum
            },

            {
                name: '确诊数',
                type: 'bar',
                stack: 'total',
                label: {
                    show: true
                },
                emphasis: {
                    focus: 'series'
                },
                itemStyle: {
                    color: '#ffd889'
                },
                data: echatrData.econNum
            },
            {
                name: '较昨日新增',
                type: 'bar',
                stack: 'total',
                label: {
                    show: true
                },
                emphasis: {
                    focus: 'series'
                },
                itemStyle: {
                    color: '#794ebd'
                },
                data: echatrData.asymptomNum
            },
            {
                name: '治愈数',
                type: 'bar',
                stack: 'total',
                label: {
                    show: true
                },
                emphasis: {
                    focus: 'series'
                },
                itemStyle: {
                    color: '#48c56b'
                },
                data: echatrData.cureNum
            },
            {
                name: '累计数',
                type: 'bar',
                stack: 'total',
                label: {
                    show: true
                },
                emphasis: {
                    focus: 'series'
                },
                itemStyle: {
                    color: '#f59158'
                },
                data: echatrData.conNum
            },
        ]
    };
    (areaEchart) && (areaEchart.dispose());//销毁实例
    areaEchart = echarts.init(document.getElementsByClassName("rightEchart-div")[0]);
    option && areaEchart.setOption(option);
};

//历史图表
function historyEchartFun(echatrData: any) {
    let option = {
        title: {
            text: provinceBaseData.value.province + "历史数据",
            left: "center",
            top: '5%',
            textStyle: {
                color: "#fff",
            },
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                label: {
                    backgroundColor: '#6a7985'
                }
            }
        },
        legend: {
            data: ['累计数', '确诊数', '较昨日新增', '治愈数', '死亡数'],
            orient: "vertical",
            top: "15%",
            right: "2%",
            textStyle: {
                color: "#fff"
            },
        },
        grid: {
            left: '8%',
            // right: '4%',
            // bottom: '3%',
            // containLabel: true
        },
        xAxis: [
            {
                type: 'category',
                boundaryGap: false,
                axisLabel: {
                    color: "#fff",
                },
                data: echatrData.time
            }
        ],
        yAxis: [
            {
                type: 'value',
                axisLabel: {
                    color: "#fff",
                },
            }

        ],
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
                name: '累计数',
                type: 'line',
                stack: 'Total',
                smooth: true,
                lineStyle: {
                    width: 0
                },
                showSymbol: false,
                areaStyle: {
                    opacity: 0.8,
                    color: "#f59158"
                },
                emphasis: {
                    focus: 'series'
                },
                itemStyle: {
                    color: '#f59158'
                },
                data: echatrData.conNum
            },
            {
                name: '确诊数',
                type: 'line',
                stack: 'Total',
                smooth: true,
                lineStyle: {
                    width: 0
                },
                showSymbol: false,
                areaStyle: {
                    opacity: 0.8,
                    color: "#ffd889"
                },
                itemStyle: {
                    color: '#ffd889'
                },
                emphasis: {
                    focus: 'series'
                },
                data: echatrData.econNum
            },
            {
                name: '较昨日新增',
                type: 'line',
                stack: 'Total',
                smooth: true,
                lineStyle: {
                    width: 0
                },
                showSymbol: false,
                label: {
                    show: true,
                    position: 'top'
                },
                areaStyle: {
                    opacity: 0.8,
                    color: "#794ebd"
                },
                itemStyle: {
                    color: '#794ebd'
                },
                emphasis: {
                    focus: 'series'
                },
                data: echatrData.asymptomNum
            },
            {
                name: '治愈数',
                type: 'line',
                stack: 'Total',
                smooth: true,
                lineStyle: {
                    width: 0
                },
                showSymbol: false,
                areaStyle: {
                    opacity: 0.8,
                    color: "#48c56b"
                },
                itemStyle: {
                    color: '#48c56b'
                },
                emphasis: {
                    focus: 'series'
                },
                data: echatrData.cureNum
            },
            {
                name: '死亡数',
                type: 'line',
                stack: 'Total',
                smooth: true,
                lineStyle: {
                    width: 0
                },
                showSymbol: false,
                areaStyle: {
                    opacity: 0.8,
                    color: "#ff6a6a"
                },
                itemStyle: {
                    color: '#ff6a6a'
                },
                emphasis: {
                    focus: 'series'
                },
                data: echatrData.deathNum
            },
        ]
    };
    (historyEchart) && (historyEchart.dispose());//销毁实例
    historyEchart = echarts.init(document.getElementsByClassName("historyEchart-div")[0]);
    option && historyEchart.setOption(option);
}
</script>

<style lang="scss" scoped>
.provinceEchart-div {
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

    .provinceEchartDiv {
        background-color: rgba(255, 255, 255, .7);
        color: #fff;
        height: calc(100vh - 100px);
        overflow: auto;

        .top-div {
            height: 55%;
            width: 100%;
            margin: 10px 0px;
            display: flex;

            .baseMsg-div {
                margin: auto;
                height: 100%;
                width: 35%;
                border-radius: 50px;
                background-color: rgba(0, 0, 0, .8);
                display: flex;

                .provinceName {
                    margin: auto 30px;
                    margin-left: 10%;
                    font-size: 30px;
                    max-width: 35%;
                }

                .provinceNum {
                    margin: auto 0px;

                    h3 {
                        font-size: 20px;
                        color: #794ebd;
                    }

                    .all-num {
                        color: #f59158;
                    }

                    .now-num {
                        color: #ffd889;
                    }

                    .ok-num {
                        color: #48c56b;
                    }

                    .death-num {
                        color: #ff6a6a;
                    }
                }
            }

            .rightEchart-div {
                margin: auto;
                height: 100%;
                width: 62%;
                border-radius: 50px;
                background-color: rgba(0, 0, 0, .8);

                .my-tab {}
            }
        }

        .historyEchart-div {
            height: 40%;
            width: 99%;
            margin: auto;
            border-radius: 50px;
            background-color: rgba(0, 0, 0, .8);
        }
    }
}
</style>