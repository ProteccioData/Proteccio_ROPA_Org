import { useState, useEffect } from "react";
import { X, Upload, FileText } from "lucide-react";
import { useToast } from "../ui/ToastProvider";
import { useTranslation } from "react-i18next";
import { addTranslationNamespace } from "../../i18n/config";

const ActionItemModal = ({ isOpen, onClose, currentUser, onSave }) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [ready , setReady] = useState(false);

  useEffect(() => {
    Promise.all([
      addTranslationNamespace("en" , "modules" , "AddActionItem"),
      addTranslationNamespace("hindi" , "modules" , "AddActionItem"),
      addTranslationNamespace("sanskrit" , "modules" , "AddActionItem"),
      addTranslationNamespace("telugu" , "modules" , "AddActionItem"),
    ]).then(() => setReady(true));
  }, [])
  
  const { t } = useTranslation("modules" , {keyPrefix: "AddActionItem"})

  const [formData, setFormData] = useState({
    actionId: `ACT-${Date.now()}`,
    title: "",
    description: "",
    createdDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    status: "Open",
    likelihood: "",
    impact: "",
    riskScore: 0,
    riskCategory: "",
    documents: [],
    assignedTo: "",
    department: currentUser.department || "",
    createdBy: currentUser.name || "",
    linkedRopaId: "",
    linkedAssessmentId: "",
    linkedDataMappingId: "",
    comments: "",
  });

  const likelihoodOptions = ["rare", "unlikely", "possible" , "likely" , "almost_certain"];
  const impactOptions = ["insignificant", "minor", "moderate", "major", "severe"];
  const statusOptions = ["open", "in_progress", "completed", "overdue"];
  const riskCategoryTable = [
    { min: 1, max: 5, category: "low" },
    { min: 6, max: 10, category: "medium" },
    { min: 11, max: 15, category: "high" },
    { min: 16, max: 20, category: "very_high" },
    { min: 21, max: 25, category: "critical" },
  ];
  const users = ["User A", "User B", "User C"]; 
  const departments = ["Finance", "HR", "IT"]; 

  // Calculate Risk Score & Category
  useEffect(() => {
    const likelihoodValue = likelihoodOptions.indexOf(formData.likelihood) + 1 || 0;
    const impactValue = impactOptions.indexOf(formData.impact) + 1 || 0;
    const score = likelihoodValue * impactValue;
    const category = riskCategoryTable.find((r) => score >= r.min && score <= r.max)?.category || "";
    setFormData((prev) => ({ ...prev, riskScore: score, riskCategory: category }));
  }, [formData.likelihood, formData.impact]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (files) => {
    if (!files) return;
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "message/rfc822",
    ];
    const validFiles = Array.from(files).filter((f) => allowedTypes.includes(f.type));
    setFormData((prev) => ({ ...prev, documents: [...prev.documents, ...validFiles] }));
    addToast("success", `${validFiles.length} file(s) uploaded`);
  };

  const removeFile = (index) => {
    setFormData((prev) => ({ ...prev, documents: prev.documents.filter((_, i) => i !== index) }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((res) => setTimeout(res, 1000));
      onSave?.(formData);
      addToast("success", "Action Item saved successfully");
      onClose();
    } catch {
      addToast("error", "Failed to save Action Item");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isReadOnly = (field) => {
    const { status } = formData;
    switch (field) {
      case "actionId":
      case "createdDate":
      case "createdBy":
      case "department":
        return true;
      case "title":
      case "description":
        return status === "Completed";
      case "status":
        return !(currentUser.role === "Org Admin" || currentUser.id === formData.createdById);
      case "likelihood":
      case "impact":
        return !(currentUser.role === "Org Admin" || currentUser.id === formData.createdById);
      default:
        return false;
    }
  };

  if (!ready) return <div>Loading ....</div>

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-[0.5px] flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 dark:border-gray-600 rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-300 dark:border-gray-600">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t("add_action_item")}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-4 space-y-4">
          {/* Action ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">{t("action_item_id")}</label>
            <input type="text" value={formData.actionId} readOnly className="w-full px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-md" />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">{t("title")} </label>
            <input
              type="text"
              maxLength={50}
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              readOnly={isReadOnly("title")}
              className={`w-full px-3 py-2 rounded-md border ${isReadOnly("title") ? "bg-gray-200 dark:bg-gray-700 border-gray-300" : "border-[#828282] dark:border-gray-500"} `}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">{t("description")} </label>
            <textarea
              maxLength={500}
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              readOnly={isReadOnly("description")}
              className={`w-full px-3 py-2 rounded-md border ${isReadOnly("description") ? "bg-gray-200 dark:bg-gray-700 border-gray-300" : "border-[#828282] dark:border-gray-500"} `}
            />
          </div>

          {/* Created Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">{t("created_date")}</label>
            <input type="date" value={formData.createdDate} readOnly className="w-full px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-md" />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">{t("due_date")} </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleInputChange("dueDate", e.target.value)}
            //   readOnly={currentUser.id !== formData.createdById}
              className={`w-full px-3 py-2 rounded-md border dark:bg-gray-700 border-[#828282] dark:border-gray-500} `}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">{t("status")} </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
              disabled={isReadOnly("status")}
              className={`w-full px-3 py-2 rounded-md border ${isReadOnly("status") ? "bg-gray-200 dark:bg-gray-700 border-gray-300" : "border-[#828282] dark:border-gray-500"} `}
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {t(s)}
                </option>
              ))}
            </select>
          </div>

          {/* Likelihood & Impact */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">{t("likelihood")} </label>
              <select
                value={formData.likelihood}
                onChange={(e) => handleInputChange("likelihood", e.target.value)}
                disabled={isReadOnly("likelihood")}
                className={`w-full px-3 py-2 rounded-md border ${isReadOnly("likelihood") ? "bg-gray-200 dark:bg-gray-700 border-gray-300" : "border-[#828282] dark:border-gray-500"} `}
              >
                <option value="">{t("select")}</option>
                {likelihoodOptions.map((l) => (
                  <option key={l} value={l}>
                    {t(l)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">{t("impact")} </label>
              <select
                value={formData.impact}
                onChange={(e) => handleInputChange("impact", e.target.value)}
                disabled={isReadOnly("impact")}
                className={`w-full px-3 py-2 rounded-md border ${isReadOnly("impact") ? "bg-gray-200 dark:bg-gray-700 border-gray-300" : "border-[#828282] dark:border-gray-500"} `}
              >
                <option value="">{t("select")}</option>
                {impactOptions.map((i) => (
                  <option key={i} value={i}>
                    {t(i)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Risk Score & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">{t("risk_score")}</label>
              <input type="text" value={formData.riskScore} readOnly className="w-full px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">{t("risk_category")}</label>
              <input type="text" value={formData.riskCategory} readOnly className="w-full px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-md" />
            </div>
          </div>

          {/* Assigned To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">{t("assigned_to")} </label>
            <select
              value={formData.assignedTo}
              onChange={(e) => handleInputChange("assignedTo", e.target.value)}
              disabled={isReadOnly("assignedTo")}
              className={`w-full px-3 py-2 rounded-md border ${isReadOnly("assignedTo") ? "bg-gray-200 dark:bg-gray-700 border-gray-300" : "border-[#828282] dark:border-gray-500"} `}
            >
              <option value="">{t("select")}</option>
              {users.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          {/* Documents Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">{t("documents")}</label>
            <input type="file" multiple onChange={(e) => handleFileUpload(e.target.files)} className="w-full" />
            {formData.documents.length > 0 && (
              <ul className="mt-2 space-y-1">
                {formData.documents.map((file, idx) => (
                  <li key={idx} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                    <span>{file.name}</span>
                    <button type="button" onClick={() => removeFile(idx)}>
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Comments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">{t("comments")}</label>
            <textarea
              maxLength={300}
              value={formData.comments}
              onChange={(e) => handleInputChange("comments", e.target.value)}
              readOnly={isReadOnly("comments")}
              className={`w-full px-3 py-2 rounded-md border ${isReadOnly("comments") ? "bg-gray-200 dark:bg-gray-700 border-gray-300" : "border-[#828282] dark:border-gray-500"} `}
            />
          </div>

          {/* Linked IDs */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">{t("linked_ropa_id")}</label>
              <input
                type="text"
                value={formData.linkedRopaId}
                onChange={(e) => handleInputChange("linkedRopaId", e.target.value)}
                readOnly
                className="w-full px-3 py-2 rounded-md border bg-gray-200 dark:bg-gray-700 border-[#828282] dark:border-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">{t("linked_assessment_id")}</label>
              <input
                type="text"
                value={formData.linkedAssessmentId}
                onChange={(e) => handleInputChange("linkedAssessmentId", e.target.value)}
                readOnly
                className="w-full px-3 py-2 rounded-md border bg-gray-200 dark:bg-gray-700  border-[#828282] dark:border-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700  dark:text-gray-400">{t("linked_data_mapping_id")}</label>
              <input
                type="text"
                value={formData.linkedDataMappingId}
                onChange={(e) => handleInputChange("linkedDataMappingId", e.target.value)}
                readOnly
                className="w-full px-3 py-2 rounded-md border bg-gray-200 dark:bg-gray-700 border-[#828282] dark:border-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex justify-end border-t border-gray-300 dark:border-gray-600">
          <button
            onClick={handleSave}
            disabled={loading}
            className={`px-6 py-2 rounded-lg ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"} text-white`}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionItemModal;
