// components/SetupWithModals.jsx
import { useState } from "react";
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
} from "../../services/SetupService";

import { useToast } from "../ui/ToastProvider";

const setupOptions = [
  {
    id: 1,
    title: "Assets Management",
    description: "Manage and organize your digital assets",
    items: 247,
    icon: <HardDrive size={32} className="text-gray-700 dark:text-gray-300" />,
    modalKey: "assets_management",
  },
  {
    id: 2,
    title: "Data Collection Configuration",
    description: "Configure data collection sources and methods",
    items: 47,
    icon: <Server size={32} className="text-gray-700 dark:text-gray-300" />,
    modalKey: "data_collection",
  },
  {
    id: 3,
    title: "Data Element Configuration",
    description: "Define data elements and their types",
    items: 7,
    icon: <Database size={32} className="text-gray-700 dark:text-gray-300" />,
    modalKey: "data_elements",
  },
  {
    id: 4,
    title: "Data Deletion Configuration",
    description: "Configure deletion policies",
    items: 12,
    icon: <Calendar size={32} className="text-gray-700 dark:text-gray-300" />,
    modalKey: "data_deletion",
  },
  {
    id: 5,
    title: "Data Subjects Configuration",
    description: "Manage data subject categories and preferences",
    items: 89,
    icon: <UserCheck size={32} className="text-gray-700 dark:text-gray-300" />,
    modalKey: "data_subjects",
  },
  {
    id: 6,
    title: "Data Transfer Configurations",
    description: "Configure cross-border data transfer settings",
    items: 23,
    icon: <Globe size={32} className="text-gray-700 dark:text-gray-300" />,
    modalKey: "data_transfer",
  },
  {
    id: 7,
    title: "Department Configuration",
    description: "Set up and manage organizational departments",
    items: 15,
    icon: <Building size={32} className="text-gray-700 dark:text-gray-300" />,
    modalKey: "department",
  },
  {
    id: 8,
    title: "Organization Configuration",
    description: "Configure organization settings and structure",
    items: 8,
    icon: <Users size={32} className="text-gray-700 dark:text-gray-300" />,
    modalKey: "organization",
  },
  {
    id: 9,
    title: "Purpose Configuration",
    description: "Define purposes for data processing",
    items: 34,
    icon: <Target size={32} className="text-gray-700 dark:text-gray-300" />,
    modalKey: "purpose",
  },
  {
    id: 10,
    title: "Legal Basis Configuration",
    description: "Configure legal basis for data processing",
    items: 18,
    icon: <Gavel size={32} className="text-gray-700 dark:text-gray-300" />,
    modalKey: "legal_basis",
  },
  {
    id: 11,
    title: "Security Safeguards Configuration",
    description: "Configure security measures and safeguards",
    items: 56,
    icon: <Shield size={32} className="text-gray-700 dark:text-gray-300" />,
    modalKey: "security_safeguards",
  },
];

// Sample Data
const sampleAssets = [
  {
    id: 1,
    name: "Laptop Dell XPS 13",
    assetId: "AST-001",
    type: "Physical",
    status: "In Use",
  },
  {
    id: 2,
    name: "Server Rack A1",
    assetId: "AST-002",
    type: "Physical",
    status: "Active",
  },
  {
    id: 3,
    name: "AWS EC2 Instance",
    assetId: "AST-003",
    type: "Virtual",
    status: "Running",
  },
];

const sampleDataCollections = [
  {
    id: 1,
    name: "Web Form Submissions",
    sourceType: "Web Form",
    uniqueId: "DC-001",
  },
  {
    id: 2,
    name: "Mobile App Analytics",
    sourceType: "Mobile SDK",
    uniqueId: "DC-002",
  },
];

const sampleDataElements = [
  {
    id: 1,
    name: "Email Address",
    valueType: "Text",
    sensitive: "Yes",
    uniqueId: "DE-001",
  },
  {
    id: 2,
    name: "Phone Number",
    valueType: "Numeric",
    sensitive: "Yes",
    uniqueId: "DE-002",
  },
];

