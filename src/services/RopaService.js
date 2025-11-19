import axios from "../utils/axiosInstance"; 

export const getAllRopas = async ({
  page = 1,
  limit = 10,
  search = "",
  category = "",
  flow_stage = "",
  status = "",
  level = "",
} = {}) => {
  return axios.get("/portal/ropas", {
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
  return axios.get(`/portal/ropas/${id}`);
};


export const createRopa = async (payload) => {
  return axios.post("/portal/ropas", payload);
};

export const updateRopa = async (id, payload) => {
  return axios.put(`/portal/ropas/${id}`, payload);
};


export const deleteRopa = async (id) => {
  return axios.delete(`/portal/ropas/${id}`);
};


export const moveRopaNext = async (id, next_review_date = null) => {
  return axios.post(`/portal/ropas/${id}/move-next`, { next_review_date });
};


export const moveRopaToReview = async (id) => {
  return axios.post(`/portal/ropas/${id}/move-review`);
};

export const getRopaStats = async (year = null, month = null) => {
  return axios.get("/portal/ropas/stats", {
    params: { year, month },
  });
};
