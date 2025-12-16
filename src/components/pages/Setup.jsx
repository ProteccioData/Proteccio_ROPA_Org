// components/SetupWithModals.jsx
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Download,
  ShieldCheck,
  HardDrive,
  Database,
  Server,
  CirclePlus,
  Building,
  Users,
  UserCheck,
  Target,
  Calendar,
  Shield,
  Globe,
  FileText,
  Edit,
  Archive,
  Eye,
  Trash2,
  Gavel,
} from "lucide-react";
import {
  Modal,
  FormInput,
  FormSelect,
  FileUpload,
  BulkImportModal,
} from "../ui/SetUpModal";
import {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  uploadAssetAttachment,
  bulkImportAssets,
  getConfigs,
  getConfigById,
  createConfig,
  updateConfig,
  deleteConfig,
  createSecuritySafeguard,
  updateSecuritySafeguard,
  deleteSecuritySafeguard,
  CONFIG_TYPE_MAP,
} from "../../services/SetupService";

import { useToast } from "../ui/ToastProvider";
import UserSearchSelect from "../ui/UserSearchSelect";

const setupOptions = [
  {
    id: 1,
    title: "Assets Management",
    description: "Manage and organize your digital assets",
    icon: <HardDrive size={32} className="text-gray-700 dark:text-gray-300" />,
    modalKey: "assets_management",
  },
  {
    id: 2,
    title: "Data Collection Configuration",
    description: "Configure data collection sources and methods",
    icon: <Server size={32} className="text-gray-700 dark:text-gray-300" />,
    modalKey: "data_collection",
  },
  {
    id: 3,
    title: "Data Element Configuration",
    description: "Define data elements and their types",
    icon: <Database size={32} className="text-gray-700 dark:text-gray-300" />,
    modalKey: "data_element",
  },
  {
    id: 4,
    title: "Data Deletion Configuration",
    description: "Configure deletion policies",
    icon: <Calendar size={32} className="text-gray-700 dark:text-gray-300" />,
    modalKey: "data_deletion",
  },
  {
    id: 5,
    title: "Data Subjects Configuration",
    description: "Manage data subject categories and preferences",
    icon: <UserCheck size={32} className="text-gray-700 dark:text-gray-300" />,
    modalKey: "data_subject",
  },
  {
    id: 6,
    title: "Data Transfer Configurations",
    description: "Configure cross-border data transfer settings",
    icon: <Globe size={32} className="text-gray-700 dark:text-gray-300" />,
    modalKey: "data_transfer",
  },
  {
    id: 7,
    title: "Department Configuration",
    description: "Set up and manage organizational departments",
    icon: <Building size={32} className="text-gray-700 dark:text-gray-300" />,
    modalKey: "department",
  },
  {
    id: 8,
    title: "Organization Configuration",
    description: "Configure organization settings and structure",
    icon: <Users size={32} className="text-gray-700 dark:text-gray-300" />,
    modalKey: "organization",
  },
  {
    id: 9,
    title: "Purpose Configuration",
    description: "Define purposes for data processing",
    icon: <Target size={32} className="text-gray-700 dark:text-gray-300" />,
    modalKey: "purpose",
  },
  {
    id: 10,
    title: "Legal Basis Configuration",
    description: "Configure legal basis for data processing",
    icon: <Gavel size={32} className="text-gray-700 dark:text-gray-300" />,
    modalKey: "legal_basis",
  },
  {
    id: 11,
    title: "Security Safeguards Configuration",
    description: "Configure security measures and safeguards",
    icon: <Shield size={32} className="text-gray-700 dark:text-gray-300" />,
    modalKey: "security_safeguards",
  },
];

const sampleComplianceMeasures = [
  {
    id: 1,
    name: "GDPR Compliance",
    description: "General Data Protection Regulation",
    uniqueId: "CM-001",
  },
  {
    id: 2,
    name: "CCPA Compliance",
    description: "California Consumer Privacy Act",
    uniqueId: "CM-002",
  },
];

const sampleOperationalMeasures = [
  {
    id: 1,
    name: "Incident Response Plan",
    description: "Procedure for security incidents",
    uniqueId: "OM-001",
  },
  {
    id: 2,
    name: "Data Backup Procedure",
    description: "Regular data backup process",
    uniqueId: "OM-002",
  },
];

const sampleEthicalMeasures = [
  {
    id: 1,
    name: "Bias Monitoring",
    description: "Monitor AI systems for bias",
    uniqueId: "EM-001",
  },
  {
    id: 2,
    name: "Transparency Reporting",
    description: "Regular ethical compliance reports",
    uniqueId: "EM-002",
  },
];

const sampleTechnicalMeasures = [
  {
    id: 1,
    name: "Data Encryption",
    description: "Encrypt data at rest and in transit",
    uniqueId: "TM-001",
  },
  {
    id: 2,
    name: "Access Logging",
    description: "Comprehensive access audit logs",
    uniqueId: "TM-002",
  },
];

const sampleAccessMeasures = [
  {
    id: 1,
    name: "Role-Based Access Control",
    description: "Access based on user roles",
    uniqueId: "AM-001",
  },
  {
    id: 2,
    name: "Multi-Factor Authentication",
    description: "Additional authentication layer",
    uniqueId: "AM-002",
  },
];

const sampleDataGovernance = [
  {
    id: 1,
    name: "Data Quality Framework",
    description: "Ensure data accuracy and consistency",
    uniqueId: "DG-001",
  },
  {
    id: 2,
    name: "Data Classification Policy",
    description: "Classify data by sensitivity",
    uniqueId: "DG-002",
  },
];

const sampleTransparencyMeasures = [
  {
    id: 1,
    name: "Privacy Policy Updates",
    description: "Regular policy review and updates",
    uniqueId: "TM-001",
  },
  {
    id: 2,
    name: "Data Processing Register",
    description: "Maintain processing activities log",
    uniqueId: "TM-002",
  },
];

const samplePhysicalSecurity = [
  {
    id: 1,
    name: "Access Control System",
    description: "Physical access to facilities",
    uniqueId: "PS-001",
  },
  {
    id: 2,
    name: "Surveillance Monitoring",
    description: "CCTV and security cameras",
    uniqueId: "PS-002",
  },
];

const sampleRiskManagement = [
  {
    id: 1,
    name: "DPIA - Customer Data",
    type: "DPIA",
    description: "Data Protection Impact Assessment",
    uniqueId: "RM-001",
  },
  {
    id: 2,
    name: "PIA - Employee Data",
    type: "PIA",
    description: "Privacy Impact Assessment",
    uniqueId: "RM-002",
  },
];

// Dropdown Options
const assetTypes = [
  { value: "physical", label: "Physical" },
  { value: "virtual", label: "Virtual" },
];

const conditionOptions = [
  { value: "new", label: "New" },
  { value: "used", label: "Used" },
  { value: "under_repair", label: "Under Repair" },
  { value: "in_use", label: "In Use" },
  { value: "retired", label: "Retired" },
];

const yesNoOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

const valueTypes = [
  { value: "text", label: "Text Value" },
  { value: "numeric", label: "Numeric" },
  { value: "alphanumeric", label: "Alphanumeric" },
];

const deletionFrequency = [
  { value: "immediate", label: "Immediate" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "on_demand", label: "On Demand" },
];

const deletionMethods = [
  { value: "manual", label: "Manual" },
  { value: "automated", label: "Automated" },
  { value: "semi_automated", label: "Semi-Automated" },
];

const verificationMethods = [
  { value: "checksum", label: "Checksum Comparison" },
  { value: "audit_log", label: "Audit Log Review" },
];

const organizationTypes = [
  { value: "corporation", label: "Corporation" },
  { value: "llc", label: "LLC" },
  { value: "partnership", label: "Partnership" },
  { value: "non_profit", label: "Non-Profit" },
  { value: "government", label: "Government" },
];

const industrySectors = [
  { value: "technology", label: "Technology" },
  { value: "healthcare", label: "Healthcare" },
  { value: "finance", label: "Finance" },
  { value: "education", label: "Education" },
  { value: "retail", label: "Retail" },
  { value: "manufacturing", label: "Manufacturing" },
];

const categoryTypes = [
  { value: "internal", label: "Internal" },
  { value: "external", label: "External" },
  { value: "customer", label: "Customer" },
  { value: "employee", label: "Employee" },
  { value: "vendor", label: "Vendor" },
];

const purposeCategories = [
  { value: "marketing", label: "Marketing" },
  { value: "analytics", label: "Analytics" },
  { value: "service", label: "Service Delivery" },
  { value: "compliance", label: "Compliance" },
  { value: "research", label: "Research" },
];

const riskManagementTypes = [
  { value: "dpia", label: "DPIA" },
  { value: "pia", label: "PIA" },
  { value: "tia", label: "TIA" },
  { value: "lia", label: "LIA" },
];