const sampleDataDeletion = [
  {
    id: 1,
    name: "Automated Data Purge",
    frequency: "Monthly",
    verification: "Yes",
    uniqueId: "DD-001",
  },
  {
    id: 2,
    name: "Manual Deletion Process",
    frequency: "On Demand",
    verification: "No",
    uniqueId: "DD-002",
  },
];

const sampleDepartments = [
  {
    id: 1,
    name: "IT Department",
    headName: "John Doe",
    manager: "Jane Smith",
    uniqueId: "DEPT-001",
  },
  {
    id: 2,
    name: "HR Department",
    headName: "Alice Johnson",
    manager: "Bob Brown",
    uniqueId: "DEPT-002",
  },
];

const sampleOrganizations = [
  {
    id: 1,
    name: "Tech Corp Inc",
    orgId: "ORG-001",
    type: "Corporation",
    industry: "Technology",
    uniqueId: "ORG-001",
  },
  {
    id: 2,
    name: "Data Solutions Ltd",
    orgId: "ORG-002",
    type: "LLC",
    industry: "Consulting",
    uniqueId: "ORG-002",
  },
];

const sampleDataSubjects = [
  {
    id: 1,
    categoryName: "Customers",
    categoryType: "External",
    subcategory: "Premium",
    uniqueId: "DS-001",
  },
  {
    id: 2,
    categoryName: "Employees",
    categoryType: "Internal",
    subcategory: "Full-time",
    uniqueId: "DS-002",
  },
];

const samplePurposes = [
  {
    id: 1,
    name: "Marketing Communications",
    category: "Marketing",
    primary: "Direct Marketing",
    uniqueId: "PUR-001",
  },
  {
    id: 2,
    name: "Service Improvement",
    category: "Analytics",
    primary: "Product Enhancement",
    uniqueId: "PUR-002",
  },
];

