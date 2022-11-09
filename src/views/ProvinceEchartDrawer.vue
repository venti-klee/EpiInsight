<!--省内图表分析-->
<template>
    <div class='provinceEchart-div'>
        <el-drawer v-model="isProvinceEchartDrawer" :with-header="false" direction="ttb" :close-on-click-modal="false"
            :before-close="handleClose" size='100%'>
            <div class="my-header">
                <span>省内分析</span>
                <el-icon :size="40" @click="handleClose" class="close-icon" color="#fff">
                    <Close />
                </el-icon>
            </div>
            <div class="provinceEchartDiv">
                <div class="top-div">
                    <!--省份基本信息-->
                    <dv-border-box-13 class="baseMsg-dv" :color="dvColor">
                        <div class="baseMsg-div">
                            <div class="provinceName">
                                <h1>{{ provinceBaseData.province }}</h1>
                            </div>
                            <div class="provinceNum">
                                <h3 class="all-num">累计：
                                    <addNumber :value="provinceBaseData.contotal" :time="10" :thousandSign="true" />
                                    (今日{{ provinceBaseData.conadd }})
                                </h3>
                                <h3 class="now-num">现存：
                                    <addNumber :value="provinceBaseData.econNum" :time="10" :thousandSign="true" />
                                    (今日{{ provinceBaseData.econadd }})
                                </h3>
                                <h3 class="ok-num">治愈：
                                    <addNumber :value="provinceBaseData.curetotal" :time="10" :thousandSign="true" />
                                    (今日{{ provinceBaseData.cureadd }})
                                </h3>
                                <h3>较昨日新增：
                                    <addNumber :value="provinceBaseData.asymptomtotal" :time="10"
                                        :thousandSign="true" />
                                </h3>
                                <!-- <h3>本土新增：
                                <addNumber :value="provinceBaseData.locIncrNum" :time="10" :thousandSign="true" />
                            </h3> -->
                                <h3 class="death-num">死亡：
                                    <addNumber :value="provinceBaseData.deathtotal" :time="10" :thousandSign="true" />
                                </h3>
                            </div>
                        </div>
                    </dv-border-box-13>
                    <!--右侧图表-->
                    <dv-border-box-1 class="rightEchartTab-dv" :color="dvColor">
                        <div class="rightEchart-div" v-show="isProHisEchart">
                        </div>
                        <div class="rightTab-div" v-show="!isProHisEchart">
                            <h3 style="height:20px;margin-top: 10px;">{{ provinceBaseData.province }}各地数据</h3>
                            <el-table class="my-tab" :data="provinceData" style="width: 100%;
                        height:calc(100% - 90px);
            --el-table-bg-color:rgba(0,0,0,0);
            --el-table-tr-bg-color:transparent;
            --el-table-header-bg-color:#333;
            --el-table-header-text-color:#fff;
            --el-table-text-color:#fff;
            --el-table-row-hover-bg-color:#333;
            --el-table-border-color:#333;
            --el-text-color-regular:#fff">
                                <el-table-column type="index" label="序号" width="100" />
                                <el-table-column prop="name" label="市/区" />
                                <el-table-column prop="conNum" label="累计数" sortable />
                                <el-table-column prop="econNum" label="确诊数" sortable />
                                <el-table-column prop="deathNum" label="死亡数" sortable />
                                <el-table-column prop="cureNum" label="治愈数" sortable />
                                <el-table-column prop="asymptomNum" label="较昨日新增" sortable />
                            </el-table>
                        </div>
                        <div class="rightEchart-btn">
                            <el-button class="btn" color="#7b52f7" @click="clickEchartBtn">
                                <el-icon style="margin-right: 10px;">
                                    <Histogram />
                                </el-icon>
                                图表
                            </el-button>
                            <el-button class="btn" color="#7b52f7" @click="isProHisEchart = false">
                                <el-icon style="margin-right: 10px;">
                                    <List />
                                </el-icon>
                                表格
                            </el-button>
                        </div>
                    </dv-border-box-1>

                </div>
                <!--历史数据图表-->
                <dv-border-box-6 class="historyEchart-dv" :color="dvColor">
                    <div class="historyEchart-div"></div>
                </dv-border-box-6>
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
    proHisEchart: any = null,//柱状图表
    historyList: any = ref([]),//省份历史数据
    historyEchart: any = null,//历史图表
    isProHisEchart = ref(true),//显示柱状图状态
    emits = defineEmits(["close"]),
    dvColor = ["#7b52f7", "#c5b2ff"];

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
            await (historyList.value = props.currentProvinceData.historylist);//获取到省份的历史数据
            initEchart();//初始化图表
        } else {
            provinceBaseData.value.contotal = 0;
            provinceBaseData.value.econNum = 0;
            provinceBaseData.value.curetotal = 0;
            provinceBaseData.value.asymptomtotal = 0;
            provinceBaseData.value.deathtotal = 0;
        }
    },
);

//关闭对话框
function handleClose() {
    isProvinceEchartDrawer.value = false;
    emits("close");
};

//点击图表按钮
function clickEchartBtn() {
    isProHisEchart.value = true;
    proHisEchartFun();
}

//初始化图表
function initEchart() {
    isProHisEchart.value = true;
    proHisEchartFun();
    historyEchartFun();
};

