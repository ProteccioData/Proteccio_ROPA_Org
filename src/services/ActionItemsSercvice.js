import axiosInstance from "../utils/axiosInstance";

export const getActionItemSummary = () => {
  return axiosInstance.get("/portal/action-items/dashboard/summary");
};

export const getRiskDistribution = () => {
  return axiosInstance.get("/portal/action-items/dashboard/risk-distribution");
};

export const getActionItemsTable = (params = {}) => {
  return axiosInstance.get("/portal/action-items/dashboard/table", { params });
};

export const getAlerts = () => {
  return axiosInstance.get("/portal/action-items/dashboard/alerts");
};

export const getRiskHeatmap = () => {
  return axiosInstance.get("/portal/action-items/dashboard/risk-heatmap");
};

export const getLinkageHeatmap = () => {
  return axiosInstance.get("/portal/action-items/dashboard/heatmap");
};

export const exportActionItems = (format = "csv") => {
  return axiosInstance.get("/portal/action-items/dashboard/export", {
    params: { format },
  });
};