const sampleLegalBasis = [
  {
    id: 1,
    name: "Consent",
    description: "Data subject has given consent",
    uniqueId: "LB-001",
  },
  {
    id: 2,
    name: "Contract",
    description: "Processing necessary for contract",
    uniqueId: "LB-002",
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

export default function Setup() {
  const [activeModal, setActiveModal] = useState(null);
  const [nestedModal, setNestedModal] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [bulkImportModal, setBulkImportModal] = useState(null);

  const { addToast } = useToast();

  const [loading, setLoading] = useState(false);

  const [assets, setAssets] = useState([]);
  const [configs, setConfigs] = useState({}); // dynamic object: type → list

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
    const headers = ["Data Source Type", "Description"];
    const sampleData = [
      "Web Form",
      "Customer registration form data collection",
    ];
    return [headers, sampleData].map((row) => row.join(",")).join("\n");
  };

  const handleFileUpload = async (file, configType) => {
    console.log(`Uploading ${file.name} for ${configType}`);

    // Here you would implement the actual file processing
    // This could involve:
    // 1. Reading the file content
    // 2. Parsing CSV/Excel/JSON
    // 3. Validating data
    // 4. Mapping to your data structure
    // 5. Saving to your backend

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      console.log("File content:", content);

      // Process the file based on configType
      switch (configType) {
        case "assets":
          processAssetImport(content);
          break;
        case "data_collection":
          processDataCollectionImport(content);
          break;
        // Add more cases for other config types
        default:
          processGenericImport(content, configType);
      }
    };
    reader.readAsText(file);
  };

  const processAssetImport = (content) => {
    // Parse CSV and create assets
    const rows = content.split("\n").slice(1); // Skip header
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
      };
    });

    console.log("Processed assets:", assets);
    // Here you would save to your state or backend
  };

  const handleBulkImport = (configType) => {
    setBulkImportModal(configType);
  };

  const loadModuleData = async (modalKey) => {
    try {
      setLoading(true);

      if (modalKey === "assets_management") {
        const res = await getAssets();
        setAssets(res.data.assets);
      } else if (CONFIG_TYPE_MAP[modalKey]) {
        const res = await getConfigs(modalKey);
        setConfigs((prev) => ({
          ...prev,
          [modalKey]: res.data.configs || [],
        }));
      } else if (SECURITY_MAP[modalKey]) {
        const beType = SECURITY_MAP[modalKey];
        const res = await getConfigs(beType);
        setConfigs((prev) => ({
          ...prev,
          [modalKey]: res.data.configs || [],
        }));
      }
    } catch (err) {
      addToast("error", "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const CONFIG_TYPE_MAP = {
    data_collection: "data_collection",
    data_elements: "data_element",
    data_deletion: "data_deletion",
    data_subjects: "data_subject",
    data_transfer: "data_transfer",
    department: "department",
    organization: "organization",
    purpose: "purpose",
    legal_basis: "legal_basis",
  };

  const SECURITY_MAP = {
    compliance_measures: "security_compliance",
    operational_measures: "security_operational",
    ethical_measures: "security_ethical",
    technical_measures: "security_technical",
    access_measures: "security_access",
    data_governance: "security_data_governance",
    transparency_measures: "security_transparency",
    physical_security: "security_physical",
    risk_management: "security_risk_management",
  };

  const handleConfigureClick = async (modalKey, event) => {
    event.stopPropagation();
    setActiveModal(modalKey);
    setNestedModal(null);

    await loadModuleData(modalKey);
  };

  const handleAddNew = (type) => {
    setNestedModal(type);
    setSelectedItem(null);
  };

  const handleEdit = (item, type) => {
    setSelectedItem(item);
    setNestedModal(type);
  };

  const handleView = (item) => {
    setSelectedItem(item);
  };

  const handleArchive = async (itemId, type) => {
    if (!confirm("Are you sure you want to archive this?")) return;

    try {
      await deleteConfig(CONFIG_TYPE_MAP[type], itemId);
      addToast("success", "Archived successfully");
      await loadModuleData(type);
    } catch (err) {
      addToast("error", "Archive failed");
    }
  };

  const handleDeleteAsset = async (id) => {
    if (!confirm("Delete this asset?")) return;
    try {
      await deleteAsset(id);
      addToast("success", "Asset deleted");
      loadModuleData("assets_management");
    } catch (e) {
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
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {asset.name}
              </h4>
              <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                <span>ID: {asset.assetId}</span>
                <span>Type: {asset.type}</span>
                <span>Status: {asset.status}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleView(asset)}
                className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors"
                title="View"
              >
                <Eye size={16} className="text-blue-600" />
              </button>
              <button
                onClick={() => handleEdit(asset, "edit_asset")}
                className="p-2 hover:bg-green-100 dark:hover:bg-green-900 rounded transition-colors"
                title="Edit"
              >
                <Edit size={16} className="text-green-600" />
              </button>
              <button
                onClick={() => handleArchive(asset.id)}
                className="p-2 hover:bg-orange-100 dark:hover:bg-orange-900 rounded transition-colors"
                title="Archive"
              >
                <Archive size={16} className="text-orange-600" />
              </button>
              <button
                onClick={() => handleDeleteAsset(asset.id)}
                className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
                title="Delete"
              >
                <Trash2 size={16} className="text-red-600" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDataCollectionList = () => (
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
        {sampleDataCollections.map((collection) => (
          <div
            key={collection.id}
            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {collection.name}
              </h4>
              <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                <span>ID: {collection.uniqueId}</span>
                <span>Source: {collection.sourceType}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleView(collection)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={() => handleEdit(collection, "edit_data_collection")}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => handleArchive(collection.id)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <Archive size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDataElementsList = () => (
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
        {configs["data_elements"]?.map((element) => (
          <div
            key={element.id}
            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {element.name}
              </h4>
              <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                <span>ID: {element.uniqueId}</span>
                <span>Type: {element.valueType}</span>
                <span>Sensitive: {element.sensitive}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleView(element)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={() => handleEdit(element, "edit_data_element")}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => handleArchive(element.id)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <Archive size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDataDeletionList = () => (
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
        {sampleDataDeletion.map((method) => (
          <div
            key={method.id}
            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {method.name}
              </h4>
              <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                <span>ID: {method.uniqueId}</span>
                <span>Frequency: {method.frequency}</span>
                <span>Verification: {method.verification}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleView(method)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={() => handleEdit(method, "edit_data_deletion")}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => handleArchive(method.id)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <Archive size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDepartmentList = () => (
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
        {sampleDepartments.map((dept) => (
          <div
            key={dept.id}
            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {dept.name}
              </h4>
              <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                <span>ID: {dept.uniqueId}</span>
                <span>Head: {dept.headName}</span>
                <span>Manager: {dept.manager}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleView(dept)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={() => handleEdit(dept, "edit_department")}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => handleArchive(dept.id)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <Archive size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderOrganizationList = () => (
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
        {sampleOrganizations.map((org) => (
          <div
            key={org.id}
            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {org.name}
              </h4>
              <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                <span>ID: {org.uniqueId}</span>
                <span>Type: {org.type}</span>
                <span>Industry: {org.industry}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleView(org)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={() => handleEdit(org, "edit_organization")}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => handleArchive(org.id)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <Archive size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDataSubjectsList = () => (
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
        {sampleDataSubjects.map((subject) => (
          <div
            key={subject.id}
            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {subject.categoryName}
              </h4>
              <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                <span>ID: {subject.uniqueId}</span>
                <span>Type: {subject.categoryType}</span>
                <span>Subcategory: {subject.subcategory}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleView(subject)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={() => handleEdit(subject, "edit_data_subject")}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => handleArchive(subject.id)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <Archive size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPurposeList = () => (
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
        {samplePurposes.map((purpose) => (
          <div
            key={purpose.id}
            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {purpose.name}
              </h4>
              <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                <span>ID: {purpose.uniqueId}</span>
                <span>Category: {purpose.category}</span>
                <span>Primary: {purpose.primary}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleView(purpose)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={() => handleEdit(purpose, "edit_purpose")}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => handleArchive(purpose.id)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <Archive size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLegalBasisList = () => (
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
        {sampleLegalBasis.map((basis) => (
          <div
            key={basis.id}
            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {basis.name}
              </h4>
              <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                <span>ID: {basis.uniqueId}</span>
                <span>{basis.description}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleView(basis)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={() => handleEdit(basis, "edit_legal_basis")}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => handleArchive(basis.id)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <Archive size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

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
            onClick={() => setActiveModal(module.modalKey)}
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

  // Security Module List Views
  const renderSecurityModuleList = (title, sampleData, addKey, editKey) => (
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
        {sampleData.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {item.name}
              </h4>
              <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                <span>ID: {item.uniqueId}</span>
                <span>{item.description}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleView(item)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={() => handleEdit(item, editKey)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => handleArchive(item.id)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <Archive size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ===== FORM COMPONENTS =====

  const renderAssetForm = () => (
    <div className="p-6 space-y-6">
      <h3 className="text-lg font-semibold dark:text-white">
        {selectedItem ? "Edit Asset" : "Add New Asset"}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Asset Name"
          required
          defaultValue={selectedItem?.name || ""}
        />
        <FormSelect
          label="Asset Type"
          options={assetTypes}
          required
          defaultValue={selectedItem?.type?.toLowerCase() || ""}
        />
        <FormInput
          label="Asset ID"
          required
          defaultValue={selectedItem?.assetId || ""}
        />
        <FormInput label="Short Description" required />
        <FormInput label="Purchase Date" type="date" />
        <FormInput label="Location" />
        <FormSelect
          label="Condition/Status"
          options={conditionOptions}
          required
          defaultValue={
            selectedItem?.status?.toLowerCase().replace(" ", "_") || ""
          }
        />
        <FormSelect label="Owner/Assigned to" options={[]} required />
        <FormInput label="Warranty Information" type="date" />
        <FormSelect
          label="Is Supplier/Vendor Managed?"
          options={yesNoOptions}
          required
        />
      </div>
      <FileUpload
        label="Attachments/Documents"
        accept=".doc,.docx,.pdf,.xlsx,.jpg,.jpeg,.svg,.eml"
        multiple
        onFilesSelected={handleFilesSelected}
      />
    </div>
  );

  const renderDataCollectionForm = () => (
    <div className="p-6 space-y-6">
      <h3 className="text-lg font-semibold dark:text-white">
        {selectedItem ? "Edit Data Collection" : "Add New Data Collection"}
      </h3>
      <div className="grid grid-cols-1 gap-4">
        <FormInput
          label="Data Source Type"
          required
          defaultValue={selectedItem?.sourceType || ""}
        />
        <FormInput label="Description" required />
        <FileUpload
          label="Attachments/Documents"
          accept=".doc,.docx,.pdf,.xlsx,.jpg,.jpeg,.svg,.eml"
          multiple
          onFilesSelected={handleFilesSelected}
        />
      </div>
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
          required
          defaultValue={selectedItem?.name || ""}
        />
        <FormInput label="Description" required />
        <FormSelect
          label="Value Type"
          options={valueTypes}
          required
          defaultValue={selectedItem?.valueType?.toLowerCase() || ""}
        />
        <FormSelect
          label="Is Sensitive Data?"
          options={yesNoOptions}
          required
          defaultValue={selectedItem?.sensitive?.toLowerCase() || ""}
        />
        <FileUpload
          label="Attachments/Documents"
          accept=".doc,.docx,.pdf,.xlsx,.jpg,.jpeg,.svg,.eml"
          multiple
          onFilesSelected={handleFilesSelected}
        />
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
          required
          defaultValue={selectedItem?.name || ""}
        />
        <FormInput label="Description" required />
        <FormSelect
          label="Deletion Frequency"
          options={deletionFrequency}
          defaultValue={
            selectedItem?.frequency?.toLowerCase().replace(" ", "_") || ""
          }
        />
        <FormSelect
          label="Is Verification Needed?"
          options={yesNoOptions}
          defaultValue={selectedItem?.verification?.toLowerCase() || ""}
        />
        <FormSelect label="When Deletion Happens" options={deletionMethods} />
        <FormSelect
          label="How Deletion is Verified"
          options={verificationMethods}
        />
      </div>
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
          required
          defaultValue={selectedItem?.name || ""}
        />
        <FormInput label="Description of the Role" required />
        <FormInput label="Parent Department" required />
        <FormInput label="Department Head Email ID" required type="email" />
        <FormInput
          label="Department Head Name"
          required
          defaultValue={selectedItem?.headName || ""}
        />
        <FormInput
          label="Manager Name"
          required
          defaultValue={selectedItem?.manager || ""}
        />
        <FormInput label="Reporting Location" required />
      </div>
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
          required
          defaultValue={selectedItem?.name || ""}
        />
        <FormInput
          label="Organization ID"
          required
          defaultValue={selectedItem?.orgId || ""}
        />
        <FormSelect
          label="Organization Type"
          options={organizationTypes}
          required
          defaultValue={selectedItem?.type?.toLowerCase() || ""}
        />
        <FormSelect
          label="Industry Sector"
          options={industrySectors}
          required
          defaultValue={selectedItem?.industry?.toLowerCase() || ""}
        />
        <FormInput label="Registration Number" required />
        <FormInput label="Address" required />
        <FormInput label="Website" required type="url" />
        <FormInput label="Parent Organization" required />
        <FormInput label="Subsidiaries" required />
        <FormInput label="Departments within Organization" required />
      </div>
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
          required
          defaultValue={selectedItem?.categoryName || ""}
        />
        <FormInput label="Description" required />
        <FormSelect
          label="Category Type"
          options={categoryTypes}
          required
          defaultValue={selectedItem?.categoryType?.toLowerCase() || ""}
        />
        <FormInput
          label="Subcategory Type"
          required
          defaultValue={selectedItem?.subcategory || ""}
        />
      </div>
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
          required
          defaultValue={selectedItem?.name || ""}
        />
        <FormInput label="Description" required />
        <FormSelect
          label="Purpose Category"
          options={purposeCategories}
          required
          defaultValue={selectedItem?.category?.toLowerCase() || ""}
        />
        <FormInput
          label="Primary Purpose"
          required
          defaultValue={selectedItem?.primary || ""}
        />
        <FormInput label="Secondary Purpose" required />
      </div>
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
          required
          defaultValue={selectedItem?.name || ""}
        />
        <FormInput
          label="Description"
          required
          defaultValue={selectedItem?.description || ""}
        />
      </div>
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
          required
          defaultValue={selectedItem?.name || ""}
        />
        <FormInput
          label="Description"
          required
          defaultValue={selectedItem?.description || ""}
        />
      </div>
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
          options={riskManagementTypes}
          required
          defaultValue={selectedItem?.type?.toLowerCase() || ""}
        />
        <FormInput
          label="Measure Name"
          required
          defaultValue={selectedItem?.name || ""}
        />
        <FormInput
          label="Description"
          required
          defaultValue={selectedItem?.description || ""}
        />
      </div>
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
    data_elements: {
      title: "Data Element Configuration",
      content: renderDataElementsList(),
      size: "xl",
    },
    data_deletion: {
      title: "Data Deletion Configuration",
      content: renderDataDeletionList(),
      size: "xl",
    },
    data_subjects: {
      title: "Data Subjects Configuration",
      content: renderDataSubjectsList(),
      size: "xl",
    },
    data_transfer: {
      title: "Data Transfer Configurations",
      content: renderDataCollectionList(),
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
        "edit_compliance"
      ),
      size: "xl",
    },
    operational_measures: {
      title: "Operational Measures",
      content: renderSecurityModuleList(
        "Operational Measures",
        sampleOperationalMeasures,
        "new_operational",
        "edit_operational"
      ),
      size: "xl",
    },
    ethical_measures: {
      title: "Ethical Measures",
      content: renderSecurityModuleList(
        "Ethical Measures",
        sampleEthicalMeasures,
        "new_ethical",
        "edit_ethical"
      ),
      size: "xl",
    },
    technical_measures: {
      title: "Technical Measures",
      content: renderSecurityModuleList(
        "Technical Measures",
        sampleTechnicalMeasures,
        "new_technical",
        "edit_technical"
      ),
      size: "xl",
    },
    access_measures: {
      title: "Access Measures",
      content: renderSecurityModuleList(
        "Access Measures",
        sampleAccessMeasures,
        "new_access",
        "edit_access"
      ),
      size: "xl",
    },
    data_governance: {
      title: "Data Governance",
      content: renderSecurityModuleList(
        "Data Governance Measures",
        sampleDataGovernance,
        "new_data_gov",
        "edit_data_gov"
      ),
      size: "xl",
    },
    transparency_measures: {
      title: "Transparency Measures",
      content: renderSecurityModuleList(
        "Transparency Measures",
        sampleTransparencyMeasures,
        "new_transparency",
        "edit_transparency"
      ),
      size: "xl",
    },
    physical_security: {
      title: "Physical Security",
      content: renderSecurityModuleList(
        "Physical Security Measures",
        samplePhysicalSecurity,
        "new_physical",
        "edit_physical"
      ),
      size: "xl",
    },
    risk_management: {
      title: "Risk Management",
      content: renderSecurityModuleList(
        "Risk Management Measures",
        sampleRiskManagement,
        "new_risk",
        "edit_risk"
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

  const saveNestedForm = async () => {
    const type = nestedModal.replace("new_", "").replace("edit_", "");

    if (type === "asset") {
      if (selectedItem) {
        await updateAsset(selectedItem.id, formData);
      } else {
        await createAsset(formData);
      }
      return;
    }

    // CONFIG MODULES
    if (CONFIG_TYPE_MAP[type]) {
      if (selectedItem) {
        await updateConfig(type, selectedItem.id, formData);
      } else {
        await createConfig(type, formData);
      }
      return;
    }

    // SECURITY MODULES
    if (SECURITY_MAP[type]) {
      const beType = SECURITY_MAP[type];

      if (selectedItem) {
        await updateSecuritySafeguard(beType, selectedItem.id, formData);
      } else {
        await createSecuritySafeguard(beType, formData);
      }

      return;
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      if (nestedModal) {
        await saveNestedForm();
      }

      addToast("success", "Saved successfully");
      await loadModuleData(activeModal);
    } catch (err) {
      addToast("error", "Save failed");
    } finally {
      setLoading(false);
      setNestedModal(null);
      setSelectedItem(null);
    }
  };

  const handleCancel = () => {
    if (nestedModal) {
      setNestedModal(null);
    } else {
      setActiveModal(null);
    }
    setSelectedItem(null);
  };

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
        {setupOptions.map((option, idx) => (
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
                {option.items} items
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
        ))}
      </div>

      {/* Main Modals (List Views) */}
      {Object.entries(modalConfigs).map(([key, config]) => (
        <Modal
          key={key}
          isOpen={activeModal === key && !nestedModal}
          onClose={handleCancel}
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
          {config.content}
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
