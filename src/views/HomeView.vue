<template>
  <div class="home">
    <HelloWorld :msg="msg" />
  </div>
</template>

<script lang='ts' setup>
import { defineProps, defineEmits, ref, computed, watch, onMounted } from 'vue';
import HelloWorld from '@/components/HelloWorld.vue'; // @ is an alias to /src
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