//柱状图
async function proHisEchartFun() {
    let echartData: any = { cityName: [], conNum: [], econNum: [], deathNum: [], cureNum: [], asymptomNum: [] };
    await provinceData.value.forEach((p: any) => {
        echartData.cityName.push(p.name);
        echartData.conNum.push(p.conNum);
        echartData.econNum.push(p.econNum);
        echartData.deathNum.push(p.deathNum);
        echartData.cureNum.push(p.cureNum);
        echartData.asymptomNum.push(p.asymptomNum);
    })
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
        dataZoom: [
            {
                type: 'inside',
            },
            {
                show: true,
                yAxisIndex: 0,
                filterMode: 'empty',
                width: 25,
                height: '70%',
                showDataShadow: false,
                left: '3%',
                top: "center"
            }
        ],
        legend: {
            data: ['累计数', '治愈数', '确诊数', '较昨日新增', '死亡数'],
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
            data: echartData.cityName,
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
                name: '累计数',
                type: 'bar',
                animationDuration: 2000,//动画时间
                animationEasing: "cubicInOut",//动画类型
                // stack: 'total',
                // label: {
                //     show: true
                // },
                emphasis: {
                    focus: 'series'
                },
                itemStyle: {
                    color: '#f59158'
                },
                data: echartData.conNum
            },
            {
                name: '治愈数',
                type: 'bar',
                animationDuration: 2000,//动画时间
                animationEasing: "cubicInOut",//动画类型
                // stack: 'total',
                // label: {
                //     show: true
                // },
                emphasis: {
                    focus: 'series'
                },
                itemStyle: {
                    color: '#48c56b'
                },
                data: echartData.cureNum
            },
            {
                name: '确诊数',
                type: 'bar',
                stack: 'total',
                animationDuration: 2000,//动画时间
                animationEasing: "cubicInOut",//动画类型
                // label: {
                //     show: true
                // },
                emphasis: {
                    focus: 'series'
                },
                itemStyle: {
                    color: '#ffd889'
                },
                data: echartData.econNum
            },
            {
                name: '较昨日新增',
                type: 'bar',
                stack: 'total',
                animationDuration: 2000,//动画时间
                animationEasing: "cubicInOut",//动画类型
                // label: {
                //     show: true
                // },
                emphasis: {
                    focus: 'series'
                },
                itemStyle: {
                    color: '#794ebd'
                },
                data: echartData.asymptomNum
            },
            {
                name: '死亡数',
                type: 'bar',
                stack: 'total',
                animationDuration: 2000,//动画时间
                animationEasing: "cubicInOut",//动画类型
                // label: {
                //     show: true
                // },
                emphasis: {
                    focus: 'series'
                },
                itemStyle: {
                    color: '#ff6a6a'
                },
                data: echartData.deathNum
            },
        ]
    };
    (proHisEchart) && (proHisEchart.dispose());//销毁实例
    proHisEchart = echarts.init(document.getElementsByClassName("rightEchart-div")[0]);
    option && proHisEchart.setOption(option);
};

//历史图表
async function historyEchartFun() {
    let echatrData: any = { time: [], conNum: [], econNum: [], deathNum: [], cureNum: [], asymptomNum: [] };
    let histData = JSON.parse(JSON.stringify(historyList.value));
    await histData.reverse();
    await histData.forEach((h: any) => {
        echatrData.time.push(h.ymd);
        echatrData.conNum.push(h.conNum);
        echatrData.econNum.push(h.econNum);
        echatrData.deathNum.push(h.deathNum);
        echatrData.cureNum.push(h.cureNum);
        echatrData.asymptomNum.push(h.asymptomNum);
    })
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
                animationDuration: 2000,//动画时间
                animationEasing: "cubicInOut",//动画类型
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
                animationDuration: 2000,//动画时间
                animationEasing: "cubicInOut",//动画类型
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
                animationDuration: 2000,//动画时间
                animationEasing: "cubicInOut",//动画类型
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
                animationDuration: 2000,//动画时间
                animationEasing: "cubicInOut",//动画类型
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
                animationDuration: 2000,//动画时间
                animationEasing: "cubicInOut",//动画类型
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
                color: #7b52f7;
                cursor: pointer;
            }
        }
    }

    .provinceEchartDiv {
        background-color: rgba(0, 0, 0, .8);
        color: #fff;
        height: calc(100vh - 100px);
        overflow: auto;

        .top-div {
            height: 340px;
            width: 100%;
            margin: 10px 0px;
            display: flex;

            .baseMsg-dv {
                margin: auto;
                height: 100%;
                width: 35%;

                .baseMsg-div {
                    height: 100%;
                    width: 100%;
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
            }

            .rightEchartTab-dv {
                text-align: center;
                margin: auto;
                height: 100%;
                width: 62%;

                .rightEchart-div,
                .rightTab-div {
                    height: 100%;
                    width: 96%;
                    margin: 0px 2%;
                }

                .rightEchart-btn {
                    position: absolute;
                    top: 0;
                    right: 20%;
                    z-index: 10;

                    .btn {
                        padding: 10px 20px;
                        border: none;
                        color: #fff;
                        border-radius: 0px;
                    }
                }
            }
        }

        .historyEchart-dv {
            height: 250px;
            width: 99%;
            margin: auto;

            .historyEchart-div {
                height: 100%;
                width: 100%;
            }
        }

    }
}
</style>