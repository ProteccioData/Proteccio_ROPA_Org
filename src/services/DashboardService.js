import axiosInstance from "../utils/axiosInstance";

export const getDashboardSummary = () => {
  return axiosInstance.get("/portal/dashboard/summary");
};

export const getDashboardActivity = () => {
  return axiosInstance.get("/portal/dashboard/activity?limit=20");
};

export const getRopaStats = () => {
    return axiosInstance.get("/portal/ropas/stats")
}
