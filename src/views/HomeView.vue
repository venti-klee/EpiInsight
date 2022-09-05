<template>
  <div class="home">
    <HelloWorld :msg="msg" />
  </div>
</template>

<script lang='ts' setup>
import { ref, computed, watch, onMounted } from 'vue';
import HelloWorld from '@/components/HelloWorld.vue';
import Sphere from '@/components/Sphere.vue';
onMounted(() => { })
let msg = ref("msg");
</script>

<style lang="scss" scoped>
.home {
  height: 100vh;
  width: 100vw;
  color: #fff;
  background-color: #000;
}
</style>