<!--设置抽屉-->
<template>
    <el-drawer v-model="isDrawer" :with-header="false" direction="ltr" :before-close="handleClose">
        <div class="drawer-div">
            <h2>系统设置</h2>
            <el-form>
                <el-form-item label="昼夜切换：">
                    <el-switch v-model="isDay" @change="handleChangeDay"
                        style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff0000">
                    </el-switch>
                </el-form-item>
                <el-form-item label="自动旋转：">
                    <el-switch v-model="autoRotate" @change="handleChangeRotate"
                        style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff0000">
                    </el-switch>
                </el-form-item>
            </el-form>
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
    h2 {
        margin: 0px 0px 30px 0px;
    }

    padding: 5px 40px;
    color: #000;
    font-size: 15px;
    font-weight: 900;
}
</style>