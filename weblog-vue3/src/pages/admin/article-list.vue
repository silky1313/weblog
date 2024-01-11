<template>
  <div>
    <!-- 表头分页查询条件， shadow="never" 指定 card 卡片组件没有阴影 -->
    <el-card shadow="never" class="mb-5">
      <!-- flex 布局，内容垂直居中 -->
      <div class="flex items-center">
        <el-text>文章标题</el-text>
        <div class="ml-3 w-52 mr-5">
          <el-input v-model="searchArticleTitle" placeholder="请输入（模糊查询）" />
        </div>

        <el-text>创建日期</el-text>
        <div class="ml-3 w-30 mr-5">
          <!-- 日期选择组件（区间选择） -->
          <el-date-picker v-model="pickDate" type="daterange" range-separator="至" start-placeholder="开始时间"
            end-placeholder="结束时间" size="default" :shortcuts="shortcuts" @change="datepickerChange" />
        </div>

        <el-button type="primary" class="ml-3" :icon="Search" @click="getTableData">查询</el-button>
        <el-button class="ml-3" :icon="RefreshRight" @click="reset">重置</el-button>
      </div>
    </el-card>

    <el-card shadow="never">
      <!-- 写文章按钮 -->
      <div class="mb-5">
        <el-button type="primary" @click="isArticlePublishEditorShow = true">
          <el-icon class="mr-1">
            <EditPen />
          </el-icon>
          写文章</el-button>
      </div>

      <!-- 分页列表 -->
      <el-table :data="tableData" border stripe style="width: 100%" v-loading="tableLoading">
        <el-table-column prop="title" label="标题" width="380" />
        <el-table-column prop="cover" label="封面" width="180">
          <template #default="scope">
            <el-image style="width: 100px;" :src="scope.row.cover" />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="发布时间" width="180" />
        <el-table-column label="操作">
          <template #default="scope">
            <el-button size="small" @click="showArticleUpdateEditor(scope.row)">
              <el-icon class="mr-1">
                <Edit />
              </el-icon>
              编辑</el-button>
            <el-button type="danger" size="small" @click="deleteArticleSubmit(scope.row)">
              <el-icon class="mr-1">
                <Delete />
              </el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="mt-10 flex justify-center">
        <el-pagination v-model:current-page="current" v-model:page-size="size" :page-sizes="[10, 20, 50]" :small="false"
          :background="true" layout="total, sizes, prev, pager, next, jumper" :total="total"
          @size-change="handleSizeChange" @current-change="getTableData" />
      </div>
    </el-card>

    <!-- 写博客的对话框 -->
    <el-dialog v-model="isArticlePublishEditorShow" :fullscreen="true" :show-close="false">
      <template #header="{ close, titleId, titleClass }">
        <!-- 固钉组件，固钉到顶部 -->
        <el-affix :offset="20" style="width: 100%">
          <!-- 指定 flex 布局， 高度为 10， 背景色为白色 -->
          <div class="flex h-10 bg-white">
            <!-- 字体加粗 -->
            <h4 class="font-bold">写文章</h4>
            <!-- 靠右对齐 -->
            <div class="ml-auto flex">
              <el-button @click="isArticlePublishEditorShow = false">取消</el-button>
              <el-button type="primary" @click="publishArticleSubmit">
                <el-icon class="mr-1">
                  <Promotion />
                </el-icon>
                发布
              </el-button>
            </div>
          </div>
        </el-affix>
      </template>

      <!-- 表单 -->
      <!-- label-position="top" 用于指定 label 元素在上面 -->
      <el-form :model="form" ref="publishArticleFormRef" label-position="top" size="large" :rules="rules">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" autocomplete="off" size="large" maxlength="40" show-word-limit clearable />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <MdEditor v-model="form.content" @onUploadImg="onUploadImg" editorId="publishArticleEditor" />
        </el-form-item>
        <el-form-item label="封面" prop="cover">
          <el-upload class="avatar-uploader" :on-change="handleCoverChange" action="#" :auto-upload="false"
            :show-file-list="false">
            <img v-if="form.cover" :src="form.cover" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon">
              <Plus />
            </el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="摘要" prop="summary">
          <!-- :rows="3" 指定 textarea 默认显示 3 行 -->
          <el-input v-model="form.summary" :rows="3" type="textarea" placeholder="请输入文章摘要" />
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <el-select v-model="form.categoryId" clearable placeholder="---请选择---" size="large">
            <el-option v-for="item in categories" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="标签" prop="tags">
          <span class="w-60">
            <!-- 标签选择 -->
            <el-select v-model="form.tags" multiple filterable remote reserve-keyword placeholder="---请输入---"
              remote-show-suffix :remote-method="remoteMethod" allow-create default-first-option
              :loading="tagSelectLoading" size="large">
              <el-option v-for="item in tags" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </span>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 编辑博客的对话框 -->
    <el-dialog v-model="isArticleUpdateEditorShow" :fullscreen="true" :show-close="false" :close-on-press-escape="false">
      <template #header="{ close, titleId, titleClass }">
        <!-- 固钉组件，固钉到顶部 -->
        <el-affix :offset="20" style="width: 100%;">
          <!-- 指定 flex 布局， 高度为 10， 背景色为白色 -->
          <div class="flex h-10 bg-white">
            <!-- 字体加粗 -->
            <h4 class="font-bold">编辑文章</h4>
            <!-- 靠右对齐 -->
            <div class="ml-auto flex">
              <el-button @click="isArticleUpdateEditorShow = false">取消</el-button>
              <el-button type="primary" @click="updateSubmit">
                <el-icon class="mr-1">
                  <Promotion />
                </el-icon>
                保存
              </el-button>
            </div>
          </div>
        </el-affix>
      </template>
      <!-- label-position="top" 用于指定 label 元素在上面 -->
      <el-form :model="updateArticleForm" ref="updateArticleFormRef" label-position="top" size="large" :rules="rules">
        <el-form-item label="标题" prop="title">
          <el-input v-model="updateArticleForm.title" autocomplete="off" size="large" maxlength="40" show-word-limit
            clearable />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <!-- Markdown 编辑器 -->
          <MdEditor v-model="updateArticleForm.content" @onUploadImg="onUploadImg" editorId="updateArticleEditor" />
        </el-form-item>
        <el-form-item label="封面" prop="cover">
          <el-upload class="avatar-uploader" action="#" :on-change="handleUpdateCoverChange" :auto-upload="false"
            :show-file-list="false">
            <img v-if="updateArticleForm.cover" :src="updateArticleForm.cover" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon">
              <Plus />
            </el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="摘要" prop="summary">
          <!-- :rows="3" 指定 textarea 默认显示 3 行 -->
          <el-input v-model="updateArticleForm.summary" :rows="3" type="textarea" placeholder="请输入文章摘要" />
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <el-select v-model="updateArticleForm.categoryId" clearable placeholder="---请选择---" size="large">
            <el-option v-for="item in categories" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签" prop="tags">
          <span class="w-60">
            <!-- 标签选择 -->
            <el-select v-model="updateArticleForm.tags" multiple filterable remote reserve-keyword placeholder="请输入文章标签"
              remote-show-suffix allow-create default-first-option :remote-method="remoteMethod"
              :loading="tagSelectLoading" size="large">
              <el-option v-for="item in tags" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </span>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { Search, RefreshRight } from "@element-plus/icons-vue";
