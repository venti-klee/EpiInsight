<!--设置抽屉-->
<template>
    <div class="set-drawer">
        <el-drawer v-model="isDrawer" :with-header="false" direction="ltr" :before-close="handleClose" size='400px'>
            <dv-border-box-6 :color="dvColor" class="drawer-div" style="--el-text-color-regular:#fff">
                <h2>球体设置</h2>
                <el-form>
                    <el-form-item label="昼夜切换：">
                        <el-switch v-model="setData.isDay" @change="changeSetData('isDay')"
                            style=" --el-switch-off-color: #ff6a6a">
                        </el-switch>
                    </el-form-item>
                    <el-form-item label="允许拖拽：">
                        <el-switch v-model="setData.isDrag" @change="changeSetData('isDrag')"
                            style=" --el-switch-off-color: #ff6a6a">
                        </el-switch>
                    </el-form-item>
                    <el-form-item label="允许缩放：">
                        <el-switch v-model="setData.isZoom" @change="changeSetData('isZoom')"
                            style="--el-switch-off-color: #ff6a6a">
                        </el-switch>
                    </el-form-item>
                    <el-form-item label="标签显示：">
                        <el-switch v-model="setData.isTag" @change="changeSetData('isTag')"
                            style="--el-switch-off-color: #ff6a6a">
                        </el-switch>
                    </el-form-item>
                    <el-form-item label="自动旋转：">
                        <el-switch v-model="setData.autoRotate" @change="changeSetData('autoRotate')"
                            style=" --el-switch-off-color: #ff6a6a">
                        </el-switch>
                    </el-form-item>
                    <el-form-item label="旋转速度：" v-if="setData.autoRotate">
                        <el-slider v-model="setData.rotateSpeed" @input="changeSetData('rotateSpeed')" />
                    </el-form-item>
                </el-form>
                <div style="text-align:center;width:100%;">
                    <el-button round type="danger" @click="refreshPage">
                        <el-icon style="margin-right:10px;" :size="20">
                            <Refresh />
                        </el-icon>
                        重置
                    </el-button>
                </div>
            </dv-border-box-6>
        </el-drawer>
    </div>

</template>

<script lang='ts' setup>
import { ref, computed, watch, onMounted } from 'vue';
let props = defineProps({
    isDrawer: Boolean,//抽屉状态
}),
    setData = ref({
        isDay: false,//是否白天
        isDrag: true,//拖拽
        isZoom: true,//缩放
        isTag: true,//标签
        autoRotate: true,//自动旋转
        rotateSpeed: 50,//旋转速度
    }),
    isDrawer = ref(false),
    emits = defineEmits(["close", "changeSetData"]),
    dvColor: any = ["#7b52f7", "#c5b2ff"];

//监听props值变化改变isDrawer
watch(
    () => props.isDrawer,
    (val) => { val && (isDrawer.value = true); }
)

function handleClose() {
    isDrawer.value = false;
    emits("close");
};

//改变设置数据
function changeSetData(type: string) {
    emits("changeSetData", type, setData)//传递至父组件
}

//刷新页面
function refreshPage() {
    location.reload();
};
</script>

<style lang="scss" scoped>
:deep(.el-drawer__body) {
    padding: 0px;
}

.set-drawer {
    --el-bg-color: rgba(0, 0, 0, .8);
    padding: 0px;

    .drawer-div {
        padding: 20px 40px;
        color: #fff;
        font-size: 15px;
        font-weight: 900;

        h2 {
            margin: 0px 0px 30px 0px;
        }

    }
}
</style>