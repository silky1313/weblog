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
