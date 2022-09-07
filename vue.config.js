const dataAddress1 = "https://news.sina.com.cn/project/fymap/ncp2020_full_data.json";
const dataAddress2 = "https://interface.sina.cn/news/wap/fymap2020_data.d.json";
let devProxy = {
  //获取疫情数据1
  '/dataSource1': {
    target: dataAddress1,
    ws: true,
    changeOrigin: true,
    pathRewrite: {
      '/dataSource1': ''
    },
  },
  //获取疫情数据2
  '/dataSource2': {
    target: dataAddress2,
    ws: true,
    changeOrigin: true,
    pathRewrite: {
      '/dataSource2': ''
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
