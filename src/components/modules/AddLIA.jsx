import { useState, useEffect } from "react";
import {
  X,
  Upload,
  FileText,
  Save,
  Clock,
  Link,
  SkipForward,
} from "lucide-react";
import { useToast } from "../ui/ToastProvider";
import ActionItemModal from "./AddActionItem";
import UserMultiSelect from "../ui/UserMultiSelect";

const LIAssessmentModal = ({ isOpen, onClose, onLIACreated }) => {
  const [currentStage, setCurrentStage] = useState(1);
  const [hoveredStep, setHoveredStep] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [errors, setErrors] = useState({});
  const { addToast } = useToast();

  // Action Item Modal State
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [currentFieldForAction, setCurrentFieldForAction] = useState(null);
  const [actionItems, setActionItems] = useState([]);

  const currentUser = {
    id: "user_1",
    name: "Alice Admin",
    department: "Legal",
    role: "Org Admin",
  };

  // Form data state
  const [formData, setFormData] = useState({
    // Basic Info
    basicInfo: {
      liaId: `LIA-${Date.now()}`,
      assessmentName: "",
      createdAt: new Date().toISOString(),
    },

    // Stage 1: Purpose & Necessity
    purposeNecessity: {
      legitimateInterest: "",
      processingNecessity: "",
      lessIntrusiveAlternatives: "",
      supportingDocuments: [],
    },

    // Stage 2: Data Details
    dataDetails: {
      dataCategories: "",
      sensitiveDataInvolved: "",
      dataFlowDocuments: [],
    },

    // Stage 3: Impact & Risk Assessment
    impactRisk: {
      potentialImpact: "",
      impactLikelihood: "",
      impactExplanation: "",
      mitigatingMeasures: "",
      riskAssessmentDocuments: [],
    },

    // Stage 4: Balancing Test & Decision
    balancingTest: {
      balancingExplanation: "",
      proportionalityFairness: "",
      finalDecision: "",
      decisionDocuments: [],
    },

    // Stage 5: Stakeholder Consultation & Review
    stakeholderConsultation: {
      stakeholdersConsulted: "",
      feedbackConcerns: "",
      assessmentDate: "",
      nextReviewDate: "",
      responsiblePerson: "",
      consultationDocuments: [],
    },
  });

  // Auto-save functionality
  useEffect(() => {
    if (!isOpen) return;

    const autoSaveInterval = setInterval(async () => {
      if (hasFormData()) {
        await handleAutoSave();
      }
    }, 5000);

    return () => clearInterval(autoSaveInterval);
  }, [isOpen, formData]);

  const hasFormData = () => {
    return Object.values(formData).some((section) =>
      Object.values(section).some(
        (value) =>
          value !== "" &&
          value !== null &&
          (!Array.isArray(value) || value.length > 0)
      )
    );
  };

  const handleAutoSave = async () => {
    if (saving) return;

    try {
      setSaving(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setLastSaved(new Date());
      console.log("Auto-saved LIA:", formData);
      addToast("success", "Progress auto-saved");
    } catch (error) {
      console.error("Auto-save failed:", error);
      addToast("error", "Auto-save failed");
    } finally {
      setSaving(false);
    }
  };

  const stages = [
    { id: 1, title: "Purpose & Necessity", shortTitle: "Purpose" },
    { id: 2, title: "Data Details", shortTitle: "Data" },
    { id: 3, title: "Impact & Risk Assessment", shortTitle: "Risk" },
    { id: 4, title: "Balancing Test & Decision", shortTitle: "Decision" },
    { id: 5, title: "Stakeholder Consultation", shortTitle: "Stakeholder" },
  ];

  const impactLevels = [
    "Insignificant",
    "Minor",
    "Moderate",
    "Major",
    "Severe",
  ];
  const liklihoodLevels = [
    "Rare",
    "Unlikely",
    "Possible",
    "Likely",
    "Almost Certain",
  ];
  const yesNoOptions = ["Yes", "No"];
  const decisionOptions = ["Justified", "Not Justified", "Needs Review"];

  // Action Item Functions
  const openActionItemModal = (section, field) => {
    setCurrentFieldForAction({ section, field });
    setIsActionModalOpen(true);
  };

  const handleActionItemSave = (actionItemData) => {
    // Link the action item to the current LIA and field
    const newActionItem = {
      ...actionItemData,
      linkedAssessmentId: formData.basicInfo.liaId,
      linkedField: `${currentFieldForAction.section}.${currentFieldForAction.field}`,
      stage: currentStage,
      stageTitle: stages.find((stage) => stage.id === currentStage)?.title,
    };

    setActionItems((prev) => [...prev, newActionItem]);
    addToast("success", "Action item added successfully");

    // Close the modal
    setIsActionModalOpen(false);
    setCurrentFieldForAction(null);
  };

  const closeActionItemModal = () => {
    setIsActionModalOpen(false);
    setCurrentFieldForAction(null);
  };

  const validateStage = (stage) => {
    const newErrors = {};

    switch (stage) {
      case 1:
        if (!formData.purposeNecessity.legitimateInterest) {
          newErrors["purposeNecessity.legitimateInterest"] =
            "This field is required";
        }
        if (!formData.purposeNecessity.processingNecessity) {
          newErrors["purposeNecessity.processingNecessity"] =
            "This field is required";
        }
        if (!formData.purposeNecessity.lessIntrusiveAlternatives) {
          newErrors["purposeNecessity.lessIntrusiveAlternatives"] =
            "This field is required";
        }
        break;

      case 2:
        if (!formData.dataDetails.dataCategories) {
          newErrors["dataDetails.dataCategories"] = "This field is required";
        }
        if (!formData.dataDetails.sensitiveDataInvolved) {
          newErrors["dataDetails.sensitiveDataInvolved"] =
            "This field is required";
        }
        break;

      case 3:
        if (!formData.impactRisk.potentialImpact) {
          newErrors["impactRisk.potentialImpact"] = "This field is required";
        }
        if (!formData.impactRisk.impactLikelihood) {
          newErrors["impactRisk.impactLikelihood"] = "This field is required";
        }
        if (!formData.impactRisk.impactExplanation) {
          newErrors["impactRisk.impactExplanation"] = "This field is required";
        }
        if (!formData.impactRisk.mitigatingMeasures) {
          newErrors["impactRisk.mitigatingMeasures"] = "This field is required";
        }
        break;

      case 4:
        if (!formData.balancingTest.balancingExplanation) {
          newErrors["balancingTest.balancingExplanation"] =
            "This field is required";
        }
        if (!formData.balancingTest.proportionalityFairness) {
          newErrors["balancingTest.proportionalityFairness"] =
            "This field is required";
        }
        if (!formData.balancingTest.finalDecision) {
          newErrors["balancingTest.finalDecision"] = "This field is required";
        }
        break;

      case 5:
        if (!formData.stakeholderConsultation.stakeholdersConsulted) {
          newErrors["stakeholderConsultation.stakeholdersConsulted"] =
            "This field is required";
        }
        if (!formData.stakeholderConsultation.feedbackConcerns) {
          newErrors["stakeholderConsultation.feedbackConcerns"] =
            "This field is required";
        }
        if (!formData.stakeholderConsultation.assessmentDate) {
          newErrors["stakeholderConsultation.assessmentDate"] =
            "This field is required";
        }
        if (!formData.stakeholderConsultation.responsiblePerson) {
          newErrors["stakeholderConsultation.responsiblePerson"] =
            "This field is required";
        }
        break;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      addToast("success", "Stage validation passed!");
      return true;
    } else {
      addToast("error", "Please fill all required fields");
      return false;
    }
  };

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));

    // Clear error when user starts typing
    if (errors[`${section}.${field}`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`${section}.${field}`];
        return newErrors;
      });
    }
  };

  const handleFileUpload = (section, field, files) => {
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);

    // Validate file types
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/jpeg",
      "image/jpg",
      "image/svg+xml",
      "message/rfc822", // email
    ];

    const validFiles = newFiles.filter((file) =>
      allowedTypes.includes(file.type)
    );

    if (validFiles.length !== newFiles.length) {
      addToast("error", "Some files were skipped due to invalid format");
    }

    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: [...(prev[section][field] || []), ...validFiles],
      },
    }));

    addToast("success", `${validFiles.length} file(s) uploaded successfully`);
  };

  const removeFile = (section, field, fileIndex) => {
    setFormData((prev) => {
      const updatedFiles = prev[section][field].filter(
        (_, index) => index !== fileIndex
      );
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: updatedFiles,
        },
      };
    });
  };

  const getFieldError = (section, field) => {
    return errors[`${section}.${field}`] || null;
  };

  const renderInput = (section, field, props) => {
    const error = getFieldError(section, field);
    const isRequired = props.required !== false;

    return (
      <div>
        <label
          className={`block text-sm font-medium mb-1 ${
            error ? "text-red-600" : "text-gray-700 dark:text-gray-400"
          }`}
        >
          {props.label} {isRequired && "*"}
        </label>
        <input
          {...props}
          className={`w-full px-3 py-2 bg-white dark:bg-gray-700 dark:text-gray-100 border rounded-md ${
            error
              ? "border-red-500 focus:border-red-500"
              : "border-[#828282] focus:border-blue-500"
          } ${props.className || ""}`}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  };

  const renderTextarea = (section, field, props) => {
    const error = getFieldError(section, field);
    const isRequired = props.required !== false;

    return (
      <div>
        <label
          className={`block text-sm font-medium mb-1 ${
            error ? "text-red-600" : "text-gray-700 dark:text-gray-400"
          }`}
        >
          {props.label} {isRequired && "*"}
        </label>
        <textarea
          {...props}
          className={`w-full px-3 py-2 bg-white dark:bg-gray-700 dark:text-gray-100 border rounded-md ${
            error
              ? "border-red-500 focus:border-red-500"
              : "border-[#828282] focus:border-blue-500"
          } ${props.className || ""}`}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  };

  const renderSelect = (section, field, props) => {
    const error = getFieldError(section, field);
    const isRequired = props.required !== false;

    return (
      <div>
        <label
          className={`block text-sm font-medium mb-1 ${
            error ? "text-red-600" : "text-gray-700 dark:text-gray-400"
          }`}
        >
          {props.label} {isRequired && "*"}
        </label>
        <select
          {...props}
          className={`w-full px-3 py-2 bg-white dark:bg-gray-700 dark:text-gray-100 border rounded-md ${
            error
              ? "border-red-500 focus:border-red-500"
              : "border-[#828282] focus:border-blue-500"
          } ${props.className || ""}`}
        >
          {props.children}
        </select>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  };

  const renderFileUpload = (section, field, label, required = false) => {
    const files = formData[section][field] || [];

    return (
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-400">
          {label} {required && "*"}
        </label>

        {/* File Upload Area */}
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 transition-colors mb-4">
          <input
            type="file"
            onChange={(e) => handleFileUpload(section, field, e.target.files)}
            accept=".pdf,.doc,.docx,.xlsx,.jpg,.jpeg,.svg,.eml"
            multiple
            className="hidden"
            id={`file-upload-${section}-${field}`}
          />
          <label
            htmlFor={`file-upload-${section}-${field}`}
            className="cursor-pointer flex flex-col items-center"
          >
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Click to upload documents
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              PDF, Word, Excel, Images, Email
            </span>
          </label>
        </div>

        {/* Uploaded Files List */}
        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(section, field, index)}
                  className="text-red-500 hover:text-red-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const handleNextStage = () => {
    if (validateStage(currentStage)) {
      if (currentStage < 5) {
        setCurrentStage(currentStage + 1);
        addToast("info", `Moving to ${stages[currentStage].title}`);
      }
    }
  };

  const handlePreviousStage = () => {
    if (currentStage > 1) {
      setCurrentStage(currentStage - 1);
      addToast("info", `Returning to ${stages[currentStage - 2].title}`);
    }
  };

  const handleSaveAndClose = async () => {
    try {
      setLoading(true);
      // Include action items in the saved data
      const liaDataWithActions = {
        ...formData,
        actionItems: actionItems,
      };
      console.log("Saving LIA assessment:", liaDataWithActions);
      addToast("success", "LIA assessment saved successfully!");
      resetForm();
      onClose();
      if (onLIACreated) {
        onLIACreated(liaDataWithActions);
      }
    } catch (error) {
      console.error("Failed to save LIA:", error);
      addToast("error", "Failed to save LIA assessment");
    } finally {
      setLoading(false);
    }
  };

  const handleLinkAndComplete = async () => {
    try {
      setLoading(true);
      // Include action items in the completed data
      const liaDataWithActions = {
        ...formData,
        actionItems: actionItems,
        status: "completed",
      };
      console.log("Completing LIA assessment:", liaDataWithActions);
      addToast("success", "LIA assessment completed and linked!");
      resetForm();
      onClose();
      if (onLIACreated) {
        onLIACreated(liaDataWithActions);
      }
    } catch (error) {
      console.error("Failed to complete LIA:", error);
      addToast("error", "Failed to complete LIA assessment");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      basicInfo: {
        liaId: `LIA-${Date.now()}`,
        assessmentName: "",
        createdAt: new Date().toISOString(),
      },
      purposeNecessity: {
        legitimateInterest: "",
        processingNecessity: "",
        lessIntrusiveAlternatives: "",
        supportingDocuments: [],
      },
      dataDetails: {
        dataCategories: "",
        sensitiveDataInvolved: "",
        dataFlowDocuments: [],
      },
      impactRisk: {
        potentialImpact: "",
        impactLikelihood: "",
        impactExplanation: "",
        mitigatingMeasures: "",
        riskAssessmentDocuments: [],
      },
      balancingTest: {
        balancingExplanation: "",
        proportionalityFairness: "",
        finalDecision: "",
        decisionDocuments: [],
      },
      stakeholderConsultation: {
        stakeholdersConsulted: "",
        feedbackConcerns: "",
        assessmentDate: "",
        nextReviewDate: "",
        responsiblePerson: "",
        consultationDocuments: [],
      },
    });
    setCurrentStage(1);
    setErrors({});
    setActionItems([]);
  };

  // Render each stage with Action Item buttons
  const renderStage1 = () => (
    <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
      <div className="bg-gray-50 dark:bg-gray-900 border border-[#828282] p-6 rounded-lg">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
          Purpose & Necessity
        </h3>
        <div className="space-y-6">
          <div>
            {renderTextarea("purposeNecessity", "legitimateInterest", {
              value: formData.purposeNecessity.legitimateInterest,
              onChange: (e) =>
                handleInputChange(
                  "purposeNecessity",
                  "legitimateInterest",
                  e.target.value
                ),
              placeholder:
                "Describe the specific legitimate interest your organization is pursuing...",
              label:
                "What is the specific legitimate interest your organization is pursuing with this processing?",
              rows: 4,
            })}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  openActionItemModal("purposeNecessity", "legitimateInterest")
                }
                className="mt-2 text-sm text-green-600 hover:underline cursor-pointer"
              >
                + Add Action Item
              </button>
            </div>
          </div>

          <div>
            {renderTextarea("purposeNecessity", "processingNecessity", {
              value: formData.purposeNecessity.processingNecessity,
              onChange: (e) =>
                handleInputChange(
                  "purposeNecessity",
                  "processingNecessity",
                  e.target.value
                ),
              placeholder:
                "Explain why this processing is necessary to achieve the purpose...",
              label:
                "Why is this processing necessary to achieve that purpose?",
              rows: 4,
            })}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  openActionItemModal("purposeNecessity", "processingNecessity")
                }
                className="mt-2 text-sm text-green-600 hover:underline cursor-pointer"
              >
                + Add Action Item
              </button>
            </div>
          </div>

          <div>
            {renderTextarea("purposeNecessity", "lessIntrusiveAlternatives", {
              value: formData.purposeNecessity.lessIntrusiveAlternatives,
              onChange: (e) =>
                handleInputChange(
                  "purposeNecessity",
                  "lessIntrusiveAlternatives",
                  e.target.value
                ),
              placeholder:
                "Describe any less intrusive alternatives considered...",
              label:
                "Have you considered any less intrusive ways to achieve the same purpose without processing personal data?",
              rows: 4,
            })}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  openActionItemModal(
                    "purposeNecessity",
                    "lessIntrusiveAlternatives"
                  )
                }
                className="mt-2 text-sm text-green-600 hover:underline cursor-pointer"
              >
                + Add Action Item
              </button>
            </div>
          </div>

          <div>
            {renderFileUpload(
              "purposeNecessity",
              "supportingDocuments",
              "Please upload any supporting documents (business case, analysis of alternatives)"
            )}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  openActionItemModal("purposeNecessity", "supportingDocuments")
                }
                className="mt-2 text-sm text-green-600 hover:underline cursor-pointer"
              >
                + Add Action Item
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStage2 = () => (
    <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
      <div className="bg-gray-50 dark:bg-gray-900 border border-[#828282] p-6 rounded-lg">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
          Data Details
        </h3>
        <div className="space-y-6">
          <div>
            {renderTextarea("dataDetails", "dataCategories", {
              value: formData.dataDetails.dataCategories,
              onChange: (e) =>
                handleInputChange(
                  "dataDetails",
                  "dataCategories",
                  e.target.value
                ),
              placeholder:
                "e.g., names, contact info, IP addresses, financial data...",
              label: "What categories of personal data will be processed?",
              rows: 3,
            })}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  openActionItemModal("dataDetails", "dataCategories")
                }
                className="mt-2 text-sm text-green-600 hover:underline cursor-pointer"
              >
                + Add Action Item
              </button>
            </div>
          </div>

          <div>
            {renderSelect("dataDetails", "sensitiveDataInvolved", {
              value: formData.dataDetails.sensitiveDataInvolved,
              onChange: (e) =>
                handleInputChange(
                  "dataDetails",
                  "sensitiveDataInvolved",
                  e.target.value
                ),
              label: "Will any special category (sensitive) data be involved?",
              children: (
                <>
                  <option value="">Select</option>
                  {yesNoOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </>
              ),
            })}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  openActionItemModal("dataDetails", "sensitiveDataInvolved")
                }
                className="mt-2 text-sm text-green-600 hover:underline cursor-pointer"
              >
                + Add Action Item
              </button>
            </div>
          </div>

          <div>
            {renderFileUpload(
              "dataDetails",
              "dataFlowDocuments",
              "Please upload any data flow diagrams or data mapping documents"
            )}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  openActionItemModal("dataDetails", "dataFlowDocuments")
                }
                className="mt-2 text-sm text-green-600 hover:underline cursor-pointer"
              >
                + Add Action Item
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStage3 = () => (
    <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
      <div className="bg-gray-50 dark:bg-gray-900 border border-[#828282] p-6 rounded-lg">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
          Impact & Risk Assessment
        </h3>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              {renderSelect("impactRisk", "potentialImpact", {
                value: formData.impactRisk.potentialImpact,
                onChange: (e) =>
                  handleInputChange(
                    "impactRisk",
                    "potentialImpact",
                    e.target.value
                  ),
                label: "What is the potential impact on individuals?",
                children: (
                  <>
                    <option value="">Select Impact Level</option>
                    {impactLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </>
                ),
              })}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    openActionItemModal("impactRisk", "potentialImpact")
                  }
                  className="mt-2 text-sm text-green-600 hover:underline cursor-pointer"
                >
                  + Add Action Item
                </button>
              </div>
            </div>

            <div>
              {renderSelect("impactRisk", "impactLikelihood", {
                value: formData.impactRisk.impactLikelihood,
                onChange: (e) =>
                  handleInputChange(
                    "impactRisk",
                    "impactLikelihood",
                    e.target.value
                  ),
                label: "How likely is it that this impact will occur?",
                children: (
                  <>
                    <option value="">Select Likelihood</option>
                    {liklihoodLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </>
                ),
              })}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    openActionItemModal("impactRisk", "impactLikelihood")
                  }
                  className="mt-2 text-sm text-green-600 hover:underline cursor-pointer"
                >
                  + Add Action Item
                </button>
              </div>
            </div>
          </div>

          <div>
            {renderTextarea("impactRisk", "impactExplanation", {
              value: formData.impactRisk.impactExplanation,
              onChange: (e) =>
                handleInputChange(
                  "impactRisk",
                  "impactExplanation",
                  e.target.value
                ),
              placeholder:
                "Explain the reasons behind your impact and likelihood ratings...",
              label:
                "Please explain the reasons behind your impact and likelihood ratings",
              rows: 3,
            })}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  openActionItemModal("impactRisk", "impactExplanation")
                }
                className="mt-2 text-sm text-green-600 hover:underline cursor-pointer"
              >
                + Add Action Item
              </button>
            </div>
          </div>

          <div>
            {renderTextarea("impactRisk", "mitigatingMeasures", {
              value: formData.impactRisk.mitigatingMeasures,
              onChange: (e) =>
                handleInputChange(
                  "impactRisk",
                  "mitigatingMeasures",
                  e.target.value
                ),
              placeholder:
                "Describe the mitigating measures or safeguards in place...",
              label:
                "What mitigating measures or safeguards are in place to reduce risks?",
              rows: 3,
            })}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  openActionItemModal("impactRisk", "mitigatingMeasures")
                }
                className="mt-2 text-sm text-green-600 hover:underline cursor-pointer"
              >
                + Add Action Item
              </button>
            </div>
          </div>

          <div>
            {renderFileUpload(
              "impactRisk",
              "riskAssessmentDocuments",
              "Please upload any risk assessment or mitigation plans"
            )}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  openActionItemModal("impactRisk", "riskAssessmentDocuments")
                }
                className="mt-2 text-sm text-green-600 hover:underline cursor-pointer"
              >
                + Add Action Item
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStage4 = () => (
    <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
      <div className="bg-gray-50 dark:bg-gray-900 border border-[#828282] p-6 rounded-lg">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
          Balancing Test & Decision
        </h3>
        <div className="space-y-6">
          <div>
            {renderTextarea("balancingTest", "balancingExplanation", {
              value: formData.balancingTest.balancingExplanation,
              onChange: (e) =>
                handleInputChange(
                  "balancingTest",
                  "balancingExplanation",
                  e.target.value
                ),
              placeholder:
                "Explain how you balance the organization's interest against individuals' rights...",
              label:
                "How do you balance the organization's legitimate interest against individuals' rights and freedoms?",
              rows: 4,
            })}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  openActionItemModal("balancingTest", "balancingExplanation")
                }
                className="mt-2 text-sm text-green-600 hover:underline cursor-pointer"
              >
                + Add Action Item
              </button>
            </div>
          </div>

          <div>
            {renderTextarea("balancingTest", "proportionalityFairness", {
              value: formData.balancingTest.proportionalityFairness,
              onChange: (e) =>
                handleInputChange(
                  "balancingTest",
                  "proportionalityFairness",
                  e.target.value
                ),
              placeholder:
                "Explain why the processing is proportionate and fair...",
              label:
                "Is the processing proportionate and fair considering the identified risks?",
              rows: 4,
            })}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  openActionItemModal(
                    "balancingTest",
                    "proportionalityFairness"
                  )
                }
                className="mt-2 text-sm text-green-600 hover:underline cursor-pointer"
              >
                + Add Action Item
              </button>
            </div>
          </div>

          <div>
            {renderSelect("balancingTest", "finalDecision", {
              value: formData.balancingTest.finalDecision,
              onChange: (e) =>
                handleInputChange(
                  "balancingTest",
                  "finalDecision",
                  e.target.value
                ),
              label:
                "What is the final decision on the legitimate interest basis?",
              children: (
                <>
                  <option value="">Select Decision</option>
                  {decisionOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </>
              ),
            })}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  openActionItemModal("balancingTest", "finalDecision")
                }
                className="mt-2 text-sm text-green-600 hover:underline cursor-pointer"
              >
                + Add Action Item
              </button>
            </div>
          </div>

          <div>
            {renderFileUpload(
              "balancingTest",
              "decisionDocuments",
              "Please upload decision documents, approvals, or DPO reviews"
            )}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  openActionItemModal("balancingTest", "decisionDocuments")
                }
                className="mt-2 text-sm text-green-600 hover:underline cursor-pointer"
              >
                + Add Action Item
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStage5 = () => (
    <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
      <div className="bg-gray-50 dark:bg-gray-900 border border-[#828282] p-6 rounded-lg">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
          Stakeholder Consultation & Review
        </h3>
        <div className="space-y-6">
          <div>
            {renderTextarea(
              "stakeholderConsultation",
              "stakeholdersConsulted",
              {
                value: formData.stakeholderConsultation.stakeholdersConsulted,
                onChange: (e) =>
                  handleInputChange(
                    "stakeholderConsultation",
                    "stakeholdersConsulted",
                    e.target.value
                  ),
                placeholder:
                  "List the stakeholders consulted (e.g., DPO, legal team, business units)...",
                label:
                  "Which stakeholders were consulted regarding this processing?",
                rows: 3,
              }
            )}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  openActionItemModal(
                    "stakeholderConsultation",
                    "stakeholdersConsulted"
                  )
                }
                className="mt-2 text-sm text-green-600 hover:underline cursor-pointer"
              >
                + Add Action Item
              </button>
            </div>
          </div>

          <div>
            {renderTextarea("stakeholderConsultation", "feedbackConcerns", {
              value: formData.stakeholderConsultation.feedbackConcerns,
              onChange: (e) =>
                handleInputChange(
                  "stakeholderConsultation",
                  "feedbackConcerns",
                  e.target.value
                ),
              placeholder:
                "Describe any feedback or concerns raised by stakeholders...",
              label: "What feedback or concerns were raised?",
              rows: 3,
            })}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  openActionItemModal(
                    "stakeholderConsultation",
                    "feedbackConcerns"
                  )
                }
                className="mt-2 text-sm text-green-600 hover:underline cursor-pointer"
              >
                + Add Action Item
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              {renderInput("stakeholderConsultation", "assessmentDate", {
                type: "date",
                value: formData.stakeholderConsultation.assessmentDate,
                onChange: (e) =>
                  handleInputChange(
                    "stakeholderConsultation",
                    "assessmentDate",
                    e.target.value
                  ),
                label: "When was this assessment conducted?",
              })}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    openActionItemModal(
                      "stakeholderConsultation",
                      "assessmentDate"
                    )
                  }
                  className="mt-2 text-sm text-green-600 hover:underline cursor-pointer"
                >
                  + Add Action Item
                </button>
              </div>
            </div>

            <div>
              {renderInput("stakeholderConsultation", "nextReviewDate", {
                type: "date",
                value: formData.stakeholderConsultation.nextReviewDate,
                onChange: (e) =>
                  handleInputChange(
                    "stakeholderConsultation",
                    "nextReviewDate",
                    e.target.value
                  ),
                label: "When will it be reviewed next?",
                required: false,
              })}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    openActionItemModal(
                      "stakeholderConsultation",
                      "nextReviewDate"
                    )
                  }
                  className="mt-2 text-sm text-green-600 hover:underline cursor-pointer"
                >
                  + Add Action Item
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Who is responsible for ongoing monitoring? *
            </label>
            <UserMultiSelect
              users={[
                { id: "user_1", name: "Alice Admin" },
                { id: "user_2", name: "Bob Reviewer" },
                { id: "user_3", name: "Charlie Manager" },
              ]}
              value={formData.stakeholderConsultation.responsiblePerson || []}
              onChange={(selectedUsers) =>
                handleInputChange(
                  "stakeholderConsultation", "responsiblePerson",
                  selectedUsers
                )
              }
            />

            {getFieldError("riskMitigation", "responsiblePersons") && (
              <p className="text-red-500 text-xs mt-1">
                {getFieldError("riskMitigation", "responsiblePersons")}
              </p>
            )}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  openActionItemModal(
                    "stakeholderConsultation",
                    "responsiblePerson"
                  )
                }
                className="mt-2 text-sm text-green-600 hover:underline cursor-pointer"
              >
                + Add Action Item
              </button>
            </div>
          </div>

          <div>
            {renderFileUpload(
              "stakeholderConsultation",
              "consultationDocuments",
              "Please upload consultation records and review confirmation documents"
            )}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  openActionItemModal(
                    "stakeholderConsultation",
                    "consultationDocuments"
                  )
                }
                className="mt-2 text-sm text-green-600 hover:underline cursor-pointer"
              >
                + Add Action Item
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ProgressBar = () => (
    <div className="flex items-center justify-center">
      {stages.map((stage, index) => (
        <div key={stage.id} className="flex items-center">
          <div
            className={`relative flex items-center justify-center text-sm font-medium cursor-pointer 
            transition-all duration-500 ease-in-out transform
            ${
              stage.id === currentStage
                ? "bg-[#5DEE92] text-black px-4 py-2 rounded-full min-w-[140px] h-10 scale-105 shadow-md"
                : stage.id < currentStage
                ? "bg-[#5DEE92] text-black w-10 h-10 rounded-full hover:px-4 hover:min-w-[120px] hover:scale-105"
                : "bg-white text-black border-4 border-[#5DEE92] w-10 h-10 rounded-full hover:px-4 hover:min-w-[140px] hover:scale-105"
            }`}
            onMouseEnter={() => setHoveredStep(stage.id)}
            onMouseLeave={() => setHoveredStep(null)}
          >
            <span className="transition-opacity duration-500 ease-in-out">
              {stage.id === currentStage
                ? stage.title
                : hoveredStep === stage.id
                ? stage.shortTitle
                : stage.id}
            </span>
          </div>
          {index < stages.length - 1 && (
            <div
              className={`w-8 lg:w-16 h-0.5 mx-2 rounded-full transition-colors duration-500 ease-in-out
              ${stage.id < currentStage ? "bg-[#5DEE92]" : "bg-gray-200"}`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const getCurrentStageContent = () => {
    switch (currentStage) {
      case 1:
        return renderStage1();
      case 2:
        return renderStage2();
      case 3:
        return renderStage3();
      case 4:
        return renderStage4();
      case 5:
        return renderStage5();
      default:
        return renderStage1();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-[0.5px] flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 dark:border-gray-600 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
          {/* Modal Header */}
          <div className="bg-white dark:bg-gray-800 dark:border-gray-600 px-6 py-4 rounded-t-2xl border-b border-[#828282] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Legitimate Interest Assessment - {formData.basicInfo.liaId}
              </h2>
              {saving && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Save className="w-4 h-4 animate-pulse" />
                  <span>Saving...</span>
                </div>
              )}
              {lastSaved && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="px-6 py-4 bg-white dark:bg-gray-800 dark:border-gray-600 flex-shrink-0">
            <ProgressBar />
          </div>

          {/* Modal Content (scrollable area) */}
          <div className="px-6 py-4 flex-1 overflow-y-auto">
            {getCurrentStageContent()}
          </div>

          {/* Modal Footer (always visible) */}
          <div className="px-6 py-4 rounded-2xl flex justify-between flex-shrink-0">
            <div className="flex space-x-3">
              {currentStage > 1 && (
                <button
                  onClick={handlePreviousStage}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  Previous
                </button>
              )}

              {/* Final stage actions */}
              {currentStage === 5 && (
                <>
                  <button
                    onClick={handleSaveAndClose}
                    disabled={loading}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    <SkipForward className="w-4 h-4" />
                    <span>Skip</span>
                  </button>
                  <button
                    onClick={handleLinkAndComplete}
                    disabled={loading}
                    className="flex items-center space-x-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                  >
                    <Link className="w-4 h-4" />
                    <span>Link & Complete</span>
                  </button>
                </>
              )}
            </div>

            <div>
              {currentStage < 5 ? (
                <button
                  onClick={handleNextStage}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                >
                  Save & Next
                </button>
              ) : (
                <button
                  onClick={handleSaveAndClose}
                  disabled={loading}
                  className={`px-6 py-2 rounded-lg transition-colors ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 cursor-pointer"
                  } text-white`}
                >
                  {loading ? "Submitting..." : "Submit & Close"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Item Modal */}
      <ActionItemModal
        isOpen={isActionModalOpen}
        onClose={closeActionItemModal}
        onSave={handleActionItemSave}
        currentUser={currentUser}
        departments={[
          "Legal",
          "Frontend",
          "Payments",
          "Procurement",
          "Customer Ops",
        ]}
        users={[
          { id: "user_1", name: "Alice Admin" },
          { id: "user_2", name: "Bob Reviewer" },
        ]}
      />
    </>
  );
};

export default LIAssessmentModal;
