<!--设置抽屉-->
<template>
    <div class="set-drawer">
        <el-drawer v-model="isDrawer" :with-header="false" direction="ltr" :before-close="handleClose" size='500px'>
            <dv-border-box-13 :color="dvColor" class="drawer-div">
                <h2>系统设置</h2>
                <el-form>
                    <el-form-item label="球体自转：">
                        <el-switch v-model="setData.autoRotate" @change="changeSetData('autoRotate')"
                            style=" --el-switch-on-color: #7b52f7">
                        </el-switch>
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
                    <el-form-item label="数据来源：">
                        <el-radio-group v-model="setData.dataType" @change="changeSetData('dataType')">
                            <el-radio-button v-for="item in dataTypeList" :label="item" :key="item"
                                style="--el-radio-button-checked-border-color:#7b52f7;--el-radio-button-checked-bg-color:#7b52f7;--el-border-radius-base: 0px;">
                                <template #default="label">
                                    <div style="display:flex ;">
                                        <img v-if="item == '在线'" :src="onImg" style="height:18px;margin: auto 5px;" />
                                        <img v-if="item == '离线'" :src="offImg" style="height:18px;margin: auto 5px" />
                                        <div style="margin: auto;">{{ item }}</div>
                                    </div>
                                </template>
                            </el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="球体类型：">
                        <el-radio-group v-model="setData.sphereType" @change="changeSetData('sphereType')">
                            <el-radio-button v-for="item in sphereTypeList" :label="item" :key="item"
                                style="--el-radio-button-checked-border-color:#7b52f7;--el-radio-button-checked-bg-color:#7b52f7;--el-border-radius-base: 0px;">
                                <template #default="label">
                                    <div style="display:flex ;">
                                        <img v-if="item == '粒子'" :src="lzImg" style="height:18px;margin: auto 5px;" />
                                        <img v-if="item == '黑夜'" :src="hyImg" style="height:18px;margin: auto 5px" />
                                        <img v-if="item == '白昼'" :src="bzImg" style="height:18px;margin: auto 5px" />
                                        <div style="margin: auto;">{{ item }}</div>
                                    </div>
                                </template>
                            </el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="自转速度：" v-if="setData.autoRotate">
                        <el-slider v-model="setData.rotateSpeed" @input="changeSetData('rotateSpeed')"
                            style="--el-color-primary:#7b52f7" />
                    </el-form-item>
                    <el-form-item label="系统重置：">
                        <el-button @click="refreshPage" color="#7b52f7" style="border-radius: 0px;">
                            <el-icon style="margin-right:10px;" :size="20">
                                <Refresh />
                            </el-icon>
                            重置
                        </el-button>
                    </el-form-item>
                </el-form>
            </dv-border-box-13>
        </el-drawer>
    </div>
</template>

<script lang='ts' setup>
import { ref, computed, watch, onMounted } from 'vue';
import onImg from "@/assets/img/on.png";
import offImg from "@/assets/img/off.png";
import lzImg from "@/assets/img/lz.png";
import hyImg from "@/assets/img/hy.png";
import bzImg from "@/assets/img/bz.png";
let props = defineProps({
    isDrawer: Boolean,//抽屉状态
    dvColor: Array
}),
    setData: any = ref({
        sphereType: "粒子",//球体类型
        isDrag: true,//拖拽
        isZoom: true,//缩放
        isTag: true,//标签
        autoRotate: true,//自动旋转
        rotateSpeed: 10,//旋转速度
        dataType: "",//数据来源
    }),
    isDrawer = ref(false),
    sphereTypeList = ["粒子", "黑夜", "白昼"],//球体列表
    dataTypeList = ["离线", "在线"],//数据来源列表
    emits = defineEmits(["close", "changeSetData"]);

//监听props值变化改变isDrawer
watch(
    () => props.isDrawer,
    (val) => {
        val && (isDrawer.value = true);
    }
)

onMounted(() => {
    sysConfig();//系统配置
})

//系统配置
function sysConfig() {
    //sessionStorage中有配置取出配置赋值setData，无则使用初始配置
    if (sessionStorage.getItem("config")) {
        setData.value = JSON.parse(sessionStorage.getItem("config") as any);
    } else {
        process.env.NODE_ENV == "development" ?
            setData.value.dataType = dataTypeList[0] ://开发环境默认使用离线数据
            setData.value.dataType = dataTypeList[1];//生产环境默认api数据
        sessionStorage.setItem("config", JSON.stringify(setData.value));//设置sessionStorage中配置
    }
};

function handleClose() {
    isDrawer.value = false;
    emits("close");
};

//改变设置数据
function changeSetData(type: string) {
    console.log(type);
    sessionStorage.setItem("config", JSON.stringify(setData.value));//修改sessionStorage
    emits("changeSetData", type, setData)//传递至父组件
}

//刷新页面
function refreshPage() {
    sessionStorage.removeItem("config");//清除sessionStorage
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