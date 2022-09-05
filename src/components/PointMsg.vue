<template>
  <div
    class="tag-div"
    v-if="currentPointData.name"
    :style="{ top: position.y, left: position.x }"
  >
    <div>
      国家：<span>{{ currentPointData.name }}</span>
    </div>
    <div>
      累计数：<span>{{ currentPointData.value }}</span>
    </div>
    <div>
      死亡数：<span>{{ currentPointData.deathNum }}</span>
    </div>
    <div>
      治愈数：<span>{{ currentPointData.cureNum }}</span>
    </div>
  </div>
</template>
<script>
export default {
  name: "",
  components: {},
  props: {
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
  },
  data() {
    return {};
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  methods: {},
};
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