<template>
  <div class='container'>
    <el-button type="primary" round>Primary</el-button>
    <el-icon size="20" color="#ff0000">
      <Edit />
    </el-icon>
    <el-switch v-model="value2" class="ml-2" style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949" />
    {{ props.msg }}
  </div>
</template>

<script lang='ts' setup>
import { ref, computed, watch, onMounted } from 'vue';
import { jsonp } from 'vue-jsonp'
import { getCOVID19 } from "@/api/request"
onMounted(() => {
  getData();
})
let value2 = ref(false)
let props = defineProps({
  msg: String
})

function getData1() {
  jsonp("https://interface.sina.cn/news/wap/fymap2020_data.d.json").then(res => {
    console.log(res.data)
  })
    .catch(err => {
      console.log(err)
    })
}

function getData() {
  getCOVID19().then(res => {
    console.log(res)
  })
}
</script>

<style lang="scss" scoped>
.container {
  height: 100%;
  width: 100%;
}
</style>