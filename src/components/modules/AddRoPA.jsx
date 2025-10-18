import { useState, useEffect, useCallback } from "react";
import { X, Upload, FileText, Save, Clock } from "lucide-react";
import { useToast } from "../ui/ToastProvider";

const operationalLensSchema = {
  parse: (data) => {
    const requiredFields = [
      'actingRole', 'title', 'description', 'organizationName', 
      'accountableDepartment', 'departmentHead', 'countryOfProcessing',
      'stateProvince', 'usingDepartments', 'processOwner', 'processExpert',
      'dataProtectionOfficer', 'privacyManager'
    ];
    
    const errors = [];
    requiredFields.forEach(field => {
      if (!data[field] || (Array.isArray(data[field]) && data[field].length === 0)) {
        errors.push({
          path: [field],
          message: `${field} is required`
        });
      }
    });
    
    if (errors.length > 0) {
      throw { errors };
    }
    return data;
  }
};

const processGridSchema = {
  parse: (data) => {
    const requiredFields = [
      'dataSubjectTypes', 'numberOfDataSubjects', 'dataElements',
      'dataCollectionSource', 'countryOfDataCollection', 'purposeOfProcessing',
      'dataRetentionPeriod', 'deletionMethod', 'physicalApplications',
      'physicalApplicationIds', 'virtualApplications', 'virtualApplicationIds'
    ];
    
    const errors = [];
    requiredFields.forEach(field => {
      if (!data[field] || (Array.isArray(data[field]) && data[field].length === 0)) {
        errors.push({
          path: [field],
          message: `${field} is required`
        });
      }
    });
    
    // Validate asset count matches ID count
    if (data.physicalApplications.length !== data.physicalApplicationIds.length) {
      errors.push({
        path: ['physicalApplications'],
        message: 'Number of physical assets must equal number of physical asset IDs'
      });
    }
    
    if (data.virtualApplications.length !== data.virtualApplicationIds.length) {
      errors.push({
        path: ['virtualApplications'],
        message: 'Number of virtual assets must equal number of virtual asset IDs'
      });
    }
    
    if (errors.length > 0) {
      throw { errors };
    }
    return data;
  }
};

const defenseGridSchema = {
  parse: (data) => {
    const requiredFields = [
      'securityMeasures', 'accessMeasures', 'complianceMeasures',
      'dataGovernance', 'operationalMeasures', 'transparencyMeasures',
      'ethicalMeasures', 'physicalSecurityMeasures', 'technicalMeasures',
      'riskManagementMeasures'
    ];
    
    const errors = [];
    requiredFields.forEach(field => {
      if (!data[field] || (Array.isArray(data[field]) && data[field].length === 0)) {
        errors.push({
          path: [field],
          message: `${field} is required`
        });
      }
    });
    
    if (errors.length > 0) {
      throw { errors };
    }
    return data;
  }
};

const dataTransitSchema = {
  parse: (data) => {
    const requiredFields = [
      'willDataBeTransferred', 'typeOfDataTransfer', 'purposeOfTransfer',
      'legalBasisForTransfer', 'importerName', 'importerLocation',
      'importerRole', 'importerRetentionPeriod', 'importerDataRights',
      'transferFrequency', 'importerSecuritySafeguards', 'exporterName',
      'exporterLocation', 'exporterRole', 'exporterRetentionPeriod',
      'exporterDataRights', 'exporterSecuritySafeguards'
    ];
    
    const errors = [];
    requiredFields.forEach(field => {
      if (!data[field] || (Array.isArray(data[field]) && data[field].length === 0)) {
        errors.push({
          path: [field],
          message: `${field} is required`
        });
      }
    });
    
    if (errors.length > 0) {
      throw { errors };
    }
    return data;
  }
};

