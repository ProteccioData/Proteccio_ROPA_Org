// components/SettingsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Check,
  Upload,
  Globe,
  Lock,
  Users,
  ShieldCheck,
  Bell,
  Database,
  Settings as Cog,
  Mail,
  UserPlus,
  Trash2,
  Edit2,
  Clock,
  MapPin,
} from "lucide-react";
import { useToast } from "../ui/ToastProvider";
import { useTranslation } from "react-i18next";
import { addTranslationNamespace } from "../../i18n/config";
import {
  uploadLogo,
  exportSettings,
  importSettings,
  getOrganizationSettings,
  updateOrganizationSettings,
  getInvitations,
  sendInvite as apiSendInvite,
  revokeInvite as apiRevokeInvite,
} from "../../services/SetupService";
import {
  apiGetTeams,
  apiCreateTeam,
  apiUpdateTeam,
  apiDeleteTeam,
} from "../../services/UserSetupService";

/* ---------- CONFIG ---------- */
const STORAGE_KEY = "settings:v1";
const BRAND = {
  primary: "#5DEE92",
  border: "#828282",
  font: "Jakarta Sans, system-ui, -apple-system, 'Segoe UI', Roboto",
};

/* Permission groups used in role creation — adapt as needed */
const PERMISSIONS = {
  ROPA: ["CREATE", "EDIT", "VIEW", "DELETE", "ASSIGN", "LINK", "ARCHIVE"],
  ASSESSMENTS: [
    "LIA",
    "DPIA",
    "TIA",
    "CREATE",
    "VIEW",
    "EDIT",
    "DELETE",
    "ARCHIVE",
  ],
  MAPPING: ["CREATE_FLOW", "EDIT", "VIEW", "ARCHIVE", "DELETE"],
  SETUP: ["CONFIGURE", "BULK_IMPORT", "SECURITY_REVIEW", "ADD_ASSET"],
  AUDIT: ["VIEW", "USER_SPECIFIC", "ALL"],
  REPORTS: ["GENERATE", "SCHEDULE", "DOWNLOAD", "VIEW", "EDIT"],
};

/* ---------- Helpers ---------- */
const uid = (pref = "") => pref + Math.random().toString(36).slice(2, 9);
const nowISO = () => new Date().toISOString();
const indianLanguages = [
  "Hindi",
  "Bengali",
  "Telugu",
  "Marathi",
  "Tamil",
  "Urdu",
  "Gujarati",
  "Kannada",
  "Malayalam",
  "Odia",
  "Punjabi",
];

/* ---------- Defaults ---------- */
const DEFAULT_STATE = {
  general: {
    organizationName: "Techorp Limited",
    logoUrl: null,
    address: "",
    registrationNumber: "",
    timeZone: "Asia/Kolkata",
    defaultLanguage: "English",
    secondaryLanguages: ["Hindi"],
    defaultCountry: "India",
    templatesEnabled: true,
    maskPersonalInfoInExports: false,
    theme: "emerald",
    customThemes: [],
  },
  access: {
    inviteQueue: [], // invited emails with status
    roles: [
      {
        id: "role_admin",
        name: "Org Admin",
        description: "Full access",
        permissions: Object.keys(PERMISSIONS).reduce(
          (acc, k) => ({ ...acc, [k]: [...PERMISSIONS[k]] }),
          {}
        ),
      },
    ],
    users: [], // reference only for UI (real app would query users)
  },
  security: {
    passwordPolicy: {
      minLength: 8,
      requireNumbers: true,
      requireSpecial: false,
      expiryDays: 90,
    },
    twoFA: "optional", // optional | mandatory | disabled
    sessionTimeoutMinutes: 30,
    ipAllowlist: [],
    ipDenylist: [],
    encryption: { aes: "AES-256", tls: ["1.2", "1.3"] },
  },
  notifications: {
    onScreen: true,
    email: true,
    alertRules: [
      {
        id: "highRiskProc",
        name: "High-risk processing created",
        enabled: true,
        frequency: "immediate",
        recipients: ["Org Admin"],
      },
    ],
    notificationFrequency: "immediate",
  },
  backups: {
    manualExportEnabled: true,
    automatedBackupFrequency: "daily",
    backupStorage: "both", // internal | external | both
    backupExternalLocation: "",
    autoBackupEnabled: true,
  },
  compliance: {
    dataRetentionYears: 6,
    lockAfterApproval: true,
    autoLockAfterDaysInactive: 365,
    roleFieldControl: true, // allow field-level view/edit control
    maskPersonalDataInExports: false,
  },
};

