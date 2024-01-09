<template>
  <div>
    <el-card shadow="never" class="mb-5">
      <div class="flex items-center">
        <el-text>分类名称</el-text>
        <!-- m代表margin w代表宽度-->
        <div class="ml-3 w-52 mr-5">
          <el-input v-model="searchCategoryName" placeholder="请输入名称模糊查询" />
        </div>

        <el-text>创建日期</el-text>
        <div class="ml-3 w-30 mr-5">
          <el-date-picker style="top: 3px" v-model="pickDate" type="daterange" range-separator="至"
            start-placeholder="开始时间" end-placeholder="结束时间" :shortcuts="shortcuts" size="default"
            @change="datepickerChange" />
        </div>

        <el-button type="primary" class="ml-3" :icon="Search" @click="getTableData">
          查询
        </el-button>
        <el-button type="primary" class="ml-3" :icon="Search" @click="reset">
          重置
        </el-button>
      </div>
    </el-card>

    <el-card shadow="never">
      <!-- 新增按钮 -->
      <div class="mb-5">
        <el-button type="primary" @click="addCategoryBtnClick">
          <el-icon class="mr-1">
            <Plus />
          </el-icon>
          新增
        </el-button>
      </div>

      <!-- 分页列表 -->
      <el-table :data="tableData" border stripe style="width: 100%" v-loading="tableLoading">
        <el-table-column prop="name" label="分类名称" width="180" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作">
          <template #default="scope">
            <el-button type="danger" size="small" @click="deleteCategorySubmit(scope.row)">
              <el-icon class="mr-1">
                <Delete />
              </el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分页 -->
    <div class="mt-10 flex justify-center">
      <el-pagination v-model:current-page="current" v-model:page-size="size" :page-sizes="[10, 20, 50]" :small="false"
        :background="true" layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
        @current-change="getTableData" />
    </div>

    <!--添加新分类-->
    <!--它允许您在Vue实例中访问具有ref属性的DOM元素或组件实例，可以在验证的时候调用-->
    <FormDialog ref="formDialogRef" title="添加文章分类" destroyOnClose @submit="onSubmit">
      <el-form ref="formRef" :rules="rules" :model="form">
        <el-form-item label="分类名称" prop="name" label-width="80px" size="large">
          <el-input v-model="form.name" placeholder="请输入分类名称" maxlength="20" show-word-limit clearable />
        </el-form-item>
      </el-form>
    </FormDialog>
  </div>
</template>

<script setup>
import FormDialog from "@/components/FormDialog.vue";
import { Search } from "@element-plus/icons-vue";
import { reactive, ref } from "vue";
import moment from "moment";
import {
  addCategory,
  deleteCategory,
  getCategoryPageList,
} from "@/api/admin/category";
import { showMessage, showModel } from "@/composables/util.js";

const searchCategoryName = ref(""); //模糊查询的分类名称
const pickDate = ref(""); //
const current = ref(1); // 当前页码，给了一个默认值 1
const total = ref(0); // 总数据量，给了个默认值 0
const size = ref(10); // 每页显示的数据量，给了个默认值 10
const startTime = reactive({}); //模糊查询的开始时间
const endTime = reactive({}); //模糊查询的结束时间
const tableData = ref([]); //category表格数据
const tableLoading = ref(false); //表格加载状态

const formRef = ref(null); // 表单引用
const form = reactive({
  name: "",
});
const rules = {
  name: [
    {
      required: true,
      message: "分类名称不能为空",
      trigger: "blur",
    },
    {
      min: 1,
      max: 20,
      message: "分类名称字数要求大于 1 个字符，小于 20 个字符",
      trigger: "blur",
    },
  ],
};
const formDialogRef = ref(null);

const shortcuts = [
  {
    text: "最近一周",
    onClick(picker) {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      picker.$emit("pick", [start, end]);
    },
  },
  {
    text: "最近一个月",
    onClick(picker) {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      picker.$emit("pick", [start, end]);
    },
  },
  {
    text: "最近三个月",
    onClick(picker) {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
      picker.$emit("pick", [start, end]);
    },
  },
];

const datepickerChange = (val) => {
  startTime.value = moment(val[0]).format("YYYY-MM-DD");
  endTime.value = moment(val[1]).format("YYYY-MM-DD");
};

function getTableData() {
  tableLoading.value = true;

  getCategoryPageList({
    current: current.value,
    size: size.value,
    startTime: startTime.value,
    endTime: endTime.value,
    name: searchCategoryName.value,
  })
    .then((res) => {
      if (res.success === true) {
        tableData.value = res.data;
        current.value = res.current;
        size.value = res.size;
        total.value = res.total;
      }
    })
    .finally(() => {
      tableLoading.value = false;
    });
}

getTableData();

//更改每展示的数据量
const handleSizeChange = (chooseSize) => {
  size.value = chooseSize;
  getTableData();
};

const reset = () => {
  searchCategoryName.value = "";
  pickDate.value = "";
  startTime.value = null;
  endTime.value = null;
};

const onSubmit = () => {
  // 先验证 form 表单字段
  formRef.value.validate((valid) => {
    if (!valid) {
      console.log("表单验证不通过");
      return false;
    }
    formDialogRef.value.showBtnLoading();
    addCategory(form)
      .then((res) => {
        if (res.success === true) {
          showMessage("添加成功");
          form.name = "";
          formDialogRef.value.close();
          getTableData();
        } else {
          showMessage(res.message, "error");
        }
      })
      .finally(() => {
        formDialogRef.value.closeBtnLoading();
      });
  });
};

const deleteCategorySubmit = (data) => {
  showModel("是否确定要删除该分类？")
    .then(() => {
      deleteCategory(data.id).then((res) => {
        if (res.success === true) {
          showMessage("删除成功");
          getTableData();
        } else {
          let message = res.message;
          showMessage(message, "error");
        }
      });
    })
    .catch(() => { });
};
const addCategoryBtnClick = () => {
  formDialogRef.value.open();
};
</script>
