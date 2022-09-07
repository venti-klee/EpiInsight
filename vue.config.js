let devProxy = {
  //获取疫情数据1
  '/dataSource1': {
    target: process.env.VUE_APP_1,
    ws: true,
    changeOrigin: true,
    pathRewrite: {
      '/dataSource1': ''
    },
  },
  //获取疫情数据2
  '/dataSource2': {
    target: process.env.VUE_APP_2,
    ws: true,
    changeOrigin: true,
    pathRewrite: {
      '/dataSource2': ''
    },
  },
};
const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: process.env.NODE_ENV === "production" ? "/covid19-visualization/" : "/",
  devServer: {
    port: 8080,//端口
    open: false,//项目启动后是否在浏览器自动打开
    proxy: devProxy//代理服务器
  },
})
