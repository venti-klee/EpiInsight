/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
declare module 'three'//防止import导入报错
declare module 'three/examples/jsm/controls/OrbitControls'
declare module 'echarts'
declare module "*.png"
declare module "*.jpg"
declare module "*.js"
declare module "*.json"
