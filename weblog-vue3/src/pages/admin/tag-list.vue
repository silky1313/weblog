<template>
  <div>
    <el-card shadow="never" class="mb-5">
      <div class="flex items-center">
        <el-text>标签名称</el-text>
        <!-- m代表margin w代表宽度-->
        <div class="ml-3 w-52 mr-5">
          <el-input v-model="searchTagName" placeholder="请输入名称模糊查询" />
        </div>

        <el-text>创建日期</el-text>
        <div class="ml-3 w-30 mr-5">
          <el-date-picker
            style="top: 3px"
            v-model="pickDate"
            type="daterange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            :shortcuts="shortcuts"
            size="default"
            @change="datepickerChange"
          />
        </div>

        <el-button
          type="primary"
          class="ml-3"
          :icon="Search"
          @click="getTableData"
        >
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
      <el-table
        :data="tableData"
        border
        stripe
        style="width: 100%"
        v-loading="tableLoading"
      >
        <el-table-column prop="name" label="标签名称" width="180">
          <template #default="scope">
            <el-tag class="ml-2" type="success">{{ scope.row.name }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作">
          <template #default="scope">
            <el-button
              type="danger"
              size="small"
              @click="deleteTagSubmit(scope.row)"
            >
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
      <el-pagination
        v-model:current-page="current"
        v-model:page-size="size"
        :page-sizes="[10, 20, 50]"
        :small="false"
        :background="true"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="getTableData"
      />
    </div>

    <!--添加新分类-->
    <!--它允许您在Vue实例中访问具有ref属性的DOM元素或组件实例，可以在验证的时候调用-->
    <FormDialog
      ref="formDialogRef"
      title="添加文章标签"
      destroyOnClose
      @submit="onSubmit"
    >
      <el-form ref="formRef" :model="form">
        <el-form-item prop="name">
          <el-tag
            v-for="tag in dynamicTags"
            :key="tag"
            class="mx-1"
            closable
            :disable-transitions="false"
            @close="handleClose(tag)"
          >
            {{ tag }}
          </el-tag>
          <span class="w-20">
            <el-input
              v-if="inputVisible"
              ref="InputRef"
              v-model="inputValue"
              class="ml-1 w-20"
              size="small"
              @keyup.enter="handleInputConfirm"
              @blur="handleInputConfirm"
            />
            <el-button
              v-else
              class="button-new-tag ml-1"
              size="small"
              @click="showInput"
            >
              + 新标签
            </el-button>
          </span>
        </el-form-item>
      </el-form>
    </FormDialog>
  </div>
</template>

<script setup>
import FormDialog from "@/components/FormDialog.vue";
import { Search } from "@element-plus/icons-vue";
import { reactive, ref, nextTick } from "vue";
import moment from "moment";
import { addTag, deleteTag, getTagPageList } from "@/api/admin/tag";
import { showMessage, showModel } from "@/composables/util.js";

const searchTagName = ref(""); //模糊查询的标签名称
const startTime = reactive({}); //模糊查询的开始时间
const endTime = reactive({}); //模糊查询的结束时间
const pickDate = ref(""); //
const current = ref(1); // 当前页码，给了一个默认值 1
const total = ref(0); // 总数据量，给了个默认值 0
const size = ref(10); // 每页显示的数据量，给了个默认值 10
const tableData = ref([]); //category表格数据
const tableLoading = ref(false); //表格加载状态

const formRef = ref(null); // 表单引用
const form = reactive({
  tags: [],
});
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

const inputValue = ref(""); //新增标签的输入框的值
const dynamicTags = ref([]); //对话框的新增标签数组
const inputVisible = ref(false); //新增标签的输入框是否显示
const InputRef = ref(""); //标签输入框的引用，用来操作dom，验证表单之类的。

const handleClose = (tag) => {
  dynamicTags.value.splice(dynamicTags.value.indexOf(tag), 1);
};

const showInput = () => {
  inputVisible.value = true;
  nextTick(() => {
    InputRef.value.input.focus();
  });
};

const handleInputConfirm = () => {
  if (inputValue.value) {
    dynamicTags.value.push(inputValue.value);
  }
  inputVisible.value = false;
  inputValue.value = "";
};

const datepickerChange = (val) => {
  startTime.value = moment(val[0]).format("YYYY-MM-DD");
  endTime.value = moment(val[1]).format("YYYY-MM-DD");
};

function getTableData() {
  tableLoading.value = true;

  getTagPageList({
    current: current.value,
    size: size.value,
    startTime: startTime.value,
    endTime: endTime.value,
    name: searchTagName.value,
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
  searchTagName.value = "";
  pickDate.value = "";
  startTime.value = null;
  endTime.value = null;
};

const onSubmit = () => {
  // 先验证 form 表单字段
  formRef.value.validate((valid) => {
    formDialogRef.value.showBtnLoading();
    form.tags = dynamicTags;
    addTag(form)
      .then((res) => {
        if (res.success === true) {
          showMessage("添加成功");
          form.tags = [];
          dynamicTags.value = [];
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

const deleteTagSubmit = (data) => {
  showModel("是否确定要删除该标签？")
    .then(() => {
      deleteTag(data.id).then((res) => {
        if (res.success === true) {
          showMessage("删除成功");
          getTableData();
        } else {
          let message = res.message;
          showMessage(message, "error");
        }
      });
    })
    .catch(() => {});
};
const addCategoryBtnClick = () => {
  formDialogRef.value.open();
};
</script>
