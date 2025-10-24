import { useState, useEffect } from "react";
import { X, Upload, FileText, Save, Clock, Link, SkipForward } from "lucide-react";
import { useToast } from "../ui/ToastProvider";

const TIAModal = ({ isOpen, onClose, onTIACreated }) => {
  const [currentStage, setCurrentStage] = useState(1);
  const [hoveredStep, setHoveredStep] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [errors, setErrors] = useState({});
  const { addToast } = useToast();

  // Form data state
  const [formData, setFormData] = useState({
    // Basic Info
    basicInfo: {
      tiaId: `TIA-${Date.now()}`,
      assessmentName: "",
      createdAt: new Date().toISOString(),
    },
    
    // Stage 1: Nature of Transfer
    natureOfTransfer: {
      purpose: "",
      dataSubjects: "",
      personalData: "",
      frequency: "",
      specialCategoryData: "",
      transferMechanisms: [],
      transferDocuments: [],
    },
    
    // Stage 2: Legal Framework
    legalFramework: {
      destinationLaws: "",
      independentOversight: "",
      legalRemedies: "",
      pastAccessRequests: "",
      canResistRequests: "",
      notificationCommitment: "",
      legalDocuments: [],
    },
    
    // Stage 3: Risk Assessment
    riskAssessment: {
      accessLikelihood: "",
      likelihoodFactors: "",
      potentialImpact: "",
      underminesProtection: "",
      riskDocuments: [],
    },
    
    // Stage 4: Supplementary Measures
    supplementaryMeasures: {
      dataEncrypted: "",
      encryptionKeyHolder: "",
      pseudonymizationApplied: "",
      notificationObligations: "",
      auditRights: "",
      staffTraining: "",
      internalPolicies: "",
      measuresDocuments: [],
    },
    
    // Stage 5: Conclusion & Documentation
    conclusion: {
      canProceed: "",
      assessedBy: "",
      reviewedBy: "",
      assessmentDate: "",
      nextReviewDate: "",
      conclusionDocuments: [],
    }
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
    return Object.values(formData).some(section => 
      Object.values(section).some(value => 
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastSaved(new Date());
      console.log("Auto-saved TIA:", formData);
      addToast("success", "Progress auto-saved");
    } catch (error) {
      console.error("Auto-save failed:", error);
      addToast("error", "Auto-save failed");
    } finally {
      setSaving(false);
    }
  };

  const stages = [
    { id: 1, title: "Nature of Transfer", shortTitle: "Transfer" },
    { id: 2, title: "Legal Framework", shortTitle: "Legal" },
    { id: 3, title: "Risk Assessment", shortTitle: "Risk" },
    { id: 4, title: "Supplementary Measures", shortTitle: "Measures" },
    { id: 5, title: "Conclusion & Documentation", shortTitle: "Conclusion" },
  ];

  const yesNoOptions = ["Yes", "No"];
  const yesNoUnknownOptions = ["Yes", "No", "Unknown"];
  const frequencyOptions = ["One-off", "Continuous", "Periodic", "On-demand"];
  const transferMechanisms = [
    "EU Standard Contractual Clauses (SCCs)",
    "Binding Corporate Rules (BCRs)",
    "Adequacy decision",
    "Consent",
    "Derogation (Article 49 GDPR)",
    "Others"
  ];
  const riskLevels = ["Low", "Medium", "High"];
  const protectionOptions = ["Yes", "No", "Unclear (further safeguards required)"];
  const conclusionOptions = [
    "Yes",
    "Yes, with additional safeguards", 
    "No — transfer must be suspended or alternative solutions sought"
  ];

  const validateStage = (stage) => {
    const newErrors = {};
    
    switch (stage) {
      case 1:
        if (!formData.natureOfTransfer.purpose) newErrors["natureOfTransfer.purpose"] = "This field is required";
        if (!formData.natureOfTransfer.dataSubjects) newErrors["natureOfTransfer.dataSubjects"] = "This field is required";
        if (!formData.natureOfTransfer.personalData) newErrors["natureOfTransfer.personalData"] = "This field is required";
        if (!formData.natureOfTransfer.frequency) newErrors["natureOfTransfer.frequency"] = "This field is required";
        if (!formData.natureOfTransfer.specialCategoryData) newErrors["natureOfTransfer.specialCategoryData"] = "This field is required";
        if (!formData.natureOfTransfer.transferMechanisms || formData.natureOfTransfer.transferMechanisms.length === 0) {
          newErrors["natureOfTransfer.transferMechanisms"] = "At least one transfer mechanism must be selected";
        }
        break;
        
      case 2:
        if (!formData.legalFramework.destinationLaws) newErrors["legalFramework.destinationLaws"] = "This field is required";
        if (!formData.legalFramework.independentOversight) newErrors["legalFramework.independentOversight"] = "This field is required";
        if (!formData.legalFramework.legalRemedies) newErrors["legalFramework.legalRemedies"] = "This field is required";
        if (!formData.legalFramework.pastAccessRequests) newErrors["legalFramework.pastAccessRequests"] = "This field is required";
        if (!formData.legalFramework.canResistRequests) newErrors["legalFramework.canResistRequests"] = "This field is required";
        if (!formData.legalFramework.notificationCommitment) newErrors["legalFramework.notificationCommitment"] = "This field is required";
        break;
        
      case 3:
        if (!formData.riskAssessment.accessLikelihood) newErrors["riskAssessment.accessLikelihood"] = "This field is required";
        if (!formData.riskAssessment.likelihoodFactors) newErrors["riskAssessment.likelihoodFactors"] = "This field is required";
        if (!formData.riskAssessment.potentialImpact) newErrors["riskAssessment.potentialImpact"] = "This field is required";
        if (!formData.riskAssessment.underminesProtection) newErrors["riskAssessment.underminesProtection"] = "This field is required";
        break;
        
      case 4:
        if (!formData.supplementaryMeasures.dataEncrypted) newErrors["supplementaryMeasures.dataEncrypted"] = "This field is required";
        if (!formData.supplementaryMeasures.encryptionKeyHolder) newErrors["supplementaryMeasures.encryptionKeyHolder"] = "This field is required";
        if (!formData.supplementaryMeasures.pseudonymizationApplied) newErrors["supplementaryMeasures.pseudonymizationApplied"] = "This field is required";
        if (!formData.supplementaryMeasures.notificationObligations) newErrors["supplementaryMeasures.notificationObligations"] = "This field is required";
        if (!formData.supplementaryMeasures.auditRights) newErrors["supplementaryMeasures.auditRights"] = "This field is required";
        if (!formData.supplementaryMeasures.staffTraining) newErrors["supplementaryMeasures.staffTraining"] = "This field is required";
        if (!formData.supplementaryMeasures.internalPolicies) newErrors["supplementaryMeasures.internalPolicies"] = "This field is required";
        break;
        
      case 5:
        if (!formData.conclusion.canProceed) newErrors["conclusion.canProceed"] = "This field is required";
        if (!formData.conclusion.assessedBy) newErrors["conclusion.assessedBy"] = "This field is required";
        if (!formData.conclusion.reviewedBy) newErrors["conclusion.reviewedBy"] = "This field is required";
        if (!formData.conclusion.assessmentDate) newErrors["conclusion.assessmentDate"] = "This field is required";
        if (!formData.conclusion.nextReviewDate) newErrors["conclusion.nextReviewDate"] = "This field is required";
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
        newArray = currentArray.filter(item => item !== value);
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
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/jpg',
      'image/svg+xml',
      'message/rfc822' // email
    ];

    const validFiles = newFiles.filter(file => allowedTypes.includes(file.type));
    
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
      const updatedFiles = prev[section][field].filter((_, index) => index !== fileIndex);
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

  const renderCheckboxGroup = (section, field, label, options, required = false) => {
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
                onChange={(e) => handleCheckboxChange(section, field, option, e.target.checked)}
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

  const renderRadioGroup = (section, field, label, options, required = false) => {
    const error = getFieldError(section, field);
    const selectedValue = formData[section][field];

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
                type="radio"
                name={`${section}-${field}`}
                checked={selectedValue === option}
                onChange={(e) => handleInputChange(section, field, option)}
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
              <div key={index} className="flex items-center justify-between p-3 border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 rounded-lg">
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
      console.log("Saving TIA assessment:", formData);
      addToast("success", "TIA assessment saved successfully!");
      resetForm();
      onClose();
      if (onTIACreated) {
        onTIACreated(formData);
      }
    } catch (error) {
      console.error("Failed to save TIA:", error);
      addToast("error", "Failed to save TIA assessment");
    } finally {
      setLoading(false);
    }
  };

  const handleLinkAndComplete = async () => {
    try {
      setLoading(true);
      console.log("Completing TIA assessment:", formData);
      addToast("success", "TIA assessment completed and linked!");
      resetForm();
      onClose();
      if (onTIACreated) {
        onTIACreated({ ...formData, status: "completed" });
      }
    } catch (error) {
      console.error("Failed to complete TIA:", error);
      addToast("error", "Failed to complete TIA assessment");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      basicInfo: {
        tiaId: `TIA-${Date.now()}`,
        assessmentName: "",
        createdAt: new Date().toISOString(),
      },
      natureOfTransfer: {
        purpose: "",
        dataSubjects: "",
        personalData: "",
        frequency: "",
        specialCategoryData: "",
        transferMechanisms: [],
        transferDocuments: [],
      },
      legalFramework: {
        destinationLaws: "",
        independentOversight: "",
        legalRemedies: "",
        pastAccessRequests: "",
        canResistRequests: "",
        notificationCommitment: "",
        legalDocuments: [],
      },
      riskAssessment: {
        accessLikelihood: "",
        likelihoodFactors: "",
        potentialImpact: "",
        underminesProtection: "",
        riskDocuments: [],
      },
      supplementaryMeasures: {
        dataEncrypted: "",
        encryptionKeyHolder: "",
        pseudonymizationApplied: "",
        notificationObligations: "",
        auditRights: "",
        staffTraining: "",
        internalPolicies: "",
        measuresDocuments: [],
      },
      conclusion: {
        canProceed: "",
        assessedBy: "",
        reviewedBy: "",
        assessmentDate: "",
        nextReviewDate: "",
        conclusionDocuments: [],
      }
    });
    setCurrentStage(1);
    setErrors({});
  };

  // Render each stage
  const renderStage1 = () => (
    <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
      <div className="bg-gray-50 dark:bg-gray-900 border border-[#828282] p-6 rounded-lg">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Nature of Transfer</h3>
        <div className="space-y-6">
          {renderTextarea("natureOfTransfer", "purpose", {
            value: formData.natureOfTransfer.purpose,
            onChange: (e) => handleInputChange("natureOfTransfer", "purpose", e.target.value),
            placeholder: "Describe the purpose of the data transfer...",
            label: "Purpose of the data transfer:",
            rows: 3,
          })}
          
          {renderTextarea("natureOfTransfer", "dataSubjects", {
            value: formData.natureOfTransfer.dataSubjects,
            onChange: (e) => handleInputChange("natureOfTransfer", "dataSubjects", e.target.value),
            placeholder: "e.g., employees, customers, vendors, patients...",
            label: "Categories of data subjects:",
            rows: 2,
          })}
          
          {renderTextarea("natureOfTransfer", "personalData", {
            value: formData.natureOfTransfer.personalData,
            onChange: (e) => handleInputChange("natureOfTransfer", "personalData", e.target.value),
            placeholder: "List categories of personal data being transferred...",
            label: "Categories of personal data:",
            rows: 3,
          })}
          
          {renderSelect("natureOfTransfer", "frequency", {
            value: formData.natureOfTransfer.frequency,
            onChange: (e) => handleInputChange("natureOfTransfer", "frequency", e.target.value),
            label: "Frequency of transfer:",
            children: (
              <>
                <option value="">Select Frequency</option>
                {frequencyOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </>
            ),
          })}
          
          {renderSelect("natureOfTransfer", "specialCategoryData", {
            value: formData.natureOfTransfer.specialCategoryData,
            onChange: (e) => handleInputChange("natureOfTransfer", "specialCategoryData", e.target.value),
            label: "Will any special category data be transferred?",
            children: (
              <>
                <option value="">Select</option>
                {yesNoOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </>
            ),
          })}
          
          {renderCheckboxGroup("natureOfTransfer", "transferMechanisms", "Transfer mechanism used:", transferMechanisms, true)}
          
          {renderFileUpload("natureOfTransfer", "transferDocuments", "Please upload any transfer-related documents")}
        </div>
      </div>
    </div>
  );

  const renderStage2 = () => (
    <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
      <div className="bg-gray-50 dark:bg-gray-900 border border-[#828282] p-6 rounded-lg">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Legal Framework</h3>
        <div className="space-y-6">
          {renderTextarea("legalFramework", "destinationLaws", {
            value: formData.legalFramework.destinationLaws,
            onChange: (e) => handleInputChange("legalFramework", "destinationLaws", e.target.value),
            placeholder: "e.g., surveillance laws, FISA 702, Cloud Act, national security laws...",
            label: "What laws in the destination country may allow public authorities to access the data?",
            rows: 3,
          })}
          
          {renderSelect("legalFramework", "independentOversight", {
            value: formData.legalFramework.independentOversight,
            onChange: (e) => handleInputChange("legalFramework", "independentOversight", e.target.value),
            label: "Is there independent oversight of such access?",
            children: (
              <>
                <option value="">Select</option>
                {yesNoOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </>
            ),
          })}
          
          {renderTextarea("legalFramework", "legalRemedies", {
            value: formData.legalFramework.legalRemedies,
            onChange: (e) => handleInputChange("legalFramework", "legalRemedies", e.target.value),
            placeholder: "Describe available legal remedies for data subjects...",
            label: "Are there legal remedies available to data subjects?",
            rows: 3,
          })}
          
          {renderSelect("legalFramework", "pastAccessRequests", {
            value: formData.legalFramework.pastAccessRequests,
            onChange: (e) => handleInputChange("legalFramework", "pastAccessRequests", e.target.value),
            label: "Has the importer received government access requests in the past 5 years?",
            children: (
              <>
                <option value="">Select</option>
                {yesNoUnknownOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </>
            ),
          })}
          
          {renderSelect("legalFramework", "canResistRequests", {
            value: formData.legalFramework.canResistRequests,
            onChange: (e) => handleInputChange("legalFramework", "canResistRequests", e.target.value),
            label: "Can the importer legally resist such requests?",
            children: (
              <>
                <option value="">Select</option>
                {yesNoOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </>
            ),
          })}
          
          {renderSelect("legalFramework", "notificationCommitment", {
            value: formData.legalFramework.notificationCommitment,
            onChange: (e) => handleInputChange("legalFramework", "notificationCommitment", e.target.value),
            label: "Does the importer commit to notifying the exporter of any data access requests?",
            children: (
              <>
                <option value="">Select</option>
                {yesNoOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </>
            ),
          })}
          
          {renderFileUpload("legalFramework", "legalDocuments", "Please upload any legal framework documents")}
        </div>
      </div>
    </div>
  );

  const renderStage3 = () => (
    <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
      <div className="bg-gray-50 dark:bg-gray-900 border border-[#828282] p-6 rounded-lg">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Risk Assessment</h3>
        <div className="space-y-6">
          {renderRadioGroup("riskAssessment", "accessLikelihood", 
            "How likely is it that public authorities would access the transferred data?", 
            riskLevels, true
          )}
          
          {renderTextarea("riskAssessment", "likelihoodFactors", {
            value: formData.riskAssessment.likelihoodFactors,
            onChange: (e) => handleInputChange("riskAssessment", "likelihoodFactors", e.target.value),
            placeholder: "e.g., nature of data, importer's industry, geographic location, historical patterns...",
            label: "What factors influence this likelihood?",
            rows: 3,
          })}
          
          {renderRadioGroup("riskAssessment", "potentialImpact", 
            "What would be the potential impact on the data subject if unauthorized access occurred?", 
            riskLevels, true
          )}
          
          {renderRadioGroup("riskAssessment", "underminesProtection", 
            "Does the risk of access undermine the level of protection equivalent to the EU?", 
            protectionOptions, true
          )}
          
          {renderFileUpload("riskAssessment", "riskDocuments", "Please upload any risk assessment documents")}
        </div>
      </div>
    </div>
  );

  const renderStage4 = () => (
    <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
      <div className="bg-gray-50 dark:bg-gray-900 border border-[#828282] p-6 rounded-lg">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Supplementary Measures</h3>
        <div className="space-y-6">
          {renderTextarea("supplementaryMeasures", "dataEncrypted", {
            value: formData.supplementaryMeasures.dataEncrypted,
            onChange: (e) => handleInputChange("supplementaryMeasures", "dataEncrypted", e.target.value),
            placeholder: "Describe encryption methods used in transit and at rest...",
            label: "Is the data encrypted in transit and at rest?",
            rows: 2,
          })}
          
          {renderTextarea("supplementaryMeasures", "encryptionKeyHolder", {
            value: formData.supplementaryMeasures.encryptionKeyHolder,
            onChange: (e) => handleInputChange("supplementaryMeasures", "encryptionKeyHolder", e.target.value),
            placeholder: "Specify who holds the encryption keys...",
            label: "Who holds the encryption keys?",
            rows: 2,
          })}
          
          {renderTextarea("supplementaryMeasures", "pseudonymizationApplied", {
            value: formData.supplementaryMeasures.pseudonymizationApplied,
            onChange: (e) => handleInputChange("supplementaryMeasures", "pseudonymizationApplied", e.target.value),
            placeholder: "Describe pseudonymization techniques applied...",
            label: "Is pseudonymization applied before transfer?",
            rows: 2,
          })}
          
          {renderTextarea("supplementaryMeasures", "notificationObligations", {
            value: formData.supplementaryMeasures.notificationObligations,
            onChange: (e) => handleInputChange("supplementaryMeasures", "notificationObligations", e.target.value),
            placeholder: "Describe notification obligations for access requests...",
            label: "Are there obligations for the importer to notify about access requests?",
            rows: 2,
          })}
          
          {renderTextarea("supplementaryMeasures", "auditRights", {
            value: formData.supplementaryMeasures.auditRights,
            onChange: (e) => handleInputChange("supplementaryMeasures", "auditRights", e.target.value),
            placeholder: "Describe audit rights included in contracts...",
            label: "Are audit rights included in the contract?",
            rows: 2,
          })}
          
          {renderTextarea("supplementaryMeasures", "staffTraining", {
            value: formData.supplementaryMeasures.staffTraining,
            onChange: (e) => handleInputChange("supplementaryMeasures", "staffTraining", e.target.value),
            placeholder: "Describe staff training programs...",
            label: "Has staff been trained in data protection?",
            rows: 2,
          })}
          
          {renderTextarea("supplementaryMeasures", "internalPolicies", {
            value: formData.supplementaryMeasures.internalPolicies,
            onChange: (e) => handleInputChange("supplementaryMeasures", "internalPolicies", e.target.value),
            placeholder: "Describe internal policies for handling government requests...",
            label: "Are internal policies in place for handling government requests?",
            rows: 2,
          })}
          
          {renderFileUpload("supplementaryMeasures", "measuresDocuments", "Please upload any supplementary measures documents")}
        </div>
      </div>
    </div>
  );

  const renderStage5 = () => (
    <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
      <div className="bg-gray-50 dark:bg-gray-900 border border-[#828282] p-6 rounded-lg">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Conclusion & Documentation</h3>
        <div className="space-y-6">
          {renderRadioGroup("conclusion", "canProceed", 
            "Can the data transfer proceed with the current level of protection?", 
            conclusionOptions, true
          )}
          
          <div className="grid grid-cols-2 gap-4">
            {renderInput("conclusion", "assessedBy", {
              type: "text",
              value: formData.conclusion.assessedBy,
              onChange: (e) => handleInputChange("conclusion", "assessedBy", e.target.value),
              placeholder: "Enter name of assessor...",
              label: "Assessment completed by:",
            })}
            
            {renderInput("conclusion", "reviewedBy", {
              type: "text",
              value: formData.conclusion.reviewedBy,
              onChange: (e) => handleInputChange("conclusion", "reviewedBy", e.target.value),
              placeholder: "Enter name of reviewer...",
              label: "Reviewed by:",
            })}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {renderInput("conclusion", "assessmentDate", {
              type: "date",
              value: formData.conclusion.assessmentDate,
              onChange: (e) => handleInputChange("conclusion", "assessmentDate", e.target.value),
              label: "Date of assessment:",
            })}
            
            {renderInput("conclusion", "nextReviewDate", {
              type: "date",
              value: formData.conclusion.nextReviewDate,
              onChange: (e) => handleInputChange("conclusion", "nextReviewDate", e.target.value),
              label: "Next review date:",
            })}
          </div>
          
          {renderFileUpload("conclusion", "conclusionDocuments", "Please upload conclusion and documentation")}
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
    <div className="fixed inset-0 bg-black/30 backdrop-blur-[0.5px] flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 dark:border-gray-600 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-white dark:bg-gray-800 dark:border-gray-600 px-6 py-4 rounded-t-2xl border-b border-[#828282] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              TIA - {formData.basicInfo.tiaId}
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
  );
};

export default TIAModal;