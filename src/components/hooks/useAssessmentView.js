import { useState } from "react";
import { getAssessmentById } from "@/services/AssessmentService";

export const useAssessmentView = () => {
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadAssessment = async (id) => {
    try {
      setLoading(true);
      const res = await getAssessmentById(id);
      setAssessment(res.data.assessment);
    } catch (err) {
      console.error("Failed to load assessment", err);
    } finally {
      setLoading(false);
    }
  };

  return { assessment, loadAssessment, loading };
};
