//获取ip信息(参数：地址、返回后执行的函数、回调名)
export default function jsonp(url: string, callback: any, callBackName: any = "val") {
    let script = document.createElement('script');
    url += '?callback=' + callBackName;
    script.setAttribute('src', url);
    document.head.appendChild(script);
    window[callBackName] = callback;
};