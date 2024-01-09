import { ElMessage } from "element-plus";
import "element-plus/es/components/message/style/css";
import nprogress from "nprogress";

//弹出提示消息，比如说登录成功之类的。
export function showMessage(
  message = "提示内容",
  type = "success",
  customClass = ""
) {
  return ElMessage({
    type: type,
    message,
    customClass,
  });
}

// 显示页面加载 Loading 就是页面最上方的横条
export function showPageLoading() {
  nprogress.start();
}
// 隐藏页面加载 Loading
export function hidePageLoading() {
  nprogress.done();
}

// 弹出确认框
export function showModel(content = "提示内容", type = "warning", title = "") {
  return ElMessageBox.confirm(content, title, {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type,
  });
}
