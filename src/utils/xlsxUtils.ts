import * as XLSX from "xlsx";
import { saveAs } from 'file-saver'

//入参示例
let eg = {
    fileName: "测试",//文件名
    tabHead: ["国家", "人口", "测试"],//表头列表
    keyList: ["name", "population", "test"],//表头对应的属性名,顺序必须与表头对应
    tabData: [
        { name: "中国", population: "11", test: "t1" },
        { name: "美国", population: "22", test: "t2" },
        { name: "日本", population: "35", test: "t3" }
    ]//对象数组
}

function workbook2blob(workbook: any) {
    // 生成excel的配置项
    let wopts: any = {
        // 要生成的文件类型
        bookType: "xlsx",
        // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
        bookSST: false,
        type: "binary"
    };
    var wbout = XLSX.write(workbook, wopts);
    // 将字符串转ArrayBuffer
    function s2ab(s: any) {
        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
        return buf;
    }
    let buf = s2ab(wbout);
    var blob = new Blob([buf], {
        type: "application/octet-stream"
    });
    return blob;
};

//导出数据表格
export default async function downloadXlsx(tabObj: any) {
    let aoaList: any = [];
    aoaList[0] = tabObj.tabHead; //赋值表头列表
    tabObj.tabData.forEach((tabItem: any, tabIndex: number) => {
        aoaList[tabIndex + 1] = [];//该二维度数组必须多加一个元素，因为表头占第一个元素
        tabObj.keyList.forEach((keyItem: any, keyIndex: number) => {
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
    //下载方式一：用XLSX的writeFile，写入文件，下载工作薄
    // await XLSX.writeFile(workBook, tabObj.fileName + ".xlsx"); 
    //下载方式二:利用file-saver的saveAs下载Blob
    saveAs(
        new Blob([workbook2blob(workBook)], { type: "application/octet-stream" }),
        tabObj.fileName + ".xlsx"
    );
};