/* ---------- Storage helpers ---------- */
/* ---------- Storage helpers ---------- */
// Removed localStorage functions in favor of API calls
function mapBackendToFrontend(backendData) {
  if (!backendData) return DEFAULT_STATE;
  return {
    general: {
      organizationName: backendData.organization_name || "",
      logoUrl: backendData.logo_url || null,
      address: backendData.address || "",
      registrationNumber: backendData.registration_number || "",
      timeZone: backendData.default_timezone || "Asia/Kolkata",
      defaultLanguage: backendData.default_language || "English",
      secondaryLanguages: backendData.secondary_languages || [],
      defaultCountry: backendData.default_country || "India",
      templatesEnabled: backendData.templates_enabled ?? true,
      maskPersonalInfoInExports: backendData.mask_personal_info_in_exports ?? false,
      theme: backendData.theme || "emerald",
      customThemes: [],
    },
    // Access roles/users are separate, but Invites will be fetched separately
    access: {
      inviteQueue: [],
      roles: DEFAULT_STATE.access.roles, // Keep default roles for now/mock
      users: [],
    },
    security: {
      passwordPolicy: {
        minLength: backendData.password_min_length || 8,
        requireNumbers: backendData.password_require_numbers ?? true,
        requireSpecial: backendData.password_require_special ?? false,
        expiryDays: backendData.password_expiry_days || 90,
      },
      twoFA: backendData.two_fa_policy || "optional",
      sessionTimeoutMinutes: backendData.session_timeout_minutes || 30,
      ipAllowlist: backendData.ip_allowlist || [],
      ipDenylist: backendData.ip_denylist || [],
      encryption: { aes: "AES-256", tls: ["1.2", "1.3"] },
    },
    notifications: {
      onScreen: backendData.on_screen_notifications ?? true,
      email: backendData.email_notifications ?? true,
      alertRules: backendData.alert_rules || DEFAULT_STATE.notifications.alertRules,
      notificationFrequency: backendData.notification_frequency || "immediate",
    },
    backups: {
      manualExportEnabled: backendData.manual_export_enabled ?? true,
      automatedBackupFrequency: backendData.automated_backup_frequency || "daily",
      backupStorage: backendData.backup_storage || "both",
      backupExternalLocation: backendData.backup_external_location || "",
      autoBackupEnabled: backendData.auto_backup_enabled ?? true,
    },
    compliance: {
      dataRetentionYears: backendData.data_retention_years || 6,
      lockAfterApproval: backendData.lock_after_approval ?? true,
      autoLockAfterDaysInactive: backendData.auto_lock_after_days_inactive || 365,
      roleFieldControl: backendData.role_field_control ?? true,
      maskPersonalDataInExports: backendData.mask_personal_data_in_exports ?? false,
    },
  };
}

function mapFrontendToBackend(state) {
  return {
    organization_name: state.general.organizationName,
    // logo_url handled separately via upload
    address: state.general.address,
    registration_number: state.general.registrationNumber,
    default_timezone: state.general.timeZone,
    default_language: state.general.defaultLanguage,
    secondary_languages: state.general.secondaryLanguages,
    default_country: state.general.defaultCountry,
    templates_enabled: state.general.templatesEnabled,
    mask_personal_info_in_exports: state.general.maskPersonalInfoInExports,
    theme: state.general.theme,

    password_min_length: state.security.passwordPolicy.minLength,
    password_require_numbers: state.security.passwordPolicy.requireNumbers,
    password_require_special: state.security.passwordPolicy.requireSpecial,
    password_expiry_days: state.security.passwordPolicy.expiryDays,
    two_fa_policy: state.security.twoFA,
    session_timeout_minutes: state.security.sessionTimeoutMinutes,
    ip_allowlist: state.security.ipAllowlist,
    ip_denylist: state.security.ipDenylist,

    on_screen_notifications: state.notifications.onScreen,
    email_notifications: state.notifications.email,
    alert_rules: state.notifications.alertRules,
    notification_frequency: state.notifications.notificationFrequency,

    manual_export_enabled: state.backups.manualExportEnabled,
    automated_backup_frequency: state.backups.automatedBackupFrequency,
    backup_storage: state.backups.backupStorage,
    auto_backup_enabled: state.backups.autoBackupEnabled,

    data_retention_years: state.compliance.dataRetentionYears,
    lock_after_approval: state.compliance.lockAfterApproval,
    auto_lock_after_days_inactive: state.compliance.autoLockAfterDaysInactive,
    role_field_control: state.compliance.roleFieldControl,
    mask_personal_data_in_exports: state.compliance.maskPersonalDataInExports,
  };
}

/* ---------- UI primitives ---------- */
function Toggle({ checked = false, onChange, size = "md", ariaLabel }) {
  const sizes = {
    sm: { width: 36, height: 20, knob: 16 },
    md: { width: 56, height: 28, knob: 24 },
    lg: { width: 64, height: 32, knob: 28 },
  };

  const s = sizes[size] || sizes.md;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className="relative inline-flex items-center rounded-full transition-colors duration-300 focus:outline-none"
      style={{
        width: s.width,
        height: s.height,
        backgroundColor: checked ? BRAND.primary : "#e6e6e6",
        boxShadow: checked ? `0 0 8px ${BRAND.primary}55` : "none",
      }}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute bg-white rounded-full shadow flex items-center justify-center"
        style={{
          width: s.knob,
          height: s.knob,
          left: checked ? s.width - s.knob - 4 : 4,
        }}
      >
        {checked && <Check className="h-3 w-3 text-black" />}
      </motion.div>
    </button>
  );
}

