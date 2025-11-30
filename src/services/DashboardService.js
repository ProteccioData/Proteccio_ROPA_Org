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

export const getComplianceScore = () => {
  return axiosInstance.get("/portal/compliance/score");
};

export const getAssessmentTrend = () => {
  return axiosInstance.get(
    "/portal/assessments/dashboard?period=yearly"
  );
};

export const getRiskOverview = () => {
  return axiosInstance.get("/portal/risk/overview");
};

export const getUpcomingAudits = (days = 30, limit = 20) => {
  return axiosInstance.get(`/portal/dashboard/upcoming-audits?days=${days}&limit=${limit}`);
};

export const getDataMappingStats = () => {
  return axiosInstance.get("/portal/data-mappings/stats");
}

export const getDataTransferStats = () => {
  return axiosInstance.get("/portal/data-transfers/stats");
};

export const getAllDataTransfers = () => {
  return axiosInstance.get("/portal/data-transfers");
};

export const getRecentReports = () =>
  axiosInstance.get("/portal/reports", {
    params: {
      page: 1,
      limit: 5,
      status: "completed",
    },
  });


