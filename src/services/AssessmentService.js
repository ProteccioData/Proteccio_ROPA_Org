import axiosInstance from "../utils/axiosInstance";

export const getAssessments = (params = {}) => {
  return axiosInstance.get("/portal/assessments", { params });
};

export const getAssessmentById = (assessmentId) => {
  return axiosInstance.get(`/portal/assessments/${assessmentId}`);
};

export const getAssessmentStats = () => {
  return axiosInstance.get("/portal/assessments/stats");
};

export const createAssessment = (data) => {
  return axiosInstance.post("/portal/assessments", data);
};

export const updateAssessment = (id, data) => {
  return axiosInstance.put(`/portal/assessments/${id}`, data);
};

export const updateStageResponses = (assessmentId, stageNumber, responses) => {
  return axiosInstance.put(
    `/portal/assessments/${assessmentId}/stages/${stageNumber}/responses`,
    { responses }
  );
};

export const completeStage = (assessmentId, stageNumber) => {
  return axiosInstance.post(
    `/portal/assessments/${assessmentId}/stages/${stageNumber}/complete`
  );
};

export const linkAssessmentToRopa = (assessmentId, ropaId) => {
  return axiosInstance.post(
    `/portal/assessments/${assessmentId}/link-ropa`,
    { ropa_id: ropaId }
  );
};

export const uploadAssessmentDocument = (assessmentId, stageNumber, file, description = "") => {
  const formData = new FormData();
  formData.append("document", file);
  if (description) formData.append("description", description);

  return axiosInstance.post(
    `/portal/assessments/${assessmentId}/stages/${stageNumber}/documents`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
};

export const deleteAssessmentDocument = (assessmentId, documentId) => {
  return axiosInstance.delete(
    `/portal/assessments/${assessmentId}/documents/${documentId}`
  );
};

export const deleteAssessment = (id) => {
  return axiosInstance.delete(`/portal/assessments/${id}`);
};

export const archiveAssessment = (id) => {
  return axiosInstance.post(`/portal/assessments/${id}/archive`);
};
export const unarchiveAssessment = (id) => {
  return axiosInstance.post(`/portal/assessments/${id}/unarchive`);
};
