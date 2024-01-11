<template>
  <div
    class="fixed overflow-y-auto bg-slate-800 h-screen text-white menu-container transition-all"
    :style="{ width: menuStore.menuWidth }"
  >
    <!-- 顶部 Logo, 指定高度为 64px, 和右边的 Header 头保持一样高 -->
    <div class="flex items-center justify-center h-[64px]">
      <img
        v-if="menuStore.menuWidth == '250px'"
        src="@/assets/admin-menu-logo.png"
        class="h-[60px]"
      />
      <img v-else src="@/assets/mini-log.png" class="h-[60px]" />
    </div>

    <!-- 下方菜单 -->
    <el-menu
      :default-active="defaultActive"
      @select="handleSelect"
      :collapse="isCollapse"
      :collapse-transition="false"
    >
      <template v-for="(item, index) in menus" :key="index">
        <el-menu-item :index="item.path">
          <!-- 菜单栏图标 -->
          <el-icon>
            <component :is="item.icon"></component>
          </el-icon>

          <!-- 菜单栏名字 -->
          <span>{{ item.name }}</span>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useMenuStore } from "@/stores/menu";
import { useRouter, useRoute } from "vue-router";

// 在组件中使用 useRoute() 可以方便地访问和利用当前路由的信息。
const route = useRoute();
// useRouter() 可以方便地进行编程式导航
const router = useRouter();
// 根据路由地址判断哪个菜单被选中
const defaultActive = ref(route.path);
const isCollapse = computed(() => !(menuStore.menuWidth == "250px"));
const menuStore = useMenuStore();
// 省略...
const menus = [
  {
    name: "仪表盘",
    icon: "Monitor",
    path: "/admin/index",
  },
  {
    name: "文章管理",
    icon: "Document",
    path: "/admin/article/list",
  },
  {
    name: "分类管理",
    icon: "FolderOpened",
    path: "/admin/category/list",
  },
  {
    name: "标签管理",
    icon: "PriceTag",
    path: "/admin/tag/list",
  },
  {
    name: "博客设置",
    icon: "Setting",
    path: "/admin/blog/setting",
  },
];

const handleSelect = (path) => {
  router.push(path);
};
</script>

<style>
.el-menu {
  background-color: rgb(30 41 59 / 1);
  border-right: 0;
}

.el-sub-menu__title {
  color: #fff;
}

.el-sub-menu__title:hover {
  background-color: #ffffff10;
}

.el-menu-item.is-active {
  background-color: var(--el-color-primary);
  color: #fff;
}

.el-menu-item.is-active:hover {
  background-color: var(--el-color-primary);
}

.el-menu-item {
  color: #fff;
}

.el-menu-item:hover {
  background-color: #ffffff10;
}
</style>