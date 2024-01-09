import { defineStore } from "pinia";
import { ref } from "vue";

/*
第一个参数是用来标识状态管理器，需要唯一
第二个参数就是主要提供状态和方法，基本上是提供给外部对这个状态的操作
*/
export const useMenuStore = defineStore(
  "menu",
  () => {
    const menuWidth = ref("250px");

    // 展开或伸缩左边栏菜单
    function handleMenuWidth() {
      menuWidth.value = menuWidth.value === "250px" ? "64px" : "250px";
    }

    return {
      menuWidth,
      handleMenuWidth,
    };
  },
  {
    // 开启持久化
    persist: true,
  }
);
