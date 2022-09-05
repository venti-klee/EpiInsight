<!--设置抽屉-->
<template>
    <el-drawer v-model="isDrawer" :with-header="false" direction="ltr" :before-close="handleClose">
        <div class="drawer-div">
            <div class="switch-div">
                <div>
                    <span>昼夜切换：</span>
                    <el-switch v-model="isDay" @change="handleChangeDay"
                        style="--el-switch-on-color: #13ce66; --el-switch-off-color: #000000">
                    </el-switch>
                </div>
                <div>
                    <span>自动旋转：</span>
                    <el-switch v-model="autoRotate" @change="handleChangeRotate"
                        style="--el-switch-on-color: #13ce66; --el-switch-off-color: #000000">
                    </el-switch>
                </div>
            </div>
        </div>
    </el-drawer>
</template>

<script lang='ts' setup>
import { ref, computed, watch, onMounted } from 'vue';
let isDay = ref(false), //是否白天
    autoRotate = ref(true); //自动旋转


let props: any = defineProps({
    isDrawer: Boolean,//抽屉状态
})

let isDrawer = ref(false);

//监听props值变化改变isDrawer
watch(
    () => props.isDrawer,
    (val) => { val && (isDrawer.value = true); }
)

let emits = defineEmits(["close", "handleChangeDay", "handleChangeRotate"])

function handleClose() {
    isDrawer.value = false;
    emits("close", false);
}

function handleChangeDay() {
    emits("handleChangeDay", isDay.value);
}

function handleChangeRotate() {
    emits("handleChangeRotate", autoRotate.value);
}
</script>

<style lang="scss" scoped>
.drawer-div {
    .switch-div {
        border-radius: 20px;
        color: #000;
        font-size: 15px;
        font-weight: 900;
        background-color: rgba(255, 255, 255, 1);
        display: inline-block;
        padding: 10px 20px;

        div {
            margin: 5px 0px;
        }
    }
}
</style>