import * as XLSX from "xlsx";

//入参示例
let eg = {
    tabHead: ["国家", "人口", "测试"],//表头列表
    keyList: ["name", "population", "test"],//表头对应的属性名,顺序必须与表头对应
    tabData: [
        { name: "中国", population: "11", test: "t1" },
        { name: "美国", population: "22", test: "t2" },
        { name: "日本", population: "35", test: "t3" }
    ]//对象数组
}

//导出数据表格
export async function downloadXlsx(tabObj) {
    let aoaList = [];
    aoaList[0] = tabObj.tabHead; //赋值表头列表
    tabObj.tabData.forEach((tabItem, tabIndex) => {
        aoaList[tabIndex + 1] = [];//该二维度数组必须多加一个元素，因为表头占第一个元素
        tabObj.keyList.forEach((keyItem, keyIndex) => {
            let val = tabItem[keyItem];//获取表格属性的值
            ((typeof val == "undefined") || (val == "")) ?
                (aoaList[tabIndex + 1][keyIndex] = "-") ://数据未定义或者为空则用"-"代替
                (aoaList[tabIndex + 1][keyIndex] = val + "");//添加空字符串，防类型为非字符串
        })
    });
    let workSheet = null;
    workSheet = XLSX.utils.aoa_to_sheet(aoaList); //将列表数据添加到工作表
    let workBook = XLSX.utils.book_new(); //创建一个工作薄
    XLSX.utils.book_append_sheet(workBook, workSheet, "1"); //将工作表添加到工作薄中
    await XLSX.writeFile(workBook, "各国疫情数据.xlsx"); //写入文件，下载工作薄
};