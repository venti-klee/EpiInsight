<template>
  <div class="home">
    <Sphere />
  </div>
</template>

<script lang='ts' setup>
import { onMounted } from 'vue';
import Sphere from '@/components/Sphere.vue';
onMounted(() => { })
</script>

<style lang="scss" scoped>
.home {
  height: 100vh;
  width: 100vw;
  color: #fff;
  background-color: #000;
}
</style>