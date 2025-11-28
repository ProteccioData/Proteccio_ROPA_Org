import axiosInstance from "../utils/axiosInstance";

export const getReports = (params = {}) =>
  axiosInstance.get("/portal/reports", { params });

export const generateReport = (data) =>
  axiosInstance.post("/portal/reports/generate", data);

export const scheduleReport = (data) =>
  axiosInstance.post("/portal/reports/schedule", data);

export const downloadReport = (id) =>
  axiosInstance.get(`/portal/reports/${id}/download`, {
    responseType: "blob",
  });

export const deleteReport = (id) => {
  return axiosInstance.delete(`/portal/reports/${id}`);
};

export const getAlerts = () => {
  return axiosInstance.get("/portal/action-items/dashboard/alerts");
};
