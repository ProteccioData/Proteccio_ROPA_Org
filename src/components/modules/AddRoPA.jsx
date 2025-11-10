import { useState, useEffect, useCallback } from "react";
import {
  Upload,
  FileText,
  Save,
  Clock,
  Home,
  User,
  Settings,
  Send,
  AlertTriangle,
  CheckCircle,
  X,
  Mail,
} from "lucide-react";
import { useToast } from "../ui/ToastProvider";
import ActionItemModal from "./AddActionItem";

// User roles and permissions
const USER_ROLES = {
  PROCESS_OWNER: "process_owner",
  PROCESS_EXPERT: "process_expert",
  DEPARTMENT_HEAD: "department_head",
  PRIVACY_SME: "privacy_sme",
};

// Current user (this would typically come from auth context)
const currentUser = {
  id: "user1",
  name: "John Doe",
  role: USER_ROLES.PRIVACY_SME, // Change this to test different roles
  email: "john.doe@company.com",
};

// Mock user database
const users = [
  {
    id: "user1",
    name: "John Doe",
    role: USER_ROLES.PROCESS_OWNER,
    email: "john.doe@company.com",
  },
  {
    id: "user2",
    name: "Alice Smith",
    role: USER_ROLES.PROCESS_EXPERT,
    email: "alice.smith@company.com",
  },
  {
    id: "user3",
    name: "Bob Wilson",
    role: USER_ROLES.DEPARTMENT_HEAD,
    email: "bob.wilson@company.com",
  },
  {
    id: "user4",
    name: "Carol Davis",
    role: USER_ROLES.PRIVACY_SME,
    email: "carol.davis@company.com",
  },
  {
    id: "user5",
    name: "David Brown",
    role: USER_ROLES.PROCESS_EXPERT,
    email: "david.brown@company.com",
  },
];

// Risk assessment options
const likelihoodOptions = ["Very Low", "Low", "Medium", "High", "Very High"];
const impactOptions = ["Very Low", "Low", "Medium", "High", "Very High"];

// Calculate risk score and category
const calculateRisk = (likelihood, impact) => {
  const scores = { "Very Low": 1, Low: 2, Medium: 3, High: 4, "Very High": 5 };
  const riskScore = scores[likelihood] * scores[impact];

  if (riskScore <= 4)
    return { score: riskScore, category: "Low", color: "green" };
  if (riskScore <= 9)
    return { score: riskScore, category: "Medium", color: "orange" };
  return { score: riskScore, category: "High", color: "red" };
};

// All the existing schemas remain the same
const operationalLensSchema = {
  parse: (data) => {
    const requiredFields = [
      "actingRole",
      "title",
      "description",
      "organizationName",
      "accountableDepartment",
      "departmentHead",
      "countryOfProcessing",
      "stateProvince",
      "usingDepartments",
      "processOwner",
      "processExpert",
      "dataProtectionOfficer",
      "privacyManager",
    ];

    const errors = [];
    requiredFields.forEach((field) => {
      if (
        !data[field] ||
        (Array.isArray(data[field]) && data[field].length === 0)
      ) {
        errors.push({
          path: [field],
          message: `${field} is required`,
        });
      }
    });

    if (errors.length > 0) {
      throw { errors };
    }
    return data;
  },
};

const processGridSchema = {
  parse: (data) => {
    const requiredFields = [
      "dataSubjectTypes",
      "numberOfDataSubjects",
      "dataElements",
      "dataCollectionSource",
      "countryOfDataCollection",
      "purposeOfProcessing",
      "dataRetentionPeriod",
      "deletionMethod",
      "physicalApplications",
      "physicalApplicationIds",
      "virtualApplications",
      "virtualApplicationIds",
    ];

    const errors = [];
    requiredFields.forEach((field) => {
      if (
        !data[field] ||
        (Array.isArray(data[field]) && data[field].length === 0)
      ) {
        errors.push({
          path: [field],
          message: `${field} is required`,
        });
      }
    });

    if (
      data.physicalApplications.length !== data.physicalApplicationIds.length
    ) {
      errors.push({
        path: ["physicalApplications"],
        message:
          "Number of physical assets must equal number of physical asset IDs",
      });
    }

    if (data.virtualApplications.length !== data.virtualApplicationIds.length) {
      errors.push({
        path: ["virtualApplications"],
        message:
          "Number of virtual assets must equal number of virtual asset IDs",
      });
    }

    if (errors.length > 0) {
      throw { errors };
    }
    return data;
  },
};

const defenseGridSchema = {
  parse: (data) => {
    const requiredFields = [
      "securityMeasures",
      "accessMeasures",
      "complianceMeasures",
      "dataGovernance",
      "operationalMeasures",
      "transparencyMeasures",
      "ethicalMeasures",
      "physicalSecurityMeasures",
      "technicalMeasures",
      "riskManagementMeasures",
    ];

    const errors = [];
    requiredFields.forEach((field) => {
      if (
        !data[field] ||
        (Array.isArray(data[field]) && data[field].length === 0)
      ) {
        errors.push({
          path: [field],
          message: `${field} is required`,
        });
      }
    });

    if (errors.length > 0) {
      throw { errors };
    }
    return data;
  },
};

const dataTransitSchema = {
  parse: (data) => {
    const requiredFields = [
      "willDataBeTransferred",
      "typeOfDataTransfer",
      "purposeOfTransfer",
      "legalBasisForTransfer",
      "importerName",
      "importerLocation",
      "importerRole",
      "importerRetentionPeriod",
      "importerDataRights",
      "transferFrequency",
      "importerSecuritySafeguards",
      "exporterName",
      "exporterLocation",
      "exporterRole",
      "exporterRetentionPeriod",
      "exporterDataRights",
      "exporterSecuritySafeguards",
    ];

    const errors = [];
    requiredFields.forEach((field) => {
      if (
        !data[field] ||
        (Array.isArray(data[field]) && data[field].length === 0)
      ) {
        errors.push({
          path: [field],
          message: `${field} is required`,
        });
      }
    });

    if (errors.length > 0) {
      throw { errors };
    }
    return data;
  },
};

