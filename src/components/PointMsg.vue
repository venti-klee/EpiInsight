<!--球面点标签-->
<template>
  <div class="tag-div" v-if="props.currentPointData.name" :style="{ top: props.position.y, left: props.position.x }">
    <div class="name">
      <span>{{ props.currentPointData.name }}</span>
    </div>
    <div class="all">
      累计数：<span>{{ props.currentPointData.value }}</span>
    </div>
    <div class="cure">
      治愈数：<span>{{ props.currentPointData.cureNum }}</span>
    </div>
    <div class="die">
      死亡数：<span>{{ props.currentPointData.deathNum }}</span>
    </div>

  </div>
</template>
<script lang='ts' setup>
import { ref, computed, watch, onMounted } from 'vue';
let props = defineProps({
  //当前点数据
  currentPointData: {
    type: Object,
    default: {},
  },
  //标签位置
  position: {
    type: Object,
    default: {},
  },
})

</script>
<style scoped lang='scss'>
.tag-div {
  padding: 10px 20px;
  background-color: rgba(0, 0, 0, .8);
  color: #fff;
  position: absolute;
  border-radius: 20px;

  div {
    margin: 5px 0px;
    font-size: 15px;
    font-weight: 900;

    span {
      color: #ff6a6a;
    }

  }

  .name {
    font-size: 20px;

    span {
      color: #fff;
    }

  }
}
</style>