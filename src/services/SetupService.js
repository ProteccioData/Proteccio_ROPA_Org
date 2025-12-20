// services/setupService.js
import axiosInstance from "../utils/axiosInstance";

// ===============================
// CONFIG TYPES MAP
// ===============================
export const CONFIG_TYPE_MAP = {
  // core config modules
  data_collection: "data_collection",
  data_element: "data_element",      // UI plural → backend singular
  data_deletion: "data_deletion",
  data_subject: "data_subject",      // UI plural → backend singular
  data_transfer: "data_transfer",
  department: "department",
  organization: "organization",
  purpose: "purpose",
  legal_basis: "legal_basis",

  // security modules
  compliance_measures: "security_compliance",
  operational_measures: "security_operational",
  ethical_measures: "security_ethical",
  technical_measures: "security_technical",
  access_measures: "security_access",
  data_governance: "security_data_governance",
  transparency_measures: "security_transparency",
  physical_security: "security_physical",
  risk_management: "security_risk_management",
};


export const SECURITY_TYPES = Object.values(CONFIG_TYPE_MAP).filter((v) =>
  v.startsWith("security_")
);

// ===============================
// GENERIC CONFIG FUNCTIONS
// ===============================

export const getConfigs = (frontendType, params = {}) => {
  const type = CONFIG_TYPE_MAP[frontendType];
  return axiosInstance.get(`/portal/setup/${type}`, { params });
};

export const getConfigById = (frontendType, id) => {
  const type = CONFIG_TYPE_MAP[frontendType];
  return axiosInstance.get(`/portal/setup/${type}/${id}`);
};

export const createConfig = (frontendType, data) => {
  const type = CONFIG_TYPE_MAP[frontendType];
  return axiosInstance.post(`/portal/setup/${type}`, data);
};

export const updateConfig = (frontendType, id, data) => {
  const type = CONFIG_TYPE_MAP[frontendType];
  return axiosInstance.put(`/portal/setup/${type}/${id}`, data);
};

export const deleteConfig = (frontendType, id) => {
  const type = CONFIG_TYPE_MAP[frontendType];
  return axiosInstance.delete(`/portal/setup/${type}/${id}`);
};

export const bulkImportConfig = (frontendType, file) => {
  const type = CONFIG_TYPE_MAP[frontendType];
  const formData = new FormData();
  formData.append("file", file);
  return axiosInstance.post(`/portal/setup/bulk-import/${type}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// ===============================
// ASSETS MODULE
// ===============================

export const getAssets = (params = {}) => {
  return axiosInstance.get("/portal/setup/assets/all", { params });
};

export const getAssetById = (id) => {
  return axiosInstance.get(`/portal/setup/assets/${id}`);
};

export const createAsset = (data) => {
  return axiosInstance.post("/portal/setup/assets/create", data);
};

export const updateAsset = (id, data) => {
  return axiosInstance.put(`/portal/setup/assets/${id}`, data);
};

export const deleteAsset = (id) => {
  return axiosInstance.delete(`/portal/setup/assets/${id}`);
};

export const uploadAssetAttachment = (id, file) => {
  const formData = new FormData();
  formData.append("document", file);

  return axiosInstance.post(
    `/portal/setup/assets/${id}/attachments`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
};

export const deleteAssetAttachment = (id, index) => {
  return axiosInstance.delete(
    `/portal/setup/assets/${id}/attachments/${index}`
  );
};

export const bulkImportAssets = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return axiosInstance.post(`/portal/setup/assets/bulk-import`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const uploadLogo = async (file) => {
  const formData = new FormData();
  formData.append("logo", file);
  const res = await axiosInstance.post("/portal/organization-settings/logo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const exportSettings = async () => {
  const res = await axiosInstance.get("/portal/organization-settings/export");
  return res.data;
};

export const importSettings = async (settingsData) => {
  const res = await axiosInstance.post("/portal/organization-settings/import", { settings: settingsData });
  return res.data;
};

// ===============================
// SECURITY SAFEGAURDS — COMBINED UI
// ===============================

export const getAllSecuritySafeguards = async () => {
  let merged = [];

  for (const type of SECURITY_TYPES) {
    const res = await axiosInstance.get(`/portal/setup/${type}`);
    const cleaned = res.data.configs.map((item) => ({
      ...item,
      __frontend_type: Object.keys(CONFIG_TYPE_MAP).find(
        (k) => CONFIG_TYPE_MAP[k] === type
      ),
    }));

    merged.push(...cleaned);
  }

  return merged;
};

export const createSecuritySafeguard = (frontendType, data) => {
  return createConfig(frontendType, data);
};

export const updateSecuritySafeguard = (frontendType, id, data) => {
  return updateConfig(frontendType, id, data);
};

export const deleteSecuritySafeguard = (frontendType, id) => {
  return deleteConfig(frontendType, id);
};
