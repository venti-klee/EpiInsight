<!--报告抽屉-->
<template>
    <div class="reportDrawer-div">
        <el-drawer v-model="isReport" :with-header="false" direction="rtl" :before-close="handleClose" size='870px'>
            <!--报告盒子-->
            <dv-border-box-8 :color="dvColor" class="docx-dv">
                <div id="docx-con">
                </div>
            </dv-border-box-8>
            <!--下载按钮-->
            <el-button class="btn" :color=dvColor[0] @click="downloadReport">
                <el-icon :size="20" style="margin-right:10px;">
                    <Download />
                </el-icon>
                下载报告
            </el-button>
        </el-drawer>
    </div>
</template>

<script lang='ts' setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { saveAs } from 'file-saver';
import { renderAsync } from "docx-preview";
let props = defineProps({
    isReport: Boolean,
    dvColor: {
        type: Array,
        default: []
    },
    reportData: {
        type: Object,
        default: {
            fileName: null,//文件名
            blobData: null//blob数据
        }
    },
}),
    isReport = ref(false),
    emits = defineEmits(["close"]);

watch(
    () => props.isReport,
    (val) => {
        if (val) {
            isReport.value = true;
            nextTick(() => {
                previewReport();//预览报告
            })
        } else {
            (document.getElementById("docx-con") as any).innerHTML = "";
        }
    },
)

onMounted(() => { });

//关闭抽屉
function handleClose() {
    isReport.value = false;
    emits("close");
};

//预览报告(传入blob与dom渲染出文件内容)
function previewReport() {
    renderAsync(
        props.reportData.blobData,
        document.getElementById("docx-con")!,
        null!,
        {
            className: "docx", // 默认和文档样式类的类名/前缀
            inWrapper: false, // 启用围绕文档内容渲染包装器
            ignoreWidth: false, //忽略宽度
            ignoreHeight: false, // 忽略高度
            // ignoreFonts: false, // 禁止字体渲染  
            // breakPages: true, // 在分页符上启用分页
        }
    );
}

//下载报告文件
function downloadReport() {
    if (confirm("确认生成并下载当地疫情报告？")) {
        let { blobData, fileName } = props.reportData;//获取blob与文件名
        saveAs(blobData, fileName);//通过返回的blob下载文件
    }
}
</script>

<style lang="scss" scoped>
::-webkit-scrollbar {
    /*滚动条整体*/
    width: 15px !important;
}

::-webkit-scrollbar-track {
    /*滑轨*/
    background-color: rgba(119, 56, 255, 0.2) !important;
}

::-webkit-scrollbar-thumb {
    /*滑块*/
    background-color: rgba(110, 34, 250, 0.5) !important;
}

.reportDrawer-div {
    --el-bg-color: rgba(0, 0, 0, 0.8);
    padding: 0px;
    text-align: center;
    user-select: none;

    .docx-dv {
        width: 100%;
        height: calc(100% - 70px);
        display: flex;

        #docx-con {
            width: calc(100% - 20px);
            height: calc(100% - 20px);
            overflow: auto;
            margin: 10px;
            background-color: #fff;
        }
    }

    .btn {
        margin-top: 20px;
        border-radius: 0px;
    }
}
</style>