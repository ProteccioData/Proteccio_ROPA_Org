import axiosInstance from "../utils/axiosInstance";

export const getAllDataMappings = (params = {}) => {
  return axiosInstance.get("/portal/data-mappings", { params });
};

export const getDataMappingById = (id) => {
  return axiosInstance.get(`/portal/data-mappings/${id}`);
};

export const createDataMapping = (payload) => {
  return axiosInstance.post("/portal/data-mappings", payload);
};

export const updateDataMapping = (id, payload) => {
  return axiosInstance.put(`/portal/data-mappings/${id}`, payload);
};

export const updateDiagramData = (id, diagram_data) => {
  return axiosInstance.put(`/portal/data-mappings/${id}/diagram`, {
    diagram_data,
  });
};

export const saveDiagramSVG = (id, svgString) => {
  return axiosInstance.post(`/portal/data-mappings/${id}/export-svg`, {
    svg_data: svgString,
  });
};

export const getSVGExport = (id, svg_data) => {
  return axiosInstance.get(`/portal/data-mappings/${id}/svg`, {
    responseType: "text",
  });
};

export const getPNGExport = (id) => {
  return axiosInstance.get(`/portal/data-mappings/${id}/png`, {
    responseType: "blob",
  });
};

export const archiveDataMapping = (id) => {
  return axiosInstance.post(`/portal/data-mappings/${id}/archive`);
};

export const restoreDataMapping = (id) => {
  return axiosInstance.post(`/portal/data-mappings/${id}/restore`);
};

export const deleteDataMapping = (id) => {
  return axiosInstance.delete(`/portal/data-mappings/${id}`);
};

export const getDataMappingStats = () => {
  return axiosInstance.get("/portal/data-mappings/stats");
};
