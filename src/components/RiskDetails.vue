<!--风险详情抽屉-->
<template>
    <div class="RiskDetails-div">
        <el-drawer v-model="isRiskDetails" :with-header="false" direction="rtl" :before-close="handleClose" size='40%'>
            <!--省名-->
            <div class="province-name">
                {{currentDetails.province}}({{currentDetails.province_total}}个)
            </div>
            <!--风险数量-->
            <div class="tit-num">
                <div class="h-ap">高风险地区{{currentDetails.province_high_num}}个</div>
                <div class="m-ap">中风险地区{{currentDetails.province_middle_num}}个</div>
            </div>
            <!-- <div class="h-tab"> -->
            <el-table class="city-tab" :data="currentDetails.list" :show-overflow-tooltip="true" style="width:100%;height:calc(100vh - 150px);
            --el-table-bg-color:rgba(0,0,0,.8);
            --el-table-tr-bg-color:transparent;
            --el-table-header-bg-color:#333;
            --el-table-header-text-color:#fff;
            --el-table-text-color:#fff;
            --el-table-row-hover-bg-color:#333;
            --el-table-border-color:#333;
            --el-text-color-regular:#fff">
                <el-table-column type="index" label="序号" />
                <el-table-column prop="city" label="省份" />
                <el-table-column type="expand">
                    <template #default="props">
                        <div class="places-div">
                            <div class="h-p">
                                <p>高风险地区</p>
                                <el-tooltip class="box-item" v-for="item in props.row.high_areas" :key="item"
                                    :content="item" placement="top-start">
                                    <el-tag class="tag-tex" effect="dark" round type="danger">
                                        {{item}}
                                    </el-tag>
                                </el-tooltip>

                            </div>
                            <div class="m-p">
                                <p>中风险地区</p>
                                <el-tooltip class="box-item" v-for="item in props.row.middle_areas" :key="item"
                                    :content="item" placement="top-start">
                                    <el-tag class="tag-tex" effect="dark" round type="warning">
                                        {{item}}
                                    </el-tag>
                                </el-tooltip>
                            </div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="high_num" label="高风险" sortable style="color:#f00" />
                <el-table-column prop="middle_num" label="中风险" sortable />
                <el-table-column prop="city_total" label="总数" sortable />
            </el-table>
            <!-- </div> -->
        </el-drawer>
    </div>
</template>

<script lang='ts' setup>
import { defineEmits, ref, computed, watch, onMounted } from 'vue';
let props = defineProps({
    isRiskDetails: {
        type: Boolean,
        default: false
    },
    currentDetails: {
        type: Object,
        default: {}
    }
}),
    isRiskDetails = ref(false),//抽屉状态
    emits = defineEmits(["close"]);

watch(
    () => props.isRiskDetails,//监听抽屉状态
    (val) => {
        if (val) {
            isRiskDetails.value = val;

        }
    }
)

//关闭抽屉
function handleClose() {
    isRiskDetails.value = false;
    emits("close");
}
</script>

<style lang="scss" scoped>
.RiskDetails-div {
    height: 100%;
    width: 100%;
    color: #fff;
    --el-bg-color: #545454;

    .province-name {
        text-align: center;
        font-size: 30px;
        font-weight: 900;
        margin: 0px 0px 20px 0px;
    }

    .tit-num {
        display: flex;
        justify-content: space-between;
        font-size: 20px;
        font-weight: 900;
        margin: 10px 0px;

        .h-ap {
            color: #f00;
        }

        .m-ap {
            color: #ffa200;
        }
    }

    .city-tab {
        width: 100%;

        .places-div {
            background-color: #333;
            width: 100%;
            display: flex;

            .h-p,
            .m-p {
                color: #f00;
                width: 50%;

                p {
                    text-align: center;
                    margin: 5px 0px;
                }

                .tag-tex {
                    margin: 2px;
                    width: 90%;
                    overflow: hidden;
                    // text-overflow: ellipsis !important;
                    // display: flex;
                    padding: 0px 10px;
                    justify-content: left !important;
                }
            }

            .m-p {
                color: #ffa200;
            }

        }
    }
}
</style>