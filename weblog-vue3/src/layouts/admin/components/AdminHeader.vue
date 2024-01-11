<template>
  <el-affix :offset="0">
    <div
      class="bg-white h-[64px] flex pr-4 border-b border-slate-100 transition-all duration-300 shadow"
    >
      <!-- 左边栏收缩、展开 -->
      <div
        class="w-[42px] h-[64px] cursor-pointer flex items-center justify-center text-gray-700 hover:bg-gray-200"
        @click="handleMenuWidth"
      >
        <el-icon>
          <el-icon>
            <Fold v-if="menuStore.menuWidth == '250px'" />
            <Expand v-else />
          </el-icon>
        </el-icon>
      </div>

      <div class="ml-auto flex">
        <!-- 点击刷新页面 -->
        <el-tooltip
          class="box-item"
          effect="dark"
          content="刷新"
          placement="bottom"
        >
          <div
            class="w-[42px] h-[64px] cursor-pointer flex items-center justify-center text-gray-700 hover:bg-gray-200"
            @click="handleRefresh"
          >
            <el-icon>
              <Refresh />
            </el-icon>
          </div>
        </el-tooltip>

        <!-- - 点击全屏展示 -->
        <el-tooltip
          class="box-item"
          effect="dark"
          content="全屏"
          placement="bottom"
        >
          <div
            class="w-[42px] h-[64px] cursor-pointer flex items-center justify-center text-gray-700 mr-2 hover:bg-gray-200"
            @click="toggle"
          >
            <el-icon>
              <FullScreen v-if="!isFullscreen" />
              <Aim v-else />
            </el-icon>
          </div>
        </el-tooltip>

        <!-- 登录用户头像 -->
        <el-dropdown
          class="flex items-center justify-center"
          @command="handleCommand"
        >
          <span
            class="el-dropdown-link flex items-center justify-center text-gray-700 text-xs"
          >
            <!-- 头像 Avatar -->
            <el-avatar
              class="mr-2"
              :size="25"
              src="https://img.quanxiaoha.com/quanxiaoha/f97361c0429d4bb1bc276ab835843065.jpg"
            />
            {{ userStore.userInfo.username }}
            <el-icon class="el-icon--right">
              <arrow-down />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="updatePassword"
                >修改密码</el-dropdown-item
              >
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <!-- 修改密码 -->
      <FormDialog
        ref="formDialogRef"
        title="修改密码"
        destroyOnClose
        confirmText="确认修改"
        @submit="onSubmit"
      >
        <el-form ref="formRef" :rules="rules" :model="form">
          <el-form-item label="用户名" prop="username" label-width="120px">
            <!-- 输入框组件 -->
            <el-input
              size="large"
              v-model="form.username"
              placeholder="请输入用户名"
              clearable
              disabled
            />
          </el-form-item>
          <el-form-item label="密码" prop="password" label-width="120px">
            <el-input
              size="large"
              type="password"
              v-model="form.password"
              placeholder="请输入密码"
              clearable
              show-password
            />
          </el-form-item>
          <!-- prop属性用于表明这个表单项用于 验证哪个属性-->
          <el-form-item label="确认密码" prop="rePassword" label-width="120px">
            <el-input
              size="large"
              type="password"
              v-model="form.rePassword"
              placeholder="请确认密码"
              clearable
              show-password
            />
          </el-form-item>
        </el-form>
      </FormDialog>
    </div>
  </el-affix>
</template>



<script setup>
import FormDialog from "@/components/FormDialog.vue";
import { useMenuStore } from "@/stores/menu";
import { useFullscreen } from "@vueuse/core";
import { useUserStore } from "@/stores/user";
import { showMessage, showModel } from "@/composables/util";
import { useRouter } from "vue-router";
import { ref, reactive, watch } from "vue";
import { updateAdminPassword } from "@/api/admin/user";

const userStore = useUserStore();
const menuStore = useMenuStore();
const router = useRouter();
const formDialogRef = ref();
const formRef = ref(null); // 表单引用
// 修改用户密码表单对象
const form = reactive({
  username: userStore.userInfo.username || "",
  password: "",
  rePassword: "",
});
// isFullscreen 表示当前是否处于全屏；toggle 用于动态切换全屏、非全屏
const { isFullscreen, toggle } = useFullscreen();

// 动态设置菜单的宽度大小
const handleMenuWidth = () => {
  menuStore.handleMenuWidth();
};
//刷新屏幕
const handleRefresh = () => location.reload();
//退出登录
function logout() {
  showModel("是否确认要退出登录？").then(() => {
    userStore.logout();
    showModel("退出登录成功！");
    // 跳转登录页
    router.push("/login");
  });
}
// 下拉菜单事件处理
const handleCommand = (command) => {
  if (command == "updatePassword") {
    formDialogRef.value.open();
  } else if (command == "logout") {
    logout();
  }
};
// 规则校验
const rules = {
  username: [
    {
      required: true,
      message: "用户名不能为空",
      trigger: "blur",
    },
  ],
  password: [
    {
      required: true,
      message: "密码不能为空",
      trigger: "blur",
    },
  ],
  rePassword: [
    {
      required: true,
      message: "确认密码不能为空",
      trigger: "blur",
    },
  ],
};

const onSubmit = () => {
  formRef.value.validate((valid) => {
    if (!valid) {
      console.log("表单验证不通过");
      return false;
    }
    if (form.password != form.rePassword) {
      showMessage("两次密码输入不一致，请检查！", "warning");
      return;
    }

    formDialogRef.value.showBtnLoading();
    updateAdminPassword(form)
      .then((res) => {
        if (res.success) {
          showMessage("密码重置成功，请重新登录！");
          userStore.logout();
          formDialogRef.value.close();
          router.push("/login");
        } else {
          showMessage(res.message, "error");
        }
      })
      .finally(() => {
        formDialogRef.value.closeBtnLoading();
      });
  });
};

// 监听 Pinia store 中的某个值的变化
watch(
  () => userStore.userInfo.username,
  (newValue, oldValue) => {
    // 在这里处理变化后的值
    console.log("新值:", newValue);
    console.log("旧值:", oldValue);

    // 可以在这里执行任何你需要的逻辑
    // 重新将新的值，设置会 form 对象中
    form.username = newValue;
  }
);
</script>
