import docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'
import JSZipUtils from 'jszip-utils'

export function getWordBlob(tempDocxPath, wordData) {
    return new Promise((resolve, reject) => {
        JSZipUtils.getBinaryContent(tempDocxPath, (error, content) => {
            let zip = new PizZip(content);// 创建一个PizZip实例，内容为模板的内容
            // 创建并加载docxtemplater实例对象
            let doc = new docxtemplater();
            doc.loadZip(zip);//加载zip
            doc.setData(wordData);//设置数据
            doc.render();// 用模板变量的值替换所有模板变量
            // 生成一个代表docxtemplater对象的zip文件（不是一个真实的文件，而是在内存中的表示）
            let out = doc.getZip().generate({
                type: "blob",
                mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            });
            resolve(out);//成功后返回blob数据
        })
    })
}