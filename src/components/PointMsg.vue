<!--球面点标签-->
<template>
  <div class="tag-div" v-if="props.currentPointData.name" :style="{ top: props.position.y, left: props.position.x }">
    <div>
      国家：<span>{{ props.currentPointData.name }}</span>
    </div>
    <div>
      累计数：<span>{{ props.currentPointData.value }}</span>
    </div>
    <div>
      死亡数：<span>{{ props.currentPointData.deathNum }}</span>
    </div>
    <div>
      治愈数：<span>{{ props.currentPointData.cureNum }}</span>
    </div>
  </div>
</template>
<script lang='ts' setup>
import { ref, computed, watch, onMounted } from 'vue';
let props: any = defineProps({
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
  background-color: rgba(255, 255, 255, 1);
  color: #000;
  position: absolute;
  border-radius: 20px;

  div {
    font-size: 15px;
    font-weight: 900;

    span {
      color: #f00;
      font-size: 10px;
      //   font-weight: 500;
    }
  }
}
</style>