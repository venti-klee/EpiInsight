import createServe from "./http"

//获取疫情数据
export function getCOVID19(params = {}) {
    return createServe({
        method: "GET",
        url: '/getCOVID19',
        params
    })
}