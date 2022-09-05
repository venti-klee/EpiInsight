const httpsAddress = "https://interface.sina.cn/news/wap/fymap2020_data.d.json";
let devProxy = {
  //获取疫情数据
  '/getCOVID19': {
    target: httpsAddress,
    ws: true,
    changeOrigin: true,
    pathRewrite: {
      '/getCOVID19': ''
    },
  },
};

const { defineConfig } = require('@vue/cli-service')
const BASE_URL = process.env.NODE_ENV === "production" ? "/covid19-visualization/" : "/";
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: BASE_URL,
  devServer: {
    port: 8080,//端口
    open: false,//项目启动后是否在浏览器自动打开
    proxy: devProxy//代理服务器
  }
})
