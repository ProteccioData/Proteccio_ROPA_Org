import axiosInstance from "../utils/axiosInstance";

export const getArticles = (params = {}) =>
  axiosInstance.get("/articles", { params });

export const getArticleById = (id) =>
  axiosInstance.get(`/articles/${id}`);

export const downloadArticleCover = (id) =>
  `${import.meta.env.VITE_API_BASE_URL}/articles/${id}/cover-photo/download`;
