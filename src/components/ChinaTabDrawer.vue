<template>
    <div class="chinaTab-drawer">
        <el-drawer v-model="isChina" :with-header="false" direction="ttb" :close-on-click-modal="false"
            :before-close="handleClose" size='100%'>
            <div class="my-header">
                <div class="top-left">
                    <p>国内数据</p>
                    <div class="name-Inp">
                        <el-input v-model="nameValue" size="small" placeholder="输入省名回车检索"
                            @keyup.enter="enterSearch(nameValue)" />
                    </div>
                    <el-button class="btn" color="#009f5d" @click="clickXlsxBtn">
                        <img :src=xlsxImg />
                        下载表格
                    </el-button>
                </div>
                <el-icon :size="40" @click="handleClose" class="close-icon" color="#ffffff88">
                    <CircleClose />
                </el-icon>
            </div>
            <!--表格-->
            <el-table :data="tabData" style="width: 100%;height: calc(100vh - 100px);
            --el-table-bg-color:rgba(0,0,0,.8);
            --el-table-tr-bg-color:transparent;
            --el-table-header-bg-color:#333;
            --el-table-header-text-color:#fff;
            --el-table-text-color:#fff;
            --el-table-row-hover-bg-color:#333;
            --el-table-border-color:#333;
            --el-text-color-regular:#fff">
                <el-table-column type="index" label="序号" width="100" />
                <el-table-column prop="name" label="省份" />
                <el-table-column type="expand">
                    <template #default="props">
                        <el-table :data="props.row.city" style="width: 100%;height: 55vh;
            --el-table-bg-color:rgba(0,0,0,.7);
            --el-table-tr-bg-color:transparent;
            --el-table-header-bg-color:#333;
            --el-table-header-text-color:#fff;
            --el-table-text-color:#fff;
            --el-table-row-hover-bg-color:#333;
            --el-table-border-color:#333">
                            <el-table-column type="index" label="序号" width="100" />
                            <el-table-column prop="name" label="市/区" />
                            <el-table-column prop="conNum" label="累计数" sortable />
                            <el-table-column prop="econNum" label="现存确诊" sortable />
                            <el-table-column prop="deathNum" label="死亡数" sortable />
                            <el-table-column prop="cureNum" label="治愈数" sortable />
                            <el-table-column prop="asymptomNum" label="较昨日新增数" sortable />
                            <el-table-column prop="zerodays" label="0增天数" sortable />
                        </el-table>
                    </template>
                </el-table-column>
                <el-table-column prop="value" label="累计数" sortable />
                <el-table-column prop="econNum" label="现存确诊" sortable />
                <el-table-column prop="deathNum" label="死亡数" sortable />
                <el-table-column prop="cureNum" label="治愈数" sortable />
                <el-table-column prop="asymptomNum" label="较昨日新增数" sortable />
                <el-table-column prop="jwsrNum" label="境外输入" sortable />
            </el-table>
        </el-drawer>
    </div>
</template>

<script lang='ts' setup>
import { ref, computed, watch, onMounted } from 'vue';
import xlsxImg from "@/assets/img/xlsx.png";
import { downloadXlsx } from "./xlsxUtils.js"
let props = defineProps({
    isChina: {
        type: Boolean,
        default: false
    },
    list: {
        type: Array,
        default: []
    }
}),
    isChina = ref(false),
    nameValue = ref(""),//检索名字
    tabData: any = ref([]),//表格数据
    list = computed(() => {
        let temp: any = JSON.parse(JSON.stringify(props.list));
        temp.forEach((t: any) => {
            t.value = Number(t.value);
            t.econNum = Number(t.econNum);
            t.deathNum = Number(t.deathNum);
            t.cureNum = Number(t.cureNum);
            t.jwsrNum = Number(t.jwsrNum);
            t.asymptomNum = Number(t.asymptomNum);
            if (t.city.length !== 0) {
                t.city.forEach((c: any) => {
                    c.conNum = Number(c.conNum);
                    c.econNum = Number(c.econNum);
                    c.deathNum = Number(c.deathNum);
                    c.cureNum = Number(c.cureNum);
                    c.asymptomNum = Number(c.asymptomNum);
                    c.zerodays = Number(c.zerodays);
                })
            }
        });
        return temp;
    }),
    emits = defineEmits(["close"]);

watch(
    () => props.isChina,
    (val) => {
        if (val) {
            isChina.value = val;
            tabData.value = props.list;//打开表格后赋值数据
        }
    },
)

//关闭对话框
function handleClose() {
    isChina.value = false;
    emits("close");
};

//回车检索
function enterSearch(matchStr: string) {
    if (matchStr == "") {
        tabData.value = props.list;//获取所有数据
        return;
    }
    tabData.value = [];//置空表格数据
    props.list.forEach((s: any) => {
        if (s.name.search(matchStr) >= 0) {
            tabData.value.push(s);
        }
    })
}

//导出数据表格
function clickXlsxBtn() {
    let tabObj = {
        fileName: "国内疫情数据",
        tabHead: ["省份", "累计数", "现存确诊", "死亡数", "治愈数", "较昨日新增数", "境外输入"],
        keyList: ["name", "value", "econNum", "econNum", "cureNum", "asymptomNum", "jwsrNum"],
        tabData: tabData.value
    };
    downloadXlsx(tabObj);
};
</script>

<style lang="scss" scoped>
.chinaTab-drawer {
    --el-bg-color: rgba(0, 0, 0, 0);

    .my-header {
        padding: 0px 10px;
        height: 50px;
        display: flex;
        justify-content: space-between;
        background-color: #000;

        .top-left {
            display: flex;

            p {
                font-weight: 900;
                font-size: 25px;
                margin: auto 0px;
                color: #fff;
            }

            .name-Inp {
                margin: auto 20px;
                margin-left: 20px;
                width: 200px;
            }

            .btn {
                margin: auto;
                border-radius: 0px;
                border: none;
                color: #fff;
                padding: 0px 10px;

                img {
                    height: 25px;
                }
            }
        }

        .close-icon {
            margin: auto 0px;

            &:hover {
                color: #fff;
                cursor: pointer;
            }
        }
    }
}
</style>