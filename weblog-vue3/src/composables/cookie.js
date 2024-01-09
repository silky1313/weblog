import { useCookies } from "@vueuse/integrations/useCookies";

const cookie = useCookies();

/* ============================== Token令牌相关function ============================== */
// 存储在 Cookie 中的 Token 的 key
const TOKEN_KEY = "Authorization";

export function getToken() {
  return cookie.get(TOKEN_KEY);
}
export function setToken(token) {
  return cookie.set(TOKEN_KEY, token);
}
export function removeToken() {
  return cookie.remove(TOKEN_KEY);
}

/* ============================== AdminTagList标签存储在token中避免刷新后标签页都没了 ============================== */
// 存储在 Cookie 中的AdminTagList数据的 key
const TAB_LIST_KEY = "tabList";

export function getTabList() {
  return cookie.get(TAB_LIST_KEY);
}
export function setTabList(tabList) {
  return cookie.set(TAB_LIST_KEY, tabList);
}
