<template>
    <div class="chinaTab-drawer">
        <el-drawer v-model="isChina" :with-header="false" direction="ttb" :close-on-click-modal="false"
            :before-close="handleClose" size='100%'>
            <div class="my-header">
                <span>国内数据</span>
                <el-icon :size="40" @click="handleClose" class="close-icon" color="#ffffff88">
                    <CircleClose />
                </el-icon>
            </div>
            <!--表格-->
            <el-table :data="list" style="width: 100%;height: calc(100vh - 100px);
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
                            <el-table-column prop="name" label="省/区" />
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
    async (val) => {
        if (val) {
            await (isChina.value = val);
        }
    },
)

//关闭对话框
function handleClose() {
    isChina.value = false;
    emits("close");
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
}
</style>