const AddROPAModal = ({ isOpen, onClose, onROPACreated }) => {
  const [currentStage, setCurrentStage] = useState("infovoyage");
  const [currentTab, setCurrentTab] = useState("operationalLens");
  const [hoveredStep, setHoveredStep] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [errors, setErrors] = useState({});
//   const { addToast } = useToast();

  // Form data state with ALL fields
  const [formData, setFormData] = useState({
    // Level Information
    levelInfo: {
      mainLevel: "",
      subLevel: "",
      levelPath: "",
    },
    
    // Infovoyage Stage - Operational Lens
    operationalLens: {
      actingRole: "",
      title: "",
      description: "",
      organizationName: "",
      accountableDepartment: "",
      departmentHead: "",
      countryOfProcessing: [],
      stateProvince: [],
      usingDepartments: [],
      processOwner: "",
      processExpert: [],
      dataProtectionOfficer: "",
      privacyManager: "",
      additionalComments: ""
    },
    
    // Process Grid
    processGrid: {
      dataSubjectTypes: [],
      numberOfDataSubjects: "",
      dataElements: [],
      dataCollectionSource: [],
      countryOfDataCollection: [],
      purposeOfProcessing: [],
      dataRetentionPeriod: "",
      deletionMethod: "",
      physicalApplications: [],
      physicalApplicationIds: [],
      virtualApplications: [],
      virtualApplicationIds: [],
      additionalComments: ""
    },
    
    // Defense Grid
    defenseGrid: {
      securityMeasures: [],
      accessMeasures: [],
      complianceMeasures: [],
      dataGovernance: [],
      operationalMeasures: [],
      transparencyMeasures: [],
      ethicalMeasures: [],
      physicalSecurityMeasures: [],
      technicalMeasures: [],
      riskManagementMeasures: [],
      additionalComments: ""
    },
    
    // Data Transit
    dataTransit: {
      willDataBeTransferred: "",
      typeOfDataTransfer: "",
      purposeOfTransfer: "",
      legalBasisForTransfer: "",
      importerName: "",
      importerLocation: "",
      importerRole: "",
      importerRetentionPeriod: "",
      importerDataRights: [],
      transferFrequency: "",
      importerSecuritySafeguards: [],
      exporterName: "",
      exporterLocation: "",
      exporterRole: "",
      exporterRetentionPeriod: "",
      exporterDataRights: [],
      exporterSecuritySafeguards: [],
      nextReviewDate: ""
    },
    
    // CheckSync Stage
    checkSyncActions: [],
    
    // Beam Stage
    beamReview: {
      reviewComments: "",
      moveToOffDoff: false
    },
    
    // OffDoff Stage
    offDoff: {
      completionDate: "",
      finalComments: ""
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
      console.log("Auto-saved:", formData);
    } catch (error) {
      console.error("Auto-save failed:", error);
    } finally {
      setSaving(false);
    }
  };

  const stages = [
    { id: "infovoyage", title: "Infovoyage", shortTitle: "Info" },
    { id: "checksync", title: "CheckSync", shortTitle: "Check" },
    { id: "beam", title: "Beam", shortTitle: "Beam" },
    { id: "offdoff", title: "OffDoff", shortTitle: "Off" },
  ];

  const infovoyageTabs = [
    { id: "operationalLens", title: "Operational Lens" },
    { id: "processGrid", title: "Process Grid" },
    { id: "defenseGrid", title: "Defense Grid" },
    { id: "dataTransit", title: "Data Transit" },
  ];

  // ALL Dropdown options as per your requirements
  const actingRoles = ["Fiduciary", "Processor", "Joint Fiduciary", "Joint Processor"];
  const mainLevels = ["1. HR Onboarding", "2. HR Hiring", "3. HR Firing", "4. Marketing", "5. Sales", "6. Finance"];
  const subLevels = ["1.1", "1.2", "1.3", "1.4", "1.5", "1.6", "1.7", "1.8", "1.9", "1.10"];
  const organizations = ["TechCorp Ltd", "DataSystems Inc", "PrivacyFirst Org", "Global Solutions"];
  const departments = ["IT", "HR", "Finance", "Marketing", "Legal", "Operations", "Sales"];
  const departmentHeads = ["John Smith - IT Head", "Sarah Johnson - HR Head", "Mike Brown - Finance Head", "Lisa Wang - Marketing Head"];
  const countries = ["United States", "India", "United Kingdom", "Germany", "France", "Japan", "Canada", "Australia"];
  const states = ["California", "Texas", "New York", "Maharashtra", "Karnataka", "Delhi", "London", "Berlin"];
  const processOwners = ["Alice Cooper - Process Manager", "Bob Wilson - Operations Lead", "Carol Davis - Department Head"];
  const processExperts = ["Dr. James Smith - Data Expert", "Prof. Maria Garcia - Privacy Specialist", "David Lee - Security Analyst"];
  const dpoOptions = ["John Doe - DPO", "Jane Smith - DPO", "Robert Brown - DPO"];
  const privacyManagers = ["Alice Johnson - Privacy Manager", "Bob Wilson - Privacy Manager", "Carol Davis - Privacy Manager"];
  
  const dataSubjectTypes = ["Employees", "Customers", "Vendors", "Patients", "Students", "Visitors"];
  const numberOfDataSubjects = ["1-100", "101-500", "501-1000", "1001-5000", "5001-10000", "10000+"];
  const dataElements = ["Name", "Email", "Phone", "Address", "Health Data", "Financial Data", "Biometric Data", "Location Data"];
  const dataCollectionSources = ["Direct from individual", "Public sources", "Third parties", "Cookies", "Sensors", "Surveys"];
  const purposes = ["HR Management", "Marketing", "Service Delivery", "Legal Compliance", "Research", "Security", "Analytics"];
  const retentionPeriods = ["1 month", "3 months", "6 months", "1 year", "2 years", "5 years", "10 years", "Indefinite"];
  const deletionMethods = ["Secure deletion", "Anonymization", "Permanent erasure", "Archiving"];
  const physicalApplications = ["Laptops", "Servers", "Mobile Devices", "Storage Devices", "Workstations", "Network Equipment"];
  const physicalApplicationIds = ["LAP-001", "LAP-002", "SRV-001", "MBL-001", "STR-001", "WRK-001", "NET-001"];
  const virtualApplications = ["Cloud Storage", "CRM", "ERP", "Database", "Analytics Platform", "Email System"];
  const virtualApplicationIds = ["CLD-001", "CRM-001", "ERP-001", "DB-001", "ANA-001", "EML-001"];
  
  const securityMeasures = ["Encryption", "Firewalls", "Access Controls", "Intrusion Detection", "Backup Systems", "Anti-virus"];
  const accessMeasures = ["Role-based Access", "Multi-factor Auth", "Access Logging", "Privilege Management", "Session Timeout"];
  const complianceMeasures = ["GDPR Compliance", "HIPAA Compliance", "CCPA Compliance", "SOC2 Certification", "ISO 27001"];
  const dataGovernance = ["Data Quality", "Data Lifecycle", "Data Classification", "Data Retention Policy", "Data Ownership"];
  const operationalMeasures = ["Incident Response", "Change Management", "Training", "Audit Trail", "Business Continuity"];
  const transparencyMeasures = ["Privacy Notices", "Consent Management", "Data Subject Rights", "Privacy Policy", "Cookie Policy"];
  const ethicalMeasures = ["Fairness", "Non-discrimination", "Accountability", "Transparency", "Human Oversight"];
  const physicalSecurityMeasures = ["Access Control", "Surveillance", "Secure Facilities", "Biometric Access", "Visitor Management"];
  const technicalMeasures = ["Encryption", "Pseudonymization", "Access Logs", "Data Masking", "Tokenization"];
  const riskManagementMeasures = ["Risk Assessment", "DPIA", "Audit", "Vendor Assessment", "Compliance Check"];
  
  const yesNoOptions = ["Yes", "No"];
  const transferTypes = ["Cross-border", "Third-party", "Intra-group", "Cloud Storage", "Processor Transfer"];
  const legalBases = ["Consent", "Contract", "Legal Obligation", "Legitimate Interest", "Vital Interest", "Public Interest"];
  const frequencies = ["One-time", "Daily", "Weekly", "Monthly", "Quarterly", "Yearly"];
  const dataRights = ["Access", "Rectification", "Erasure", "Restriction", "Portability", "Objection", "Consent Withdrawal"];

  const validateTab = (tab) => {
    try {
      let schema;
      let dataToValidate;

      switch (tab) {
        case "operationalLens":
          schema = operationalLensSchema;
          dataToValidate = formData.operationalLens;
          break;
        case "processGrid":
          schema = processGridSchema;
          dataToValidate = formData.processGrid;
          break;
        case "defenseGrid":
          schema = defenseGridSchema;
          dataToValidate = formData.defenseGrid;
          break;
        case "dataTransit":
          schema = dataTransitSchema;
          dataToValidate = formData.dataTransit;
          break;
        default:
          return true;
      }

      schema.parse(dataToValidate);
      setErrors({});
    //   addToast("success", "Validation passed!");
      return true;
    } catch (error) {
      const newErrors = {};
      if (error.errors) {
        error.errors.forEach((err) => {
          const path = err.path.join(".");
          newErrors[path] = err.message;
        });
      }
      setErrors(newErrors);
    //   addToast("error", "Please fill all required fields correctly");
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

    if (errors[`${section}.${field}`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`${section}.${field}`];
        return newErrors;
      });
    }
  };

  const handleArrayChange = (section, field, value, isChecked) => {
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

  const getFieldError = (section, field) => {
    const path = `${section}.${field}`;
    return errors[path] || null;
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

  const renderMultiSelect = (section, field, label, options, required = true) => {
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
        <div className="space-y-2 max-h-40 overflow-y-auto border border-[#828282] rounded-md p-3">
          {options.map((option) => (
            <label key={option} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedValues.includes(option)}
                onChange={(e) => handleArrayChange(section, field, option, e.target.checked)}
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

  // Level Management
  const handleLevelChange = (mainLevel, subLevel = "") => {
    const levelPath = subLevel ? `${mainLevel} - ${subLevel}` : mainLevel;
    handleInputChange("levelInfo", "mainLevel", mainLevel);
    handleInputChange("levelInfo", "subLevel", subLevel);
    handleInputChange("levelInfo", "levelPath", levelPath);
  };

  // CheckSync Actions Management
  const [actionItems, setActionItems] = useState([]);

  const addActionItem = () => {
    const newAction = {
      id: `ACTION-${Date.now()}`,
      title: "",
      description: "",
      documents: [],
      status: "pending"
    };
    setActionItems([...actionItems, newAction]);
  };

  const removeActionItem = (id) => {
    setActionItems(actionItems.filter(action => action.id !== id));
  };

  const updateActionItem = (id, field, value) => {
    setActionItems(actionItems.map(action => 
      action.id === id ? { ...action, [field]: value } : action
    ));
  };

  const handleFileUpload = (actionId, files) => {
    console.log("Uploading files for action:", actionId, files);
    // addToast("success", "Files uploaded successfully!");
  };

  // Stage Navigation
  const handleNextStage = () => {
    if (currentStage === "infovoyage") {
      if (!validateTab(currentTab)) return;
      
      const currentTabIndex = infovoyageTabs.findIndex(tab => tab.id === currentTab);
      if (currentTabIndex < infovoyageTabs.length - 1) {
        setCurrentTab(infovoyageTabs[currentTabIndex + 1].id);
      } else {
        setCurrentStage("checksync");
      }
    } else {
      const currentStageIndex = stages.findIndex(stage => stage.id === currentStage);
      if (currentStageIndex < stages.length - 1) {
        setCurrentStage(stages[currentStageIndex + 1].id);
      }
    }
  };

  const handlePreviousStage = () => {
    if (currentStage === "infovoyage") {
      const currentTabIndex = infovoyageTabs.findIndex(tab => tab.id === currentTab);
      if (currentTabIndex > 0) {
        setCurrentTab(infovoyageTabs[currentTabIndex - 1].id);
      }
    } else {
      const currentStageIndex = stages.findIndex(stage => stage.id === currentStage);
      if (currentStageIndex > 0) {
        setCurrentStage(stages[currentStageIndex - 1].id);
        if (stages[currentStageIndex - 1].id === "infovoyage") {
          setCurrentTab("dataTransit");
        }
      }
    }
  };

  const handleCreateRoPA = async () => {
    try {
      setLoading(true);
      console.log("Creating RoPA with data:", formData);
    //   addToast("success", "RoPA created successfully!");
      resetForm();
      onClose();
      if (onROPACreated) {
        onROPACreated(formData);
      }
    } catch (error) {
      console.error("Failed to create RoPA:", error);
    //   addToast("error", "Failed to create RoPA");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      levelInfo: { mainLevel: "", subLevel: "", levelPath: "" },
      operationalLens: {
        actingRole: "", title: "", description: "", organizationName: "", 
        accountableDepartment: "", departmentHead: "", countryOfProcessing: [], 
        stateProvince: [], usingDepartments: [], processOwner: "", processExpert: [], 
        dataProtectionOfficer: "", privacyManager: "", additionalComments: ""
      },
      processGrid: {
        dataSubjectTypes: [], numberOfDataSubjects: "", dataElements: [], 
        dataCollectionSource: [], countryOfDataCollection: [], purposeOfProcessing: [], 
        dataRetentionPeriod: "", deletionMethod: "", physicalApplications: [], 
        physicalApplicationIds: [], virtualApplications: [], virtualApplicationIds: [], 
        additionalComments: ""
      },
      defenseGrid: {
        securityMeasures: [], accessMeasures: [], complianceMeasures: [], 
        dataGovernance: [], operationalMeasures: [], transparencyMeasures: [], 
        ethicalMeasures: [], physicalSecurityMeasures: [], technicalMeasures: [], 
        riskManagementMeasures: [], additionalComments: ""
      },
      dataTransit: {
        willDataBeTransferred: "", typeOfDataTransfer: "", purposeOfTransfer: "", 
        legalBasisForTransfer: "", importerName: "", importerLocation: "", 
        importerRole: "", importerRetentionPeriod: "", importerDataRights: [], 
        transferFrequency: "", importerSecuritySafeguards: [], exporterName: "", 
        exporterLocation: "", exporterRole: "", exporterRetentionPeriod: "", 
        exporterDataRights: [], exporterSecuritySafeguards: [], nextReviewDate: ""
      },
      checkSyncActions: [],
      beamReview: { reviewComments: "", moveToOffDoff: false },
      offDoff: { completionDate: "", finalComments: "" }
    });
    setActionItems([]);
    setCurrentStage("infovoyage");
    setCurrentTab("operationalLens");
    setErrors({});
  };

  // Render Components for each section
  const renderLevelSection = () => (
    <div className="bg-gray-50 dark:bg-gray-900 border border-[#828282] p-4 rounded-lg mb-4">
      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Level Information</h3>
      <div className="grid grid-cols-2 gap-4">
        {renderSelect("levelInfo", "mainLevel", {
          value: formData.levelInfo.mainLevel,
          onChange: (e) => handleLevelChange(e.target.value, formData.levelInfo.subLevel),
          label: "Main Level",
          children: (
            <>
              <option value="">Select Main Level</option>
              {mainLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </>
          ),
        })}
        {renderSelect("levelInfo", "subLevel", {
          value: formData.levelInfo.subLevel,
          onChange: (e) => handleLevelChange(formData.levelInfo.mainLevel, e.target.value),
          label: "Sub Level",
          required: false,
          children: (
            <>
              <option value="">Select Sub Level</option>
              {subLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </>
          ),
        })}
        {renderInput("levelInfo", "levelPath", {
          type: "text",
          value: formData.levelInfo.levelPath,
          disabled: true,
          label: "Level Path",
          required: false,
        })}
      </div>
    </div>
  );

  const renderOperationalLens = () => (
    <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
      {renderLevelSection()}
      <div className="bg-gray-50 dark:bg-gray-900 border border-[#828282] p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Operational Lens</h3>
        <div className="grid grid-cols-2 gap-4">
          {renderSelect("operationalLens", "actingRole", {
            value: formData.operationalLens.actingRole,
            onChange: (e) => handleInputChange("operationalLens", "actingRole", e.target.value),
            label: "Acting Role",
            children: (
              <>
                <option value="">Select Role</option>
                {actingRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </>
            ),
          })}
          {renderInput("operationalLens", "title", {
            type: "text",
            value: formData.operationalLens.title,
            onChange: (e) => handleInputChange("operationalLens", "title", e.target.value),
            placeholder: "HR Employee Onboarding Process",
            label: "Title of Processing Activity",
          })}
          {renderTextarea("operationalLens", "description", {
            value: formData.operationalLens.description,
            onChange: (e) => handleInputChange("operationalLens", "description", e.target.value),
            placeholder: "Detailed description of the processing activity...",
            label: "Description of Processing Activity",
            rows: 3,
          })}
          {renderSelect("operationalLens", "organizationName", {
            value: formData.operationalLens.organizationName,
            onChange: (e) => handleInputChange("operationalLens", "organizationName", e.target.value),
            label: "Name of Organization",
            children: (
              <>
                <option value="">Select Organization</option>
                {organizations.map(org => (
                  <option key={org} value={org}>{org}</option>
                ))}
              </>
            ),
          })}
          {renderSelect("operationalLens", "accountableDepartment", {
            value: formData.operationalLens.accountableDepartment,
            onChange: (e) => handleInputChange("operationalLens", "accountableDepartment", e.target.value),
            label: "Accountable Department",
            children: (
              <>
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </>
            ),
          })}
          {renderSelect("operationalLens", "departmentHead", {
            value: formData.operationalLens.departmentHead,
            onChange: (e) => handleInputChange("operationalLens", "departmentHead", e.target.value),
            label: "Department Head",
            children: (
              <>
                <option value="">Select Department Head</option>
                {departmentHeads.map(head => (
                  <option key={head} value={head}>{head}</option>
                ))}
              </>
            ),
          })}
          {renderMultiSelect("operationalLens", "countryOfProcessing", "Country of Processing Activity", countries)}
          {renderMultiSelect("operationalLens", "stateProvince", "State/Province", states)}
          {renderMultiSelect("operationalLens", "usingDepartments", "Which department uses this processing activity?", departments)}
          {renderSelect("operationalLens", "processOwner", {
            value: formData.operationalLens.processOwner,
            onChange: (e) => handleInputChange("operationalLens", "processOwner", e.target.value),
            label: "Process Owner",
            children: (
              <>
                <option value="">Select Process Owner</option>
                {processOwners.map(owner => (
                  <option key={owner} value={owner}>{owner}</option>
                ))}
              </>
            ),
          })}
          {renderMultiSelect("operationalLens", "processExpert", "Process Expert", processExperts)}
          {renderSelect("operationalLens", "dataProtectionOfficer", {
            value: formData.operationalLens.dataProtectionOfficer,
            onChange: (e) => handleInputChange("operationalLens", "dataProtectionOfficer", e.target.value),
            label: "Data Protection Officer (DPO)",
            children: (
              <>
                <option value="">Select DPO</option>
                {dpoOptions.map(dpo => (
                  <option key={dpo} value={dpo}>{dpo}</option>
                ))}
              </>
            ),
          })}
          {renderSelect("operationalLens", "privacyManager", {
            value: formData.operationalLens.privacyManager,
            onChange: (e) => handleInputChange("operationalLens", "privacyManager", e.target.value),
            label: "Privacy Manager",
            children: (
              <>
                <option value="">Select Privacy Manager</option>
                {privacyManagers.map(manager => (
                  <option key={manager} value={manager}>{manager}</option>
                ))}
              </>
            ),
          })}
          {renderTextarea("operationalLens", "additionalComments", {
            value: formData.operationalLens.additionalComments,
            onChange: (e) => handleInputChange("operationalLens", "additionalComments", e.target.value),
            placeholder: "Any additional comments...",
            label: "Additional Comments",
            rows: 2,
            required: false,
          })}
        </div>
      </div>
    </div>
  );

  const renderProcessGrid = () => (
    <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
      <div className="bg-gray-50 dark:bg-gray-900 border border-[#828282] p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Process Grid</h3>
        <div className="grid grid-cols-2 gap-4">
          {renderMultiSelect("processGrid", "dataSubjectTypes", "Type of Data Subjects", dataSubjectTypes)}
          {renderSelect("processGrid", "numberOfDataSubjects", {
            value: formData.processGrid.numberOfDataSubjects,
            onChange: (e) => handleInputChange("processGrid", "numberOfDataSubjects", e.target.value),
            label: "Number of Data Subjects",
            children: (
              <>
                <option value="">Select Range</option>
                {numberOfDataSubjects.map(range => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </>
            ),
          })}
          {renderMultiSelect("processGrid", "dataElements", "Data Elements", dataElements)}
          {renderMultiSelect("processGrid", "dataCollectionSource", "Data Collection Source", dataCollectionSources)}
          {renderMultiSelect("processGrid", "countryOfDataCollection", "Country of Data Collection", countries)}
          {renderMultiSelect("processGrid", "purposeOfProcessing", "Purpose of Processing", purposes)}
          {renderSelect("processGrid", "dataRetentionPeriod", {
            value: formData.processGrid.dataRetentionPeriod,
            onChange: (e) => handleInputChange("processGrid", "dataRetentionPeriod", e.target.value),
            label: "Data Retention Period",
            children: (
              <>
                <option value="">Select Retention Period</option>
                {retentionPeriods.map(period => (
                  <option key={period} value={period}>{period}</option>
                ))}
              </>
            ),
          })}
          {renderSelect("processGrid", "deletionMethod", {
            value: formData.processGrid.deletionMethod,
            onChange: (e) => handleInputChange("processGrid", "deletionMethod", e.target.value),
            label: "Deletion Method",
            children: (
              <>
                <option value="">Select Deletion Method</option>
                {deletionMethods.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </>
            ),
          })}
          {renderMultiSelect("processGrid", "physicalApplications", "Physical Application/Asset Used", physicalApplications)}
          {renderMultiSelect("processGrid", "physicalApplicationIds", "Physical Application/Asset ID", physicalApplicationIds)}
          {renderMultiSelect("processGrid", "virtualApplications", "Virtual Applications/Assets Used", virtualApplications)}
          {renderMultiSelect("processGrid", "virtualApplicationIds", "Virtual Application/Asset ID", virtualApplicationIds)}
          {renderTextarea("processGrid", "additionalComments", {
            value: formData.processGrid.additionalComments,
            onChange: (e) => handleInputChange("processGrid", "additionalComments", e.target.value),
            placeholder: "Any additional comments...",
            label: "Additional Comments",
            rows: 2,
            required: false,
          })}
        </div>
      </div>
    </div>
  );

  const renderDefenseGrid = () => (
    <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
      <div className="bg-gray-50 dark:bg-gray-900 border border-[#828282] p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Defense Grid</h3>
        <div className="grid grid-cols-2 gap-4">
          {renderMultiSelect("defenseGrid", "securityMeasures", "Security Measures", securityMeasures)}
          {renderMultiSelect("defenseGrid", "accessMeasures", "Access Measures", accessMeasures)}
          {renderMultiSelect("defenseGrid", "complianceMeasures", "Compliance Measures", complianceMeasures)}
          {renderMultiSelect("defenseGrid", "dataGovernance", "Data Governance", dataGovernance)}
          {renderMultiSelect("defenseGrid", "operationalMeasures", "Operational Measures", operationalMeasures)}
          {renderMultiSelect("defenseGrid", "transparencyMeasures", "Transparency Measures", transparencyMeasures)}
          {renderMultiSelect("defenseGrid", "ethicalMeasures", "Ethical Measures", ethicalMeasures)}
          {renderMultiSelect("defenseGrid", "physicalSecurityMeasures", "Physical Security Measures", physicalSecurityMeasures)}
          {renderMultiSelect("defenseGrid", "technicalMeasures", "Technical Measures", technicalMeasures)}
          {renderMultiSelect("defenseGrid", "riskManagementMeasures", "Risk Management Measures", riskManagementMeasures)}
          {renderTextarea("defenseGrid", "additionalComments", {
            value: formData.defenseGrid.additionalComments,
            onChange: (e) => handleInputChange("defenseGrid", "additionalComments", e.target.value),
            placeholder: "Any additional comments...",
            label: "Additional Comments",
            rows: 2,
            required: false,
          })}
        </div>
      </div>
    </div>
  );

  const renderDataTransit = () => (
    <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
      <div className="bg-gray-50 dark:bg-gray-900 border border-[#828282] p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Data Transit</h3>
        <div className="grid grid-cols-2 gap-4">
          {renderSelect("dataTransit", "willDataBeTransferred", {
            value: formData.dataTransit.willDataBeTransferred,
            onChange: (e) => handleInputChange("dataTransit", "willDataBeTransferred", e.target.value),
            label: "Will the data be transferred?",
            children: (
              <>
                <option value="">Select</option>
                {yesNoOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </>
            ),
          })}
          {renderSelect("dataTransit", "typeOfDataTransfer", {
            value: formData.dataTransit.typeOfDataTransfer,
            onChange: (e) => handleInputChange("dataTransit", "typeOfDataTransfer", e.target.value),
            label: "Type of Data Transfer",
            children: (
              <>
                <option value="">Select Type</option>
                {transferTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </>
            ),
          })}
          {renderSelect("dataTransit", "purposeOfTransfer", {
            value: formData.dataTransit.purposeOfTransfer,
            onChange: (e) => handleInputChange("dataTransit", "purposeOfTransfer", e.target.value),
            label: "Purpose of the Transfer",
            children: (
              <>
                <option value="">Select Purpose</option>
                {purposes.map(purpose => (
                  <option key={purpose} value={purpose}>{purpose}</option>
                ))}
              </>
            ),
          })}
          {renderSelect("dataTransit", "legalBasisForTransfer", {
            value: formData.dataTransit.legalBasisForTransfer,
            onChange: (e) => handleInputChange("dataTransit", "legalBasisForTransfer", e.target.value),
            label: "Legal Basis for the Transfer",
            children: (
              <>
                <option value="">Select Legal Basis</option>
                {legalBases.map(basis => (
                  <option key={basis} value={basis}>{basis}</option>
                ))}
              </>
            ),
          })}
          
          {/* Importer Section */}
          <div className="col-span-2 border-t pt-4 mt-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Importer Details</h4>
          </div>
          {renderInput("dataTransit", "importerName", {
            type: "text",
            value: formData.dataTransit.importerName,
            onChange: (e) => handleInputChange("dataTransit", "importerName", e.target.value),
            placeholder: "Importer Organization Name",
            label: "Importer Name",
          })}
          {renderSelect("dataTransit", "importerLocation", {
            value: formData.dataTransit.importerLocation,
            onChange: (e) => handleInputChange("dataTransit", "importerLocation", e.target.value),
            label: "Importer Location",
            children: (
              <>
                <option value="">Select Location</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </>
            ),
          })}
          {renderSelect("dataTransit", "importerRole", {
            value: formData.dataTransit.importerRole,
            onChange: (e) => handleInputChange("dataTransit", "importerRole", e.target.value),
            label: "Importer Role",
            children: (
              <>
                <option value="">Select Role</option>
                {actingRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </>
            ),
          })}
          {renderInput("dataTransit", "importerRetentionPeriod", {
            type: "text",
            value: formData.dataTransit.importerRetentionPeriod,
            onChange: (e) => handleInputChange("dataTransit", "importerRetentionPeriod", e.target.value),
            placeholder: "e.g., 2 years",
            label: "Retention Period",
          })}
          {renderMultiSelect("dataTransit", "importerDataRights", "Data Principal Rights by Importer", dataRights)}
          {renderSelect("dataTransit", "transferFrequency", {
            value: formData.dataTransit.transferFrequency,
            onChange: (e) => handleInputChange("dataTransit", "transferFrequency", e.target.value),
            label: "Frequency of Transfer",
            children: (
              <>
                <option value="">Select Frequency</option>
                {frequencies.map(freq => (
                  <option key={freq} value={freq}>{freq}</option>
                ))}
              </>
            ),
          })}
          {renderMultiSelect("dataTransit", "importerSecuritySafeguards", "Security Safeguards by Importer", securityMeasures)}
          
          {/* Exporter Section */}
          <div className="col-span-2 border-t pt-4 mt-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Exporter Details</h4>
          </div>
          {renderInput("dataTransit", "exporterName", {
            type: "text",
            value: formData.dataTransit.exporterName,
            onChange: (e) => handleInputChange("dataTransit", "exporterName", e.target.value),
            placeholder: "Exporter Organization Name",
            label: "Exporter Name",
          })}
          {renderSelect("dataTransit", "exporterLocation", {
            value: formData.dataTransit.exporterLocation,
            onChange: (e) => handleInputChange("dataTransit", "exporterLocation", e.target.value),
            label: "Exporter Location",
            children: (
              <>
                <option value="">Select Location</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </>
            ),
          })}
          {renderSelect("dataTransit", "exporterRole", {
            value: formData.dataTransit.exporterRole,
            onChange: (e) => handleInputChange("dataTransit", "exporterRole", e.target.value),
            label: "Exporter Role",
            children: (
              <>
                <option value="">Select Role</option>
                {actingRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </>
            ),
          })}
          {renderInput("dataTransit", "exporterRetentionPeriod", {
            type: "text",
            value: formData.dataTransit.exporterRetentionPeriod,
            onChange: (e) => handleInputChange("dataTransit", "exporterRetentionPeriod", e.target.value),
            placeholder: "e.g., 1 year",
            label: "Retention period by exporter",
          })}
          {renderMultiSelect("dataTransit", "exporterDataRights", "Data Principal Rights by exporter", dataRights)}
          {renderMultiSelect("dataTransit", "exporterSecuritySafeguards", "Security Safeguards by exporter", securityMeasures)}
          
          {renderInput("dataTransit", "nextReviewDate", {
            type: "date",
            value: formData.dataTransit.nextReviewDate,
            onChange: (e) => handleInputChange("dataTransit", "nextReviewDate", e.target.value),
            label: "Next Review Date",
          })}
        </div>
      </div>
    </div>
  );

  const renderCheckSync = () => (
    <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
      <div className="bg-gray-50 dark:bg-gray-900 border border-[#828282] p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">CheckSync - Action Items</h3>
        
        {/* Show all tabs data in read-only mode */}
        <div className="mb-6 grid grid-cols-4 gap-2">
          {infovoyageTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`px-3 py-2 text-sm rounded-md cursor-pointer ${
                currentTab === tab.id 
                  ? "bg-[#5DEE92] text-black" 
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              {tab.title}
            </button>
          ))}
        </div>

        {/* Action Items */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Action Items</h4>
            <button
              onClick={addActionItem}
              className="px-4 py-2 bg-[#5DEE92] text-black rounded-md text-sm font-medium hover:bg-green-500 cursor-pointer transition"
            >
              + Add Action Item
            </button>
          </div>

          {actionItems.map((action, index) => (
            <div key={action.id} className="border border-[#828282] rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <h5 className="font-medium">Action Item {index + 1}</h5>
                <button
                  onClick={() => removeActionItem(action.id)}
                  className="text-red-500 text-sm hover:underline cursor-pointer"
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={action.title}
                  onChange={(e) => updateActionItem(action.id, "title", e.target.value)}
                  placeholder="Action title"
                  className="w-full px-3 py-2 border border-[#828282] rounded-md"
                />
                <select
                  value={action.status}
                  onChange={(e) => updateActionItem(action.id, "status", e.target.value)}
                  className="w-full px-3 py-2 border border-[#828282] rounded-md"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <textarea
                  value={action.description}
                  onChange={(e) => updateActionItem(action.id, "description", e.target.value)}
                  placeholder="Action description"
                  rows={2}
                  className="col-span-2 w-full px-3 py-2 border border-[#828282] rounded-md"
                />
              </div>
              
              {/* Document Upload */}
              <div className="mt-3">
                <label className="block text-sm font-medium mb-2">Upload Documents</label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    multiple
                    onChange={(e) => handleFileUpload(action.id, e.target.files)}
                    accept=".pdf,.doc,.docx,.xlsx,.jpg,.jpeg,.png,.svg,.txt"
                    className="hidden"
                    id={`file-upload-${action.id}`}
                  />
                  <label
                    htmlFor={`file-upload-${action.id}`}
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="w-6 h-6 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Click to upload documents
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      PDF, Word, Excel, Images, etc.
                    </span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBeam = () => (
    <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
      <div className="bg-gray-50 dark:bg-gray-900 border border-[#828282] p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Beam Stage</h3>
        <div className="space-y-4">
          <div className="flex gap-4">
            <button
              onClick={() => setCurrentStage("infovoyage")}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer transition"
            >
              Review
            </button>
            <button
              onClick={() => handleInputChange("beamReview", "moveToOffDoff", true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer transition"
            >
              Move to OffDoff
            </button>
          </div>
          
          {renderTextarea("beamReview", "reviewComments", {
            value: formData.beamReview.reviewComments,
            onChange: (e) => handleInputChange("beamReview", "reviewComments", e.target.value),
            placeholder: "Enter review comments...",
            label: "Review Comments",
            rows: 4,
            required: false,
          })}
        </div>
      </div>
    </div>
  );

  const renderOffDoff = () => (
    <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
      <div className="bg-gray-50 dark:bg-gray-900 border border-[#828282] p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">OffDoff Stage</h3>
        <div className="grid grid-cols-2 gap-4">
          {renderInput("offDoff", "completionDate", {
            type: "date",
            value: formData.offDoff.completionDate,
            onChange: (e) => handleInputChange("offDoff", "completionDate", e.target.value),
            label: "Completion Date",
          })}
          {renderTextarea("offDoff", "finalComments", {
            value: formData.offDoff.finalComments,
            onChange: (e) => handleInputChange("offDoff", "finalComments", e.target.value),
            placeholder: "Final comments...",
            label: "Final Comments",
            rows: 3,
            required: false,
          })}
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
                ? "bg-[#5DEE92] text-black px-4 py-2 rounded-full min-w-[120px] h-10 scale-105 shadow-md"
                : stage.id === "infovoyage" && infovoyageTabs.some(tab => tab.id === currentTab)
                ? "bg-[#5DEE92] text-black w-10 h-10 rounded-full hover:px-4 hover:min-w-[100px] hover:scale-105"
                : "bg-white text-black border-4 border-[#5DEE92] w-10 h-10 rounded-full hover:px-4 hover:min-w-[120px] hover:scale-105"
            }`}
            onMouseEnter={() => setHoveredStep(stage.id)}
            onMouseLeave={() => setHoveredStep(null)}
          >
            <span className="transition-opacity duration-500 ease-in-out">
              {stage.id === currentStage
                ? stage.title
                : hoveredStep === stage.id
                ? stage.shortTitle
                : stage.id === "infovoyage" && infovoyageTabs.some(tab => tab.id === currentTab)
                ? "✓"
                : index + 1}
            </span>
          </div>
          {index < stages.length - 1 && (
            <div
              className={`w-8 lg:w-24 h-0.5 mx-2 rounded-full transition-colors duration-500 ease-in-out
              ${stage.id === "infovoyage" && infovoyageTabs.some(tab => tab.id === currentTab) ? "bg-[#5DEE92]" : "bg-gray-200"}`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const InfovoyageTabsBar = () => (
    <div className="flex space-x-2 mb-4">
      {infovoyageTabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setCurrentTab(tab.id)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            currentTab === tab.id
              ? "bg-[#5DEE92] text-black"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          {tab.title}
        </button>
      ))}
    </div>
  );

  const getCurrentContent = () => {
    switch (currentStage) {
      case "infovoyage":
        return (
          <div>
            <InfovoyageTabsBar />
            {currentTab === "operationalLens" && renderOperationalLens()}
            {currentTab === "processGrid" && renderProcessGrid()}
            {currentTab === "defenseGrid" && renderDefenseGrid()}
            {currentTab === "dataTransit" && renderDataTransit()}
          </div>
        );
      case "checksync":
        return renderCheckSync();
      case "beam":
        return renderBeam();
      case "offdoff":
        return renderOffDoff();
      default:
        return renderOperationalLens();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-[0.5px] flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 dark:border-gray-600 rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-white dark:bg-gray-800 dark:border-gray-600 px-6 py-4 rounded-t-2xl border-b border-[#828282] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Add RoPA
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
          {getCurrentContent()}
        </div>

        {/* Modal Footer (always visible) */}
        <div className="px-6 py-4 rounded-2xl flex justify-between flex-shrink-0">
          <div>
            {(currentStage !== "infovoyage" || currentTab !== "operationalLens") && (
              <button
                onClick={handlePreviousStage}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
              >
                Previous
              </button>
            )}
          </div>
          <div>
            {currentStage !== "offdoff" ? (
              <button
                onClick={handleNextStage}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
              >
                {currentStage === "infovoyage" && currentTab === "dataTransit" ? "Next Stage" : "Next"}
              </button>
            ) : (
              <button
                onClick={handleCreateRoPA}
                disabled={loading}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 cursor-pointer"
                } text-white`}
              >
                {loading ? "Creating..." : "Create RoPA"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddROPAModal;