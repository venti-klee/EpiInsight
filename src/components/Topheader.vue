<template>
  <!-- 顶部标题 -->
  <div :color="dvColor" class="top-div">
    <!-- 系统名称区域 -->
    <div class="name-div" :style="{ backgroundColor: sysBackgroundColor }">
      <dv-decoration-3 class="name-dv" :color="dvColor" />
      <dv-decoration-11 class="sys-name" :color="dvColor">
        <img src="../assets/logo拆分3.png" alt="e_logo" style="height: 100%"/>
      </dv-decoration-11>
      <dv-decoration-3 :reverse="true" class="name-dv" :color="dvColor" />
    </div>

    <!-- 数据信息提示 -->
    <dv-decoration-7 class="sys-msg" :style="{ backgroundColor: sysBackgroundColor }" :color="dvColor">
      <span>
<!--        {{ dataType }}数据截止{{ allData.mtime }}-->
         <el-date-picker
             v-model="selectedDate"
             type="date"
             placeholder="选择日期"
             size="small"
             @change="handleDateChange"
         />
      </span>
    </dv-decoration-7>

    <!-- 装饰线条 -->
    <dv-decoration-5 :color="dvColor" style="margin: auto; width:60%; height:60px; margin-top: -30px;" />
  </div>
</template>

<script setup>
import { ref, defineProps } from 'vue';

// 接收父组件传入的配色和数据
defineProps({
  dvColor: {
    type: Array,
    required: true
  },
  sysBackgroundColor: {
    type: String,
    default: 'rgb(255, 255, 255, .1)'
  },
  allData: {
    type: Object,
    required: true
  },
  dataType: {
    type: String,
    default: '实时'
  }
});
// 定义事件发射器
const emit = defineEmits(['date-change']);

// 本地状态管理选中的日期
const selectedDate = ref('');

// 处理日期变化事件
const handleDateChange = (date) => {
  // 发射事件给父组件
  emit('date-change', date);
};
</script>

<style scoped lang="scss">
.top-div {
  pointer-events: none;
  width: 98%;
  margin: 0px 1%;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 5;
  color: #fff;

  .name-div {
    margin: 15px 0px 0px 0px;
    display: flex;
    justify-content: center;
    align-items: center;

    .name-dv {
      width: 30vw;
      height: 40px;
    }

    .sys-name {
      height: 60px;
      width: 350px;
      font-size: 25px;
      font-weight: 900;
      margin: 0px 10vw;

    }
  }

  .sys-msg {
    height: 100%;
    font-weight: 900;
    margin: 0px auto;

    span {
      margin: 0px 20px;
    }
  }
}
</style>