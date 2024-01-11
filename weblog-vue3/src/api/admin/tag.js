import axios from "@/axios";

export function getTagPageList(data) {
  return axios.post("/admin/tag/list", data);
}

export function addTag(data) {
  return axios.post("/admin/tag/add", data);
}

export function deleteTag(id) {
  return axios.post("/admin/tag/delete", { id });
}

export function searchTags(key) {
  return axios.post("/admin/tag/search", { key })
}

// 获取标签 select 列表数据
export function getTagSelectList() {
  return axios.post("/admin/tag/select/list")
}
