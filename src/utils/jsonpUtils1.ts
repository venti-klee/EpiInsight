//获取当前省的数据
export default function jsonp(url: any, callback: any, callBackName: any = "val1", sendData: string) {
    let script = document.createElement('script');
    url += '?callback=' + callBackName + "&" + sendData;
    script.setAttribute('src', url);//添加script的src属性
    document.head.appendChild(script);
    window[callBackName] = callback;
};