function Card({ children, title, subtitle }) {
  return (
    <div
      className="rounded-2xl border"
      style={{ borderColor: BRAND.border, background: "var(--card-bg)" }}
    >
      <div
        className="px-6 py-4 border-b"
        style={{ borderColor: "rgba(130,130,130,0.08)" }}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-lg font-semibold">{title}</div>
            {subtitle && (
              <div className="text-sm text-gray-500 dark:text-gray-300">
                {subtitle}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

/* ---------- Modal shell for Role creation / Invite ---------- */
function Modal({ title, onClose, children, footer }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        transition={{ duration: 0.12 }}
        className="relative z-10 w-full max-w-3xl rounded-2xl border p-4"
        style={{ background: "var(--card-bg)", borderColor: BRAND.border }}
      >
        <div
          className="flex items-center justify-between px-3 py-2 border-b"
          style={{ borderColor: "rgba(130,130,130,0.08)" }}
        >
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose}>
            <X />
          </button>
        </div>
        <div className="p-4 max-h-[60vh] overflow-y-auto">{children}</div>
        <div
          className="px-4 py-3 border-t flex justify-end gap-2"
          style={{ borderColor: "rgba(130,130,130,0.08)" }}
        >
          {footer}
        </div>
      </motion.div>
    </div>
  );
}

/* ---------- Main Settings Page ---------- */
export default function SettingsPage() {
  // Initial state from defaults, will be populated by API
  const [state, setState] = useState(DEFAULT_STATE);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("general"); // tabs: General, Access, Security, Notifications, Backups, Compliance

  /* Modals */
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([
      addTranslationNamespace("en", "pages", "Settings"),
      addTranslationNamespace("hindi", "pages", "Settings"),
      addTranslationNamespace("sanskrit", "pages", "Settings"),
      addTranslationNamespace("telugu", "pages", "Settings"),
    ]).then(() => setReady(true));
  }, []);

  const { t } = useTranslation("pages", { keyPrefix: "Settings" });
  const { addToast } = useToast();

  /* Load data from Backend */
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [settingsData, invitesData, teamsData] = await Promise.all([
          getOrganizationSettings(),
          getInvitations().catch(() => ({ invitations: [] })),
          apiGetTeams().catch(() => ({ teams: [] }))
        ]);

        const mappedState = mapBackendToFrontend(settingsData.settings || settingsData);

        // Merge invitations and teams
        mappedState.access.inviteQueue = invitesData.invitations || [];
        mappedState.access.roles = teamsData.teams || teamsData.roles || []; // handle possible key differences

        setState(mappedState);
      } catch (err) {
        console.error("Failed to load settings", err);
        addToast("error", "Failed to load settings");
      } finally {
        setLoading(false);
      }
    }
    if (ready) fetchData();
  }, [ready]);

  /* Save Handler */
  const handleSaveSettings = async () => {
    try {
      const payload = mapFrontendToBackend(state);
      await updateOrganizationSettings(payload);
      addToast("success", t("settings_saved_successfully") || "Settings saved successfully");
    } catch (err) {
      console.error(err);
      addToast("error", t("failed_to_save_settings") || "Failed to save settings");
    }
  };

  /* Handlers for nested updates */
  const update = (path, value) => {
    // path like "general.organizationName"
    setState((s) => {
      const next = JSON.parse(JSON.stringify(s));
      const keys = path.split(".");
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (!(k in cur)) cur[k] = {};
        cur = cur[k];
      }
      cur[keys[keys.length - 1]] = value;
      return next;
    });
  };

  /* Role CRUD */
  async function saveRole(roleData) {
    try {
      if (roleData.id && !roleData.id.toString().startsWith("role_")) {
        // Existing backend role (not a temp mock ID)
        await apiUpdateTeam(roleData.id, roleData);
        addToast("success", "Role updated successfully");
      } else {
        // New role
        await apiCreateTeam(roleData);
        addToast("success", "Role created successfully");
      }
      // Refresh roles
      const teamsRes = await apiGetTeams();
      setState((s) => ({
        ...s,
        access: { ...s.access, roles: teamsRes.teams || teamsRes.roles || [] }
      }));
      setShowRoleModal(false);
      setRoleToEdit(null);
    } catch (err) {
      console.error(err);
      addToast("error", "Failed to save role");
    }
  }

  async function deleteRole(roleId) {
    if (!confirm("Delete this role?")) return;
    try {
      await apiDeleteTeam(roleId);
      addToast("success", "Role deleted successfully");
      // Refresh roles
      const teamsRes = await apiGetTeams();
      setState((s) => ({
        ...s,
        access: { ...s.access, roles: teamsRes.teams || teamsRes.roles || [] }
      }));
    } catch (err) {
      console.error(err);
      addToast("error", "Failed to delete role");
    }
  }

  /* Invite user simulation */
  /* Invite user API */
  async function sendInvite(email) {
    if (!email) return;
    try {
      const res = await apiSendInvite(email);
      addToast("success", `Invite sent to ${email}`);
      // Refresh invites
      const invites = await getInvitations();
      setState(s => ({
        ...s,
        access: { ...s.access, inviteQueue: invites.invitations || [] }
      }));
    } catch (err) {
      console.error(err);
      addToast("error", "Failed to send invite");
    }
  }

  async function revokeInvite(inviteId) {
    if (!confirm("Revoke this invitation?")) return;
    try {
      await apiRevokeInvite(inviteId);
      addToast("success", "Invitation revoked");
      // Refresh invites
      const invites = await getInvitations();
      setState(s => ({
        ...s,
        access: { ...s.access, inviteQueue: invites.invitations || [] }
      }));
    } catch (err) {
      console.error(err);
      addToast("error", "Failed to revoke invitation");
    }
  }

  /* IP list management helpers */
  function addIP(listName, ip) {
    setState((s) => {
      const next = { ...s };
      next.security[listName] = [...(next.security[listName] || []), ip];
      return next;
    });
  }
  function removeIP(listName, ip) {
    setState((s) => {
      const next = { ...s };
      next.security[listName] = (next.security[listName] || []).filter(
        (x) => x !== ip
      );
      return next;
    });
  }

  function applyTheme(themeName) {
    document.documentElement.setAttribute("data-theme", themeName);
  }

  useEffect(() => {
    applyTheme(state.general.theme);
  }, [state.general.theme]);

  /* Logo upload handling (store objectURL locally for demo) */
  /* Logo upload handling */
  const handleLogoUpload = async (file) => {
    if (!file) return;
    try {
      const res = await uploadLogo(file);
      // res should contain new logo url
      if (res.logo_url) {
        update("general.logoUrl", res.logo_url);
        addToast("success", t("logo_uploaded_successfully"));
      }
    } catch (err) {
      console.error(err);
      addToast("error", t("failed_to_upload_logo"));
    }
  };

  /* Handle bulk file upload (CSV / JSON) */
  async function handleFileUpload(file) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      addToast("error", " File too large (max 5MB)");
      return;
    }

    const text = await file.text();
    try {
      if (file.name.endsWith(".json")) {
        const json = JSON.parse(text);
        // Comprehensive Import (Settings + Teams)
        if (json.settings || json.teams) {
          await importSettings(json);
          // Re-fetch all to get final state
          const [settingsRes, teamsRes] = await Promise.all([
            getOrganizationSettings(),
            apiGetTeams()
          ]);
          const mapped = mapBackendToFrontend(settingsRes.settings || settingsRes);
          mapped.access.roles = teamsRes.teams || teamsRes.roles || [];
          setState(mapped);
          addToast("success", t("settings_imported_successfully") || "Data imported successfully");
          return;
        }
      } else {
        // Parse CSV - For now simple mapping to General Settings or list
        const [header, ...rows] = text.trim().split("\n");
        const keys = header.split(",");
        const data = rows.map((r) => {
          const vals = r.split(",");
          return Object.fromEntries(
            keys.map((k, i) => [k.trim(), vals[i]?.trim()])
          );
        });
        update("general.importedData", data);
        addToast("success", `Imported ${data.length} record(s) correctly. Review the preview below.`);
      }
    } catch (err) {
      console.error(err);
      addToast("error", "Invalid file format or parse error.");
    }
  }

  const handleCsvExport = () => {
    const generalData = state.general;
    const headers = Object.keys(generalData).filter(k => typeof generalData[k] !== 'object');
    const values = headers.map(h => `"${generalData[h]}"`);

    const csvContent = [headers.join(","), values.join(",")].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `org_general_settings_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast("success", "CSV exported successfully");
  };

  const handleBulkExport = async () => {
    const format = document.getElementById('exportFormat')?.value || 'json';

    if (format === 'csv') {
      handleCsvExport();
      return;
    }

    try {
      const data = await exportSettings(); // Returns { settings, teams, exported_at }
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `proteccio_setup_backup_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      addToast("success", t("settings_exported_successfully") || "JSON Export completed successfully");
    } catch (err) {
      console.error(err);
      addToast("error", t("failed_to_export_settings") || "Export failed");
    }
  };

  /* ---------- Render: Tabs Nav ---------- */
  const TABS = [
    { id: "general", labelKey: "general" },
    { id: "access", labelKey: "access" },
    { id: "security", labelKey: "security" },
    { id: "notifications", labelKey: "notifications" },
    { id: "backups", labelKey: "backups" },
    { id: "compliance", labelKey: "compliance" },
  ];

  const TWO_FA_MODES = [
    { id: "optional", labelKey: "optional" },
    { id: "mandatory", labelKey: "mandatory" },
    { id: "disabled", labelKey: "disabled" },
  ];

  if (!ready || loading) return <div className="p-6">Loading settings...</div>;

  return (
    <div className="p-6 dark:text-white" style={{ fontFamily: BRAND.font }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t("settings")}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            {t("centralize_org_wide_configuration_security_complia")}
          </p>
        </div>

        <div className="flex gap-2 items-center">
          <button
            onClick={handleSaveSettings}
            className="px-4 py-2 bg-[#5DEE92] text-black rounded font-medium shadow hover:shadow-md transition"
          >
            {t("save_changes") || "Save Changes"}
          </button>
          <div className="text-sm text-gray-600 dark:text-gray-300 ml-4">
            {t("active_tab")}
          </div>
          <div
            className="px-3 py-1 rounded border"
            style={{ borderColor: BRAND.border }}
          >
            {t(TABS.find((t) => t.id === activeTab)?.labelKey)}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex gap-2 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-2xl font-medium cursor-pointer ${activeTab === tab.id
                ? "bg-[#5DEE92] text-black"
                : "bg-white dark:bg-[#071019] border border-[#828282]"
                }`}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="space-y-6">
        {/* GENERAL */}
        {activeTab === "general" && (
          <Card
            title={t("general_settings")}
            subtitle={t("organization_information_and_default_preferences")}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium">
                  {t("organization_name")}
                </label>
                <input
                  className="mt-1 w-full border border-[#828282] rounded px-3 py-2"
                  value={state.general.organizationName}
                  onChange={(e) =>
                    update("general.organizationName", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium">{t("logo")}</label>
                <div className="mt-2 flex items-center gap-3">
                  <div
                    className="w-20 h-20 rounded bg-[#f3fff7] dark:bg-[#f3fff7]/20 flex items-center justify-center border"
                    style={{ borderColor: BRAND.border }}
                  >
                    {state.general.logoUrl ? (
                      <img
                        src={state.general.logoUrl}
                        alt="logo"
                        className="object-cover w-full h-full rounded"
                      />
                    ) : (
                      <Upload />
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleLogoUpload(e.target.files[0])}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {t("recommended_400x400_png_or_svg")}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium border-[#828282]">
                  {t("address")}
                </label>
                <textarea
                  className="mt-1 w-full border border-[#828282] rounded px-3 py-2"
                  value={state.general.address}
                  onChange={(e) => update("general.address", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  {t("registration_number")}
                </label>
                <input
                  className="mt-1 w-full border border-[#828282] rounded px-3 py-2"
                  value={state.general.registrationNumber}
                  onChange={(e) =>
                    update("general.registrationNumber", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  {t("time_zone")}
                </label>
                <select
                  className="mt-1 w-full border dark:bg-gray-900 border-[#828282] rounded px-3 py-2"
                  value={state.general.timeZone}
                  onChange={(e) => update("general.timeZone", e.target.value)}
                >
                  <option className="dark:bg-gray-900" value="Asia/Kolkata">
                    {t("asia_kolkata")}
                  </option>
                  <option value="UTC">{t("utc")}</option>
                  <option value="America/New_York">
                    {t("america_new_york")}
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">
                  {t("default_country")}
                </label>
                <select
                  className="mt-1 w-full dark:bg-gray-900 border border-[#828282] rounded px-3 py-2"
                  value={state.general.defaultCountry}
                  onChange={(e) =>
                    update("general.defaultCountry", e.target.value)
                  }
                >
                  <option>{t("india")}</option>
                  <option>{t("united_states")}</option>
                  <option>{t("united_kingdom")}</option>
                </select>
              </div>

              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-sm font-medium">
                    {t("configure_templates")}
                  </label>
                  <div className="text-sm text-gray-500 dark:text-gray-300">
                    {t("enable_templates_and_defaults_to_streamline_ropa_e")}
                  </div>
                </div>
                <div>
                  <Toggle
                    checked={state.general.templatesEnabled}
                    onChange={(v) => update("general.templatesEnabled", v)}
                  />
                </div>
              </div>

              <div className="">
                <label className="block text-sm font-medium">
                  {t("mask_personal_names_emails_in_exports_logs")}
                </label>
                <div className="flex items-center gap-3 mt-2">
                  <Toggle
                    checked={state.general.maskPersonalInfoInExports}
                    onChange={(v) =>
                      update("general.maskPersonalInfoInExports", v)
                    }
                  />
                  <div className="text-sm text-gray-500 dark:text-gray-300">
                    {t("toggle_to_mask_pii_in_exports_and_logs")}
                  </div>
                </div>
              </div>

              {/* Bulk Import Section */}
              <div className="md:col-span-2 border-t pt-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-base font-semibold flex items-center gap-2">
                      <Database
                        className="w-4 h-4"
                        style={{ color: BRAND.primary }}
                      />
                      {t("bulk_import_data")}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                      {t("download_a_sample_file_and_upload_your_data_to_pop")}
                    </div>
                  </div>
                </div>

                {/* Download Sample */}
                <button
                  className="px-4 py-2 rounded-md bg-[#5DEE92] text-black font-medium text-sm shadow-sm hover:shadow transition cursor-pointer"
                  onClick={() => {
                    const sampleCsv = `organizationName,address,registrationNumber,defaultCountry\nTechorp Limited,Patna,BR12345,India`;
                    const blob = new Blob([sampleCsv], { type: "text/csv" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "sample_import.csv";
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  {t("download_sample_csv")}
                </button>

                {/* Upload Area */}
                <div
                  className="mt-5 relative border-2 border-dashed rounded-2xl p-6 text-center transition hover:border-[#5DEE92] bg-white/50 dark:bg-gray-800"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (!file) return;
                    const ext = file.name.split(".").pop().toLowerCase();
                    if (ext !== "csv" && ext !== "json") {
                      addToast(
                        "error",
                        "Only .csv or .json files are allowed."
                      );
                      return;
                    }
                    handleFileUpload(file);
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0.6, scale: 0.98 }}
                    whileHover={{ scale: 1.02, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center justify-center gap-3"
                  >
                    <Upload className="w-10 h-10 text-[#5DEE92]" />
                    <p className="text-sm text-gray-700 dark:text-white">
                      Drag & drop your CSV/JSON here or{" "}
                      <label className="ml-1 text-[#5DEE92] font-medium cursor-pointer underline">
                        browse
                        <input
                          type="file"
                          accept=".csv,.json"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            const ext = file.name
                              .split(".")
                              .pop()
                              .toLowerCase();
                            if (ext !== "csv" && ext !== "json") {
                              alert("❌ Only .csv or .json files are allowed.");
                              e.target.value = "";
                              return;
                            }
                            handleFileUpload(file);
                          }}
                        />
                      </label>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-200">
                      Accepted formats: .csv, .json • Max size: 5MB
                    </p>
                  </motion.div>
                </div>

                {/* Preview Section */}
                {state.general.importedData && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-5 bg-white dark:bg-gray-800 border rounded-xl p-4 shadow-sm"
                    style={{ borderColor: "rgba(130,130,130,0.2)" }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-sm text-gray-700 dark:text-gray-200">
                        {t("imported_data_preview")}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-300">
                        {state.general.importedData.length} record(s)
                      </div>
                    </div>
                    <pre
                      className="text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded overflow-x-auto text-left border"
                      style={{ borderColor: "rgba(130,130,130,0.1)" }}
                    >
                      {JSON.stringify(state.general.importedData[0], null, 2)}
                    </pre>
                    <div className="mt-3 text-right">
                      <button
                        className="px-3 py-1 text-xs rounded-md border hover:bg-gray-100 transition"
                        style={{ borderColor: BRAND.border }}
                        onClick={() => update("general.importedData", null)}
                      >
                        {t("clear_imported_data")}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Bulk Export Section */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-base font-semibold flex items-center gap-2">
                      <Database
                        className="w-4 h-4"
                        style={{ color: BRAND.primary }}
                      />
                      {t("bulk_export_data")}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                      {t("accepted_formats_csv_json_max_size_5mb")}
                    </div>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-5 border-2 border-dashed rounded-2xl text-center hover:border-[#5DEE92] transition"
                >
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                    <select
                      id="exportFormat"
                      className="border rounded-lg px-3 py-2 text-sm focus:outline-none"
                      style={{ borderColor: BRAND.border }}
                      defaultValue="csv"
                    >
                      <option value="csv">{t("export_as_csv")}</option>
                      <option value="json">{t("export_as_json")}</option>
                    </select>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleBulkExport}
                      className="px-5 py-2 bg-[#5DEE92] text-black rounded-lg font-semibold text-sm"
                    >
                      {t("export_all_data")}
                    </motion.button>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-300 mt-3">
                    {t("includes_general_settings_roles_users_access_contr")}
                  </p>
                </motion.div>
              </div>
            </div>
          </Card>
        )}

        {/* ACCESS */}
        {activeTab === "access" && (
          <Card
            title={t("access_control")}
            subtitle={t("manage_invites_roles_and_role_assignment_history")}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Invite */}
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">
                      {t("invite_by_email")}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-300">
                      {t("send_invitation_to_join_org")}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <input
                    id="inviteEmail"
                    placeholder={t("email_example_com")}
                    className="flex-1 border border-[#828282] rounded px-3 py-2"
                  />
                  <button
                    onClick={() => {
                      const el = document.getElementById("inviteEmail");
                      if (!el || !el.value) return alert("Enter email");
                      sendInvite(el.value);
                      el.value = "";
                    }}
                    className="px-4 py-2 rounded bg-[#5DEE92] text-black flex items-center gap-2"
                  >
                    <Mail /> {t("invite")}
                  </button>
                </div>

                <div className="mt-4">
                  <div className="text-sm font-medium">{t("invite_queue")}</div>
                  <div className="mt-2 space-y-2">
                    {(state.access.inviteQueue || []).map((i) => (
                      <div
                        key={i.id}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <div className="text-sm">
                          {i.email}{" "}
                          <span className="text-xs text-gray-400">
                            ({i.status})
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => revokeInvite(i.id)}
                            className="px-2 py-1 rounded border"
                          >
                            <Trash2 />
                          </button>
                        </div>
                      </div>
                    ))}
                    {(state.access.inviteQueue || []).length === 0 && (
                      <div className="text-sm text-gray-500 dark:text-gray-300">
                        {t("no_invites_queued")}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* SECURITY */}
        {activeTab === "security" && (
          <Card
            title={t("security_settings")}
            subtitle={t("passwords_2fa_session_ip_controls")}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm font-semibold">
                  {t("password_policy")}
                </div>
                <div className="mt-2 space-y-2">
                  <label className="text-xs">{t("minimum_length")}</label>
                  <input
                    type="number"
                    min={6}
                    className="w-24 border rounded px-2 py-1"
                    value={state.security.passwordPolicy.minLength}
                    onChange={(e) =>
                      update(
                        "security.passwordPolicy.minLength",
                        Number(e.target.value)
                      )
                    }
                  />

                  <div className="flex items-center gap-3 mt-2">
                    <div className="text-sm">{t("require_numbers")}</div>
                    <Toggle
                      checked={state.security.passwordPolicy.requireNumbers}
                      onChange={(v) =>
                        update("security.passwordPolicy.requireNumbers", v)
                      }
                    />
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="text-sm">
                      {t("require_special_characters")}
                    </div>
                    <Toggle
                      checked={state.security.passwordPolicy.requireSpecial}
                      onChange={(v) =>
                        update("security.passwordPolicy.requireSpecial", v)
                      }
                    />
                  </div>

                  <div className="mt-2">
                    <label className="text-xs pr-2">
                      {t("password_expiry")}
                    </label>
                    <input
                      type="number"
                      min={0}
                      className="w-32 border border-[#828282] rounded px-2 py-1"
                      value={state.security.passwordPolicy.expiryDays}
                      onChange={(e) =>
                        update(
                          "security.passwordPolicy.expiryDays",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold">
                  {t("two_factor_auth")}
                </div>
                <div className="mt-2 space-y-2">
                  {/* 2FA Mode Selector (Modern Toggle Tabs) */}
                  <div className="flex flex-col gap-2 mt-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("mode")}
                    </label>

                    <motion.div
                      layout
                      className="relative flex bg-gray-100 dark:bg-[#0d131a] rounded-xl border border-gray-200/40 dark:border-gray-700 p-1 w-fit"
                      style={{ minWidth: "280px" }}
                    >
                      {TWO_FA_MODES.map((mode) => {
                        const isActive = state.security.twoFA === mode.id;
                        return (
                          <motion.button
                            key={mode}
                            onClick={() => update("security.twoFA", mode.id)}
                            className={`relative z-10 flex-1 px-4 py-2 text-sm font-medium capitalize transition-colors duration-200 ${isActive
                              ? "text-black"
                              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                              }`}
                          >
                            {isActive && (
                              <motion.div
                                layoutId="2fa-highlight"
                                transition={{
                                  type: "spring",
                                  stiffness: 500,
                                  damping: 40,
                                }}
                                className="absolute inset-0 z-0 bg-[#5DEE92] rounded-lg shadow-md "
                              />
                            )}
                            <span className="relative z-10 cursor-pointer">
                              {t(mode.labelKey)}
                            </span>
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  </div>

                  <div className="mt-2">
                    <label className="text-sm pr-2">
                      {t("session_timeout")}
                    </label>
                    <input
                      type="number"
                      className="w-24 border border-[#828282] rounded px-2 py-1"
                      value={state.security.sessionTimeoutMinutes}
                      onChange={(e) =>
                        update(
                          "security.sessionTimeoutMinutes",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              {/* IP lists */}
              <div>
                <div className="text-sm font-semibold">{t("ip_allowlist")}</div>
                <div className="mt-2">
                  <div className="flex gap-2">
                    <input
                      id="ipAllow"
                      className="flex-1 border border-[#828282] rounded px-3 py-2"
                      placeholder="x.x.x.x or CIDR"
                    />
                    <button
                      onClick={() => {
                        const el = document.getElementById("ipAllow");
                        if (!el.value) return;
                        addIP("ipAllowlist", el.value);
                        el.value = "";
                      }}
                      className="px-3 py-1 rounded bg-[#5DEE92] text-black"
                    >
                      {t("add")}
                    </button>
                  </div>
                  <div className="mt-3 space-y-2">
                    {(state.security.ipAllowlist || []).map((ip) => (
                      <div
                        key={ip}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <div className="text-sm">{ip}</div>
                        <button
                          onClick={() => removeIP("ipAllowlist", ip)}
                          className="text-red-600 px-2"
                        >
                          {t("remove")}
                        </button>
                      </div>
                    ))}
                    {(state.security.ipAllowlist || []).length === 0 && (
                      <div className="text-sm text-gray-500 dark:text-gray-300">
                        {t("no_ips_added")}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold">{t("ip_denylist")}</div>
                <div className="mt-2">
                  <div className="flex gap-2">
                    <input
                      id="ipDeny"
                      className="flex-1 border border-[#828282] rounded px-3 py-2"
                      placeholder="x.x.x.x or CIDR"
                    />
                    <button
                      onClick={() => {
                        const el = document.getElementById("ipDeny");
                        if (!el.value) return;
                        addIP("ipDenylist", el.value);
                        el.value = "";
                      }}
                      className="px-3 py-1 rounded bg-[#5DEE92] text-black"
                    >
                      {t("add")}
                    </button>
                  </div>
                  <div className="mt-3 space-y-2">
                    {(state.security.ipDenylist || []).map((ip) => (
                      <div
                        key={ip}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <div className="text-sm">{ip}</div>
                        <button
                          onClick={() => removeIP("ipDenylist", ip)}
                          className="text-red-600 px-2"
                        >
                          {t("remove")}
                        </button>
                      </div>
                    ))}
                    {(state.security.ipDenylist || []).length === 0 && (
                      <div className="text-sm text-gray-500 dark:text-gray-300">
                        {t("no_ips_blocked")}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="text-sm font-semibold">
                  {t("encryption_transport")}
                </div>
                <div className="mt-2 p-3 border border-[#828282] rounded">
                  <div className="text-sm">
                    AES: {state.security.encryption.aes}
                  </div>
                  <div className="text-sm mt-1">
                    TLS supported: {state.security.encryption.tls.join(", ")}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-300 mt-2">
                    {t("visibility_only_configure_actual_encryption_at_inf")}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* NOTIFICATIONS */}
        {activeTab === "notifications" && (
          <Card
            title={t("notifications_alerts")}
            subtitle={t("configure_system_alerts_frequency_and_recipients")}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">
                      {t("system_notifications")}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-300">
                      {t("on_screen_and_email_notifications")}
                    </div>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="text-sm">{t("on_screen")}</div>
                    <Toggle
                      checked={state.notifications.onScreen}
                      onChange={(v) => update("notifications.onScreen", v)}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm">{t("email")}</div>
                    <Toggle
                      checked={state.notifications.email}
                      onChange={(v) => update("notifications.email", v)}
                    />
                  </div>

                  <div className="mt-3">
                    <label className="text-sm font-medium pr-2">
                      {t("default_notification_frequency")}
                    </label>
                    <select
                      className="mt-1 border border-[#828282] dark:bg-gray-900 rounded px-3 py-1"
                      value={state.notifications.notificationFrequency}
                      onChange={(e) =>
                        update(
                          "notifications.notificationFrequency",
                          e.target.value
                        )
                      }
                    >
                      <option value="immediate">{t("immediate")}</option>
                      <option value="daily">{t("daily_digest")}</option>
                      <option value="weekly">{t("weekly")}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* BACKUPS */}
        {activeTab === "backups" && (
          <Card
            title={t("backups_export")}
            subtitle={t("configure_exports_backups_and_storage")}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm font-semibold">{t("manual_export")}</div>
                <div className="mt-2 flex items-center gap-3">
                  <Toggle
                    checked={state.backups.manualExportEnabled}
                    onChange={(v) => update("backups.manualExportEnabled", v)}
                  />
                  <div className="text-sm text-gray-500 dark:text-gray-300">
                    {t("enable_manual_data_export")}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold">{t("automated_backups")}</div>
                <div className="mt-2">
                  <label className="text-xs pr-2">{t("frequency")}</label>
                  <select
                    className="mt-1 border border-[#828282] dark:bg-gray-900 rounded px-3 py-1"
                    value={state.backups.automatedBackupFrequency}
                    onChange={(e) =>
                      update("backups.automatedBackupFrequency", e.target.value)
                    }
                  >
                    <option value="daily">{t("daily")}</option>
                    <option value="weekly">{t("weekly")}</option>
                    <option value="monthly">{t("monthly")}</option>
                  </select>
                </div>

                <div className="mt-3">
                  <label className="text-xs pr-2">{t("storage")}</label>
                  <select
                    className="mt-1 border border-[#828282] dark:bg-gray-900 rounded px-3 py-1"
                    value={state.backups.backupStorage}
                    onChange={(e) =>
                      update("backups.backupStorage", e.target.value)
                    }
                  >
                    <option value="internal">{t("internal")}</option>
                    <option value="external">{t("external")}</option>
                    <option value="both">{t("both")}</option>
                  </select>
                </div>

                <div className="mt-3">
                  <label className="text-xs">
                    External location (if applicable)
                  </label>
                  <input
                    className="mt-1 w-full border border-[#828282] rounded px-3 py-2"
                    value={state.backups.backupExternalLocation}
                    onChange={(e) =>
                      update("backups.backupExternalLocation", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="mt-3 text-sm text-gray-500 dark:text-gray-300">
                  {t("backups_should_be_verified_regularly_you_can_toggl")}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* COMPLIANCE */}
        {activeTab === "compliance" && (
          <Card
            title={t("compliance_retention")}
            subtitle={t("retention_locks_field_level_controls_and_export_ma")}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm pr-2 font-medium">
                  Default data retention (years)
                </label>
                <input
                  type="number"
                  min={0}
                  className="mt-1 border border-[#828282] rounded px-3 py-2 w-36"
                  value={state.compliance.dataRetentionYears}
                  onChange={(e) =>
                    update(
                      "compliance.dataRetentionYears",
                      Number(e.target.value)
                    )
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  {t("lock_ropa_records_after_approval_audit_submission")}
                </label>
                <div className="mt-2 flex items-center gap-3">
                  <Toggle
                    checked={state.compliance.lockAfterApproval}
                    onChange={(v) => update("compliance.lockAfterApproval", v)}
                  />
                  <div className="text-sm text-gray-500 dark:text-gray-300">
                    {t("lock_records_to_prevent_edits_after_approval")}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium pr-2">
                  Auto-lock after inactivity (days)
                </label>
                <input
                  type="number"
                  min={0}
                  className="mt-1 border border-[#828282] rounded px-3 py-2 w-36"
                  value={state.compliance.autoLockAfterDaysInactive}
                  onChange={(e) =>
                    update(
                      "compliance.autoLockAfterDaysInactive",
                      Number(e.target.value)
                    )
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  {t("mask_personal_names_emails_in_exports")}
                </label>
                <div className="mt-2 flex items-center gap-3">
                  <Toggle
                    checked={state.compliance.maskPersonalDataInExports}
                    onChange={(v) =>
                      update("compliance.maskPersonalDataInExports", v)
                    }
                  />
                  <div className="text-sm text-gray-500 dark:text-gray-300">
                    {t("when_enabled_exported_reports_logs_will_mask_pii")}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium">
                  {t("field_visibility_role_based_control")}
                </label>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-300">
                  {t("manage_field_level_visibility_and_whether_fields_a")}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Role Modal */}
      <AnimatePresence>
        {showRoleModal && (
          <Modal
            title={roleToEdit ? "Edit Role" : "Create Role"}
            onClose={() => {
              setShowRoleModal(false);
              setRoleToEdit(null);
            }}
          >
            <RoleEditor
              initialRole={roleToEdit}
              onSave={saveRole}
              onCancel={() => {
                setShowRoleModal(false);
                setRoleToEdit(null);
              }}
            />
          </Modal>
        )}
      </AnimatePresence>

      {/* Invite modal (simple) */}
      <AnimatePresence>
        {showInviteModal && (
          <Modal title="Invite User" onClose={() => setShowInviteModal(false)}>
            <div>
              <label className="block text-sm">Email</label>
              <input
                id="inviteModalEmail"
                className="mt-1 w-full border rounded px-3 py-2"
              />
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="px-3 py-1 rounded border"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById("inviteModalEmail");
                    if (!el.value) return alert("enter email");
                    sendInvite(el.value);
                    setShowInviteModal(false);
                  }}
                  className="px-3 py-1 rounded bg-[#5DEE92]"
                >
                  Send Invite
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
