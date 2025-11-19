import axiosInstance from "../utils/axiosInstance";

export const getAuditLogs = (params = {}) =>
  axiosInstance.get("/portal/audit", { params });

export const getAuditStats = (params = {}) =>
  axiosInstance.get("/portal/audit/stats", { params });

export const exportAuditLogs = (params = {}) =>
  axiosInstance.get("/portal/audit/export", {
    params,
    responseType: "blob"
  });
