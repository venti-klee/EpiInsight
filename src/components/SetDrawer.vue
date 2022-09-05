<!--设置抽屉-->
<template>
    <el-drawer v-model="isDrawer" :with-header="false" direction="ltr" :before-close="handleClose">
        <div class="drawer-div">
            vdfbvhfj
        </div>
    </el-drawer>
</template>

<script lang='ts' setup>
import { ref, computed, watch, onMounted } from 'vue';

let props: any = defineProps({
    isDrawer: Boolean,//抽屉状态
})

let isDrawer = ref(false);

//监听props值变化改变isDrawer
watch(
    () => props.isDrawer,
    (val) => { val && (isDrawer.value = true); }
)

let emits = defineEmits(["close"])

onMounted(() => { })
function handleClose() {
    isDrawer.value = false;
    emits("close", false);
}
</script>

<style lang="scss" scoped>
.drawer-div {}
</style>