<template>
    <span :data-time="time" class="number-grow" :data-value="value">{{addNum}}</span>
</template>

<script lang='ts' setup>
import { ref, computed, watch, onMounted } from 'vue';
let props = defineProps({
    //动画时间
    time: {
        type: Number,
        default: 2
    },
    //停止时的值
    value: {
        type: Number,
        default: 0
    },
    //千位的逗号
    thousandSign: {
        type: Boolean,
        default: () => false
    }
}),
    oldValue: any = ref(0),
    addNum: any = ref(0);//响应式的数值

watch(
    () => props.value,
    () => {
        startAnimation();//值改变时开始动画
    })

function startAnimation() {
    let value: number = props.value - oldValue.value;
    let step = (value * 10) / (props.time * 100);
    let current = 0;
    let start = oldValue.value;
    //定时器
    let t: any = setInterval(() => {
        start += step;
        if (start > value) {
            clearInterval(t);
            start = value;
            t = null;
        }
        if (current === start) {
            return;
        }
        current = Math.floor(start);//取整
        oldValue.value = current;
        if (props.thousandSign) {
            addNum.value = current.toString().replace(/(\d)(?=(?:\d{3}[+]?)+$)/g, '$1,');//添加千位符
        } else {
            addNum.value = current.toString();//无千位符
        }
    }, 10)
}

onMounted(() => {
    startAnimation();
})
</script>