import moment from "moment";
import { getArticlePageList, deleteArticle, publishArticle, getArticleDetail, updateArticle } from '@/api/admin/article'
import { searchTags, getTagSelectList } from '@/api/admin/tag'
import { getCategorySelectList } from '@/api/admin/category'
import { uploadFile } from '@/api/admin/file'
import { showMessage, showModel } from "@/composables/util";
import { get } from "@vueuse/core";
/*markdown编辑器 */
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'



const isArticlePublishEditorShow = ref(false); // 是否显示文章发布对话框
const searchArticleTitle = ref(""); // 模糊搜索的文章标题
const pickDate = ref(""); // 日期
// 查询条件：开始结束时间
const startDate = reactive({});
const endDate = reactive({});

// 监听日期组件改变事件，并将开始结束时间设置到变量中
const datepickerChange = (e) => {
  startDate.value = moment(e[0]).format("YYYY-MM-DD");
  endDate.value = moment(e[1]).format("YYYY-MM-DD");
};

const shortcuts = [
  {
    text: "最近一周",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    },
  },
  {
    text: "最近一个月",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return [start, end];
    },
  },
  {
    text: "最近三个月",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
      return [start, end];
    },
  },
];

// 重置
const reset = () => {
  pickDate.value = "";
  startDate.value = null;
  endDate.value = null;
  searchArticleTitle.value = "";
};

// 表格加载 Loading
const tableLoading = ref(false);
// 表格数据
const tableData = ref([]);
// 当前页码，给了一个默认值 1
const current = ref(1);
// 总数据量，给了个默认值 0
const total = ref(0);
// 每页显示的数据量，给了个默认值 10
const size = ref(10);

// 获取分页数据
function getTableData() {
  tableLoading.value = true;
  getArticlePageList({
    current: current.value,
    size: size.value,
    title: searchArticleTitle.value,
    startDate: startDate.value,
    endDate: endDate.value,
  })
    .then((res) => {
      if (res.success == true) {
        tableData.value = res.data;
        total.value = res.total;
        size.value = res.size;
        current.value = res.current;
      }
    })
    .finally(() => {
      tableLoading.value = false;
    });
}
getTableData();

// 每页展示数量变更事件
const handleSizeChange = (chooseSize) => {
  size.value = chooseSize;
  getTableData();
};

// 删除文章
const deleteArticleSubmit = (row) => {
  showModel("确定删除该文章吗？").then(() => {
    deleteArticle(row.id).then((res) => {
      if (res.success == false) {
        let message = res.message;
        showMessage(message, "error");
        return;
      }
      showMessage("删除成功");
      getTableData();
    });
  });
};

