//获取世界数据与使用者ip信息
export default function jsonp(url: string, callback: any, callBackName: any = "val") {
    let script = document.createElement('script');
    url += '?callback=' + callBackName;
    script.setAttribute('src', url);//添加script的src属性
    document.head.appendChild(script);
    window[callBackName] = callback;
};