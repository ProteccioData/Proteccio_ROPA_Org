import axiosInstance from "../utils/axiosInstance";

export const getAllRopas = async ({
  page = 1,
  limit = 10,
  search = "",
  category = "",
  flow_stage = "",
  status = "",
  level = "",
} = {}) => {
  return axiosInstance.get("/portal/ropas", {
    params: {
      page,
      limit,
      search,
      category,
      flow_stage,
      status,
      level,
    },
  });
};

export const getRopaById = async (id) => {
  return axiosInstance.get(`/portal/ropas/${id}`);
};


export const createRopa = async (payload) => {
  return axiosInstance.post("/portal/ropas", payload);
};

export const updateRopa = async (id, payload) => {
  return axiosInstance.put(`/portal/ropas/${id}`, payload);
};


export const deleteRopa = async (id) => {
  return axiosInstance.delete(`/portal/ropas/${id}`);
};

export const archiveRopa = async (id) => {
  return axiosInstance.post(`/portal/ropas/${id}/archive`);
};

export const unarchiveRopa = async (id) => {
  return axiosInstance.post(`/portal/ropas/${id}/unarchive`);
};


export const moveRopaNext = async (id, next_review_date = null) => {
  return axiosInstance.post(`/portal/ropas/${id}/move-next`, { next_review_date });
};


export const moveRopaToReview = async (id) => {
  return axiosInstance.post(`/portal/ropas/${id}/move-review`);
};

export const getRopaStats = async (params = {}) => {
  return axiosInstance.get("/portal/ropas/stats", { params });
};

export const getRopaGraphData = (params) => {
  return axiosInstance.get("/portal/ropas/graph", { params });
}

export const getRopaRiskHeatmap = () =>
  axiosInstance.get("/portal/ropas/risk-heatmap");


