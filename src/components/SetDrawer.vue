<!--设置抽屉-->
<template>
    <div class="set-drawer">
        <el-drawer v-model="isDrawer" :with-header="false" direction="ltr" :before-close="handleClose" size='400px'>
            <dv-border-box-13 :color="dvColor" class="drawer-div">
                <h2>系统设置</h2>
                <el-form>
                    <el-form-item label="球体切换：">
                        <el-radio-group v-model="setData.isDay" @change="changeSetData('isDay')">
                            <el-radio-button v-for="item in isDayList" :label="item" :key="item"
                                style="--el-radio-button-checked-border-color:#7b52f7;--el-radio-button-checked-bg-color:#7b52f7" />
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="球体拖拽：">
                        <el-switch v-model="setData.isDrag" @change="changeSetData('isDrag')"
                            style="--el-switch-on-color: #7b52f7">
                        </el-switch>
                    </el-form-item>
                    <el-form-item label="球体缩放：">
                        <el-switch v-model="setData.isZoom" @change="changeSetData('isZoom')"
                            style="--el-switch-on-color: #7b52f7">
                        </el-switch>
                    </el-form-item>
                    <el-form-item label="球体标签：">
                        <el-switch v-model="setData.isTag" @change="changeSetData('isTag')"
                            style="--el-switch-on-color: #7b52f7">
                        </el-switch>
                    </el-form-item>
                    <el-form-item label="球体自转：">
                        <el-switch v-model="setData.autoRotate" @change="changeSetData('autoRotate')"
                            style=" --el-switch-on-color: #7b52f7">
                        </el-switch>
                    </el-form-item>
                    <el-form-item label="自转速度：" v-if="setData.autoRotate">
                        <el-slider v-model="setData.rotateSpeed" @input="changeSetData('rotateSpeed')"
                            style="--el-color-primary:#7b52f7" />
                    </el-form-item>
                    <el-form-item label="离线数据：">
                        <el-switch v-model="setData.isOfLData" @change="changeSetData('isOfLData')"
                            style="--el-switch-on-color: #7b52f7">
                        </el-switch>
                    </el-form-item>
                </el-form>
                <div style="text-align:center;width:100%;">
                    <el-button @click="refreshPage" color="#7b52f7" style="border-radius: 0px;">
                        <el-icon style="margin-right:10px;" :size="20">
                            <Refresh />
                        </el-icon>
                        重置
                    </el-button>
                </div>
            </dv-border-box-13>
        </el-drawer>
    </div>
</template>

<script lang='ts' setup>
import { ref, computed, watch, onMounted } from 'vue';
let props = defineProps({
    isDrawer: Boolean,//抽屉状态
    dvColor: Array
}),
    setData: any = ref({
        isDay: "粒子",//球体切换
        isDrag: true,//拖拽
        isZoom: true,//缩放
        isTag: true,//标签
        autoRotate: true,//自动旋转
        rotateSpeed: 10,//旋转速度
        isOfLData: null,//离线数据
    }),
    isDrawer = ref(false),
    isDayList = ["粒子", "黑夜", "白昼"],//球体列表
    emits = defineEmits(["close", "changeSetData"]);

//监听props值变化改变isDrawer
watch(
    () => props.isDrawer,
    (val) => {
        if (val) {
            isDrawer.value = true;
            //通过sessionStorage给isOfLData赋值
            sessionStorage.getItem("isOffLineData") == "true" ?
                setData.value.isOfLData = true :
                setData.value.isOfLData = false;
        }
    }
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
    sessionStorage.removeItem("isOffLineData");//清除sessionStorage中isOffLineData状态
    location.reload();
};
</script>

<style lang="scss" scoped>
:：deep(.el-drawer__body) {
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