const RoPAPage = () => {
  const [currentStage, setCurrentStage] = useState("infovoyage");
  const [currentTab, setCurrentTab] = useState("operationalLens");
  const [hoveredStep, setHoveredStep] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showMoveToBeamConfirm, setShowMoveToBeamConfirm] = useState(false);
  const [showMoveToOffDoffConfirm, setShowMoveToOffDoffConfirm] =
    useState(false);
  const [showAssessmentLink, setShowAssessmentLink] = useState(false);
  const [showActionItemForm, setShowActionItemForm] = useState(false);
  const [showCreateAssessment, setShowCreateAssessment] = useState(false);
  const { addToast } = useToast();

  // New state for workflow management
  const [workflow, setWorkflow] = useState({
    assignedTo: null,
    status: "draft",
    ropaId: `ROPA-${Date.now().toString().slice(-6)}`,
    createdAt: new Date(),
    createdBy: currentUser,
    currentAssignee: currentUser,
    riskAssessment: {
      likelihood: "",
      impact: "",
      score: 0,
      category: "",
      color: "",
    },
  });

  // Action Items state
  const [actionItems, setActionItems] = useState([]);
  const [newActionItem, setNewActionItem] = useState({
    title: "",
    description: "",
    assignedTo: "",
    dueDate: "",
    likelihood: "",
    impact: "",
    status: "open",
  });

  // Form data state with ALL fields
  const [formData, setFormData] = useState({
    levelInfo: {
      mainLevel: "",
      subLevel: "",
      levelPath: "",
    },
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
      additionalComments: "",
    },
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
      additionalComments: "",
    },
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
      additionalComments: "",
    },
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
      nextReviewDate: "",
    },
    checkSyncActions: [],
    beamReview: {
      reviewComments: "",
      moveToOffDoff: false,
    },
    offDoff: {
      completionDate: "",
      finalComments: "",
    },
  });

  // Permission checks - UPDATED BASED ON NEW REQUIREMENTS
  const canEditInfoVoyage = () => {
    if (currentStage !== "infovoyage") return false;
    
    // Process Owner can edit when in draft status
    if (currentUser.role === USER_ROLES.PROCESS_OWNER) {
      return workflow.status === "draft" || workflow.status === "returned";
    }
    
    // Process Expert can edit when assigned and in assigned/returned status
    if (currentUser.role === USER_ROLES.PROCESS_EXPERT) {
      return true
      // return (
      //   workflow.assignedTo?.id === currentUser.id &&
      //   (workflow.status === "assigned" || workflow.status === "returned")
      // );
    }
    
    return false;
  };

  const canEditCheckSync = () => {
    return currentStage === "checksync" && currentUser.role === USER_ROLES.PRIVACY_SME;
  };

  const canAssignRoPA = () => {
    return currentUser.role === USER_ROLES.PROCESS_OWNER && workflow.status === "draft";
  };

  const isReadOnly = (section) => {
    if (currentStage === "offdoff") return true;

    switch (currentStage) {
      case "infovoyage":
        return !canEditInfoVoyage();
      case "checksync":
        // Privacy SME has edit access only for risk assessment and action items
        if (section === "riskAssessment" || section === "actionItems") {
          return currentUser.role !== USER_ROLES.PRIVACY_SME;
        }
        // All other sections are read-only for everyone in checksync
        return true;
      case "beam":
        return currentUser.role !== USER_ROLES.PRIVACY_SME;
      case "offdoff":
        return true;
      default:
        return false;
    }
  };

  // Check if field should be hidden based on user role
  const shouldHideField = (section, field) => {
    // Process Expert cannot edit RoPA ID and Process Expert assignment fields
    if (currentUser.role === USER_ROLES.PROCESS_EXPERT) {
      const restrictedFields = [
        "ropaId",
        "assignedTo",
        "processExpert", // Cannot modify the process expert list
      ];
      return restrictedFields.includes(field);
    }
    return false;
  };

  // Auto-save functionality
  useEffect(() => {
    const autoSaveInterval = setInterval(async () => {
      if (hasFormData() && !isReadOnly()) {
        await handleAutoSave();
      }
    }, 5000);

    return () => clearInterval(autoSaveInterval);
  }, [formData]);

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
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setLastSaved(new Date());
      console.log("Auto-saved:", formData);
    } catch (error) {
      console.error("Auto-save failed:", error);
    } finally {
      setSaving(false);
    }
  };

  const stages = [
    { id: "infovoyage", title: "Infovoyage", shortTitle: "InfoVoyage" },
    { id: "checksync", title: "CheckSync", shortTitle: "CheckSync" },
    { id: "beam", title: "Beam", shortTitle: "Beam" },
    { id: "offdoff", title: "OffDoff", shortTitle: "OffDoff" },
  ];

  const infovoyageTabs = [
    { id: "operationalLens", title: "Operational Lens" },
    { id: "processGrid", title: "Process Grid" },
    { id: "defenseGrid", title: "Defense Grid" },
    { id: "dataTransit", title: "Data Transit" },
  ];

  // All dropdown options remain the same...
  const actingRoles = [
    "Fiduciary",
    "Processor",
    "Joint Fiduciary",
    "Joint Processor",
  ];
  const mainLevels = [
    "1. HR Onboarding",
    "2. HR Hiring",
    "3. HR Firing",
    "4. Marketing",
    "5. Sales",
    "6. Finance",
  ];
  const subLevels = [
    "1.1",
    "1.2",
    "1.3",
    "1.4",
    "1.5",
    "1.6",
    "1.7",
    "1.8",
    "1.9",
    "1.10",
  ];
  const organizations = [
    "TechCorp Ltd",
    "DataSystems Inc",
    "PrivacyFirst Org",
    "Global Solutions",
  ];
  const departments = [
    "IT",
    "HR",
    "Finance",
    "Marketing",
    "Legal",
    "Operations",
    "Sales",
  ];
  const departmentHeads = [
    "John Smith - IT Head",
    "Sarah Johnson - HR Head",
    "Mike Brown - Finance Head",
    "Lisa Wang - Marketing Head",
  ];
  const countries = [
    "United States",
    "India",
    "United Kingdom",
    "Germany",
    "France",
    "Japan",
    "Canada",
    "Australia",
  ];
  const states = [
    "California",
    "Texas",
    "New York",
    "Maharashtra",
    "Karnataka",
    "Delhi",
    "London",
    "Berlin",
  ];
  const processOwners = [
    "Alice Cooper - Process Manager",
    "Bob Wilson - Operations Lead",
    "Carol Davis - Department Head",
  ];
  const processExperts = [
    "Dr. James Smith - Data Expert",
    "Prof. Maria Garcia - Privacy Specialist",
    "David Lee - Security Analyst",
  ];
  const dpoOptions = [
    "John Doe - DPO",
    "Jane Smith - DPO",
    "Robert Brown - DPO",
  ];
  const privacyManagers = [
    "Alice Johnson - Privacy Manager",
    "Bob Wilson - Privacy Manager",
    "Carol Davis - Privacy Manager",
  ];

  const dataSubjectTypes = [
    "Employees",
    "Customers",
    "Vendors",
    "Patients",
    "Students",
    "Visitors",
  ];
  const numberOfDataSubjects = [
    "1-100",
    "101-500",
    "501-1000",
    "1001-5000",
    "5001-10000",
    "10000+",
  ];
  const dataElements = [
    "Name",
    "Email",
    "Phone",
    "Address",
    "Health Data",
    "Financial Data",
    "Biometric Data",
    "Location Data",
  ];
  const dataCollectionSources = [
    "Direct from individual",
    "Public sources",
    "Third parties",
    "Cookies",
    "Sensors",
    "Surveys",
  ];
  const purposes = [
    "HR Management",
    "Marketing",
    "Service Delivery",
    "Legal Compliance",
    "Research",
    "Security",
    "Analytics",
  ];
  const retentionPeriods = [
    "1 month",
    "3 months",
    "6 months",
    "1 year",
    "2 years",
    "5 years",
    "10 years",
    "Indefinite",
  ];
  const deletionMethods = [
    "Secure deletion",
    "Anonymization",
    "Permanent erasure",
    "Archiving",
  ];
  const physicalApplications = [
    "Laptops",
    "Servers",
    "Mobile Devices",
    "Storage Devices",
    "Workstations",
    "Network Equipment",
  ];
  const physicalApplicationIds = [
    "LAP-001",
    "LAP-002",
    "SRV-001",
    "MBL-001",
    "STR-001",
    "WRK-001",
    "NET-001",
  ];
  const virtualApplications = [
    "Cloud Storage",
    "CRM",
    "ERP",
    "Database",
    "Analytics Platform",
    "Email System",
  ];
  const virtualApplicationIds = [
    "CLD-001",
    "CRM-001",
    "ERP-001",
    "DB-001",
    "ANA-001",
    "EML-001",
  ];

  const securityMeasures = [
    "Encryption",
    "Firewalls",
    "Access Controls",
    "Intrusion Detection",
    "Backup Systems",
    "Anti-virus",
  ];
  const accessMeasures = [
    "Role-based Access",
    "Multi-factor Auth",
    "Access Logging",
    "Privilege Management",
    "Session Timeout",
  ];
  const complianceMeasures = [
    "GDPR Compliance",
    "HIPAA Compliance",
    "CCPA Compliance",
    "SOC2 Certification",
    "ISO 27001",
  ];
  const dataGovernance = [
    "Data Quality",
    "Data Lifecycle",
    "Data Classification",
    "Data Retention Policy",
    "Data Ownership",
  ];
  const operationalMeasures = [
    "Incident Response",
    "Change Management",
    "Training",
    "Audit Trail",
    "Business Continuity",
  ];
  const transparencyMeasures = [
    "Privacy Notices",
    "Consent Management",
    "Data Subject Rights",
    "Privacy Policy",
    "Cookie Policy",
  ];
  const ethicalMeasures = [
    "Fairness",
    "Non-discrimination",
    "Accountability",
    "Transparency",
    "Human Oversight",
  ];
  const physicalSecurityMeasures = [
    "Access Control",
    "Surveillance",
    "Secure Facilities",
    "Biometric Access",
    "Visitor Management",
  ];
  const technicalMeasures = [
    "Encryption",
    "Pseudonymization",
    "Access Logs",
    "Data Masking",
    "Tokenization",
  ];
  const riskManagementMeasures = [
    "Risk Assessment",
    "DPIA",
    "Audit",
    "Vendor Assessment",
    "Compliance Check",
  ];

  const yesNoOptions = ["Yes", "No"];
  const transferTypes = [
    "Cross-border",
    "Third-party",
    "Intra-group",
    "Cloud Storage",
    "Processor Transfer",
  ];
  const legalBases = [
    "Consent",
    "Contract",
    "Legal Obligation",
    "Legitimate Interest",
    "Vital Interest",
    "Public Interest",
  ];
  const frequencies = [
    "One-time",
    "Daily",
    "Weekly",
    "Monthly",
    "Quarterly",
    "Yearly",
  ];
  const dataRights = [
    "Access",
    "Rectification",
    "Erasure",
    "Restriction",
    "Portability",
    "Objection",
    "Consent Withdrawal",
  ];

  // Validation functions
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
      addToast("success", "Validation passed!");
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
      addToast("error", "Please fill all required fields correctly");
      return false;
    }
  };

  const handleInputChange = (section, field, value) => {
    if (isReadOnly(section)) return;

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
    if (isReadOnly(section)) return;

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

  const getFieldError = (section, field) => {
    const path = `${section}.${field}`;
    return errors[path] || null;
  };

  // Enhanced input renderers with role-based field hiding
  const renderInput = (section, field, props) => {
    if (shouldHideField(section, field)) return null;

    const error = getFieldError(section, field);
    const isRequired = props.required !== false;
    const readOnly = isReadOnly(section);

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
          readOnly={readOnly}
          className={`w-full px-3 py-2 bg-white dark:bg-gray-700 dark:text-gray-100 border rounded-md ${
            readOnly ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : ""
          } ${
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
    if (shouldHideField(section, field)) return null;

    const error = getFieldError(section, field);
    const isRequired = props.required !== false;
    const readOnly = isReadOnly(section);

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
          disabled={readOnly}
          className={`w-full px-3 py-2 bg-white dark:bg-gray-700 dark:text-gray-100 border rounded-md ${
            readOnly ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : ""
          } ${
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

  const renderMultiSelect = (
    section,
    field,
    label,
    options,
    required = true
  ) => {
    if (shouldHideField(section, field)) return null;

    const error = getFieldError(section, field);
    const selectedValues = formData[section][field] || [];
    const readOnly = isReadOnly(section);

    return (
      <div>
        <label
          className={`block text-sm font-medium mb-2 ${
            error ? "text-red-600" : "text-gray-700 dark:text-gray-400"
          }`}
        >
          {label} {required && "*"}
        </label>
        <div
          className={`space-y-2 max-h-40 overflow-y-auto border rounded-md p-3 ${
            readOnly
              ? "bg-gray-100 dark:bg-gray-800 border-gray-300"
              : "border-[#828282]"
          }`}
        >
          {options.map((option) => (
            <label key={option} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedValues.includes(option)}
                onChange={(e) =>
                  !readOnly &&
                  handleArrayChange(section, field, option, e.target.checked)
                }
                disabled={readOnly}
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
    const readOnly = isReadOnly(section);

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
          readOnly={readOnly}
          className={`w-full px-3 py-2 bg-white dark:bg-gray-700 dark:text-gray-100 border rounded-md ${
            readOnly ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : ""
          } ${
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

  // Email Notification Functions
  const sendEmailNotification = (to, subject, body) => {
    console.log(`📧 Email sent to ${to}:
    Subject: ${subject}
    Body: ${body}
  `);
    addToast("success", `Email notification sent to ${to}`);
  };

  const sendProcessExpertAssignmentEmail = (expert) => {
    const subject = `RoPA Assignment - ${workflow.ropaId}`;
    const body = `
      You have been assigned a new RoPA to complete.
      
      RoPA ID: ${workflow.ropaId}
      RoPA Name: ${formData.operationalLens.title}
      Description: ${formData.operationalLens.description}
      
      Please click the link below to access and complete the RoPA:
      /ropa/${workflow.ropaId}
      
      Thank you,
      RoPA Management System
    `;
    sendEmailNotification(expert.email, subject, body);
  };

  const sendPrivacySMESubmissionEmail = () => {
    const privacySME = users.find(u => u.role === USER_ROLES.PRIVACY_SME);
    const subject = `RoPA Ready for Review - ${workflow.ropaId}`;
    const body = `
      A RoPA has been completed and is ready for your review.
      
      RoPA ID: ${workflow.ropaId}
      RoPA Name: ${formData.operationalLens.title}
      Description: ${formData.operationalLens.description}
      Department: ${formData.operationalLens.accountableDepartment}
      
      Please click the link below to review the RoPA:
      /ropa/${workflow.ropaId}
      
      Thank you,
      RoPA Management System
    `;
    sendEmailNotification(privacySME.email, subject, body);
  };

  const sendProcessOwnerSubmissionEmail = () => {
    const subject = `RoPA Submitted for Review - ${workflow.ropaId}`;
    const body = `
      Your RoPA has been submitted for Privacy SME review.
      
      RoPA ID: ${workflow.ropaId}
      RoPA Name: ${formData.operationalLens.title}
      Description: ${formData.operationalLens.description}
      Department: ${formData.operationalLens.accountableDepartment}
      
      Current Status: Under Privacy SME Review
      
      You can track the progress at:
      /ropa/${workflow.ropaId}
      
      Thank you,
      RoPA Management System
    `;
    sendEmailNotification(currentUser.email, subject, body);
  };

  const sendActionItemAssignmentEmail = (actionItem, assignedUser) => {
    const subject = `Action Item Assigned - ${actionItem.id}`;
    const body = `
      You have been assigned a new Action Item.
      
      Action Item ID: ${actionItem.id}
      Title: ${actionItem.title}
      Description: ${actionItem.description}
      Due Date: ${new Date(actionItem.dueDate).toLocaleDateString()}
      Risk Category: ${actionItem.riskCategory}
      Created By: ${actionItem.createdBy.name}
      
      RoPA Details:
      RoPA ID: ${actionItem.ropaId}
      RoPA Name: ${actionItem.ropaName}
      
      Please click the link below to access the Action Item:
      /action-items/${actionItem.id}
      
      Thank you,
      RoPA Management System
    `;
    sendEmailNotification(assignedUser.email, subject, body);
  };

  const sendReturnToInfoVoyageEmail = () => {
    const processExpert = workflow.assignedTo;
    const processOwner = workflow.createdBy;
    
    const subject = `RoPA Returned for Additional Input - ${workflow.ropaId}`;
    const body = `
      The RoPA has been returned to InfoVoyage stage for additional input.
      
      RoPA ID: ${workflow.ropaId}
      RoPA Name: ${formData.operationalLens.title}
      Department: ${formData.operationalLens.accountableDepartment}
      
      Please review and provide the required additional information.
      
      Access the RoPA at:
      /ropa/${workflow.ropaId}
      
      Thank you,
      RoPA Management System
    `;

    // Send to both Process Expert and Process Owner
    sendEmailNotification(processExpert.email, subject, body);
    sendEmailNotification(processOwner.email, subject, body);
  };

  // Workflow Functions
  const handleAssignToProcessExpert = (expertId) => {
    const expert = users.find((u) => u.id === expertId);
    setWorkflow((prev) => ({
      ...prev,
      assignedTo: expert,
      currentAssignee: expert,
      status: "assigned",
    }));

    addToast("success", `RoPA assigned to ${expert.name}. Email notification sent.`);
    sendProcessExpertAssignmentEmail(expert);
  };

  const handleSubmitInfoVoyage = () => {
    if (!validateTab(currentTab)) return;
    setShowSubmitConfirm(true);
  };

  const confirmSubmitInfoVoyage = () => {
    setWorkflow((prev) => ({
      ...prev,
      status: "submitted",
      currentAssignee: users.find((u) => u.role === USER_ROLES.PRIVACY_SME),
    }));
    setCurrentStage("checksync");
    setShowSubmitConfirm(false);
    
    addToast("success", "RoPA submitted to Privacy SME");
    
    // Send email notifications
    sendPrivacySMESubmissionEmail();
    sendProcessOwnerSubmissionEmail();
  };

  const handleMoveToPreviousStage = () => {
    if (currentUser.role === USER_ROLES.PRIVACY_SME && currentStage === "checksync") {
      setWorkflow((prev) => ({
        ...prev,
        status: "returned",
        currentAssignee: workflow.assignedTo,
      }));
      setCurrentStage("infovoyage");
      addToast("info", "RoPA returned to InfoVoyage for additional input");
      sendReturnToInfoVoyageEmail();
    }
  };

  const handleRiskAssessmentChange = (field, value) => {
    setWorkflow((prev) => {
      const newRisk = { ...prev.riskAssessment, [field]: value };

      if (newRisk.likelihood && newRisk.impact) {
        const riskResult = calculateRisk(newRisk.likelihood, newRisk.impact);
        newRisk.score = riskResult.score;
        newRisk.category = riskResult.category;
        newRisk.color = riskResult.color;
      }

      return { ...prev, riskAssessment: newRisk };
    });
  };

  const handleCreateActionItem = () => {
    const actionItemId = `ACTION-${Date.now().toString().slice(-6)}`;
    const riskResult = calculateRisk(
      newActionItem.likelihood,
      newActionItem.impact
    );
    const assignedUser = users.find((u) => u.id === newActionItem.assignedTo);

    const actionItem = {
      ...newActionItem,
      id: actionItemId,
      createdDate: new Date(),
      createdBy: currentUser,
      riskScore: riskResult.score,
      riskCategory: riskResult.category,
      ropaId: workflow.ropaId,
      ropaName: formData.operationalLens.title,
      assignedUserName: assignedUser?.name,
    };

    setActionItems((prev) => [...prev, actionItem]);
    setNewActionItem({
      title: "",
      description: "",
      assignedTo: "",
      dueDate: "",
      likelihood: "",
      impact: "",
      status: "open",
    });
    setShowActionItemForm(false);
    addToast("success", "Action item created successfully");
    
    // Send email notification to assigned user
    if (assignedUser) {
      sendActionItemAssignmentEmail(actionItem, assignedUser);
    }
  };

  const handleMoveToBeam = () => {
    // Check if all action items are completed
    const hasOpenActionItems = actionItems.some(item => item.status === "open");
    if (hasOpenActionItems) {
      addToast("error", "Please complete all action items before moving to Beam stage");
      return;
    }
    setShowMoveToBeamConfirm(true);
  };

  const confirmMoveToBeam = () => {
    setCurrentStage("beam");
    setShowMoveToBeamConfirm(false);
    setShowAssessmentLink(true);
  };

  const handleMoveToOffDoff = () => {
    setShowMoveToOffDoffConfirm(true);
  };

  const confirmMoveToOffDoff = () => {
    setCurrentStage("offdoff");
    setShowMoveToOffDoffConfirm(false);
    addToast("success", "RoPA completed and moved to Off-Doff");
  };

  const handleDiscardActionItem = () => {
    setNewActionItem({
      title: "",
      description: "",
      assignedTo: "",
      dueDate: "",
      likelihood: "",
      impact: "",
      status: "open",
    });
    setShowActionItemForm(false);
    addToast("info", "Action item discarded");
  };

  // Assignment Section for Process Owner
  const renderAssignmentSection = () => {
    if (currentUser.role !== USER_ROLES.PROCESS_OWNER) {
      return null;
    }

    if (workflow.status !== "draft") {
      return null;
    }

    if (workflow.assignedTo) {
      return (
        <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 p-4 rounded-lg mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                Assigned to: {workflow.assignedTo.name}
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Email sent to {workflow.assignedTo.email}
              </p>
            </div>
            <Mail className="w-5 h-5 text-blue-500" />
          </div>
        </div>
      );
    }

    return (
      <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 p-4 rounded-lg mb-4">
        <h3 className="font-medium text-yellow-900 dark:text-yellow-100 mb-3">
          Assign to Process Expert
        </h3>
        <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
          Fill in the basic details below, then assign to a Process Expert who
          will complete the detailed information.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Select Process Expert *
            </label>
            <select
              value={workflow.assignedTo?.id || ""}
              onChange={(e) => {
                const expertId = e.target.value;
                if (expertId) {
                  const expert = users.find((u) => u.id === expertId);
                  setWorkflow((prev) => ({
                    ...prev,
                    assignedTo: expert,
                  }));
                }
              }}
              className="w-full px-3 py-2 border border-[#828282] rounded-md"
            >
              <option value="">Select Process Expert</option>
              {users
                .filter((user) => user.role === USER_ROLES.PROCESS_EXPERT)
                .map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() =>
                workflow.assignedTo &&
                handleAssignToProcessExpert(workflow.assignedTo.id)
              }
              disabled={
                !workflow.assignedTo ||
                !formData.operationalLens.title ||
                !formData.operationalLens.description
              }
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
            >
              Assign & Send Email
            </button>
          </div>
        </div>
        {(!formData.operationalLens.title ||
          !formData.operationalLens.description) && (
          <p className="text-xs text-red-500 mt-2">
            * Please fill in at least RoPA Title and Description before
            assigning
          </p>
        )}
      </div>
    );
  };

  const renderLevelSection = () => (
    <div className="bg-gray-50 dark:bg-gray-900 border border-[#828282] p-4 rounded-lg mb-4">
      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
        Level Information
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {renderSelect("levelInfo", "mainLevel", {
          value: formData.levelInfo.mainLevel,
          onChange: (e) =>
            handleLevelChange(e.target.value, formData.levelInfo.subLevel),
          label: "Main Level",
          children: (
            <>
              <option value="">Select Main Level</option>
              {mainLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </>
          ),
        })}
        {renderSelect("levelInfo", "subLevel", {
          value: formData.levelInfo.subLevel,
          onChange: (e) =>
            handleLevelChange(formData.levelInfo.mainLevel, e.target.value),
          label: "Sub Level",
          required: false,
          children: (
            <>
              <option value="">Select Sub Level</option>
              {subLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
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
    <div className="space-y-6">
      {/* Workflow Status Indicator */}
      <div
        className={`p-4 rounded-lg border ${
          workflow.status === "draft"
            ? "bg-gray-50 border-gray-200"
            : workflow.status === "assigned"
            ? "bg-blue-50 border-blue-200"
            : workflow.status === "submitted"
            ? "bg-green-50 border-green-200"
            : "bg-yellow-50 border-yellow-200"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">
              Status:
              <span
                className={`ml-2 ${
                  workflow.status === "draft"
                    ? "text-gray-700"
                    : workflow.status === "assigned"
                    ? "text-blue-700"
                    : workflow.status === "submitted"
                    ? "text-green-700"
                    : "text-yellow-700"
                }`}
              >
                {workflow.status.charAt(0).toUpperCase() +
                  workflow.status.slice(1)}
              </span>
            </h3>
            {workflow.assignedTo && (
              <p className="text-sm mt-1">
                Current Assignee: <strong>{workflow.assignedTo.name}</strong>
              </p>
            )}
          </div>
          <div className="text-sm text-gray-600">
            RoPA ID: <strong>{workflow.ropaId}</strong>
          </div>
        </div>
      </div>

      {renderAssignmentSection()}
      {renderLevelSection()}
      <div className="bg-gray-50 dark:bg-gray-900 border border-[#828282] p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
          Operational Lens
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {renderSelect("operationalLens", "actingRole", {
            value: formData.operationalLens.actingRole,
            onChange: (e) =>
              handleInputChange(
                "operationalLens",
                "actingRole",
                e.target.value
              ),
            label: "Acting Role",
            children: (
              <>
                <option value="">Select Role</option>
                {actingRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </>
            ),
          })}
          {renderInput("operationalLens", "title", {
            type: "text",
            value: formData.operationalLens.title,
            onChange: (e) =>
              handleInputChange("operationalLens", "title", e.target.value),
            placeholder: "HR Employee Onboarding Process",
            label: "Title of Processing Activity",
          })}
          {renderTextarea("operationalLens", "description", {
            value: formData.operationalLens.description,
            onChange: (e) =>
              handleInputChange(
                "operationalLens",
                "description",
                e.target.value
              ),
            placeholder: "Detailed description of the processing activity...",
            label: "Description of Processing Activity",
            rows: 3,
          })}
          {renderSelect("operationalLens", "organizationName", {
            value: formData.operationalLens.organizationName,
            onChange: (e) =>
              handleInputChange(
                "operationalLens",
                "organizationName",
                e.target.value
              ),
            label: "Name of Organization",
            children: (
              <>
                <option value="">Select Organization</option>
                {organizations.map((org) => (
                  <option key={org} value={org}>
                    {org}
                  </option>
                ))}
              </>
            ),
          })}
          {renderSelect("operationalLens", "accountableDepartment", {
            value: formData.operationalLens.accountableDepartment,
            onChange: (e) =>
              handleInputChange(
                "operationalLens",
                "accountableDepartment",
                e.target.value
              ),
            label: "Accountable Department",
            children: (
              <>
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </>
            ),
          })}
          {renderSelect("operationalLens", "departmentHead", {
            value: formData.operationalLens.departmentHead,
            onChange: (e) =>
              handleInputChange(
                "operationalLens",
                "departmentHead",
                e.target.value
              ),
            label: "Department Head",
            children: (
              <>
                <option value="">Select Department Head</option>
                {departmentHeads.map((head) => (
                  <option key={head} value={head}>
                    {head}
                  </option>
                ))}
              </>
            ),
          })}
          {renderMultiSelect(
            "operationalLens",
            "countryOfProcessing",
            "Country of Processing Activity",
            countries
          )}
          {renderMultiSelect(
            "operationalLens",
            "stateProvince",
            "State/Province",
            states
          )}
          {renderMultiSelect(
            "operationalLens",
            "usingDepartments",
            "Which department uses this processing activity?",
            departments
          )}
          {renderSelect("operationalLens", "processOwner", {
            value: formData.operationalLens.processOwner,
            onChange: (e) =>
              handleInputChange(
                "operationalLens",
                "processOwner",
                e.target.value
              ),
            label: "Process Owner",
            children: (
              <>
                <option value="">Select Process Owner</option>
                {processOwners.map((owner) => (
                  <option key={owner} value={owner}>
                    {owner}
                  </option>
                ))}
              </>
            ),
          })}
          {renderMultiSelect(
            "operationalLens",
            "processExpert",
            "Process Expert",
            processExperts
          )}
          {renderSelect("operationalLens", "dataProtectionOfficer", {
            value: formData.operationalLens.dataProtectionOfficer,
            onChange: (e) =>
              handleInputChange(
                "operationalLens",
                "dataProtectionOfficer",
                e.target.value
              ),
            label: "Data Protection Officer (DPO)",
            children: (
              <>
                <option value="">Select DPO</option>
                {dpoOptions.map((dpo) => (
                  <option key={dpo} value={dpo}>
                    {dpo}
                  </option>
                ))}
              </>
            ),
          })}
          {renderSelect("operationalLens", "privacyManager", {
            value: formData.operationalLens.privacyManager,
            onChange: (e) =>
              handleInputChange(
                "operationalLens",
                "privacyManager",
                e.target.value
              ),
            label: "Privacy Manager",
            children: (
              <>
                <option value="">Select Privacy Manager</option>
                {privacyManagers.map((manager) => (
                  <option key={manager} value={manager}>
                    {manager}
                  </option>
                ))}
              </>
            ),
          })}
          {renderTextarea("operationalLens", "additionalComments", {
            value: formData.operationalLens.additionalComments,
            onChange: (e) =>
              handleInputChange(
                "operationalLens",
                "additionalComments",
                e.target.value
              ),
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
    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-900 border border-[#828282] p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
          Process Grid
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {renderMultiSelect(
            "processGrid",
            "dataSubjectTypes",
            "Type of Data Subjects",
            dataSubjectTypes
          )}
          {renderSelect("processGrid", "numberOfDataSubjects", {
            value: formData.processGrid.numberOfDataSubjects,
            onChange: (e) =>
              handleInputChange(
                "processGrid",
                "numberOfDataSubjects",
                e.target.value
              ),
            label: "Number of Data Subjects",
            children: (
              <>
                <option value="">Select Range</option>
                {numberOfDataSubjects.map((range) => (
                  <option key={range} value={range}>
                    {range}
                  </option>
                ))}
              </>
            ),
          })}
          {renderMultiSelect(
            "processGrid",
            "dataElements",
            "Data Elements",
            dataElements
          )}
          {renderMultiSelect(
            "processGrid",
            "dataCollectionSource",
            "Data Collection Source",
            dataCollectionSources
          )}
          {renderMultiSelect(
            "processGrid",
            "countryOfDataCollection",
            "Country of Data Collection",
            countries
          )}
          {renderMultiSelect(
            "processGrid",
            "purposeOfProcessing",
            "Purpose of Processing",
            purposes
          )}
          {renderSelect("processGrid", "dataRetentionPeriod", {
            value: formData.processGrid.dataRetentionPeriod,
            onChange: (e) =>
              handleInputChange(
                "processGrid",
                "dataRetentionPeriod",
                e.target.value
              ),
            label: "Data Retention Period",
            children: (
              <>
                <option value="">Select Retention Period</option>
                {retentionPeriods.map((period) => (
                  <option key={period} value={period}>
                    {period}
                  </option>
                ))}
              </>
            ),
          })}
          {renderSelect("processGrid", "deletionMethod", {
            value: formData.processGrid.deletionMethod,
            onChange: (e) =>
              handleInputChange(
                "processGrid",
                "deletionMethod",
                e.target.value
              ),
            label: "Deletion Method",
            children: (
              <>
                <option value="">Select Deletion Method</option>
                {deletionMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </>
            ),
          })}
          {renderMultiSelect(
            "processGrid",
            "physicalApplications",
            "Physical Application/Asset Used",
            physicalApplications
          )}
          {renderMultiSelect(
            "processGrid",
            "physicalApplicationIds",
            "Physical Application/Asset ID",
            physicalApplicationIds
          )}
          {renderMultiSelect(
            "processGrid",
            "virtualApplications",
            "Virtual Applications/Assets Used",
            virtualApplications
          )}
          {renderMultiSelect(
            "processGrid",
            "virtualApplicationIds",
            "Virtual Application/Asset ID",
            virtualApplicationIds
          )}
          {renderTextarea("processGrid", "additionalComments", {
            value: formData.processGrid.additionalComments,
            onChange: (e) =>
              handleInputChange(
                "processGrid",
                "additionalComments",
                e.target.value
              ),
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
    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-900 border border-[#828282] p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
          Defense Grid
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {renderMultiSelect(
            "defenseGrid",
            "securityMeasures",
            "Security Measures",
            securityMeasures
          )}
          {renderMultiSelect(
            "defenseGrid",
            "accessMeasures",
            "Access Measures",
            accessMeasures
          )}
          {renderMultiSelect(
            "defenseGrid",
            "complianceMeasures",
            "Compliance Measures",
            complianceMeasures
          )}
          {renderMultiSelect(
            "defenseGrid",
            "dataGovernance",
            "Data Governance",
            dataGovernance
          )}
          {renderMultiSelect(
            "defenseGrid",
            "operationalMeasures",
            "Operational Measures",
            operationalMeasures
          )}
          {renderMultiSelect(
            "defenseGrid",
            "transparencyMeasures",
            "Transparency Measures",
            transparencyMeasures
          )}
          {renderMultiSelect(
            "defenseGrid",
            "ethicalMeasures",
            "Ethical Measures",
            ethicalMeasures
          )}
          {renderMultiSelect(
            "defenseGrid",
            "physicalSecurityMeasures",
            "Physical Security Measures",
            physicalSecurityMeasures
          )}
          {renderMultiSelect(
            "defenseGrid",
            "technicalMeasures",
            "Technical Measures",
            technicalMeasures
          )}
          {renderMultiSelect(
            "defenseGrid",
            "riskManagementMeasures",
            "Risk Management Measures",
            riskManagementMeasures
          )}
          {renderTextarea("defenseGrid", "additionalComments", {
            value: formData.defenseGrid.additionalComments,
            onChange: (e) =>
              handleInputChange(
                "defenseGrid",
                "additionalComments",
                e.target.value
              ),
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
    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-900 border border-[#828282] p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
          Data Transit
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {renderSelect("dataTransit", "willDataBeTransferred", {
            value: formData.dataTransit.willDataBeTransferred,
            onChange: (e) =>
              handleInputChange(
                "dataTransit",
                "willDataBeTransferred",
                e.target.value
              ),
            label: "Will the data be transferred?",
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
          {renderSelect("dataTransit", "typeOfDataTransfer", {
            value: formData.dataTransit.typeOfDataTransfer,
            onChange: (e) =>
              handleInputChange(
                "dataTransit",
                "typeOfDataTransfer",
                e.target.value
              ),
            label: "Type of Data Transfer",
            children: (
              <>
                <option value="">Select Type</option>
                {transferTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </>
            ),
          })}
          {renderSelect("dataTransit", "purposeOfTransfer", {
            value: formData.dataTransit.purposeOfTransfer,
            onChange: (e) =>
              handleInputChange(
                "dataTransit",
                "purposeOfTransfer",
                e.target.value
              ),
            label: "Purpose of the Transfer",
            children: (
              <>
                <option value="">Select Purpose</option>
                {purposes.map((purpose) => (
                  <option key={purpose} value={purpose}>
                    {purpose}
                  </option>
                ))}
              </>
            ),
          })}
          {renderSelect("dataTransit", "legalBasisForTransfer", {
            value: formData.dataTransit.legalBasisForTransfer,
            onChange: (e) =>
              handleInputChange(
                "dataTransit",
                "legalBasisForTransfer",
                e.target.value
              ),
            label: "Legal Basis for the Transfer",
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

          {/* Importer Section */}
          <div className="col-span-2 border-t pt-4 mt-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
              Importer Details
            </h4>
          </div>
          {renderInput("dataTransit", "importerName", {
            type: "text",
            value: formData.dataTransit.importerName,
            onChange: (e) =>
              handleInputChange("dataTransit", "importerName", e.target.value),
            placeholder: "Importer Organization Name",
            label: "Importer Name",
          })}
          {renderSelect("dataTransit", "importerLocation", {
            value: formData.dataTransit.importerLocation,
            onChange: (e) =>
              handleInputChange(
                "dataTransit",
                "importerLocation",
                e.target.value
              ),
            label: "Importer Location",
            children: (
              <>
                <option value="">Select Location</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </>
            ),
          })}
          {renderSelect("dataTransit", "importerRole", {
            value: formData.dataTransit.importerRole,
            onChange: (e) =>
              handleInputChange("dataTransit", "importerRole", e.target.value),
            label: "Importer Role",
            children: (
              <>
                <option value="">Select Role</option>
                {actingRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </>
            ),
          })}
          {renderInput("dataTransit", "importerRetentionPeriod", {
            type: "text",
            value: formData.dataTransit.importerRetentionPeriod,
            onChange: (e) =>
              handleInputChange(
                "dataTransit",
                "importerRetentionPeriod",
                e.target.value
              ),
            placeholder: "e.g., 2 years",
            label: "Retention Period",
          })}
          {renderMultiSelect(
            "dataTransit",
            "importerDataRights",
            "Data Principal Rights by Importer",
            dataRights
          )}
          {renderSelect("dataTransit", "transferFrequency", {
            value: formData.dataTransit.transferFrequency,
            onChange: (e) =>
              handleInputChange(
                "dataTransit",
                "transferFrequency",
                e.target.value
              ),
            label: "Frequency of Transfer",
            children: (
              <>
                <option value="">Select Frequency</option>
                {frequencies.map((freq) => (
                  <option key={freq} value={freq}>
                    {freq}
                  </option>
                ))}
              </>
            ),
          })}
          {renderMultiSelect(
            "dataTransit",
            "importerSecuritySafeguards",
            "Security Safeguards by Importer",
            securityMeasures
          )}

          {/* Exporter Section */}
          <div className="col-span-2 border-t pt-4 mt-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
              Exporter Details
            </h4>
          </div>
          {renderInput("dataTransit", "exporterName", {
            type: "text",
            value: formData.dataTransit.exporterName,
            onChange: (e) =>
              handleInputChange("dataTransit", "exporterName", e.target.value),
            placeholder: "Exporter Organization Name",
            label: "Exporter Name",
          })}
          {renderSelect("dataTransit", "exporterLocation", {
            value: formData.dataTransit.exporterLocation,
            onChange: (e) =>
              handleInputChange(
                "dataTransit",
                "exporterLocation",
                e.target.value
              ),
            label: "Exporter Location",
            children: (
              <>
                <option value="">Select Location</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </>
            ),
          })}
          {renderSelect("dataTransit", "exporterRole", {
            value: formData.dataTransit.exporterRole,
            onChange: (e) =>
              handleInputChange("dataTransit", "exporterRole", e.target.value),
            label: "Exporter Role",
            children: (
              <>
                <option value="">Select Role</option>
                {actingRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </>
            ),
          })}
          {renderInput("dataTransit", "exporterRetentionPeriod", {
            type: "text",
            value: formData.dataTransit.exporterRetentionPeriod,
            onChange: (e) =>
              handleInputChange(
                "dataTransit",
                "exporterRetentionPeriod",
                e.target.value
              ),
            placeholder: "e.g., 1 year",
            label: "Retention period by exporter",
          })}
          {renderMultiSelect(
            "dataTransit",
            "exporterDataRights",
            "Data Principal Rights by exporter",
            dataRights
          )}
          {renderMultiSelect(
            "dataTransit",
            "exporterSecuritySafeguards",
            "Security Safeguards by exporter",
            securityMeasures
          )}

          {renderInput("dataTransit", "nextReviewDate", {
            type: "date",
            value: formData.dataTransit.nextReviewDate,
            onChange: (e) =>
              handleInputChange(
                "dataTransit",
                "nextReviewDate",
                e.target.value
              ),
            label: "Next Review Date",
          })}
        </div>
      </div>
    </div>
  );

  const renderCheckSync = () => (
    <div className="space-y-6">
      {/* Read-only view of all InfoVoyage sections for Privacy SME */}
      {currentUser.role === USER_ROLES.PRIVACY_SME && (
        <div className="bg-gray-50 dark:bg-gray-900 border border-[#828282] p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
            RoPA Details (Read Only)
          </h3>
          <InfovoyageTabsBar />
          {currentTab === "operationalLens" && (
            <div className="opacity-80">
              {renderOperationalLens()}
            </div>
          )}
          {currentTab === "processGrid" && (
            <div className="opacity-80">
              {renderProcessGrid()}
            </div>
          )}
          {currentTab === "defenseGrid" && (
            <div className="opacity-80">
              {renderDefenseGrid()}
            </div>
          )}
          {currentTab === "dataTransit" && (
            <div className="opacity-80">
              {renderDataTransit()}
            </div>
          )}
        </div>
      )}

      <div className="bg-gray-50 dark:bg-gray-900 border border-[#828282] p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
          CheckSync - Risk Assessment
        </h3>

        {/* Risk Assessment */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              Likelihood *
            </label>
            <select
              value={workflow.riskAssessment.likelihood}
              onChange={(e) =>
                handleRiskAssessmentChange("likelihood", e.target.value)
              }
              disabled={!canEditCheckSync()}
              className="w-full px-3 py-2 border border-[#828282] rounded-md"
            >
              <option value="">Select Likelihood</option>
              {likelihoodOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Impact *</label>
            <select
              value={workflow.riskAssessment.impact}
              onChange={(e) =>
                handleRiskAssessmentChange("impact", e.target.value)
              }
              disabled={!canEditCheckSync()}
              className="w-full px-3 py-2 border border-[#828282] rounded-md"
            >
              <option value="">Select Impact</option>
              {impactOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          {workflow.riskAssessment.score > 0 && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Risk Score
                </label>
                <input
                  type="text"
                  value={workflow.riskAssessment.score}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Risk Category
                </label>
                <div
                  className={`w-full px-3 py-2 border rounded-md text-white text-center font-medium ${
                    workflow.riskAssessment.color === "green"
                      ? "bg-green-500"
                      : workflow.riskAssessment.color === "orange"
                      ? "bg-orange-500"
                      : "bg-red-500"
                  }`}
                >
                  {workflow.riskAssessment.category}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Action Items */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              Action Items
            </h4>
            {canEditCheckSync() && (
              <button
                onClick={() => setShowActionItemForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
              >
                + Add Action Item
              </button>
            )}
          </div>

          {actionItems.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No action items created yet.
            </p>
          ) : (
            actionItems.map((item, index) => (
              <div
                key={item.id}
                className="border border-[#828282] rounded-lg p-4 mb-3"
              >
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium">{item.title}</h5>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      item.status === "open"
                        ? "bg-yellow-100 text-yellow-800"
                        : item.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>Assigned to: {item.assignedUserName}</div>
                  <div>Due: {new Date(item.dueDate).toLocaleDateString()}</div>
                  <div>
                    Risk: {item.riskCategory} ({item.riskScore})
                  </div>
                  <div>
                    Created: {new Date(item.createdDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Navigation for Privacy SME */}
        {currentUser.role === USER_ROLES.PRIVACY_SME && (
          <div className="flex justify-between">
            <button
              onClick={handleMoveToPreviousStage}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 cursor-pointer"
            >
              Move Back to InfoVoyage
            </button>
            <button
              onClick={handleMoveToBeam}
              disabled={actionItems.some((item) => item.status !== "completed")}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
            >
              Move to Beam
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderBeam = () => (
    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-900 border border-[#828282] p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
          Beam Stage
        </h3>
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            RoPA is ready to move to final stage. Please review and proceed.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setCurrentStage("checksync")}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={handleMoveToOffDoff}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer"
            >
              Move to OffDoff
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOffDoff = () => (
    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-900 border border-[#828282] p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
          OffDoff Stage
        </h3>
        <div className="text-center py-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
            RoPA Completed Successfully
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            This RoPA has been completed and moved to OffDoff stage. No further actions are required.
          </p>
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              <strong>Note:</strong> Once a RoPA reaches OffDoff stage, it cannot be deleted or modified.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Action Item Form Modal
  const renderActionItemForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Create Action Item</h3>
          <button
            onClick={() => setShowActionItemForm(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Action Item ID
              </label>
              <input
                type="text"
                value={`ACTION-${Date.now().toString().slice(-6)}`}
                readOnly
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Created Date
              </label>
              <input
                type="text"
                value={new Date().toLocaleDateString()}
                readOnly
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Title *
            </label>
            <input
              type="text"
              value={newActionItem.title}
              onChange={(e) => setNewActionItem(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-[#828282] rounded-md"
              placeholder="Enter action item title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description *
            </label>
            <textarea
              value={newActionItem.description}
              onChange={(e) => setNewActionItem(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-[#828282] rounded-md"
              placeholder="Enter action item description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Assigned To *
              </label>
              <select
                value={newActionItem.assignedTo}
                onChange={(e) => setNewActionItem(prev => ({ ...prev, assignedTo: e.target.value }))}
                className="w-full px-3 py-2 border border-[#828282] rounded-md"
              >
                <option value="">Select User</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Due Date *
              </label>
              <input
                type="date"
                value={newActionItem.dueDate}
                onChange={(e) => setNewActionItem(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-3 py-2 border border-[#828282] rounded-md"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Likelihood *
              </label>
              <select
                value={newActionItem.likelihood}
                onChange={(e) => setNewActionItem(prev => ({ ...prev, likelihood: e.target.value }))}
                className="w-full px-3 py-2 border border-[#828282] rounded-md"
              >
                <option value="">Select Likelihood</option>
                {likelihoodOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Impact *
              </label>
              <select
                value={newActionItem.impact}
                onChange={(e) => setNewActionItem(prev => ({ ...prev, impact: e.target.value }))}
                className="w-full px-3 py-2 border border-[#828282] rounded-md"
              >
                <option value="">Select Impact</option>
                {impactOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {newActionItem.likelihood && newActionItem.impact && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Risk Score
                </label>
                <input
                  type="text"
                  value={calculateRisk(newActionItem.likelihood, newActionItem.impact).score}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Risk Category
                </label>
                <div
                  className={`w-full px-3 py-2 border rounded-md text-white text-center font-medium ${
                    calculateRisk(newActionItem.likelihood, newActionItem.impact).color === "green"
                      ? "bg-green-500"
                      : calculateRisk(newActionItem.likelihood, newActionItem.impact).color === "orange"
                      ? "bg-orange-500"
                      : "bg-red-500"
                  }`}
                >
                  {calculateRisk(newActionItem.likelihood, newActionItem.impact).category}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={handleDiscardActionItem}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 cursor-pointer"
            >
              Discard/Close
            </button>
            <button
              onClick={handleCreateActionItem}
              disabled={!newActionItem.title || !newActionItem.description || !newActionItem.assignedTo || !newActionItem.dueDate || !newActionItem.likelihood || !newActionItem.impact}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Assessment Link Modal
  const renderAssessmentLinkModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium mb-4">Link Assessment</h3>
        <p className="mb-6">Do you wish to link assessment?</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => {
              setShowCreateAssessment(true);
              setShowAssessmentLink(false);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
          >
            Create New Assessment
          </button>
          <button
            onClick={() => setShowAssessmentLink(false)}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  // Create Assessment Modal
  const renderCreateAssessmentModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Create New Assessment</h3>
          <button
            onClick={() => setShowCreateAssessment(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <p className="text-gray-600">Assessment creation workflow would go here...</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowCreateAssessment(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                setShowCreateAssessment(false);
                addToast("success", "Assessment created successfully");
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer"
            >
              Create Assessment
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Confirmation Modals
  const renderConfirmationModals = () => (
    <>
      {/* Submit Confirmation */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Confirm Submission</h3>
            <p className="mb-6">
              Are you sure you want to submit this RoPA? This will move it to
              CheckSync stage and notify the Privacy SME.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 cursor-pointer"
              >
                No
              </button>
              <button
                onClick={confirmSubmitInfoVoyage}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Move to Beam Confirmation */}
      {showMoveToBeamConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Move to Beam Stage</h3>
            <p className="mb-2">
              {new Date().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}{" "}
              is your next review date
            </p>
            <p className="mb-6">
              Are you sure do you want to move it to Beam stage?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowMoveToBeamConfirm(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 cursor-pointer"
              >
                No
              </button>
              <button
                onClick={confirmMoveToBeam}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Move to OffDoff Confirmation */}
      {showMoveToOffDoffConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Move to Off-Doff Stage</h3>
            <p className="mb-6">
              Are you sure do you wish to move it Off-Doff stage?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowMoveToOffDoffConfirm(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 cursor-pointer"
              >
                No
              </button>
              <button
                onClick={confirmMoveToOffDoff}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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
                : stage.id === "infovoyage" &&
                  infovoyageTabs.some((tab) => tab.id === currentTab)
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
                : stage.id === "infovoyage" &&
                  infovoyageTabs.some((tab) => tab.id === currentTab)
                ? "✓"
                : index + 1}
            </span>
          </div>
          {index < stages.length - 1 && (
            <div
              className={`w-8 lg:w-24 h-0.5 mx-2 rounded-full transition-colors duration-500 ease-in-out
              ${
                stage.id === "infovoyage" &&
                infovoyageTabs.some((tab) => tab.id === currentTab)
                  ? "bg-[#5DEE92]"
                  : "bg-gray-200"
              }`}
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

  const PageHeader = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Create RoPA - {workflow.ropaId}
            </h1>
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
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Current User: {currentUser.name} (
              {currentUser.role.replace("_", " ").toUpperCase()})
            </div>
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
            >
              Reset Form
            </button>
          </div>
        </div>
      </div>
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

  const handleNextStage = () => {
    if (currentStage === "infovoyage") {
      if (!validateTab(currentTab)) return;

      const currentTabIndex = infovoyageTabs.findIndex(
        (tab) => tab.id === currentTab
      );
      if (currentTabIndex < infovoyageTabs.length - 1) {
        setCurrentTab(infovoyageTabs[currentTabIndex + 1].id);
      } else {
        handleSubmitInfoVoyage();
      }
    }
  };

  const handlePreviousStage = () => {
    if (currentStage === "infovoyage") {
      const currentTabIndex = infovoyageTabs.findIndex(
        (tab) => tab.id === currentTab
      );
      if (currentTabIndex > 0) {
        setCurrentTab(infovoyageTabs[currentTabIndex - 1].id);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      levelInfo: { mainLevel: "", subLevel: "", levelPath: "" },
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
        additionalComments: "",
      },
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
        additionalComments: "",
      },
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
        additionalComments: "",
      },
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
        nextReviewDate: "",
      },
      checkSyncActions: [],
      beamReview: { reviewComments: "", moveToOffDoff: false },
      offDoff: { completionDate: "", finalComments: "" },
    });
    setActionItems([]);
    setCurrentStage("infovoyage");
    setCurrentTab("operationalLens");
    setErrors({});
    setWorkflow({
      assignedTo: null,
      status: "draft",
      ropaId: `ROPA-${Date.now().toString().slice(-6)}`,
      createdAt: new Date(),
      createdBy: currentUser,
      currentAssignee: currentUser,
      riskAssessment: {
        likelihood: "",
        impact: "",
        score: 0,
        category: "",
        color: "",
      },
    });
  };

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <PageHeader />

      {/* Main Content */}
      <div className="mx-auto py-6">
        {/* Progress Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <ProgressBar />
        </div>

        {/* Form Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          {getCurrentContent()}
        </div>

        {/* Navigation Footer */}
        {currentStage === "infovoyage" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mt-6">
            <div className="flex justify-between">
              <div>
                {currentTab !== "operationalLens" && canEditInfoVoyage() && (
                  <button
                    onClick={handlePreviousStage}
                    className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    Previous
                  </button>
                )}
              </div>
              <div>
                {canEditInfoVoyage() ? (
                  <button
                    onClick={handleNextStage}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                  >
                    {currentTab === "dataTransit" ? "Submit RoPA" : "Next"}
                  </button>
                ) : (
                  <div className="text-sm text-gray-500 italic">
                    {workflow.status === "assigned"
                      ? "Awaiting Process Expert input..."
                      : workflow.status === "submitted"
                      ? "Submitted to Privacy SME for review"
                      : "No edit permissions"}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showActionItemForm && renderActionItemForm()}
      {showAssessmentLink && renderAssessmentLinkModal()}
      {showCreateAssessment && renderCreateAssessmentModal()}
      {renderConfirmationModals()}
    </div>
  );
};

export default RoPAPage;