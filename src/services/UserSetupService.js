import axiosInstance from "../utils/axiosInstance";

/* ---------- Users ---------- */
export const apiGetUsers = async (params = {}) => {
  // params: page, limit, search, role, status
  const res = await axiosInstance.get("/users", { params });
  return res.data;
};

export const apiCreateUser = async (payload) => {
  // payload: { email, password, fullName, department, role, organizationId }
  const res = await axiosInstance.post("/users", payload);
  return res.data;
};

export const apiUpdateUser = async (id, payload) => {
  const res = await axiosInstance.put(`/users/${id}`, payload);
  return res.data;
};

export const apiDeleteUser = async (id) => {
  const res = await axiosInstance.delete(`/users/${id}`);
  return res.data;
};

export const apiDeactivateUser = async (id) => {
  const res = await axiosInstance.patch(`/users/${id}/deactivate`);
  return res.data;
};

/* ---------- Teams (portal) ---------- */
export const apiGetTeams = async (params = {}) => {
  const res = await axiosInstance.get("/portal/teams", { params });
  return res.data;
};

export const apiGetPermissionsStructure = async () => {
  const res = await axiosInstance.get("/portal/teams/permissions");
  return res.data;
};

export const apiCreateTeam = async (payload) => {
  // payload: { name, description, permissions }
  const res = await axiosInstance.post("/portal/teams", payload);
  return res.data;
};

export const apiUpdateTeam = async (id, payload) => {
  const res = await axiosInstance.put(`/portal/teams/${id}`, payload);
  return res.data;
};

export const apiDeleteTeam = async (id) => {
  const res = await axiosInstance.delete(`/portal/teams/${id}`);
  return res.data;
};

export const apiAddUserToTeam = async (teamId, userId) => {
  const res = await axiosInstance.post(`/portal/teams/${teamId}/users`, {
    user_id: userId,
  });
  return res.data;
};

export const apiRemoveUserFromTeam = async (teamId, userId) => {
  const res = await axiosInstance.delete(
    `/portal/teams/${teamId}/users/${userId}`
  );
  return res.data;
};
