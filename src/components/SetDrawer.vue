<!--设置抽屉-->
<template>
    <div class="set-drawer">
        <el-drawer v-model="isDrawer" :with-header="false" direction="ltr" :before-close="handleClose" size='500px'>
            <dv-border-box-13 :color="setData.sysColor" class="drawer-div">
                <h2>系统设置</h2>
                <el-form>
                    <el-form-item label="球体自转：">
                        <el-switch v-model="setData.autoRotate" @change="changeSetData('autoRotate')"
                            style=" --el-switch-on-color: #555555">
                        </el-switch>
                    </el-form-item>
                    <el-form-item label="球体拖拽：">
                        <el-switch v-model="setData.isDrag" @change="changeSetData('isDrag')"
                            style="--el-switch-on-color: #555555">
                        </el-switch>
                    </el-form-item>
                    <el-form-item label="球体缩放：">
                        <el-switch v-model="setData.isZoom" @change="changeSetData('isZoom')"
                            style="--el-switch-on-color: #555555">
                        </el-switch>
                    </el-form-item>
                    <el-form-item label="球体标签：">
                        <el-switch v-model="setData.isTag" @change="changeSetData('isTag')"
                            style="--el-switch-on-color: #555555">
                        </el-switch>
                    </el-form-item>
                    <el-form-item label="数据来源：">
                        <el-radio-group v-model="setData.dataType" @change="changeSetData('dataType')">
                            <el-radio-button v-for="item in dataTypeList" :label="item" :key="item"
                                style="--el-radio-button-checked-border-color:#555555;--el-radio-button-checked-bg-color:#555555;--el-border-radius-base: 0px;">
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
                                style="--el-radio-button-checked-border-color:#555555;--el-radio-button-checked-bg-color:#555555;--el-border-radius-base: 0px;">
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
                            style="--el-color-primary:#555555" />
                    </el-form-item>
                    <el-form-item label="主题定制：">
                        <el-popover placement="top" trigger="click">
                            <template #reference>
                                <el-button class="presets-btn">预设</el-button>
                            </template>
                            <div class="color-div" v-for="item in colorList" :key="item[0]" @click="presetsColor(item)">
                                <div class="color1" :style="{ backgroundColor: item[0] }">主色</div>
                                <div class="color2" :style="{ backgroundColor: item[1] }">副色</div>
                            </div>
                        </el-popover>
                        <input id="colorInp" style="height: 0px;opacity: 0;width: 0px;margin: 0px;padding: 0px;"
                            type="color" />
                        <el-button class="main-color" :color="setData.sysColor[0]" @click="changeColor(0)">
                            主色
                        </el-button>
                        <el-button class="secondary-color" :color="setData.sysColor[1]" @click="changeColor(1)">
                            副色
                        </el-button>
                        <el-button class="sure-btn" @click="sureColor">确定</el-button>
                    </el-form-item>
                    <el-form-item label="系统重置：">
                        <el-button @click="refreshPage" color="#555555" style="border-radius: 0px;">
                            <el-icon style="margin-right:10px;" :size="20">
                                <Refresh />
                            </el-icon>
                            重置
                        </el-button>
                    </el-form-item>
                </el-form>
                <!--版本号盒子-->
                <div class="ver-div">
                    版本号：v{{ setData.sysVer }}
                </div>
            </dv-border-box-13>
        </el-drawer>
    </div>
</template>

<script lang='ts' setup>
import { ref, computed, watch, onBeforeMount, onMounted, nextTick } from 'vue';
import PK from "@/../package.json";
import onImg from "@/assets/img/on.png";
import offImg from "@/assets/img/off.png";
import lzImg from "@/assets/img/lz.png";
import hyImg from "@/assets/img/hy.png";
import bzImg from "@/assets/img/bz.png";
let props = defineProps({
    isDrawer: Boolean,//抽屉状态
}),
    setData: any = ref({
        sphereType: "粒子",//球体类型
        isDrag: true,//拖拽
        isZoom: true,//缩放
        isTag: true,//标签
        autoRotate: true,//自动旋转
        rotateSpeed: 10,//旋转速度
        sysVer: "",//系统版本号
        dataType: "",//数据来源
        sysColor: ["#7b52f7", "#c5b2ff"],//系统配色
    }),
    isDrawer = ref(false),
    sphereTypeList = ["粒子", "黑夜", "白昼"],//球体列表
    dataTypeList = ["离线", "在线"],//数据来源列表
    emits = defineEmits(["close", "changeSetData"]),
    colorType: any = null,//主题颜色类型
    colorList: any = [
        ["#7b52f7", "#c5b2ff"],
        ["#414a89", "#b9c1ff"],
        ["#295eb5", "#a4c5fb"],
    ];//预设主题列表

