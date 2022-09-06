<template>
    <el-dialog v-model="isSphere" width="94%" :close-on-click-modal="false" :show-close="false"
        :before-close="handleClose" style="--el-dialog-bg-color: #ffffff55;height: 75vh;">
        <template #header="{ close, titleId, titleClass }">
            <div class="my-header">
                <span :id="titleId" :class="titleClass">全球数据</span>
                <el-icon :size="40" @click="close" class="close-icon" color="#fff">
                    <CircleClose />
                </el-icon>
            </div>
        </template>
        <!--表格-->
        <el-table :data="props.sphereData" style="width: 100%;height: 55vh;
            --el-table-bg-color:rgba(0,0,0,.7);
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
            <el-table-column prop="deathadd" label="新增死亡数" />
            <el-table-column prop="citycode" label="地区代码" />
            <el-table-column label="坐标">
                <template #default="scope">{{ scope.row.position ? scope.row.position : "-" }}</template>
            </el-table-column>
        </el-table>
    </el-dialog>
</template>

<script lang='ts' setup>
import { defineEmits, ref, computed, watch, onMounted } from 'vue';
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
</style>