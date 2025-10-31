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

const DPIAModal = ({ isOpen, onClose, onDPIACreated }) => {
  const [currentStage, setCurrentStage] = useState(1);
  const [hoveredStep, setHoveredStep] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [errors, setErrors] = useState({});
  const { addToast } = useToast();

  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [currentFieldForAction, setCurrentFieldForAction] = useState(null);
  const [actionItems, setActionItems] = useState([]);
  const currentUser = { id: "user_1", name: "Alice Admin", department: "Legal", role: "Org Admin" };

  // Form data state
  const [formData, setFormData] = useState({
    // Basic Info
    basicInfo: {
      dpiaId: `DPIA-${Date.now()}`,
      assessmentName: "",
      createdAt: new Date().toISOString(),
    },

    // Stage 1: Purpose & Scope
    purposeScope: {
      naturePurpose: "",
      intendedOutcome: "",
      productsServices: "",
      dataSubjects: "",
      personalData: "",
      sensitiveDataInvolved: "",
      supportingDocuments: [],
    },

    // Stage 2: Assess Necessity & Proportionality
    necessityProportionality: {
      processingNecessary: "",
      legalBasis: "",
      dataMinimization: "",
      retentionPeriods: "",
      accessControls: "",
      individualsInformed: "",
      necessityDocuments: [],
    },

    // Stage 3: Identify Risks to Individuals
    riskIdentification: {
      potentialRisks: "",
      riskLikelihood: "",
      riskImpact: "",
      vulnerableGroups: "",
      riskDocuments: [],
    },

    // Stage 4: Evaluate and Mitigate Risks
    riskMitigation: {
      existingControls: "",
      additionalMeasures: "",
      responsiblePersons: "",
      residualRisk: "",
      mitigationDocuments: [],
    },

    // Stage 5: Sign-off, Review & Consultation
    signoffReview: {
      dpoConsulted: "",
      stakeholdersConsulted: "",
      feedbackObjections: "",
      finalOutcome: [],
      nextReviewDate: "",
      accountablePerson: "",
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
      console.log("Auto-saved DPIA:", formData);
      addToast("success", "Progress auto-saved");
    } catch (error) {
      console.error("Auto-save failed:", error);
      addToast("error", "Auto-save failed");
    } finally {
      setSaving(false);
    }
  };

  const stages = [
    { id: 1, title: "Purpose & Scope", shortTitle: "Purpose" },
    { id: 2, title: "Necessity & Proportionality", shortTitle: "Necessity" },
    { id: 3, title: "Identify Risks", shortTitle: "Risks" },
    { id: 4, title: "Evaluate & Mitigate", shortTitle: "Mitigate" },
    { id: 5, title: "Sign-off & Review", shortTitle: "Sign-off" },
  ];

  const yesNoOptions = ["Yes", "No"];
  const riskLevels = ["Low", "Medium", "High"];
  const legalBases = [
    "Consent (Article 6(1)(a))",
    "Contract (Article 6(1)(b))",
    "Legal Obligation (Article 6(1)(c))",
    "Vital Interests (Article 6(1)(d))",
    "Public Task (Article 6(1)(e))",
    "Legitimate Interests (Article 6(1)(f))",
    "Explicit Consent (Article 9(2)(a))",
    "Employment & Social Security (Article 9(2)(b))",
    "Vital Interests (Article 9(2)(c))",
    "Not-for-profit (Article 9(2)(d))",
    "Made Public (Article 9(2)(e))",
    "Legal Claims (Article 9(2)(f))",
    "Public Interest (Article 9(2)(g))",
    "Health & Social Care (Article 9(2)(h))",
    "Public Health (Article 9(2)(i))",
    "Archiving & Research (Article 9(2)(j))",
  ];
  const finalOutcomeOptions = [
    "Proceed with processing",
    "Proceed with conditions",
    "Reassess or do not proceed",
  ];

  const validateStage = (stage) => {
    const newErrors = {};

    switch (stage) {
      case 1:
        if (!formData.purposeScope.naturePurpose)
          newErrors["purposeScope.naturePurpose"] = "This field is required";
        if (!formData.purposeScope.intendedOutcome)
          newErrors["purposeScope.intendedOutcome"] = "This field is required";
        if (!formData.purposeScope.productsServices)
          newErrors["purposeScope.productsServices"] = "This field is required";
        if (!formData.purposeScope.dataSubjects)
          newErrors["purposeScope.dataSubjects"] = "This field is required";
        if (!formData.purposeScope.personalData)
          newErrors["purposeScope.personalData"] = "This field is required";
        if (!formData.purposeScope.sensitiveDataInvolved)
          newErrors["purposeScope.sensitiveDataInvolved"] =
            "This field is required";
        break;

      case 2:
        if (!formData.necessityProportionality.processingNecessary)
          newErrors["necessityProportionality.processingNecessary"] =
            "This field is required";
        if (!formData.necessityProportionality.legalBasis)
          newErrors["necessityProportionality.legalBasis"] =
            "This field is required";
        if (!formData.necessityProportionality.dataMinimization)
          newErrors["necessityProportionality.dataMinimization"] =
            "This field is required";
        if (!formData.necessityProportionality.retentionPeriods)
          newErrors["necessityProportionality.retentionPeriods"] =
            "This field is required";
        if (!formData.necessityProportionality.accessControls)
          newErrors["necessityProportionality.accessControls"] =
            "This field is required";
        if (!formData.necessityProportionality.individualsInformed)
          newErrors["necessityProportionality.individualsInformed"] =
            "This field is required";
        break;

      case 3:
        if (!formData.riskIdentification.potentialRisks)
          newErrors["riskIdentification.potentialRisks"] =
            "This field is required";
        if (!formData.riskIdentification.riskLikelihood)
          newErrors["riskIdentification.riskLikelihood"] =
            "This field is required";
        if (!formData.riskIdentification.riskImpact)
          newErrors["riskIdentification.riskImpact"] = "This field is required";
        if (!formData.riskIdentification.vulnerableGroups)
          newErrors["riskIdentification.vulnerableGroups"] =
            "This field is required";
        break;

      case 4:
        if (!formData.riskMitigation.existingControls)
          newErrors["riskMitigation.existingControls"] =
            "This field is required";
        if (!formData.riskMitigation.additionalMeasures)
          newErrors["riskMitigation.additionalMeasures"] =
            "This field is required";
        if (!formData.riskMitigation.responsiblePersons)
          newErrors["riskMitigation.responsiblePersons"] =
            "This field is required";
        if (!formData.riskMitigation.residualRisk)
          newErrors["riskMitigation.residualRisk"] = "This field is required";
        break;

      case 5:
        if (!formData.signoffReview.dpoConsulted)
          newErrors["signoffReview.dpoConsulted"] = "This field is required";
        if (!formData.signoffReview.stakeholdersConsulted)
          newErrors["signoffReview.stakeholdersConsulted"] =
            "This field is required";
        if (!formData.signoffReview.feedbackObjections)
          newErrors["signoffReview.feedbackObjections"] =
            "This field is required";
        if (
          !formData.signoffReview.finalOutcome ||
          formData.signoffReview.finalOutcome.length === 0
        )
          newErrors["signoffReview.finalOutcome"] = "This field is required";
        if (!formData.signoffReview.nextReviewDate)
          newErrors["signoffReview.nextReviewDate"] = "This field is required";
        if (!formData.signoffReview.accountablePerson)
          newErrors["signoffReview.accountablePerson"] =
            "This field is required";
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

  const handleCheckboxChange = (section, field, value, isChecked) => {
    setFormData((prev) => {
      const currentArray = prev[section][field] || [];
      let newArray;

      if (isChecked) {
        newArray = [...currentArray, value];
      } else {
        newArray = currentArray.filter((item) => item !== value);
      }

      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: newArray,
        },
      };
    });
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

  const openActionItemModal = (section, field) => {
    setCurrentFieldForAction({ section, field });
    setIsActionModalOpen(true);
  };

  const handleActionItemSave = (actionItemData) => {
    // Link the action item to the current DPIA and field
    const newActionItem = {
      ...actionItemData,
      linkedAssessmentId: formData.basicInfo.dpiaId,
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

  const renderCheckboxGroup = (
    section,
    field,
    label,
    options,
    required = false
  ) => {
    const error = getFieldError(section, field);
    const selectedValues = formData[section][field] || [];

    return (
      <div>
        <label
          className={`block text-sm font-medium mb-2 ${
            error ? "text-red-600" : "text-gray-700 dark:text-gray-400"
          }`}
        >
          {label} {required && "*"}
        </label>
        <div className="space-y-2 border border-[#828282] rounded-md p-3">
          {options.map((option) => (
            <label key={option} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedValues.includes(option)}
                onChange={(e) =>
                  handleCheckboxChange(section, field, option, e.target.checked)
                }
                className="rounded border-gray-300"
              />
              <span className="text-sm">{option}</span>
            </label>
          ))}
        </div>
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
      const dpiaDataWithActions = {
        ...formData,
        actionItems: actionItems,
      };
      console.log("Saving DPIA assessment:", dpiaDataWithActions);
      addToast("success", "DPIA assessment saved successfully!");
      resetForm();
      onClose();
      if (onDPIACreated) {
        onDPIACreated(dpiaDataWithActions);
      }
    } catch (error) {
      console.error("Failed to save DPIA:", error);
      addToast("error", "Failed to save DPIA assessment");
    } finally {
      setLoading(false);
    }
  };

  const handleLinkAndComplete = async () => {
    try {
      setLoading(true);
      const dpiaDataWithActions = {
        ...formData,
        actionItems: actionItems,
        status: "completed",
      };
      console.log("Completing DPIA assessment:", dpiaDataWithActions);
      addToast("success", "DPIA assessment completed and linked!");
      resetForm();
      onClose();
      if (onDPIACreated) {
        onDPIACreated(dpiaDataWithActions);
      }
    } catch (error) {
      console.error("Failed to complete DPIA:", error);
      addToast("error", "Failed to complete DPIA assessment");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      basicInfo: {
        dpiaId: `DPIA-${Date.now()}`,
        assessmentName: "",
        createdAt: new Date().toISOString(),
      },
      purposeScope: {
        naturePurpose: "",
        intendedOutcome: "",
        productsServices: "",
        dataSubjects: "",
        personalData: "",
        sensitiveDataInvolved: "",
        supportingDocuments: [],
      },
      necessityProportionality: {
        processingNecessary: "",
        legalBasis: "",
        dataMinimization: "",
        retentionPeriods: "",
        accessControls: "",
        individualsInformed: "",
        necessityDocuments: [],
      },
      riskIdentification: {
        potentialRisks: "",
        riskLikelihood: "",
        riskImpact: "",
        vulnerableGroups: "",
        riskDocuments: [],
      },
      riskMitigation: {
        existingControls: "",
        additionalMeasures: "",
        responsiblePersons: "",
        residualRisk: "",
        mitigationDocuments: [],
      },
      signoffReview: {
        dpoConsulted: "",
        stakeholdersConsulted: "",
        feedbackObjections: "",
        finalOutcome: [],
        nextReviewDate: "",
        accountablePerson: "",
        consultationDocuments: [],
      },
    });
    setCurrentStage(1);
    setErrors({});
  };

  // Render each stage
  const renderStage1 = () => (
    <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
      <div className="bg-gray-50 dark:bg-gray-900 border border-[#828282] p-6 rounded-lg">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
          Purpose & Scope
        </h3>
        <div className="space-y-6">
          <div>
            {renderTextarea("purposeScope", "naturePurpose", {
              value: formData.purposeScope.naturePurpose,
              onChange: (e) =>
                handleInputChange(
                  "purposeScope",
                  "naturePurpose",
                  e.target.value
                ),
              placeholder:
                "Describe the nature and purpose of the processing...",
              label: "What is the nature and purpose of the processing?",
              rows: 3,
            })}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  openActionItemModal("purposeScope", "naturePurpose")
                }
                className="mt-2 text-sm text-green-600 hover:underline cursor-pointer"
              >
                + Add Action Item
              </button>
            </div>
          </div>

          <div>
            {renderTextarea("purposeScope", "intendedOutcome", {
              value: formData.purposeScope.intendedOutcome,
              onChange: (e) =>
                handleInputChange(
                  "purposeScope",
                  "intendedOutcome",
                  e.target.value
                ),
              placeholder: "Describe the intended outcome or objective...",
              label: "What is the intended outcome or objective?",
              rows: 3,
            })}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  openActionItemModal("purposeScope", "intendedOutcome")
                }
                className="mt-2 text-sm text-green-600 hover:underline cursor-pointer"
              >
                + Add Action Item
              </button>
            </div>
          </div>

          <div>
            {renderTextarea("purposeScope", "productsServices", {
              value: formData.purposeScope.productsServices,
              onChange: (e) =>
                handleInputChange(
                  "purposeScope",
                  "productsServices",
                  e.target.value
                ),
              placeholder:
                "List the products, services, systems, or processes involved...",
              label:
                "What products, services, systems, or processes are involved?",
              rows: 3,
            })}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  openActionItemModal("purposeScope", "productsServices")
                }
                className="mt-2 text-sm text-green-600 hover:underline cursor-pointer"
              >
                + Add Action Item
              </button>
            </div>
          </div>

          <div>
            {renderTextarea("purposeScope", "dataSubjects", {
              value: formData.purposeScope.dataSubjects,
              onChange: (e) =>
                handleInputChange(
                  "purposeScope",
                  "dataSubjects",
                  e.target.value
                ),
              placeholder: "e.g., customers, employees, vendors, visitors...",
              label: "Who are the data subjects?",
              rows: 2,
            })}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  openActionItemModal("purposeScope", "dataSubjects")
                }
                className="mt-2 text-sm text-green-600 hover:underline cursor-pointer"
              >
                + Add Action Item
              </button>
            </div>
          </div>

          <div>
            {renderTextarea("purposeScope", "personalData", {
              value: formData.purposeScope.personalData,
              onChange: (e) =>
                handleInputChange(
                  "purposeScope",
                  "personalData",
                  e.target.value
                ),
              placeholder:
                "List categories of personal data being processed...",
              label:
                "What personal data is being processed? (Include categories)",
              rows: 3,
            })}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  openActionItemModal("purposeScope", "personalData")
                }
                className="mt-2 text-sm text-green-600 hover:underline cursor-pointer"
              >
                + Add Action Item
              </button>
            </div>
          </div>

          <div>
            {renderSelect("purposeScope", "sensitiveDataInvolved", {
              value: formData.purposeScope.sensitiveDataInvolved,
              onChange: (e) =>
                handleInputChange(
                  "purposeScope",
                  "sensitiveDataInvolved",
                  e.target.value
                ),
              label: "Is any special category or sensitive data involved?",
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
                  openActionItemModal("purposeScope", "sensitiveDataInvolved")
                }
                className="mt-2 text-sm text-green-600 hover:underline cursor-pointer"
              >
                + Add Action Item
              </button>
            </div>
          </div>

          <div>
            {renderFileUpload(
              "purposeScope",
              "supportingDocuments",
              "Please upload any supporting documents"
            )}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  openActionItemModal("purposeScope", "supportingDocuments")
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
          Assess Necessity & Proportionality
        </h3>
        <div className="space-y-6">
          <div>
            {renderSelect("necessityProportionality", "processingNecessary", {
              value: formData.necessityProportionality.processingNecessary,
              onChange: (e) =>
                handleInputChange(
                  "necessityProportionality",
                  "processingNecessary",
                  e.target.value
                ),
              label: "Is the processing necessary for the stated purpose?",
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
                  openActionItemModal(
                    "necessityProportionality",
                    "processingNecessary"
                  )
                }
                className="mt-2 text-sm text-green-600 hover:underline cursor-pointer"
              >
                + Add Action Item
              </button>
            </div>
          </div>

          <div>
            {renderSelect("necessityProportionality", "legalBasis", {
              value: formData.necessityProportionality.legalBasis,
              onChange: (e) =>
                handleInputChange(
                  "necessityProportionality",
                  "legalBasis",
                  e.target.value
                ),
              label:
                "What is the legal basis for processing (under Article 6 or 9 of GDPR)?",
              children: (
                <>
                  <option value="">Select Legal Basis</option>
                  {legalBases.map((basis) => (
                    <option key={basis} value={basis}>
                      {basis}
                    </option>
                  ))}
                </>
              ),
            })}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  openActionItemModal("necessityProportionality", "legalBasis")
                }
                className="mt-2 text-sm text-green-600 hover:underline cursor-pointer"
              >
                + Add Action Item
              </button>
            </div>
          </div>

          <div>
            {renderTextarea("necessityProportionality", "dataMinimization", {
              value: formData.necessityProportionality.dataMinimization,
              onChange: (e) =>
                handleInputChange(
                  "necessityProportionality",
                  "dataMinimization",
                  e.target.value
                ),
              placeholder: "Explain how data minimization is ensured...",
              label: "How is data minimization ensured?",
              rows: 3,
            })}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  openActionItemModal(
                    "necessityProportionality",
                    "dataMinimization"
                  )
                }
                className="mt-2 text-sm text-green-600 hover:underline cursor-pointer"
              >
                + Add Action Item
              </button>
            </div>
          </div>

          <div>
            {renderTextarea("necessityProportionality", "retentionPeriods", {
              value: formData.necessityProportionality.retentionPeriods,
              onChange: (e) =>
                handleInputChange(
                  "necessityProportionality",
                  "retentionPeriods",
                  e.target.value
                ),
              placeholder: "Specify data retention periods...",
              label: "What are the data retention periods?",
              rows: 2,
            })}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  openActionItemModal(
                    "necessityProportionality",
                    "retentionPeriods"
                  )
                }
                className="mt-2 text-sm text-green-600 hover:underline cursor-pointer"
              >
                + Add Action Item
              </button>
            </div>
          </div>

          <div>
            {renderTextarea("necessityProportionality", "accessControls", {
              value: formData.necessityProportionality.accessControls,
              onChange: (e) =>
                handleInputChange(
                  "necessityProportionality",
                  "accessControls",
                  e.target.value
                ),
              placeholder: "Describe access controls and security measures...",
              label: "What access controls and security measures are in place?",
              rows: 3,
            })}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  openActionItemModal(
                    "necessityProportionality",
                    "accessControls"
                  )
                }
                className="mt-2 text-sm text-green-600 hover:underline cursor-pointer"
              >
                + Add Action Item
              </button>
            </div>
          </div>

          <div>
            {renderSelect("necessityProportionality", "individualsInformed", {
              value: formData.necessityProportionality.individualsInformed,
              onChange: (e) =>
                handleInputChange(
                  "necessityProportionality",
                  "individualsInformed",
                  e.target.value
                ),
              label: "Are individuals informed (e.g., via privacy notice)?",
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
                  openActionItemModal(
                    "necessityProportionality",
                    "individualsInformed"
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
              "necessityProportionality",
              "necessityDocuments",
              "Please upload any supporting documents"
            )}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  openActionItemModal(
                    "necessityProportionality",
                    "necessityDocuments"
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

  const renderStage3 = () => (
    <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
      <div className="bg-gray-50 dark:bg-gray-900 border border-[#828282] p-6 rounded-lg">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
          Identify Risks to Individuals
        </h3>
        <div className="space-y-6">
          <div>
            {renderTextarea("riskIdentification", "potentialRisks", {
              value: formData.riskIdentification.potentialRisks,
              onChange: (e) =>
                handleInputChange(
                  "riskIdentification",
                  "potentialRisks",
                  e.target.value
                ),
              placeholder:
                "e.g., identity theft, financial loss, reputational damage, discrimination...",
              label: "What potential risks could arise for data subjects?",
              rows: 4,
            })}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  openActionItemModal("riskIdentification", "potentialRisks")
                }
                className="mt-2 text-sm text-green-600 hover:underline cursor-pointer"
              >
                + Add Action Item
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              {renderSelect("riskIdentification", "riskLikelihood", {
                value: formData.riskIdentification.riskLikelihood,
                onChange: (e) =>
                  handleInputChange(
                    "riskIdentification",
                    "riskLikelihood",
                    e.target.value
                  ),
                label: "What is the likelihood of each risk occurring?",
                children: (
                  <>
                    <option value="">Select Likelihood</option>
                    {riskLevels.map((level) => (
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
                    openActionItemModal("riskIdentification", "riskLikelihood")
                  }
                  className="mt-2 text-sm text-green-600 hover:underline cursor-pointer"
                >
                  + Add Action Item
                </button>
              </div>
            </div>

            <div>
              {renderSelect("riskIdentification", "riskImpact", {
                value: formData.riskIdentification.riskImpact,
                onChange: (e) =>
                  handleInputChange(
                    "riskIdentification",
                    "riskImpact",
                    e.target.value
                  ),
                label: "What is the impact if the risk occurs?",
                children: (
                  <>
                    <option value="">Select Impact</option>
                    {riskLevels.map((level) => (
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
                    openActionItemModal("riskIdentification", "riskImpact")
                  }
                  className="mt-2 text-sm text-green-600 hover:underline cursor-pointer"
                >
                  + Add Action Item
                </button>
              </div>
            </div>
          </div>

          <div>
            {renderTextarea("riskIdentification", "vulnerableGroups", {
              value: formData.riskIdentification.vulnerableGroups,
              onChange: (e) =>
                handleInputChange(
                  "riskIdentification",
                  "vulnerableGroups",
                  e.target.value
                ),
              placeholder:
                "e.g., children, elderly, disabled individuals, employees...",
              label: "Are any vulnerable groups affected?",
              rows: 3,
            })}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  openActionItemModal("riskIdentification", "vulnerableGroups")
                }
                className="mt-2 text-sm text-green-600 hover:underline cursor-pointer"
              >
                + Add Action Item
              </button>
            </div>
          </div>

          <div>
            {renderFileUpload(
              "riskIdentification",
              "riskDocuments",
              "Please upload any risk assessment documents"
            )}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  openActionItemModal("riskIdentification", "riskDocuments")
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
          Evaluate and Mitigate Risks
        </h3>
        <div className="space-y-6">
          <div>
            {renderTextarea("riskMitigation", "existingControls", {
              value: formData.riskMitigation.existingControls,
              onChange: (e) =>
                handleInputChange(
                  "riskMitigation",
                  "existingControls",
                  e.target.value
                ),
              placeholder: "Describe existing controls and safeguards...",
              label:
                "What existing controls are in place to mitigate the risks?",
              rows: 3,
            })}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  openActionItemModal("riskMitigation", "existingControls")
                }
                className="mt-2 text-sm text-green-600 hover:underline cursor-pointer"
              >
                + Add Action Item
              </button>
            </div>
          </div>

          <div>
            {renderTextarea("riskMitigation", "additionalMeasures", {
              value: formData.riskMitigation.additionalMeasures,
              onChange: (e) =>
                handleInputChange(
                  "riskMitigation",
                  "additionalMeasures",
                  e.target.value
                ),
              placeholder: "Describe any additional measures needed...",
              label: "Are additional measures needed? (If yes, describe them)",
              rows: 3,
            })}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  openActionItemModal("riskMitigation", "additionalMeasures")
                }
                className="mt-2 text-sm text-green-600 hover:underline cursor-pointer"
              >
                + Add Action Item
              </button>
            </div>
          </div>

          <div>
            {renderTextarea("riskMitigation", "responsiblePersons", {
              value: formData.riskMitigation.responsiblePersons,
              onChange: (e) =>
                handleInputChange(
                  "riskMitigation",
                  "responsiblePersons",
                  e.target.value
                ),
              placeholder:
                "List responsible persons/teams for each mitigation...",
              label: "Who is responsible for implementing each mitigation?",
              rows: 3,
            })}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  openActionItemModal("riskMitigation", "responsiblePersons")
                }
                className="mt-2 text-sm text-green-600 hover:underline cursor-pointer"
              >
                + Add Action Item
              </button>
            </div>
          </div>

          <div>
            {renderTextarea("riskMitigation", "residualRisk", {
              value: formData.riskMitigation.residualRisk,
              onChange: (e) =>
                handleInputChange(
                  "riskMitigation",
                  "residualRisk",
                  e.target.value
                ),
              placeholder:
                "Describe the residual risk level after mitigation...",
              label: "After mitigation, what is the residual risk level?",
              rows: 3,
            })}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  openActionItemModal("riskMitigation", "residualRisk")
                }
                className="mt-2 text-sm text-green-600 hover:underline cursor-pointer"
              >
                + Add Action Item
              </button>
            </div>
          </div>

          <div>
            {renderFileUpload(
              "riskMitigation",
              "mitigationDocuments",
              "Please upload any mitigation plan documents"
            )}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  openActionItemModal("riskMitigation", "mitigationDocuments")
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
          Sign-off, Review & Consultation
        </h3>
        <div className="space-y-6">
          <div>
            {renderSelect("signoffReview", "dpoConsulted", {
              value: formData.signoffReview.dpoConsulted,
              onChange: (e) =>
                handleInputChange(
                  "signoffReview",
                  "dpoConsulted",
                  e.target.value
                ),
              label: "Has the Data Protection Officer (DPO) been consulted?",
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
                  openActionItemModal("signoffReview", "dpoConsulted")
                }
                className="mt-2 text-sm text-green-600 hover:underline cursor-pointer"
              >
                + Add Action Item
              </button>
            </div>
          </div>

          <div>
            {renderTextarea("signoffReview", "stakeholdersConsulted", {
              value: formData.signoffReview.stakeholdersConsulted,
              onChange: (e) =>
                handleInputChange(
                  "signoffReview",
                  "stakeholdersConsulted",
                  e.target.value
                ),
              placeholder:
                "List internal and external stakeholders consulted...",
              label: "Have stakeholders been consulted (internal or external)?",
              rows: 3,
            })}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  openActionItemModal("signoffReview", "stakeholdersConsulted")
                }
                className="mt-2 text-sm text-green-600 hover:underline cursor-pointer"
              >
                + Add Action Item
              </button>
            </div>
          </div>

          <div>
            {renderTextarea("signoffReview", "feedbackObjections", {
              value: formData.signoffReview.feedbackObjections,
              onChange: (e) =>
                handleInputChange(
                  "signoffReview",
                  "feedbackObjections",
                  e.target.value
                ),
              placeholder:
                "Describe any feedback, concerns, or objections raised...",
              label: "What was the feedback or objections, if any?",
              rows: 3,
            })}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  openActionItemModal("signoffReview", "feedbackObjections")
                }
                className="mt-2 text-sm text-green-600 hover:underline cursor-pointer"
              >
                + Add Action Item
              </button>
            </div>
          </div>

          <div>
            {renderCheckboxGroup(
              "signoffReview",
              "finalOutcome",
              "Final assessment outcome:",
              finalOutcomeOptions,
              true
            )}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  openActionItemModal("signoffReview", "finalOutcome")
                }
                className="mt-2 text-sm text-green-600 hover:underline cursor-pointer"
              >
                + Add Action Item
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              {renderInput("signoffReview", "nextReviewDate", {
                type: "date",
                value: formData.signoffReview.nextReviewDate,
                onChange: (e) =>
                  handleInputChange(
                    "signoffReview",
                    "nextReviewDate",
                    e.target.value
                  ),
                label: "Set next review date",
              })}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    openActionItemModal("signoffReview", "nextReviewDate")
                  }
                  className="mt-2 text-sm text-green-600 hover:underline cursor-pointer"
                >
                  + Add Action Item
                </button>
              </div>
            </div>

            <div>
              {renderInput("signoffReview", "accountablePerson", {
                type: "text",
                value: formData.signoffReview.accountablePerson,
                onChange: (e) =>
                  handleInputChange(
                    "signoffReview",
                    "accountablePerson",
                    e.target.value
                  ),
                placeholder: "Enter name of accountable person/team...",
                label: "Record accountable person/team",
              })}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    openActionItemModal("signoffReview", "accountablePerson")
                  }
                  className="mt-2 text-sm text-green-600 hover:underline cursor-pointer"
                >
                  + Add Action Item
                </button>
              </div>
            </div>
          </div>

          <div>
            {renderFileUpload(
              "signoffReview",
              "consultationDocuments",
              "Please upload consultation records and review documents"
            )}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  openActionItemModal("signoffReview", "consultationDocuments")
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
                ? "bg-[#5DEE92] text-black px-4 py-2 rounded-full min-w-[160px] h-10 scale-105 shadow-md"
                : stage.id < currentStage
                ? "bg-[#5DEE92] text-black w-10 h-10 rounded-full hover:px-4 hover:min-w-[140px] hover:scale-105"
                : "bg-white text-black border-4 border-[#5DEE92] w-10 h-10 rounded-full hover:px-4 hover:min-w-[160px] hover:scale-105"
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
                DPIA - {formData.basicInfo.dpiaId}
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

export default DPIAModal;