//监听props值变化改变isDrawer
watch(
    () => props.isDrawer,
    (val) => {
        if (val) {
            isDrawer.value = true;
            nextTick(() => {
                //监听取色器
                (document as any)
                    .getElementById("colorInp")
                    .addEventListener("input", updateColorVal, false);
            });
        } else {
            //移除监听
            (document as any)
                .getElementById("colorInp")
                .removeEventListener("input", updateColorVal, false);
        }
    }
)

onBeforeMount(() => {
    sysConfig();//系统配置
});

//系统配置
function sysConfig() {
    setData.value.sysVer = PK.version//获取系统版本号
    process.env.NODE_ENV == "development" ?
        setData.value.dataType = dataTypeList[0] ://开发环境使用离线数据
        setData.value.dataType = dataTypeList[1];//生产环境使用在线数据
    let ss = sessionStorage.getItem("config");//获取缓存配置
    //缓存中有配置取出配置，无则使用初始配置
    if (ss) {
        let cuVer = setData.value.sysVer,//当前版本号
            ssVer = JSON.parse(ss).sysVer,//缓存版本号
            isUpDate = null;//是否更新缓存
        //当前版本号与缓存版本号若不等清除缓存使用当前配置，否则使用缓存配置
        (cuVer !== ssVer) ?
            (isUpDate = true) :
            isUpDate = false;
        isUpDate ?
            (
                (sessionStorage.removeItem("config")),//清除缓存
                (sessionStorage.setItem("config", JSON.stringify(setData.value)))//设置缓存配置
            ) :
            (setData.value = JSON.parse(ss));
    } else {
        sessionStorage.setItem("config", JSON.stringify(setData.value));//设置缓存配置
    }
};

//hex转rgb
function hexToRgb(color: any) {
    var str: any = "0x" + color.substring(1, color.length);
    var r = str & 0x0000ff;
    var g = (str & 0x00ff00) >> 8;
    var b = (str & 0xff0000) >> 16;
    let RGBVal = "rgb(" + b + "," + g + "," + r + ")";
    return RGBVal;
};

//更新颜色值
function updateColorVal(e: any) {
    setData.value.sysColor[colorType] = e.target.value;
};

//改变系统配色
function changeColor(type: Number) {
    (document.getElementById("colorInp") as any).click();//手动点击取色器
    colorType = type;//改变颜色类型
};

//预设主题
function presetsColor(item: any) {
    if (confirm("确认使用该预设主题？")) {
        setData.value.sysColor = item;//设置主题
        sureColor();//确认颜色
    }
};

//确定颜色
function sureColor() {
    sessionStorage.setItem("config", JSON.stringify(setData.value));//修改缓存配置
    location.reload();//刷新页面
};

function handleClose() {
    isDrawer.value = false;
    emits("close");
};

//改变设置数据
function changeSetData(type: string) {
    sessionStorage.setItem("config", JSON.stringify(setData.value));//修改缓存配置
    emits("changeSetData", type, setData)//传递至Sphere组件中
}

//刷新页面
function refreshPage() {
    if (confirm("确认重置所有设置？")) {
        sessionStorage.removeItem("config");//清除缓存
        location.reload();
    }
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

        .main-color,
        .secondary-color {
            margin: 0px;
            border-radius: 0px;
            -webkit-text-stroke: 1px #000;
            color: #fff;
            font-weight: 900;
            font-size: 15px;
        }

        .main-color {
            margin-left: 10px;
        }

        .secondary-color {
            margin-right: 10px;
        }


        .presets-btn,
        .sure-btn {
            margin: 0px;
            border-radius: 0px;
            font-weight: 900;
            font-size: 15px;
        }

        .ver-div {
            position: absolute;
            right: 0;
            bottom: 0;
            margin: 0px 0px 10px 0px;
            font-weight: 900;
            color: #aaa
        }
    }
}

.color-div {
    display: flex;
    margin: 5px 0px;

    &:hover {
        margin: 5px 2px;
        cursor: pointer;
    }

    .color1,
    .color2 {
        -webkit-text-stroke: 1px #000;
        color: #fff;
        padding: 7px 15px;
        font-weight: 900;
        font-size: 15px;
        width: 80px;
        // margin: 5px 0px;
    }
}
</style>