const securityModules = [
  {
    name: "Compliance Measures",
    icon: FileText,
    modalKey: "compliance_measures",
  },
  {
    name: "Operational Measures",
    icon: FileText,
    modalKey: "operational_measures",
  },
  { name: "Ethical Measures", icon: FileText, modalKey: "ethical_measures" },
  {
    name: "Technical Measures",
    icon: FileText,
    modalKey: "technical_measures",
  },
  { name: "Access Measures", icon: FileText, modalKey: "access_measures" },
  { name: "Data Governance", icon: FileText, modalKey: "data_governance" },
  {
    name: "Transparency Measures",
    icon: FileText,
    modalKey: "transparency_measures",
  },
  { name: "Physical Security", icon: FileText, modalKey: "physical_security" },
  { name: "Risk Management", icon: FileText, modalKey: "risk_management" },
];

const ActionButton = ({ onClick, icon: Icon, color = "gray", title }) => (
  <button
    onClick={onClick}
    className={`
      p-2 rounded transition-colors
      hover:bg-${color}-100 dark:hover:bg-${color}-900
    `}
    title={title}
  >
    <Icon size={16} className={`text-${color}-600`} />
  </button>
);

export default function Setup() {
  const [activeModal, setActiveModal] = useState(null);
  const [nestedModal, setNestedModal] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [bulkImportModal, setBulkImportModal] = useState(null);
  const [formValues, setFormValues] = useState({});

  const { addToast } = useToast();

  const [loading, setLoading] = useState(false);

  const [assets, setAssets] = useState([]);
  const [configs, setConfigs] = useState({}); // dynamic object: type → list

  const [fieldErrors, setFieldErrors] = useState({}); // inline errors map param -> message

  // formRef for nested modal form extraction
  const formRef = useRef(null);

  useEffect(() => {
    preloadAllCounts();
  }, []);

  const preloadAllCounts = async () => {
    try {
      // Load assets
      const resAssets = await getAssets();
      setAssets(resAssets.data.assets || []);

      // Load all config modules
      const modulesToLoad = [
        "data_collection",
        "data_element",
        "data_deletion",
        "data_subject",
        "data_transfer",
        "department",
        "organization",
        "purpose",
        "legal_basis",
        "compliance_measures",
        "operational_measures",
        "ethical_measures",
        "technical_measures",
        "access_measures",
        "data_governance",
        "transparency_measures",
        "physical_security",
        "risk_management",
      ];

      for (const m of modulesToLoad) {
        try {
          const res = await getConfigs(m);
          setConfigs((prev) => ({
            ...prev,
            [m]: res.data.configs || [],
          }));
        } catch (e) {
          console.warn("Failed to preload", m);
        }
      }
    } catch (err) {
      console.error("Preload error:", err);
    }
  };

  const generateId = () =>
    `ID_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleFilesSelected = (files) => {
    setSelectedFiles(files);
  };

  const generateAssetTemplate = () => {
    const headers = [
      "Asset Name",
      "Asset Type",
      "Asset ID",
      "Short Description",
      "Purchase Date",
      "Location",
      "Condition/Status",
      "Owner/Assigned to",
      "Warranty Information",
      "Is Supplier/Vendor Managed",
    ];
    const sampleData = [
      "Laptop Dell XPS 13",
      "Physical",
      "AST-001",
      "High-performance laptop for development",
      "2024-01-15",
      "Office A1",
      "In Use",
      "John Doe",
      "2026-01-15",
      "No",
    ];
    return [headers, sampleData].map((row) => row.join(",")).join("\n");
  };

  const generateDataCollectionTemplate = () => {
    const headers = ["Name", "Data Source Type", "Description"];
    const sampleData = [
      "Customer Registration Form",
      "Web Form",
      "Customer registration form data collection",
    ];
    return [headers, sampleData].map((row) => row.join(",")).join("\n");
  };

  const handleFileUpload = async (file, configType) => {
    console.log(`Uploading ${file.name} for ${configType}`);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      console.log("File content:", content);

      switch (configType) {
        case "assets":
          processAssetImport(content);
          break;
        case "data_collection":
          processDataCollectionImport(content);
          break;
        default:
          processGenericImport(content, configType);
      }
    };
    reader.readAsText(file);
  };

  const processAssetImport = (content) => {
    const rows = content.split("\n").slice(1);
    const assets = rows.map((row) => {
      const [
        name,
        type,
        assetId,
        description,
        purchaseDate,
        location,
        status,
        owner,
        warranty,
        supplierManaged,
      ] = row.split(",");
      return {
        asset_name: name,
        asset_type: type,
        asset_id_custom: assetId,
        short_description: description,
        purchase_date: purchaseDate,
        location,
        condition_status: status,
        owner_assigned_to: owner,
        warranty_info: warranty,
        is_supplier_vendor_managed: supplierManaged,
      };
    });

    console.log("Processed assets:", assets);
  };

  const handleBulkImport = (configType) => {
    setBulkImportModal(configType);
  };

  const sanitizeName = (text) =>
    text
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");

  // Inject name attributes when inputs lack them (based on neighboring labels)
  const ensureFieldNames = (formEl) => {
    if (!formEl) return;
    const inputs = formEl.querySelectorAll("input, select, textarea");
    inputs.forEach((input) => {
      if (input.name) return;

      let name = null;
      if (input.id) {
        const lab = formEl.querySelector(`label[for='${input.id}']`);
        if (lab && lab.innerText) name = sanitizeName(lab.innerText);
      }

      if (!name) {
        const prev = input.previousElementSibling;
        if (prev && prev.tagName === "LABEL" && prev.innerText) {
          name = sanitizeName(prev.innerText);
        }
      }

      if (!name) {
        if (input.parentElement && input.parentElement.tagName === "LABEL") {
          name = sanitizeName(input.parentElement.innerText);
        }
      }

      if (!name) {
        name = `${input.tagName.toLowerCase()}_${Math.random()
          .toString(36)
          .substr(2, 6)}`;
      }

      input.name = name;
    });
  };

  const normalizeValue = (key, value) => {
    if (value === null || typeof value === "undefined") return null;
    if (typeof value === "string") value = value.trim();
    if (typeof value === "string") {
      const low = value.toLowerCase();
      if (low === "yes") return true;
      if (low === "no") return false;
      if (low === "true") return true;
      if (low === "false") return false;
      if (low === "" || low === "select" || value === "undefined") return null;
    }
    if (key.match(/(^|_)id$|count|number|amount/gi) && !isNaN(value)) {
      return Number(value);
    }
    if (key.includes("date") && typeof value === "string") {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d.toISOString();
    }
    if (key === "asset_type" && typeof value === "string") {
      const m = value.toLowerCase();
      return m === "physical"
        ? "Physical"
        : m === "virtual"
        ? "Virtual"
        : value;
    }
    if (key === "condition_status" && typeof value === "string") {
      const map = {
        in_use: "In Use",
        "in use": "In Use",
        under_repair: "Under Repair",
        "under repair": "Under Repair",
        new: "New",
        used: "Used",
        retired: "Retired",
      };
      const k = value.toLowerCase().replace(/\s+/g, "_");
      return map[k] || value;
    }
    return value;
  };

  const buildMetadata = (frontendType, rawValues) => {
    const topLevelKeys = new Set(["name", "description", "status"]);
    const metadata = {};
    Object.entries(rawValues || {}).forEach(([k, v]) => {
      if (topLevelKeys.has(k)) return;
      metadata[k] = v;
    });
    return metadata;
  };

  const extractFormData = (frontendType, isAsset = false) => {
    const formEl = formRef.current;
    if (!formEl) return {};
    ensureFieldNames(formEl);
    const elements = Array.from(
      formEl.querySelectorAll("input, select, textarea")
    );
    const raw = {};
    elements.forEach((el) => {
      if (el.disabled) return;
      const type = el.type;
      const name = el.name;
      if (!name) return;
      let value = null;
      if (type === "checkbox") {
        value = el.checked;
      } else if (type === "radio") {
        if (!el.checked) return;
        value = el.value;
      } else if (el.tagName === "SELECT" && el.multiple) {
        value = Array.from(el.selectedOptions).map((o) => o.value);
      } else if (type === "file") {
        value = el.files ? Array.from(el.files) : [];
      } else {
        value = el.value;
      }
      raw[name] = normalizeValue(name, value);
    });

    // Convert for asset payload
    if (frontendType === "assets_management" || frontendType === "asset") {
      const mapping = {
        asset_name: "asset_name",
        assetname: "asset_name",
        "asset name": "asset_name",
        asset_id: "asset_id_custom",
        assetid: "asset_id_custom",
        "asset id": "asset_id_custom",
        asset_id_custom: "asset_id_custom",
        short_description: "short_description",
        description: "short_description",
        purchase_date: "purchase_date",
        location: "location",
        condition_status: "condition_status",
        condition: "condition_status",
        status: "status",
        // owner_assigned_to: "owner_assigned_to",
        // owner: formValues.owner_assigned_to || null || "owner_assigned_to",
        warranty_info: "warranty_info",
        is_supplier_vendor_managed: "is_supplier_vendor_managed",
        supplier_vendor_name: "supplier_vendor_name",
      };

      const payload = {};
      Object.entries(raw).forEach(([k, v]) => {
        const key = k.toLowerCase();
        const mapped = mapping[key] || mapping[key.replace(/[_ ]/g, "")] || key;
        payload[mapped] = v;
      });

      if (typeof payload.is_supplier_vendor_managed === "string") {
        payload.is_supplier_vendor_managed =
          payload.is_supplier_vendor_managed === "yes" ||
          payload.is_supplier_vendor_managed === "true";
      }

      if (formValues.owner_assigned_to) {
        payload.owner_assigned_to = formValues.owner_assigned_to;
      }

      return payload;
    }

    // Config modules: prefer top-level name/description keys
    const topName =
      raw.name ||
      raw.title ||
      raw["data source type"] ||
      raw["data_source_type"] ||
      raw[Object.keys(raw).find((k) => k.includes("name"))];
    const topDescription =
      raw.description ||
      raw.desc ||
      raw[Object.keys(raw).find((k) => k.includes("description"))];

    const toplevel = {};
    if (topName) toplevel.name = topName;
    if (topDescription) toplevel.description = topDescription;
    const metadata = buildMetadata(frontendType, raw);

    return {
      name: toplevel.name || generateId(),
      description: toplevel.description || "",
      metadata,
    };
  };

  const loadModuleData = async (modalKey) => {
    try {
      setLoading(true);

      // ASSETS
      if (modalKey === "assets_management") {
        const res = await getAssets();
        setAssets(res.data.assets || []);
        return;
      }

      let frontendType = modalKey;

      // NORMALIZE modalKey → frontendType
      if (
        modalKey === "data_element" ||
        modalKey === "edit_data_element" ||
        modalKey === "new_data_element"
      )
        frontendType = "data_element";

      if (
        modalKey === "data_subject" ||
        modalKey === "edit_data_subject" ||
        modalKey === "new_data_subject"
      )
        frontendType = "data_subject";

      if (modalKey === "data_transfer") frontendType = "data_transfer";

      if (frontendType === "security_safeguards") {
        return; // no backend call for parent module
      }

      // Fix for security submodules
      if (securityModules.find((m) => m.modalKey === modalKey)) {
        frontendType = modalKey;
      }

      // Security modules
      if (modalKey === "compliance_measures")
        frontendType = "compliance_measures";
      if (modalKey === "operational_measures")
        frontendType = "operational_measures";
      if (modalKey === "ethical_measures") frontendType = "ethical_measures";
      if (modalKey === "technical_measures")
        frontendType = "technical_measures";
      if (modalKey === "access_measures") frontendType = "access_measures";
      if (modalKey === "data_governance") frontendType = "data_governance";
      if (modalKey === "transparency_measures")
        frontendType = "transparency_measures";
      if (modalKey === "physical_security") frontendType = "physical_security";
      if (modalKey === "risk_management") frontendType = "risk_management";

      const backendType = CONFIG_TYPE_MAP[frontendType];

      if (backendType) {
        // security + config modules
        const res = await getConfigs(frontendType);
        setConfigs((prev) => ({
          ...prev,
          [modalKey]: res.data.configs || [],
        }));
      } else {
        // fallback → generic get
        const res = await getConfigs(frontendType);
        setConfigs((prev) => ({
          ...prev,
          [modalKey]: res.data.configs || [],
        }));
      }
    } catch (err) {
      console.error("Load module error", err);
      addToast("error", "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleConfigureClick = async (modalKey, event) => {
    event.stopPropagation();
    setActiveModal(modalKey);
    setNestedModal(null);
    setSelectedItem(null);
    setFieldErrors({});
    // Security Safeguards is a "parent container", not a config type
    if (modalKey === "security_safeguards") {
      setActiveModal("security_safeguards");
      return;
    }

    await loadModuleData(modalKey);
  };

  const handleAddNew = (type) => {
    setFieldErrors({});
    setSelectedItem(null);
    setNestedModal(type);
  };

  const handleEdit = (item, type) => {
    setFieldErrors({});
    setSelectedItem(item);
    setNestedModal(type);
  };

  const handleView = (item) => {
    setSelectedItem(item);
  };

  const handleArchive = async (itemId, type) => {
    if (!confirm("Are you sure you want to archive this?")) return;

    try {
      if (CONFIG_TYPE_MAP[type]) {
        await deleteConfig(type, itemId);
      } else {
        await deleteSecuritySafeguard(type, itemId);
      }
      addToast("success", "Archived successfully");
      await loadModuleData(type);
    } catch (err) {
      console.error(err);
      addToast("error", "Archive failed");
    }
  };

  const handleDeleteAsset = async (id) => {
    if (!confirm("Delete this asset?")) return;
    try {
      await deleteAsset(id);
      addToast("success", "Asset archived");
      loadModuleData("assets_management");
    } catch (e) {
      console.error(e);
      addToast("error", "Delete failed");
    }
  };

  // ===== LIST VIEW COMPONENTS =====
  const renderAssetList = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold dark:text-white">
          Asset Management
        </h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleAddNew("new_asset")}
          className="bg-[#5DEE92] text-black px-4 py-2 rounded-lg font-medium hover:bg-green-500 transition-colors text-sm flex items-center gap-2"
        >
          <Plus size={16} />
          New Asset
        </motion.button>
      </div>
      <div className="space-y-3">
        {assets.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            No configurations found
          </div>
        )}

        {assets.map((asset) => (
          <div
            key={asset.id}
            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {asset.asset_name || asset.name || asset.assetId || asset.name}
              </h4>
              <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                <span>
                  ID: {asset.asset_id_custom || asset.assetId || asset.uniqueId}
                </span>
                <span>Type: {asset.asset_type || asset.type}</span>
                <span>
                  Status:{" "}
                  {asset.status || asset.condition_status || asset.status}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <ActionButton
                onClick={() => handleView(item)}
                icon={Eye}
                color="blue"
                title="View"
              />
              <ActionButton
                onClick={() => handleEdit(item, editKey)}
                icon={Edit}
                color="green"
                title="Edit"
              />
              <ActionButton
                // onClick={() => handleArchive(item.id, moduleKey)}
                icon={Archive}
                color="orange"
                title="Archive"
              />
              {/* {moduleKey === "assets_management" && (
                <ActionButton
                  onClick={() => handleDeleteAsset(item.id)}
                  icon={Trash2}
                  color="red"
                  title="Delete"
                />
              )} */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDataCollectionList = () => {
    const list = configs["data_collection"] || [];

    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold dark:text-white">
            Data Collection Configuration
          </h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAddNew("new_data_collection")}
            className="bg-[#5DEE92] text-black px-4 py-2 rounded-lg font-medium hover:bg-green-500 transition-colors text-sm flex items-center gap-2"
          >
            <Plus size={16} />
            New Collection
          </motion.button>
        </div>

        <div className="space-y-3">
          {list.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              No configurations found
            </div>
          )}

          {list.map((collection) => (
            <div
              key={collection.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {collection.name}
                </h4>
                <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>ID: {collection.config_id || collection.uniqueId}</span>
                  <span>
                    Source:{" "}
                    {collection.metadata?.source_type ||
                      collection.sourceType ||
                      collection.source_type}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <ActionButton
                  onClick={() => handleView(collection)}
                  icon={Eye}
                  color="blue"
                  title="View"
                />
                <ActionButton
                  onClick={() => handleEdit(collection, "edit_data_collection")}
                  icon={Edit}
                  color="green"
                  title="Edit"
                />
                <ActionButton
                  onClick={() =>
                    handleArchive(collection.id, "data_collection")
                  }
                  icon={Archive}
                  color="orange"
                  title="Archive"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDataTransferList = () => {
    const list = configs["data_transfer"] || [];
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold dark:text-white">
            Data Transfer Configuration
          </h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAddNew("new_data_transfer")}
            className="bg-[#5DEE92] text-black px-4 py-2 rounded-lg font-medium hover:bg-green-500 transition-colors text-sm flex items-center gap-2"
          >
            <Plus size={16} />
            New Element
          </motion.button>
        </div>
        <div className="space-y-3">
          {list.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              No configurations found
            </div>
          )}
          {list.map((element) => (
            <div
              key={element.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {element.name}
                </h4>
                <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>ID: {element.config_id || element.uniqueId}</span>
                  <span>
                    Type: {element.metadata?.valueType || element.valueType}
                  </span>
                  <span>
                    Sensitive:{" "}
                    {element.metadata?.sensitive || element.sensitive}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <ActionButton
                  onClick={() => handleView(element)}
                  icon={Eye}
                  color="blue"
                  title="View"
                />
                <ActionButton
                  onClick={() => handleEdit(element, "edit_data_transfer")}
                  icon={Edit}
                  color="green"
                  title="Edit"
                />
                <ActionButton
                  // onClick={() => handleArchive(item.id, moduleKey)}
                  icon={Archive}
                  color="orange"
                  title="Archive"
                />
                {/* {moduleKey === "assets_management" && (
                <ActionButton
                  onClick={() => handleDeleteAsset(item.id)}
                  icon={Trash2}
                  color="red"
                  title="Delete"
                />
              )} */}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDataElementsList = () => {
    const list = configs["data_element"] || [];
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold dark:text-white">
            Data Element Configuration
          </h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAddNew("new_data_element")}
            className="bg-[#5DEE92] text-black px-4 py-2 rounded-lg font-medium hover:bg-green-500 transition-colors text-sm flex items-center gap-2"
          >
            <Plus size={16} />
            New Element
          </motion.button>
        </div>
        <div className="space-y-3">
          {list.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              No configurations found
            </div>
          )}
          {list.map((element) => (
            <div
              key={element.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {element.name}
                </h4>
                <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>ID: {element.config_id || element.uniqueId}</span>
                  <span>
                    Type: {element.metadata?.valueType || element.valueType}
                  </span>
                  <span>
                    Sensitive:{" "}
                    {element.metadata?.sensitive || element.sensitive}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <ActionButton
                  onClick={() => handleView(element)}
                  icon={Eye}
                  color="blue"
                  title="View"
                />
                <ActionButton
                  onClick={() => handleEdit(element, "edit_data_element")}
                  icon={Edit}
                  color="green"
                  title="Edit"
                />
                <ActionButton
                  // onClick={() => handleArchive(item.id, moduleKey)}
                  icon={Archive}
                  color="orange"
                  title="Archive"
                />
                {/* {moduleKey === "assets_management" && (
                <ActionButton
                  onClick={() => handleDeleteAsset(item.id)}
                  icon={Trash2}
                  color="red"
                  title="Delete"
                />
              )} */}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDataDeletionList = () => {
    const list = configs["data_deletion"] || [];
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold dark:text-white">
            Data Deletion Methods
          </h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAddNew("new_data_deletion")}
            className="bg-[#5DEE92] text-black px-4 py-2 rounded-lg font-medium hover:bg-green-500 transition-colors text-sm flex items-center gap-2"
          >
            <Plus size={16} />
            New Method
          </motion.button>
        </div>
        <div className="space-y-3">
          {list.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              No configurations found
            </div>
          )}
          {list.map((method) => (
            <div
              key={method.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {method.name}
                </h4>
                <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>ID: {method.config_id || method.uniqueId}</span>
                  <span>
                    Frequency: {method.metadata?.frequency || method.frequency}
                  </span>
                  <span>
                    Verification:{" "}
                    {method.metadata?.verification || method.verification}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <ActionButton
                  onClick={() => handleView(item)}
                  icon={Eye}
                  color="blue"
                  title="View"
                />
                <ActionButton
                  onClick={() => handleEdit(item, editKey)}
                  icon={Edit}
                  color="green"
                  title="Edit"
                />
                <ActionButton
                  // onClick={() => handleArchive(item.id, moduleKey)}
                  icon={Archive}
                  color="orange"
                  title="Archive"
                />
                {/* {moduleKey === "assets_management" && (
                <ActionButton
                  onClick={() => handleDeleteAsset(item.id)}
                  icon={Trash2}
                  color="red"
                  title="Delete"
                />
              )} */}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDepartmentList = () => {
    const list = configs["department"] || [];
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold dark:text-white">
            Department Structure
          </h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAddNew("new_department")}
            className="bg-[#5DEE92] text-black px-4 py-2 rounded-lg font-medium hover:bg-green-500 transition-colors text-sm flex items-center gap-2"
          >
            <Plus size={16} />
            New Department
          </motion.button>
        </div>
        <div className="space-y-3">
          {list.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              No configurations found
            </div>
          )}
          {list.map((dept) => (
            <div
              key={dept.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {dept.name}
                </h4>
                <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>ID: {dept.config_id || dept.uniqueId}</span>
                  <span>Head: {dept.metadata?.headName || dept.headName}</span>
                  <span>Manager: {dept.metadata?.manager || dept.manager}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <ActionButton
                  onClick={() => handleView(item)}
                  icon={Eye}
                  color="blue"
                  title="View"
                />
                <ActionButton
                  onClick={() => handleEdit(item, editKey)}
                  icon={Edit}
                  color="green"
                  title="Edit"
                />
                <ActionButton
                  // onClick={() => handleArchive(item.id, moduleKey)}
                  icon={Archive}
                  color="orange"
                  title="Archive"
                />
                {/* {moduleKey === "assets_management" && (
                <ActionButton
                  onClick={() => handleDeleteAsset(item.id)}
                  icon={Trash2}
                  color="red"
                  title="Delete"
                />
              )} */}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderOrganizationList = () => {
    const list = configs["organization"] || [];
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold dark:text-white">
            Organization Structure
          </h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAddNew("new_organization")}
            className="bg-[#5DEE92] text-black px-4 py-2 rounded-lg font-medium hover:bg-green-500 transition-colors text-sm flex items-center gap-2"
          >
            <Plus size={16} />
            New Organization
          </motion.button>
        </div>
        <div className="space-y-3">
          {list.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              No configurations found
            </div>
          )}
          {list.map((org) => (
            <div
              key={org.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {org.name}
                </h4>
                <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>ID: {org.config_id || org.uniqueId}</span>
                  <span>Type: {org.metadata?.type || org.type}</span>
                  <span>
                    Industry: {org.metadata?.industry || org.industry}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <ActionButton
                  onClick={() => handleView(item)}
                  icon={Eye}
                  color="blue"
                  title="View"
                />
                <ActionButton
                  onClick={() => handleEdit(item, editKey)}
                  icon={Edit}
                  color="green"
                  title="Edit"
                />
                <ActionButton
                  // onClick={() => handleArchive(item.id, moduleKey)}
                  icon={Archive}
                  color="orange"
                  title="Archive"
                />
                {/* {moduleKey === "assets_management" && (
                <ActionButton
                  onClick={() => handleDeleteAsset(item.id)}
                  icon={Trash2}
                  color="red"
                  title="Delete"
                />
              )} */}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDataSubjectsList = () => {
    const list = configs["data_subject"] || [];
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold dark:text-white">
            Data Subjects Categories
          </h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAddNew("new_data_subject")}
            className="bg-[#5DEE92] text-black px-4 py-2 rounded-lg font-medium hover:bg-green-500 transition-colors text-sm flex items-center gap-2"
          >
            <Plus size={16} />
            New Category
          </motion.button>
        </div>
        <div className="space-y-3">
          {list.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              No configurations found
            </div>
          )}
          {list.map((subject) => (
            <div
              key={subject.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {subject.metadata?.categoryName || subject.categoryName}
                </h4>
                <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>ID: {subject.config_id || subject.uniqueId}</span>
                  <span>
                    Type:{" "}
                    {subject.metadata?.categoryType || subject.categoryType}
                  </span>
                  <span>
                    Subcategory:{" "}
                    {subject.metadata?.subcategory || subject.subcategory}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <ActionButton
                  onClick={() => handleView(item)}
                  icon={Eye}
                  color="blue"
                  title="View"
                />
                <ActionButton
                  onClick={() => handleEdit(item, editKey)}
                  icon={Edit}
                  color="green"
                  title="Edit"
                />
                <ActionButton
                  // onClick={() => handleArchive(item.id, moduleKey)}
                  icon={Archive}
                  color="orange"
                  title="Archive"
                />
                {/* {moduleKey === "assets_management" && (
                <ActionButton
                  onClick={() => handleDeleteAsset(item.id)}
                  icon={Trash2}
                  color="red"
                  title="Delete"
                />
              )} */}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPurposeList = () => {
    const list = configs["purpose"] || [];
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold dark:text-white">
            Processing Purposes
          </h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAddNew("new_purpose")}
            className="bg-[#5DEE92] text-black px-4 py-2 rounded-lg font-medium hover:bg-green-500 transition-colors text-sm flex items-center gap-2"
          >
            <Plus size={16} />
            New Purpose
          </motion.button>
        </div>
        <div className="space-y-3">
          {list.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              No configurations found
            </div>
          )}
          {list.map((purpose) => (
            <div
              key={purpose.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {purpose.name}
                </h4>
                <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>ID: {purpose.config_id || purpose.uniqueId}</span>
                  <span>
                    Category: {purpose.metadata?.category || purpose.category}
                  </span>
                  <span>
                    Primary: {purpose.metadata?.primary || purpose.primary}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <ActionButton
                  onClick={() => handleView(item)}
                  icon={Eye}
                  color="blue"
                  title="View"
                />
                <ActionButton
                  onClick={() => handleEdit(item, editKey)}
                  icon={Edit}
                  color="green"
                  title="Edit"
                />
                <ActionButton
                  // onClick={() => handleArchive(item.id, moduleKey)}
                  icon={Archive}
                  color="orange"
                  title="Archive"
                />
                {/* {moduleKey === "assets_management" && (
                <ActionButton
                  onClick={() => handleDeleteAsset(item.id)}
                  icon={Trash2}
                  color="red"
                  title="Delete"
                />
              )} */}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderLegalBasisList = () => {
    const list = configs["legal_basis"] || [];
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold dark:text-white">Legal Basis</h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAddNew("new_legal_basis")}
            className="bg-[#5DEE92] text-black px-4 py-2 rounded-lg font-medium hover:bg-green-500 transition-colors text-sm flex items-center gap-2"
          >
            <Plus size={16} />
            New Legal Basis
          </motion.button>
        </div>
        <div className="space-y-3">
          {list.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              No configurations found
            </div>
          )}
          {list.map((basis) => (
            <div
              key={basis.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {basis.name}
                </h4>
                <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>ID: {basis.config_id || basis.uniqueId}</span>
                  <span>
                    {basis.description || basis.metadata?.description}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <ActionButton
                  onClick={() => handleView(item)}
                  icon={Eye}
                  color="blue"
                  title="View"
                />
                <ActionButton
                  onClick={() => handleEdit(item, editKey)}
                  icon={Edit}
                  color="green"
                  title="Edit"
                />
                <ActionButton
                  // onClick={() => handleArchive(item.id, moduleKey)}
                  icon={Archive}
                  color="orange"
                  title="Archive"
                />
                {/* {moduleKey === "assets_management" && (
                <ActionButton
                  onClick={() => handleDeleteAsset(item.id)}
                  icon={Trash2}
                  color="red"
                  title="Delete"
                />
              )} */}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSecuritySafeguards = () => (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-6 dark:text-white">
        Security Safeguards Modules
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {securityModules.map((module) => (
          <motion.div
            key={module.name}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-[#5DEE92] transition-colors"
            onClick={(e) => handleConfigureClick(module.modalKey, e)}
          >
            <div className="flex items-center gap-3">
              <module.icon size={24} className="text-[#5DEE92]" />
              <span className="font-medium dark:text-white">{module.name}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderSecurityModuleList = (
    title,
    sampleData,
    addKey,
    editKey,
    moduleKey
  ) => {
    const list = configs[moduleKey] || [];
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold dark:text-white">{title}</h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAddNew(addKey)}
            className="bg-[#5DEE92] text-black px-4 py-2 rounded-lg font-medium hover:bg-green-500 transition-colors text-sm flex items-center gap-2"
          >
            <Plus size={16} />
            New {title.split(" ")[0]}
          </motion.button>
        </div>
        <div className="space-y-3">
          {list.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              No configurations found
            </div>
          )}
          {list.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {item.name}
                </h4>
                <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>ID: {item.config_id || item.uniqueId}</span>
                  <span>{item.description || item.metadata?.description}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <ActionButton
                  onClick={() => handleView(item)}
                  icon={Eye}
                  color="blue"
                  title="View"
                />
                <ActionButton
                  onClick={() => handleEdit(item, editKey)}
                  icon={Edit}
                  color="green"
                  title="Edit"
                />
                <ActionButton
                  // onClick={() => handleArchive(item.id, moduleKey)}
                  icon={Archive}
                  color="orange"
                  title="Archive"
                />
                {/* {moduleKey === "assets_management" && (
                <ActionButton
                  onClick={() => handleDeleteAsset(item.id)}
                  icon={Trash2}
                  color="red"
                  title="Delete"
                />
              )} */}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  // ===== FORM COMPONENTS (with name attributes for integration) =====

  const renderAssetForm = () => (
    <div className="p-6 space-y-6">
      <h3 className="text-lg font-semibold dark:text-white">
        {selectedItem ? "Edit Asset" : "Add New Asset"}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Asset Name"
          name="asset_name"
          required
          defaultValue={selectedItem?.asset_name || selectedItem?.name || ""}
        />
        <FormSelect
          label="Asset Type"
          name="asset_type"
          options={assetTypes}
          required
          defaultValue={(selectedItem?.asset_type || "").toLowerCase()}
        />
        <FormInput
          label="Asset ID"
          name="asset_id_custom"
          required
          defaultValue={
            selectedItem?.asset_id_custom || selectedItem?.assetId || ""
          }
        />
        <FormInput
          label="Short Description"
          name="short_description"
          required
          defaultValue={selectedItem?.short_description || ""}
        />
        <FormInput
          label="Purchase Date"
          name="purchase_date"
          type="date"
          defaultValue={
            selectedItem?.purchase_date
              ? selectedItem.purchase_date.split("T")[0]
              : ""
          }
        />
        <FormInput
          label="Location"
          name="location"
          defaultValue={selectedItem?.location || ""}
        />
        <FormSelect
          label="Condition/Status"
          name="condition_status"
          options={conditionOptions}
          required
          defaultValue={(selectedItem?.condition_status || "")
            .toLowerCase()
            .replace(" ", "_")}
        />
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Owner / Assigned To
          </label>

          <UserSearchSelect
            value={
              formValues.owner_assigned_to
                ? {
                    label: formValues.owner_assigned_to_label,
                    value: formValues.owner_assigned_to,
                  }
                : selectedItem?.owner
                ? {
                    label: `${selectedItem.owner.full_name} (${selectedItem.owner.email})`,
                    value: selectedItem.owner.id,
                  }
                : null
            }
            onChange={(opt) => {
              setFormValues((prev) => ({
                ...prev,
                owner_assigned_to: opt?.value || null,
                owner_assigned_to_label: opt?.label || "",
              }));
            }}
          />
        </div>

        <FormInput
          label="Warranty Information"
          name="warranty_info"
          type="date"
          defaultValue={
            selectedItem?.warranty_info
              ? selectedItem.warranty_info.split("T")[0]
              : ""
          }
        />
        <FormSelect
          label="Is Supplier/Vendor Managed?"
          name="is_supplier_vendor_managed"
          options={yesNoOptions}
          required
          defaultValue={
            selectedItem?.is_supplier_vendor_managed
              ? selectedItem.is_supplier_vendor_managed
                ? "yes"
                : "no"
              : ""
          }
        />
      </div>
      <FileUpload
        label="Attachments/Documents"
        name="attachments"
        accept=".doc,.docx,.pdf,.xlsx,.jpg,.jpeg,.svg,.eml"
        multiple
        onFilesSelected={handleFilesSelected}
      />

      {/* Inline validation display for any asset fields */}
      <div>
        {Object.entries(fieldErrors)
          .filter(([k]) => k.startsWith("asset"))
          .map(([k, v]) => (
            <div key={k} className="text-sm text-red-600 mt-1">
              {v}
            </div>
          ))}
      </div>
    </div>
  );

  const renderDataCollectionForm = () => (
    <div className="p-6 space-y-6">
      <h3 className="text-lg font-semibold dark:text-white">
        {selectedItem ? "Edit Data Collection" : "Add New Data Collection"}
      </h3>
      <div className="grid grid-cols-1 gap-4">
        {/* top-level name for config */}
        <FormInput
          label="Name"
          name="name"
          required
          defaultValue={selectedItem?.name || ""}
        />
        <FormInput
          label="Data Source Type"
          name="source_type"
          required
          defaultValue={selectedItem?.metadata?.source_type || ""}
        />
        <FormInput
          label="Description"
          name="description"
          required
          defaultValue={selectedItem?.description || ""}
        />
        <FileUpload
          label="Attachments/Documents"
          name="attachments"
          accept=".doc,.docx,.pdf,.xlsx,.jpg,.jpeg,.svg,.eml"
          multiple
          onFilesSelected={handleFilesSelected}
        />

        {/* inline errors */}
        {fieldErrors["name"] && (
          <div className="text-sm text-red-600">{fieldErrors["name"]}</div>
        )}
        {fieldErrors["source_type"] && (
          <div className="text-sm text-red-600">
            {fieldErrors["source_type"]}
          </div>
        )}
      </div>
    </div>
  );

  const renderDataTransferForm = () => (
    <div className="p-6 space-y-6">
      <h3 className="text-lg font-semibold dark:text-white">
        {selectedItem ? "Edit Data Transfer" : "Add New Data Transfer"}
      </h3>

      <div className="grid grid-cols-1 gap-4">
        <FormInput
          label="Name"
          name="name"
          required
          defaultValue={selectedItem?.name || ""}
        />
        <FormInput
          label="Description"
          name="description"
          required
          defaultValue={selectedItem?.description || ""}
        />
        <FormSelect
          label="Value Type"
          name="valueType"
          options={valueTypes}
          defaultValue={String(
            selectedItem?.metadata?.valueType ?? selectedItem?.valueType ?? ""
          ).toLowerCase()}
        />
        <FormSelect
          label="Sensitive"
          name="sensitive"
          options={yesNoOptions}
          defaultValue={String(
            selectedItem?.metadata?.valueType ?? selectedItem?.valueType ?? ""
          ).toLowerCase()}
        />
      </div>

      {fieldErrors["name"] && (
        <div className="text-sm text-red-600">{fieldErrors["name"]}</div>
      )}
    </div>
  );

  const renderDataElementForm = () => (
    <div className="p-6 space-y-6">
      <h3 className="text-lg font-semibold dark:text-white">
        {selectedItem ? "Edit Data Element" : "Add New Data Element"}
      </h3>
      <div className="grid grid-cols-1 gap-4">
        <FormInput
          label="Name of the Data Element"
          name="name"
          required
          defaultValue={selectedItem?.name || ""}
        />
        <FormInput
          label="Description"
          name="description"
          required
          defaultValue={selectedItem?.description || ""}
        />
        <FormSelect
          label="Value Type"
          name="valueType"
          options={valueTypes}
          required
          defaultValue={String(
            selectedItem?.metadata?.valueType ?? selectedItem?.valueType ?? ""
          ).toLowerCase()}
        />
        <FormSelect
          label="Is Sensitive Data?"
          name="sensitive"
          options={yesNoOptions}
          required
          defaultValue={(
            selectedItem?.metadata?.valueType ??
            selectedItem?.valueType ??
            ""
          ).toLowerCase()}
        />
        <FileUpload
          label="Attachments/Documents"
          name="attachments"
          accept=".doc,.docx,.pdf,.xlsx,.jpg,.jpeg,.svg,.eml"
          multiple
          onFilesSelected={handleFilesSelected}
        />

        {fieldErrors["name"] && (
          <div className="text-sm text-red-600">{fieldErrors["name"]}</div>
        )}
      </div>
    </div>
  );

  const renderDataDeletionForm = () => (
    <div className="p-6 space-y-6">
      <h3 className="text-lg font-semibold dark:text-white">
        {selectedItem
          ? "Edit Data Deletion Method"
          : "Add New Data Deletion Method"}
      </h3>
      <div className="grid grid-cols-1 gap-4">
        <FormInput
          label="Name of Data Deletion Method"
          name="name"
          required
          defaultValue={selectedItem?.name || ""}
        />
        <FormInput
          label="Description"
          name="description"
          required
          defaultValue={selectedItem?.description || ""}
        />
        <FormSelect
          label="Deletion Frequency"
          name="frequency"
          options={deletionFrequency}
          defaultValue={(
            selectedItem?.metadata?.frequency ||
            selectedItem?.frequency ||
            ""
          ).toLowerCase()}
        />
        <FormSelect
          label="Is Verification Needed?"
          name="verification"
          options={yesNoOptions}
          defaultValue={(
            selectedItem?.metadata?.verification ||
            selectedItem?.verification ||
            ""
          ).toLowerCase()}
        />
        <FormSelect
          label="When Deletion Happens"
          name="method"
          options={deletionMethods}
        />
        <FormSelect
          label="How Deletion is Verified"
          name="verification_method"
          options={verificationMethods}
        />
      </div>
      {fieldErrors["name"] && (
        <div className="text-sm text-red-600">{fieldErrors["name"]}</div>
      )}
    </div>
  );

  const renderDepartmentForm = () => (
    <div className="p-6 space-y-6">
      <h3 className="text-lg font-semibold dark:text-white">
        {selectedItem ? "Edit Department" : "Add New Department"}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Department Name"
          name="name"
          required
          defaultValue={selectedItem?.name || ""}
        />
        <FormInput
          label="Description of the Role"
          name="description"
          required
          defaultValue={selectedItem?.description || ""}
        />
        <FormInput
          label="Parent Department"
          name="parent_department"
          required
          defaultValue={selectedItem?.metadata?.parent_department || ""}
        />
        <FormInput
          label="Department Head Email ID"
          name="head_email"
          required
          type="email"
          defaultValue={selectedItem?.metadata?.head_email || ""}
        />
        <FormInput
          label="Department Head Name"
          name="headName"
          required
          defaultValue={
            selectedItem?.metadata?.headName || selectedItem?.headName || ""
          }
        />
        <FormInput
          label="Manager Name"
          name="manager"
          required
          defaultValue={
            selectedItem?.metadata?.manager || selectedItem?.manager || ""
          }
        />
        <FormInput
          label="Reporting Location"
          name="reporting_location"
          required
          defaultValue={selectedItem?.metadata?.reporting_location || ""}
        />
      </div>
      {fieldErrors["name"] && (
        <div className="text-sm text-red-600">{fieldErrors["name"]}</div>
      )}
    </div>
  );

  const renderOrganizationForm = () => (
    <div className="p-6 space-y-6">
      <h3 className="text-lg font-semibold dark:text-white">
        {selectedItem ? "Edit Organization" : "Add New Organization"}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Organization Name"
          name="name"
          required
          defaultValue={selectedItem?.name || ""}
        />
        <FormInput
          label="Organization ID"
          name="org_id"
          required
          defaultValue={
            selectedItem?.metadata?.org_id || selectedItem?.orgId || ""
          }
        />
        <FormSelect
          label="Organization Type"
          name="type"
          options={organizationTypes}
          required
          defaultValue={(
            selectedItem?.metadata?.type ||
            selectedItem?.type ||
            ""
          ).toLowerCase()}
        />
        <FormSelect
          label="Industry Sector"
          name="industry"
          options={industrySectors}
          required
          defaultValue={(
            selectedItem?.metadata?.industry ||
            selectedItem?.industry ||
            ""
          ).toLowerCase()}
        />
        <FormInput
          label="Registration Number"
          name="registration_number"
          required
          defaultValue={selectedItem?.metadata?.registration_number || ""}
        />
        <FormInput
          label="Address"
          name="address"
          required
          defaultValue={selectedItem?.metadata?.address || ""}
        />
        <FormInput
          label="Website"
          name="website"
          required
          type="url"
          defaultValue={
            selectedItem?.metadata?.website || selectedItem?.website || ""
          }
        />
        <FormInput
          label="Parent Organization"
          name="parent_organization"
          required
          defaultValue={selectedItem?.metadata?.parent_organization || ""}
        />
        <FormInput
          label="Subsidiaries"
          name="subsidiaries"
          required
          defaultValue={selectedItem?.metadata?.subsidiaries || ""}
        />
        <FormInput
          label="Departments within Organization"
          name="departments"
          required
          defaultValue={selectedItem?.metadata?.departments || ""}
        />
      </div>
      {fieldErrors["name"] && (
        <div className="text-sm text-red-600">{fieldErrors["name"]}</div>
      )}
    </div>
  );

  const renderDataSubjectForm = () => (
    <div className="p-6 space-y-6">
      <h3 className="text-lg font-semibold dark:text-white">
        {selectedItem
          ? "Edit Data Subject Category"
          : "Add New Data Subject Category"}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Category Name"
          name="categoryName"
          required
          defaultValue={
            selectedItem?.metadata?.categoryName ||
            selectedItem?.categoryName ||
            ""
          }
        />
        <FormInput
          label="Description"
          name="description"
          required
          defaultValue={selectedItem?.description || ""}
        />
        <FormSelect
          label="Category Type"
          name="categoryType"
          options={categoryTypes}
          required
          defaultValue={(
            selectedItem?.metadata?.categoryType ||
            selectedItem?.categoryType ||
            ""
          ).toLowerCase()}
        />
        <FormInput
          label="Subcategory Type"
          name="subcategory"
          required
          defaultValue={
            selectedItem?.metadata?.subcategory ||
            selectedItem?.subcategory ||
            ""
          }
        />
      </div>
      {fieldErrors["categoryName"] && (
        <div className="text-sm text-red-600">
          {fieldErrors["categoryName"]}
        </div>
      )}
    </div>
  );

  const renderPurposeForm = () => (
    <div className="p-6 space-y-6">
      <h3 className="text-lg font-semibold dark:text-white">
        {selectedItem ? "Edit Purpose" : "Add New Purpose"}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Purpose Name"
          name="name"
          required
          defaultValue={selectedItem?.name || ""}
        />
        <FormInput
          label="Description"
          name="description"
          required
          defaultValue={selectedItem?.description || ""}
        />
        <FormSelect
          label="Purpose Category"
          name="category"
          options={purposeCategories}
          required
          defaultValue={(
            selectedItem?.metadata?.category ||
            selectedItem?.category ||
            ""
          ).toLowerCase()}
        />
        <FormInput
          label="Primary Purpose"
          name="primary"
          required
          defaultValue={
            selectedItem?.metadata?.primary || selectedItem?.primary || ""
          }
        />
        <FormInput
          label="Secondary Purpose"
          name="secondary"
          required
          defaultValue={selectedItem?.metadata?.secondary || ""}
        />
      </div>
      {fieldErrors["name"] && (
        <div className="text-sm text-red-600">{fieldErrors["name"]}</div>
      )}
    </div>
  );

  const renderLegalBasisForm = () => (
    <div className="p-6 space-y-6">
      <h3 className="text-lg font-semibold dark:text-white">
        {selectedItem ? "Edit Legal Basis" : "Add New Legal Basis"}
      </h3>
      <div className="grid grid-cols-1 gap-4">
        <FormInput
          label="Legal Basis Name"
          name="name"
          required
          defaultValue={selectedItem?.name || ""}
        />
        <FormInput
          label="Description"
          name="description"
          required
          defaultValue={
            selectedItem?.description ||
            selectedItem?.metadata?.description ||
            ""
          }
        />
      </div>
      {fieldErrors["name"] && (
        <div className="text-sm text-red-600">{fieldErrors["name"]}</div>
      )}
    </div>
  );

  const renderSecurityMeasureForm = (title) => (
    <div className="p-6 space-y-6">
      <h3 className="text-lg font-semibold">
        {selectedItem ? `Edit ${title}` : `Add New ${title}`}
      </h3>
      <div className="grid grid-cols-1 gap-4">
        <FormInput
          label={`${title} Name`}
          name="name"
          required
          defaultValue={selectedItem?.name || ""}
        />
        <FormInput
          label="Description"
          name="description"
          required
          defaultValue={
            selectedItem?.description ||
            selectedItem?.metadata?.description ||
            ""
          }
        />
      </div>
      {fieldErrors["name"] && (
        <div className="text-sm text-red-600">{fieldErrors["name"]}</div>
      )}
    </div>
  );

  const renderRiskManagementForm = () => (
    <div className="p-6 space-y-6">
      <h3 className="text-lg font-semibold">
        {selectedItem
          ? "Edit Risk Management Measure"
          : "Add New Risk Management Measure"}
      </h3>
      <div className="grid grid-cols-1 gap-4">
        <FormSelect
          label="Risk Assessment Type"
          name="type"
          options={riskManagementTypes}
          required
          defaultValue={(
            selectedItem?.metadata?.type ||
            selectedItem?.type ||
            ""
          ).toLowerCase()}
        />
        <FormInput
          label="Measure Name"
          name="name"
          required
          defaultValue={selectedItem?.name || ""}
        />
        <FormInput
          label="Description"
          name="description"
          required
          defaultValue={
            selectedItem?.description ||
            selectedItem?.metadata?.description ||
            ""
          }
        />
      </div>
      {fieldErrors["name"] && (
        <div className="text-sm text-red-600">{fieldErrors["name"]}</div>
      )}
    </div>
  );

  // ===== MODAL CONFIGS =====

  const modalConfigs = {
    assets_management: {
      title: "Asset Management",
      content: renderAssetList(),
      size: "xl",
    },
    data_collection: {
      title: "Data Collection Configuration",
      content: renderDataCollectionList(),
      size: "xl",
    },
    data_element: {
      title: "Data Element Configuration",
      content: renderDataElementsList(),
      size: "xl",
    },
    data_deletion: {
      title: "Data Deletion Configuration",
      content: renderDataDeletionList(),
      size: "xl",
    },
    data_subject: {
      title: "Data Subjects Configuration",
      content: renderDataSubjectsList(),
      size: "xl",
    },
    data_transfer: {
      title: "Data Transfer Configurations",
      content: renderDataTransferList(),
      size: "xl",
    },
    department: {
      title: "Department Configuration",
      content: renderDepartmentList(),
      size: "xl",
    },
    organization: {
      title: "Organization Configuration",
      content: renderOrganizationList(),
      size: "xl",
    },
    purpose: {
      title: "Purpose Configuration",
      content: renderPurposeList(),
      size: "xl",
    },
    legal_basis: {
      title: "Legal Basis Configuration",
      content: renderLegalBasisList(),
      size: "xl",
    },
    security_safeguards: {
      title: "Security Safeguards Configuration",
      content: renderSecuritySafeguards(),
      size: "xl",
    },
    compliance_measures: {
      title: "Compliance Measures",
      content: renderSecurityModuleList(
        "Compliance Measures",
        sampleComplianceMeasures,
        "new_compliance",
        "edit_compliance",
        "compliance_measures"
      ),
      size: "xl",
    },
    operational_measures: {
      title: "Operational Measures",
      content: renderSecurityModuleList(
        "Operational Measures",
        sampleOperationalMeasures,
        "new_operational",
        "edit_operational",
        "operational_measures"
      ),
      size: "xl",
    },
    ethical_measures: {
      title: "Ethical Measures",
      content: renderSecurityModuleList(
        "Ethical Measures",
        sampleEthicalMeasures,
        "new_ethical",
        "edit_ethical",
        "ethical_measures"
      ),
      size: "xl",
    },
    technical_measures: {
      title: "Technical Measures",
      content: renderSecurityModuleList(
        "Technical Measures",
        sampleTechnicalMeasures,
        "new_technical",
        "edit_technical",
        "technical_measures"
      ),
      size: "xl",
    },
    access_measures: {
      title: "Access Measures",
      content: renderSecurityModuleList(
        "Access Measures",
        sampleAccessMeasures,
        "new_access",
        "edit_access",
        "access_measures"
      ),
      size: "xl",
    },
    data_governance: {
      title: "Data Governance",
      content: renderSecurityModuleList(
        "Data Governance Measures",
        sampleDataGovernance,
        "new_data_gov",
        "edit_data_gov",
        "data_governance"
      ),
      size: "xl",
    },
    transparency_measures: {
      title: "Transparency Measures",
      content: renderSecurityModuleList(
        "Transparency Measures",
        sampleTransparencyMeasures,
        "new_transparency",
        "edit_transparency",
        "transparency_measures"
      ),
      size: "xl",
    },
    physical_security: {
      title: "Physical Security",
      content: renderSecurityModuleList(
        "Physical Security Measures",
        samplePhysicalSecurity,
        "new_physical",
        "edit_physical",
        "physical_security"
      ),
      size: "xl",
    },
    risk_management: {
      title: "Risk Management",
      content: renderSecurityModuleList(
        "Risk Management Measures",
        sampleRiskManagement,
        "new_risk",
        "edit_risk",
        "risk_management"
      ),
      size: "xl",
    },
  };

  const nestedModalConfigs = {
    new_asset: {
      title: "Add New Asset",
      content: renderAssetForm(),
      size: "xl",
    },
    edit_asset: { title: "Edit Asset", content: renderAssetForm(), size: "xl" },
    new_data_collection: {
      title: "Add New Data Collection",
      content: renderDataCollectionForm(),
      size: "lg",
    },
    edit_data_collection: {
      title: "Edit Data Collection",
      content: renderDataCollectionForm(),
      size: "lg",
    },
    new_data_element: {
      title: "Add New Data Element",
      content: renderDataElementForm(),
      size: "lg",
    },
    edit_data_element: {
      title: "Edit Data Element",
      content: renderDataElementForm(),
      size: "lg",
    },
    new_data_transfer: {
      title: "Add New Data Transfer",
      content: renderDataTransferForm(),
      size: "lg",
    },
    edit_data_transfer: {
      title: "Edit Data Transfer",
      content: renderDataTransferForm(),
      size: "lg",
    },
    new_data_deletion: {
      title: "Add New Data Deletion Method",
      content: renderDataDeletionForm(),
      size: "lg",
    },
    edit_data_deletion: {
      title: "Edit Data Deletion Method",
      content: renderDataDeletionForm(),
      size: "lg",
    },
    new_department: {
      title: "Add New Department",
      content: renderDepartmentForm(),
      size: "lg",
    },
    edit_department: {
      title: "Edit Department",
      content: renderDepartmentForm(),
      size: "lg",
    },
    new_organization: {
      title: "Add New Organization",
      content: renderOrganizationForm(),
      size: "lg",
    },
    edit_organization: {
      title: "Edit Organization",
      content: renderOrganizationForm(),
      size: "lg",
    },
    // new_data_transfer: {
    //   title: "Add New Data Transfer Category",
    //   content: renderDataTransferForm(),
    //   size:"lg"
    // },
    new_data_subject: {
      title: "Add New Data Subject Category",
      content: renderDataSubjectForm(),
      size: "lg",
    },
    edit_data_subject: {
      title: "Edit Data Subject Category",
      content: renderDataSubjectForm(),
      size: "lg",
    },
    new_purpose: {
      title: "Add New Purpose",
      content: renderPurposeForm(),
      size: "lg",
    },
    edit_purpose: {
      title: "Edit Purpose",
      content: renderPurposeForm(),
      size: "lg",
    },
    new_legal_basis: {
      title: "Add New Legal Basis",
      content: renderLegalBasisForm(),
      size: "lg",
    },
    edit_legal_basis: {
      title: "Edit Legal Basis",
      content: renderLegalBasisForm(),
      size: "lg",
    },
    new_compliance: {
      title: "Add New Compliance Measure",
      content: renderSecurityMeasureForm("Compliance Measure"),
      size: "lg",
    },
    edit_compliance: {
      title: "Edit Compliance Measure",
      content: renderSecurityMeasureForm("Compliance Measure"),
      size: "lg",
    },
    new_operational: {
      title: "Add New Operational Measure",
      content: renderSecurityMeasureForm("Operational Measure"),
      size: "lg",
    },
    edit_operational: {
      title: "Edit Operational Measure",
      content: renderSecurityMeasureForm("Operational Measure"),
      size: "lg",
    },
    new_ethical: {
      title: "Add New Ethical Measure",
      content: renderSecurityMeasureForm("Ethical Measure"),
      size: "lg",
    },
    edit_ethical: {
      title: "Edit Ethical Measure",
      content: renderSecurityMeasureForm("Ethical Measure"),
      size: "lg",
    },
    new_technical: {
      title: "Add New Technical Measure",
      content: renderSecurityMeasureForm("Technical Measure"),
      size: "lg",
    },
    edit_technical: {
      title: "Edit Technical Measure",
      content: renderSecurityMeasureForm("Technical Measure"),
      size: "lg",
    },
    new_access: {
      title: "Add New Access Measure",
      content: renderSecurityMeasureForm("Access Measure"),
      size: "lg",
    },
    edit_access: {
      title: "Edit Access Measure",
      content: renderSecurityMeasureForm("Access Measure"),
      size: "lg",
    },
    new_data_gov: {
      title: "Add New Data Governance Measure",
      content: renderSecurityMeasureForm("Data Governance Measure"),
      size: "lg",
    },
    edit_data_gov: {
      title: "Edit Data Governance Measure",
      content: renderSecurityMeasureForm("Data Governance Measure"),
      size: "lg",
    },
    new_transparency: {
      title: "Add New Transparency Measure",
      content: renderSecurityMeasureForm("Transparency Measure"),
      size: "lg",
    },
    edit_transparency: {
      title: "Edit Transparency Measure",
      content: renderSecurityMeasureForm("Transparency Measure"),
      size: "lg",
    },
    new_physical: {
      title: "Add New Physical Security Measure",
      content: renderSecurityMeasureForm("Physical Security Measure"),
      size: "lg",
    },
    edit_physical: {
      title: "Edit Physical Security Measure",
      content: renderSecurityMeasureForm("Physical Security Measure"),
      size: "lg",
    },
    new_risk: {
      title: "Add New Risk Management Measure",
      content: renderRiskManagementForm(),
      size: "lg",
    },
    edit_risk: {
      title: "Edit Risk Management Measure",
      content: renderRiskManagementForm(),
      size: "lg",
    },
  };

  // ===== SAVE LOGIC =====
  const handleSave = async () => {
    // wrapper to call saveNestedForm
    await saveNestedForm();
    setFormValues({});
  };

  const uploadFilesForAsset = async (assetId, files) => {
    try {
      for (const file of files) {
        await uploadAssetAttachment(assetId, file);
      }
    } catch (err) {
      console.error("upload asset files error", err);
      // do not throw, asset created — just warn
    }
  };

  const handleFieldError = (err) => {
    if (err?.response?.data?.details) {
      const map = {};
      err.response.data.details.forEach((d) => {
        map[d.param] = d.msg;
      });
      setFieldErrors(map);
    } else {
      addToast("error", "Operation failed");
    }
  };

  const saveNestedForm = async () => {
    if (!nestedModal) return;

    const type = nestedModal.replace("new_", "").replace("edit_", "");

    try {
      setLoading(true);
      setFieldErrors({});

      // asset handling
      if (type === "asset" || nestedModal.includes("asset")) {
        const payload = extractFormData("assets_management", true);

        if (selectedItem) {
          const res = await updateAsset(selectedItem.id, payload);
          addToast("success", "Asset updated");
          // if files selected, upload
          if (selectedFiles && selectedFiles.length) {
            await uploadFilesForAsset(selectedItem.id, selectedFiles);
          }
        } else {
          const res = await createAsset(payload);
          addToast("success", "Asset created");
          const newAssetId = res.data.asset?.id;
          if (newAssetId && selectedFiles && selectedFiles.length) {
            await uploadFilesForAsset(newAssetId, selectedFiles);
          }
        }

        await loadModuleData("assets_management");
        setNestedModal(null);
        setSelectedItem(null);
        setSelectedFiles([]);
        return;
      }

      // config & security modules

      let frontendType = type;

      const normalizeTypeMap = {
        data_element: "data_element",
        data_subject: "data_subject",
        data_transfer: "data_transfer",
      };

      if (normalizeTypeMap[type]) {
        frontendType = normalizeTypeMap[type];
      }

      // security
      const secMap = {
        compliance: "compliance_measures",
        operational: "operational_measures",
        ethical: "ethical_measures",
        technical: "technical_measures",
        access: "access_measures",
        data_gov: "data_governance",
        transparency: "transparency_measures",
        physical: "physical_security",
        risk: "risk_management",
      };

      if (secMap[type]) {
        frontendType = secMap[type];
      }

      let backendType = CONFIG_TYPE_MAP[frontendType];

      // build payload
      const payload = extractFormData(frontendType, false);

      // create / update
      if (selectedItem) {
        // update
        try {
          if (!backendType) {
            // security fallback
            await updateSecuritySafeguard(
              frontendType,
              selectedItem.id,
              payload
            );
          } else {
            await updateConfig(frontendType, selectedItem.id, payload);
          }
          addToast("success", "Updated successfully");
        } catch (err) {
          // map field errors
          handleFieldError(err);
          throw err;
        }
      } else {
        // create
        try {
          if (backendType) {
            await createConfig(frontendType, payload);
          } else {
            await createSecuritySafeguard(frontendType, payload);
          }
          addToast("success", "Created successfully");
        } catch (err) {
          handleFieldError(err);
          throw err;
        }
      }

      await loadModuleData(activeModal || frontendType);
      setNestedModal(null);
      setSelectedItem(null);
    } catch (err) {
      // already handled errors above
      console.error("Save failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFieldErrors({});
    if (nestedModal) {
      setNestedModal(null);
    } else {
      setActiveModal(null);
    }
    setSelectedItem(null);
    setFormValues({});
  };

  // when nested modal opens with selectedItem (edit), prefill fields by setting values on inputs
  useEffect(() => {
    if (!nestedModal) {
      // cleanup form when closed
      if (formRef.current) {
        formRef.current.reset();
      }
      return;
    }

    // small timeout to allow modal content to mount
    setTimeout(async () => {
      // ensure names are injected
      if (formRef.current) ensureFieldNames(formRef.current);

      // if editing, prefill
      if (selectedItem && formRef.current) {
        const elements = Array.from(
          formRef.current.querySelectorAll("input, select, textarea")
        );
        elements.forEach((el) => {
          const name = el.name;
          if (!name) return;

          // read value from selectedItem top-level, metadata or fallback
          const val =
            selectedItem[name] ??
            selectedItem.metadata?.[name] ??
            selectedItem[name.replace(/_/g, "")] ??
            selectedItem.metadata?.[name.replace(/_/g, "")];

          if (typeof val !== "undefined" && val !== null) {
            if (el.type === "checkbox") {
              el.checked = Boolean(val);
            } else if (el.type === "file") {
              // leave files blank
            } else if (el.tagName === "SELECT") {
              // try to set value
              try {
                el.value = typeof val === "string" ? val.toLowerCase() : val;
              } catch (e) {}
            } else {
              // for dates: if ISO -> set YYYY-MM-DD
              if (
                name.includes("date") &&
                typeof val === "string" &&
                val.includes("T")
              ) {
                el.value = val.split("T")[0];
              } else {
                el.value = val;
              }
            }
          }
        });
      }
    }, 40);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nestedModal, selectedItem]);

  return (
    <div className="min-h-screen p-6">
      {/* Action Buttons */}
      <div className="flex w-full gap-4 mb-8">
        <motion.button
          onClick={() => handleAddNew("new_asset")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center justify-center flex-1 gap-2 bg-[#5DEE92] px-6 py-3 rounded-lg text-black font-medium shadow-md hover:opacity-90 transition"
        >
          <CirclePlus size={18} /> Add New Asset
        </motion.button>
        <motion.button
          onClick={() => handleBulkImport("assets")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center justify-center flex-1 gap-2 bg-[#5DEE92] px-6 py-3 rounded-lg text-black font-medium shadow-md hover:opacity-90 transition"
        >
          <Download size={18} /> Bulk Import
        </motion.button>
      </div>

      {/* Setup Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {setupOptions.map((option, idx) => {
          const count =
            option.modalKey === "assets_management"
              ? assets.length
              : configs[option.modalKey]?.length || 0;
          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 flex flex-col justify-between"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">{option.icon}</div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {option.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {option.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-6">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {count} items
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-[#5DEE92] text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-500 transition"
                  onClick={(e) => handleConfigureClick(option.modalKey, e)}
                >
                  Configure
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Modals (List Views) */}
      {Object.entries(modalConfigs).map(([key, config]) => (
        <Modal
          key={key}
          isOpen={activeModal === key && !nestedModal}
          onClose={() => setActiveModal(null)}
          title={config.title}
          size={config.size}
        >
          {config.content}
        </Modal>
      ))}

      {/* Nested Modals (Forms) */}
      {Object.entries(nestedModalConfigs).map(([key, config]) => (
        <Modal
          key={key}
          isOpen={nestedModal === key}
          onClose={handleCancel}
          title={config.title}
          size={config.size}
        >
          {/* wrap content in form so extractFormData can read inputs */}
          <form ref={formRef} className="p-0 m-0">
            {config.content}
          </form>

          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 dark:text-white">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              className="bg-[#5DEE92] text-black px-6 py-2 rounded-lg font-medium hover:bg-green-500 transition-colors"
            >
              {selectedItem ? "Update" : "Save"}
            </motion.button>
          </div>
        </Modal>
      ))}

      <BulkImportModal
        isOpen={bulkImportModal === "assets"}
        onClose={() => setBulkImportModal(null)}
        title="Bulk Import Assets"
        onFileUpload={async (file) => {
          try {
            await bulkImportAssets(file);
            addToast("success", "Imported successfully");
            await loadModuleData("assets_management");
          } catch (err) {
            addToast("error", "Import failed");
          }
        }}
        acceptedFormats={[".csv", ".xlsx", ".json"]}
        templateDownload={generateAssetTemplate}
      />

      <BulkImportModal
        isOpen={bulkImportModal === "data_collection"}
        onClose={() => setBulkImportModal(null)}
        title="Bulk Import Data Collections"
        onFileUpload={(file) => handleFileUpload(file, "data_collection")}
        acceptedFormats={[".csv", ".xlsx", ".json"]}
        templateDownload={generateDataCollectionTemplate}
      />
    </div>
  );
}
