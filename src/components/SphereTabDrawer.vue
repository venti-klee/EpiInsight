<template>
    <div class="sphereTab-drawer">
        <el-drawer v-model="isSphere" :with-header="false" direction="ttb" :close-on-click-modal="false"
            :before-close="handleClose" size='100%'>

            <div class="my-header">
                <span>全球数据</span>
                <el-icon :size="40" @click="handleClose" class="close-icon" color="#ffffff88">
                    <CircleClose />
                </el-icon>
            </div>
            <!--表格-->
            <el-table :data="props.sphereData" style="width: 100%;height: calc(100vh - 100px);
            --el-table-bg-color:rgba(0,0,0,.8);
            --el-table-tr-bg-color:transparent;
            --el-table-header-bg-color:#333;
            --el-table-header-text-color:#fff;
            --el-table-text-color:#fff;
            --el-table-row-hover-bg-color:#333;
            --el-table-border-color:#333">
                <el-table-column type="index" label="序号" width="100" />
                <el-table-column prop="name" label="国家" />
                <el-table-column prop="value" label="累计数" sortable />
                <el-table-column prop="deathNum" label="死亡数" sortable />
                <el-table-column prop="cureNum" label="治愈数" sortable />
                <el-table-column prop="citycode" label="地区代码" />
                <el-table-column label="坐标">
                    <template #default="scope">{{ scope.row.position ? scope.row.position : "-" }}</template>
                </el-table-column>
            </el-table>

        </el-drawer>
    </div>
</template>

<script lang='ts' setup>
import { ref, computed, watch, onMounted } from 'vue';
let props: any = defineProps({
    isSphere: {
        type: Boolean,
        default: false
    },
    sphereData: {
        type: Array,
        default: [],
    }
})


let isSphere = ref(false);

watch(
    () => props.isSphere,
    async (val) => {
        if (val) {
            await (isSphere.value = val);

        }
    },
)

let emits = defineEmits(["close"])

//关闭对话框
function handleClose() {
    isSphere.value = false;
    emits("close");
};
</script>

<style lang="scss" scoped>
.sphereTab-drawer {
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