///////////////////////////////////////////////////////
// 发表文章相关
const form = reactive({
  id: null,
  title: "",
  content: "请输入内容",
  cover: "",
  categoryId: null,
  tags: [],
  summary: "",
});
// 发布文章表单引用
const publishArticleFormRef = ref(null);
// 表单校验规则
const rules = {
  title: [
    { required: true, message: "请输入文章标题", trigger: "blur" },
    {
      min: 1,
      max: 40,
      message: "文章标题要求大于1个字符，小于40个字符",
      trigger: "blur",
    },
  ],
  content: [{ required: true }],
  cover: [{ required: true }],
  categoryId: [{ required: true, message: "请选择文章分类", trigger: "blur" }],
  tags: [{ required: true, message: "请选择文章标签", trigger: "blur" }],
};
//图片上传
const handleCoverChange = (file) => {
  // 1.先创建新的表单对象
  let formData = new FormData();
  formData.append("file", file.raw);

  // 2.调用接口上传
  uploadFile(formData).then((res) => {
    if (res.success == false) {
      showMessage(res.message, "error");
      return;
    }

    form.cover = res.data.url;
    showMessage("上传成功");
  })
}
//处理markdown的图片上传
const onUploadImg = async (files, callback) => {
  const res = await Promise.all(
    files.map((file) => {
      return new Promise((rev, rej) => {
        console.log('==> 编辑器开始上传文件...')
        let formData = new FormData()
        formData.append("file", file);
        uploadFile(formData).then((res) => {
          console.log(res)
          console.log('访问路径：' + res.data.url)
          // 调用 callback 函数，回显上传图片
          callback([res.data.url]);
        })
      });
    })
  );
}
//处理category下拉列表
const categories = ref([])
getCategorySelectList().then((e) => {
  categories.value = e.data
})
//处理tag的下列列表
const tagSelectLoading = ref(false)
const tags = ref([])// 文章标签
const remoteMethod = (query) => {
  if (query) {
    tagSelectLoading.value = true;
    searchTags(query).then((res) => {
      if (res.success == true) {
        tags.value = res.data;
      }
    }).finally(() => {
      tagSelectLoading.value = false;
    })
    console.log(tags.value);
  }
}
//发布文章
const publishArticleSubmit = () => {
  publishArticleFormRef.value.validate((valid) => {
    // 1.先判断是否验证成功
    if (valid == false) {
      return false;
    }

    // 2.调用接口实现publish操作
    publishArticle(form).then((res) => {
      if (res.success == false) {
        showMessage(res.message, "error");
        return;
      }

      showMessage("发布成功");

      isArticlePublishEditorShow.value = false;
      form.title = ''
      form.content = ''
      form.cover = ''
      form.summary = ''
      form.categoryId = null
      form.tags = []
      getTableData();
    })
  });
}
///////////////////////////////////////////////////////
//编辑文章相关
// 是否显示编辑文章对话框
const isArticleUpdateEditorShow = ref(false)
// 编辑文章表单引用
const updateArticleFormRef = ref(null)
// 修改文章表单对象
const updateArticleForm = reactive({
  id: null,
  title: '',
  content: '请输入内容',
  cover: '',
  categoryId: null,
  tags: [],
  summary: ""
})
// 编辑文章：上传文章封面图片
const handleUpdateCoverChange = (file) => {
  // 表单对象
  let formData = new FormData()
  // 添加 file 字段，并将文件传入 
  formData.append('file', file.raw)
  uploadFile(formData).then((e) => {
    // 响参失败，提示错误消息
    if (e.success == false) {
      let message = e.message
      showMessage(message, 'error')
      return
    }
    // 成功则设置表单对象中的封面链接，并提示上传成功
    updateArticleForm.cover = e.data.url
    showMessage('上传成功')
  })
}
// 编辑文章按钮点击事件
const showArticleUpdateEditor = (row) => {
  // 显示编辑文章对话框
  isArticleUpdateEditorShow.value = true
  // 拿到文章 ID
  let articleId = row.id
  getArticleDetail(articleId).then((res) => {
    if (res.success) {
      // 设置表单数据
      updateArticleForm.id = res.data.id
      updateArticleForm.title = res.data.title
      updateArticleForm.cover = res.data.cover
      updateArticleForm.content = res.data.content
      updateArticleForm.categoryId = res.data.categoryId
      updateArticleForm.tags = res.data.tagIds
      updateArticleForm.summary = res.data.summary
    }
  })
}
// 渲染标签数据
getTagSelectList().then(res => {
  tags.value = res.data
})
// 保存文章
const updateSubmit = () => {
  updateArticleFormRef.value.validate((valid) => {
    if (!valid) {
      return false
    }

    // 请求更新文章接口
    updateArticle(updateArticleForm).then((res) => {
      if (res.success == false) {
        showMessage(res.message, 'error')
        return
      }
      showMessage('保存成功')
      isArticleUpdateEditorShow.value = false
      getTableData()
    })
  })
}
</script>


<style scoped>
/* 封面图片样式 */
.avatar-uploader .avatar {
  width: 200px;
  height: 100px;
  display: block;
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 200px;
  height: 100px;
  text-align: center;
}

.el-select--large {
  width: 600px;
}
</style>

<style>
.md-editor-footer {
  height: 40px;
}
</style>