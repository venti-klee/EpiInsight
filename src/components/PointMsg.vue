<!--球面点标签-->
<template>
  <div class="tag-div" v-show="props.currentPointData.name"
    :style="{ top: props.position.y, left: props.position.x,borderColor: props.dvColor[0] }">
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
  //标签位置
  dvColor: {
    default: []
  },
});

</script>
<style scoped lang='scss'>
.tag-div {
  padding: 5px 20px;
  background-color: rgba(0, 0, 0, .5);
  color: #fff;
  position: absolute;
  border: 2px solid #aaa;
  font-size: 15px;
  font-weight: 900;

  .name {
    font-size: 25px;
    color: #ff6a6a;
    margin: 0px 0px 10px 0px;
  }

  .die,
  .cure,
  .all {
    margin: 0px 0px 5px 0px;
    color: #ccc;

    span {
      color: #fff;
    }
  }
}
</style>