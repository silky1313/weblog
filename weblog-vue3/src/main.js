import "@/assets/main.css";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import "nprogress/nprogress.css";
//动画库
import "animate.css";
import { createApp } from "vue";
import App from "@/App.vue";
// 导入路由
import router from "@/router";
// 导入全局路由守卫
import "@/permission";
//对pinia进行了封装
import pinia from "@/stores";

const app = createApp(App);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

// 应用路由
app.use(router);
app.use(pinia);
app.mount("#app");
