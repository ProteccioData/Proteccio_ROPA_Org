import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircle,
  UserPlus,
  Users,
  Edit2,
  Trash2,
  Search,
  Filter,
  X,
  Check,
  Settings,
  Eye,
  EyeClosed,
} from "lucide-react";

import {
  apiGetTeams,
  apiCreateTeam,
  apiUpdateTeam,
  apiDeleteTeam,
  apiGetUsers,
  apiCreateUser,
  apiUpdateUser,
  apiDeleteUser,
  apiAddUserToTeam,
  apiRemoveUserFromTeam,
  apiGetPermissionsStructure,
} from "../../services/UserSetupService";

import { useToast } from "../ui/ToastProvider"; // keep as your project uses

// === Attempt to import auth hook (adjust path to your project if needed) ===
import { useAuth } from "../../context/AuthContext"; // if your project uses different path, change it
import ConfirmationModal from "../ui/ConfirmationModal";

const STORAGE_KEY = "um:modern:v1";
const BRAND = {
  primary: "#5DEE92",
  border: "#828282",
  font: "Jakarta Sans, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto",
};

// ---- FALLBACK DEFAULT PERMISSIONS (mirror backend's DEFAULT_PERMISSIONS) ----
// This will be overridden by apiGetPermissionsStructure() if available.
const FALLBACK_BACKEND_PERMISSIONS = {
  create_ropa: false,
  view_ropa: false,
  delete_ropa: false,
  assign_ropa: false,

  view_infovoyage: false,
  edit_infovoyage: false,
  create_infovoyage: false,

  view_checksync: false,
  edit_checksync: false,
  create_checksync: false,

  view_beam: false,
  edit_beam: false,
  create_beam: false,

  view_offdoff: false,
  edit_offdoff: false,
  create_offdoff: false,

  view_operational_lens: false,
  edit_operational_lens: false,

  view_process_grid: false,
  edit_process_grid: false,

  view_defense_grid: false,
  edit_defense_grid: false,

  view_data_transit: false,
  edit_data_transit: false,

  create_assessment: false,
  view_assessment: false,
  edit_assessment: false,
  delete_assessment: false,
  assign_assessment: false,

  create_data_mapping: false,
  view_data_mapping: false,
  edit_data_mapping: false,
  delete_data_mapping: false,

  create_data_transfer: false,
  view_data_transfer: false,
  edit_data_transfer: false,
  delete_data_transfer: false,

  view_setup: false,
  edit_setup: false,
  delete_setup: false,

  view_reports: false,
  generate_reports: false,
  schedule_reports: false,

  view_audit_logs: false,
  view_team_audit_logs: false,
  view_all_audit_logs: false,

  receive_notifications: true,
  manage_notifications: false,

  view_dashboard: true,
  view_analytics: false,
};

// ---- Frontend grouped permission definitions (UI-friendly) ----
const UI_GROUPS = {
  ROPA: ["CREATE", "VIEW", "DELETE", "ASSIGN", "ARCHIVE"], // ARCHIVE mapped to nothing backend-specific (keeps false unless you want it mapped)
  ROPA_STAGES: ["InfoVoyage", "CheckSync", "Beam", "OffDoff"],
  ROPA_CATEGORY: [
    "OperationalLens",
    "ProcessGrid",
    "DefenseGrid",
    "DataTransit",
  ],
  ASSESSMENTS: ["CREATE", "VIEW", "EDIT", "DELETE", "ASSIGN"],
  // ASSESS_STAGES: ["LIA", "DPIA", "TIA"], // mapped to general assessment perms
  MAPPING: ["CREATE FLOW", "VIEW", "EDIT", "DELETE"],
  DATA_TRANSFER: ["CREATE", "VIEW", "EDIT", "DELETE"],
  SETUP: ["VIEW", "EDIT", "DELETE"],
  REPORTS: ["VIEW", "GENERATE", "SCHEDULE"],
  AUDIT: ["VIEW AUDIT LOGS", "VIEW TEAM AUDIT LOGS", "VIEW ALL AUDIT LOGS"],
  NOTIFICATIONS: ["RECEIVE", "MANAGE"],
  DASHBOARD: ["VIEW", "ANALYTICS"],
};

// small helpers
const uid = (pre = "") => pre + Math.random().toString(36).slice(2, 9);
const nowISO = () => new Date().toISOString();

/* ========== UI Primitives (unchanged) ========== */
function ToggleSwitch({ checked = false, onChange, size = "md", ariaLabel }) {
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

function Pill({ children }) {
  return (
    <span className="text-xs px-2 py-1 rounded-md bg-white/60 dark:bg-white/6 border border-[#828282] text-gray-800 dark:text-gray-100">
      {children}
    </span>
  );
}

function ModalShell({ title, onClose, children, footer }) {
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.985, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.985, opacity: 0 }}
        transition={{ duration: 0.16 }}
        className="relative z-10 w-full max-w-4xl bg-white dark:bg-gray-900 border border-[#828282] rounded-2xl shadow-2xl"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e6e6e6] dark:border-[#2b2b2b]">
          <h3
            className="text-lg dark:text-gray-300 font-semibold"
            style={{ fontFamily: BRAND.font }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5 text-gray-700 dark:text-gray-200" />
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">{children}</div>
        <div className="px-6 py-4 border-t border-[#e6e6e6] dark:border-[#2b2b2b] flex justify-end gap-3">
          {footer}
        </div>
      </motion.div>
    </div>
  );
}

/* === PERMISSION TRANSFORMERS ===
   - normalizeBackendPermissions(backendPermissions): convert flat backend booleans -> grouped UI state
   - buildBackendPermissions(frontendGrouped): convert UI grouped state -> backend flat booleans
*/

function normalizeBackendPermissions(backend = {}, backendDefaults = {}) {
  const b = {
    ...(backendDefaults || FALLBACK_BACKEND_PERMISSIONS),
    ...backend,
  };

  const result = {
    ROPA: [],
    ROPA_STAGE_PERMS: {
      InfoVoyage: { VIEW: b.view_infovoyage, EDIT: b.edit_infovoyage },
      CheckSync: { VIEW: b.view_checksync, EDIT: b.edit_checksync },
      Beam: { VIEW: b.view_beam, EDIT: b.edit_beam },
      OffDoff: { VIEW: b.view_offdoff, EDIT: b.edit_offdoff },
    },

    ASSESSMENTS: [],

    // MUST ADD THESE ALWAYS, otherwise buildBackendPermissions returns FALSE
    MAPPING: [],
    DATA_TRANSFER: [],
    SETUP: [],
    REPORTS: [],
    AUDIT: [],
    NOTIFICATIONS: [],
    DASHBOARD: [],
  };

  if (b.create_ropa) result.ROPA.push("CREATE");
  if (b.view_ropa) result.ROPA.push("VIEW");
  if (b.delete_ropa) result.ROPA.push("DELETE");
  if (b.assign_ropa) result.ROPA.push("ASSIGN");

  // ASSESSMENT
  if (b.create_assessment) result.ASSESSMENTS.push("CREATE");
  if (b.view_assessment) result.ASSESSMENTS.push("VIEW");
  if (b.edit_assessment) result.ASSESSMENTS.push("EDIT");
  if (b.delete_assessment) result.ASSESSMENTS.push("DELETE");
  if (b.assign_assessment) result.ASSESSMENTS.push("ASSIGN");

  // YOU MUST ALSO MAP THESE BACK INTO GROUP ARRAYS:
  if (b.create_data_mapping) result.MAPPING.push("CREATE FLOW");
  if (b.view_data_mapping) result.MAPPING.push("VIEW");
  if (b.edit_data_mapping) result.MAPPING.push("EDIT");
  if (b.delete_data_mapping) result.MAPPING.push("DELETE");

  if (b.create_data_transfer) result.DATA_TRANSFER.push("CREATE");
  if (b.view_data_transfer) result.DATA_TRANSFER.push("VIEW");
  if (b.edit_data_transfer) result.DATA_TRANSFER.push("EDIT");
  if (b.delete_data_transfer) result.DATA_TRANSFER.push("DELETE");

  if (b.view_setup) result.SETUP.push("VIEW");
  if (b.edit_setup) result.SETUP.push("EDIT");
  if (b.delete_setup) result.SETUP.push("DELETE");

  if (b.view_reports) result.REPORTS.push("VIEW");
  if (b.generate_reports) result.REPORTS.push("GENERATE");
  if (b.schedule_reports) result.REPORTS.push("SCHEDULE");

  if (b.view_audit_logs) result.AUDIT.push("VIEW AUDIT LOGS");
  if (b.view_team_audit_logs) result.AUDIT.push("VIEW TEAM AUDIT LOGS");
  if (b.view_all_audit_logs) result.AUDIT.push("VIEW ALL AUDIT LOGS");

  if (b.receive_notifications) result.NOTIFICATIONS.push("RECEIVE");
  if (b.manage_notifications) result.NOTIFICATIONS.push("MANAGE");

  if (b.view_dashboard) result.DASHBOARD.push("VIEW");
  if (b.view_analytics) result.DASHBOARD.push("ANALYTICS");

  return result;
}

function buildBackendPermissions(frontend = {}, backendDefaults = {}) {
  const base = backendDefaults || FALLBACK_BACKEND_PERMISSIONS;
  const out = { ...base };

  const has = (group, perm) =>
    Array.isArray(frontend[group]) && frontend[group].includes(perm);

  /* ---------- MAIN ROPA ---------- */
  out.create_ropa = has("ROPA", "CREATE");
  out.view_ropa = has("ROPA", "VIEW");
  out.delete_ropa = has("ROPA", "DELETE");
  out.assign_ropa = has("ROPA", "ASSIGN");

  /* ---------- ROPA STAGES (VIEW / EDIT) ---------- */
  const s = frontend.ROPA_STAGE_PERMS || {};

  out.view_infovoyage = s.InfoVoyage?.VIEW || false;
  out.edit_infovoyage = s.InfoVoyage?.EDIT || false;

  out.view_checksync = s.CheckSync?.VIEW || false;
  out.edit_checksync = s.CheckSync?.EDIT || false;

  out.view_beam = s.Beam?.VIEW || false;
  out.edit_beam = s.Beam?.EDIT || false;

  out.view_offdoff = s.OffDoff?.VIEW || false;
  out.edit_offdoff = s.OffDoff?.EDIT || false;

  /* ---------- AUTO CATEGORIES ---------- */
  const anyViewStage =
    out.view_infovoyage ||
    out.view_checksync ||
    out.view_beam ||
    out.view_offdoff;

  const anyEditStage =
    out.edit_infovoyage ||
    out.edit_checksync ||
    out.edit_beam ||
    out.edit_offdoff;

  out.view_operational_lens = anyViewStage;
  out.edit_operational_lens = anyEditStage;

  out.view_process_grid = anyViewStage;
  out.edit_process_grid = anyEditStage;

  out.view_defense_grid = anyViewStage;
  out.edit_defense_grid = anyEditStage;

  out.view_data_transit = anyViewStage;
  out.edit_data_transit = anyEditStage;

  /* ---------- ASSESSMENTS ---------- */
  out.create_assessment = has("ASSESSMENTS", "CREATE");
  out.view_assessment = has("ASSESSMENTS", "VIEW");
  out.edit_assessment = has("ASSESSMENTS", "EDIT");
  out.delete_assessment = has("ASSESSMENTS", "DELETE");
  out.assign_assessment = has("ASSESSMENTS", "ASSIGN");

  /* ---------- MAPPING ---------- */
  out.create_data_mapping = has("MAPPING", "CREATE FLOW");
  out.view_data_mapping = has("MAPPING", "VIEW");
  out.edit_data_mapping = has("MAPPING", "EDIT");
  out.delete_data_mapping = has("MAPPING", "DELETE");

  /* ---------- DATA TRANSFER ---------- */
  out.create_data_transfer = has("DATA_TRANSFER", "CREATE");
  out.view_data_transfer = has("DATA_TRANSFER", "VIEW");
  out.edit_data_transfer = has("DATA_TRANSFER", "EDIT");
  out.delete_data_transfer = has("DATA_TRANSFER", "DELETE");

  /* ---------- SETUP ---------- */
  out.view_setup = has("SETUP", "VIEW");
  out.edit_setup = has("SETUP", "EDIT");
  out.delete_setup = has("SETUP", "DELETE");

  /* ---------- REPORTS ---------- */
  out.view_reports = has("REPORTS", "VIEW");
  out.generate_reports = has("REPORTS", "GENERATE");
  out.schedule_reports = has("REPORTS", "SCHEDULE");

  /* ---------- AUDIT ---------- */
  out.view_audit_logs = has("AUDIT", "VIEW AUDIT LOGS");
  out.view_team_audit_logs = has("AUDIT", "VIEW TEAM AUDIT LOGS");
  out.view_all_audit_logs = has("AUDIT", "VIEW ALL AUDIT LOGS");

  /* ---------- NOTIFICATIONS ---------- */
  out.receive_notifications = has("NOTIFICATIONS", "RECEIVE");
  out.manage_notifications = has("NOTIFICATIONS", "MANAGE");

  /* ---------- DASHBOARD ---------- */
  out.view_dashboard = has("DASHBOARD", "VIEW");
  out.view_analytics = has("DASHBOARD", "ANALYTICS");

  return out;
}

/* ========== Team Modal (create / edit) ========== */
function TeamModal({ initial = null, onClose, onSave, backendDefaults }) {
  const isEdit = Boolean(initial);
  // initial.permissions is expected to be backend flat-permission object or grouped object depending on how parent passes it.
  // We standardize: if initial.permissions is flat -> normalizeBackendPermissions, if grouped -> use as-is.
  const [name, setName] = useState(initial?.name || "");
  const [desc, setDesc] = useState(initial?.description || "");
  const [groupedPerms, setGroupedPerms] = useState(() => {
    if (!initial?.permissions)
      return normalizeBackendPermissions({}, backendDefaults);
    // detect if initial.permissions looks flat (booleans) or grouped (arrays)
    const sample = initial.permissions;
    const isFlat = Object.values(sample).every(
      (v) => typeof v === "boolean" || typeof v === "number"
    );
    return isFlat
      ? normalizeBackendPermissions(sample, backendDefaults)
      : sample;
  });

  function handleSave() {
    if (!name.trim()) return alert("Please provide team name");

    // Build backend payload
    const backendPermissions = buildBackendPermissions(
      groupedPerms,
      backendDefaults
    );

    const payload = {
      id: initial?.id || uid("team_"),
      name: name.trim(),
      description: desc.trim(),
      permissions: groupedPerms,
      backendPermissions: backendPermissions,
      createdAt: initial?.createdAt || nowISO(),
    };

    onSave(payload);
  }

  return (
    <ModalShell
      title={isEdit ? "Edit Team" : "Create Team"}
      onClose={onClose}
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-[#828282] dark:text-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded bg-[#5DEE92] text-black font-semibold"
          >
            {isEdit ? "Save" : "Create"}
          </button>
        </>
      }
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm dark:text-gray-400 font-medium">
            Team name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 border-[#e6e6e6] dark:border-[#2b2b2b]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium dark:text-gray-400">
            Description
          </label>
          <input
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="mt-2 w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 border-[#e6e6e6] dark:border-[#2b2b2b]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 dark:text-gray-400">
            Permissions
          </label>
          <div className="rounded-xl border border-[#e6e6e6] dark:border-[#2b2b2b] p-4 bg-white dark:bg-gray-900">
            <PermissionsEditor
              value={groupedPerms}
              onChange={setGroupedPerms}
            />
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

const passwordRules = {
  minLength: 6,
  hasLower: /[a-z]/,
  hasUpper: /[A-Z]/,
  hasNumber: /[0-9]/,
  hasSpecial: /[^A-Za-z0-9]/,
};

function validatePassword(pw) {
  return (
    pw.length >= passwordRules.minLength &&
    passwordRules.hasLower.test(pw) &&
    passwordRules.hasUpper.test(pw) &&
    passwordRules.hasNumber.test(pw) &&
    passwordRules.hasSpecial.test(pw)
  );
}

function UserModal({ initial = null, onClose, onSave, teams = [] }) {
  const isEdit = Boolean(initial);

  const [name, setName] = useState(initial?.name || initial?.full_name || "");
  const [email, setEmail] = useState(initial?.email || "");
  const [department, setDepartment] = useState(initial?.department || "");

  // CREATE → simple password
  const [password, setPassword] = useState("");

  // EDIT → password change section
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // TEAM ASSIGNMENT
  const [assigned, setAssigned] = useState(initial?.teams || []);
  useEffect(() => {
    setAssigned(initial?.teams || []);
  }, [initial?.teams]);

  const toggleTeam = (tid) => {
    setAssigned((s) =>
      s.includes(tid) ? s.filter((x) => x !== tid) : [...s, tid]
    );
  };

  function handleSave() {
    if (!name.trim() || !email.trim()) return alert("Name and email required");

    // CREATE VALIDATION
    if (!isEdit) {
      if (!validatePassword(password)) {
        return alert(
          "Password must be 6+ characters, include upper, lower, number & special character."
        );
      }
    }

    // EDIT VALIDATION
    if (isEdit) {
      if (newPassword || confirmNewPassword) {
        if (!validatePassword(newPassword)) {
          return alert(
            "New password must be 6+ characters, include upper, lower, number & special character."
          );
        }

        if (newPassword !== confirmNewPassword) {
          return alert("New password & confirm password do not match.");
        }
      }
    }

    const payload = {
      id: initial?.id,
      name: name.trim(),
      email: email.trim(),
      department,
      teams: assigned,
      password: !isEdit ? password : newPassword || undefined,
    };

    onSave(payload);
  }

  return (
    <ModalShell
      title={isEdit ? "Edit User" : "Create User"}
      onClose={onClose}
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-[#828282]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded bg-[#5DEE92] text-black font-semibold"
          >
            {isEdit ? "Save" : "Create"}
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* NAME */}
        <div>
          <label className="block text-sm font-medium">Full name</label>
          <input
            className="mt-2 w-full border rounded px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* EMAIL */}
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            className="mt-2 w-full border rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* PASSWORD (CREATE MODE) */}
        {!isEdit && (
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Password</label>
            <div className="relative mt-2">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full border rounded px-3 py-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-2.5 text-sm"
              >
                {showPassword ? <EyeClosed /> : <Eye />}
              </button>
            </div>
          </div>
        )}

        {/* PASSWORD CHANGE (EDIT MODE) */}
        {isEdit && (
          <>
            <div className="sm:col-span-2 mt-2">
              <label className="block text-sm font-medium">
                Change Password (optional)
              </label>

              {/* NEW PASSWORD */}
              <div className="relative mt-2">
                <input
                  type={showNewPassword ? "text" : "password"}
                  className="w-full border rounded px-3 py-2"
                  value={newPassword}
                  placeholder="New password"
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((s) => !s)}
                  className="absolute right-3 top-2.5 text-sm"
                >
                  {showNewPassword ? <EyeClosed /> : <Eye />}
                </button>
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="relative mt-3">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full border rounded px-3 py-2"
                  value={confirmNewPassword}
                  placeholder="Confirm new password"
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  className="absolute right-3 top-2.5 text-sm"
                >
                  {showConfirmPassword ? <EyeClosed /> : <Eye />}
                </button>
              </div>
            </div>
          </>
        )}

        {/* DEPARTMENT */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium">Department</label>
          <input
            className="mt-2 w-full border rounded px-3 py-2"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
        </div>

        {/* TEAM ASSIGN */}
        <div className="sm:col-span-2 mt-4">
          <label className="block text-sm font-medium mb-2">Assign Teams</label>
          <div className="flex flex-wrap gap-2">
            {teams.map((t) => (
              <button
                key={t.id}
                onClick={() => toggleTeam(t.id)}
                className={`px-3 py-1 rounded-md text-sm ${
                  assigned.includes(t.id)
                    ? "bg-[#5DEE92]"
                    : "border border-[#828282]"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

/* PermissionGroup row using ToggleSwitches */
function PermissionGroupRow({ group, perms, stateGroup = [], onToggle }) {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="text-sm font-semibold">{group}</div>
          <Pill>{perms.length}</Pill>
        </div>
        <div className="text-xs text-gray-500">Toggle permissions</div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {perms.map((p) => (
          <div
            key={p}
            className="flex items-center justify-between p-2 border rounded bg-white dark:bg-gray-800 border-[#e6e6e6] dark:border-[#2b2b2b]"
          >
            <div className="text-xs">{p}</div>
            <ToggleSwitch
              checked={stateGroup.includes(p)}
              onChange={() => onToggle(p)}
              ariaLabel={`${group}-${p}`}
              size="sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ROPA Permissions block (stages + categories + main) */
function RopaPermissionBlock({ value, onChange }) {
  const main = value.ROPA || [];
  const stagePerms = value.ROPA_STAGE_PERMS || {
    InfoVoyage: { VIEW: false, EDIT: false },
    CheckSync: { VIEW: false, EDIT: false },
    Beam: { VIEW: false, EDIT: false },
    OffDoff: { VIEW: false, EDIT: false },
  };

  const toggleMain = (perm) => {
    let next = main.includes(perm)
      ? main.filter((x) => x !== perm)
      : [...main, perm];

    let updatedStages = { ...stagePerms };

    if (perm === "CREATE") {
      const enable = next.includes("CREATE");

      ["InfoVoyage", "CheckSync", "Beam", "OffDoff"].forEach((stage) => {
        updatedStages[stage] = {
          VIEW: enable ? true : updatedStages[stage].VIEW,
          EDIT: enable ? true : updatedStages[stage].EDIT,
        };
      });
    }

    onChange({
      ...value,
      ROPA: next,
      ROPA_STAGE_PERMS: updatedStages,
    });
  };

  const toggleStage = (stage, perm) => {
    const updated = {
      ...stagePerms,
      [stage]: {
        ...stagePerms[stage],
        [perm]: !stagePerms[stage][perm],
      },
    };
    onChange({ ...value, ROPA_STAGE_PERMS: updated });
  };

  const stages = ["InfoVoyage", "CheckSync", "Beam", "OffDoff"];

  return (
    <div className="mb-5 border rounded-xl p-4 bg-white dark:bg-gray-900 border-[#e6e6e6] dark:border-[#2b2b2b]">
      <h3 className="text-sm font-semibold dark:text-gray-200 mb-3">
        ROPA Permissions
      </h3>

      {/* MAIN ROPA PERMISSIONS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {["CREATE", "VIEW", "DELETE", "ASSIGN"].map((perm) => (
          <div
            key={perm}
            className="flex items-center justify-between p-2 border rounded bg-white dark:bg-gray-800 border-[#e6e6e6] dark:border-[#2b2b2b]"
          >
            <div className="text-xs">{perm}</div>
            <ToggleSwitch
              size="sm"
              checked={main.includes(perm)}
              onChange={() => toggleMain(perm)}
            />
          </div>
        ))}
      </div>

      {/* STAGE-LEVEL VIEW/EDIT */}
      <div>
        <div className="text-xs font-medium dark:text-gray-300 mb-2">
          Stage Permissions
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stages.map((stage) => (
            <div
              key={stage}
              className="p-3 border rounded bg-white dark:bg-gray-800 border-[#e6e6e6] dark:border-[#2b2b2b]"
            >
              <div className="text-xs font-semibold mb-2">{stage}</div>

              <div className="flex items-center justify-between py-1">
                <span className="text-xs">VIEW</span>
                <ToggleSwitch
                  size="sm"
                  checked={stagePerms[stage]?.VIEW || false}
                  onChange={() => toggleStage(stage, "VIEW")}
                />
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-xs">EDIT</span>
                <ToggleSwitch
                  size="sm"
                  checked={stagePerms[stage]?.EDIT || false}
                  onChange={() => toggleStage(stage, "EDIT")}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Assessment Permission Block  */

function AssessmentPermissionBlock({ value, onChange }) {
  const main = value.ASSESSMENTS || [];

  const toggleMain = (perm) => {
    const next = main.includes(perm)
      ? main.filter((x) => x !== perm)
      : [...main, perm];
    onChange({ ...value, ASSESSMENTS: next });
  };

  return (
    <div className="mb-5 border rounded-xl p-4 bg-white dark:bg-gray-900 border-[#e6e6e6] dark:border-[#2b2b2b]">
      <h3 className="text-sm font-semibold dark:text-gray-200 mb-3">
        Assessment Permissions
      </h3>

      {/* 5 assessment permissions: CREATE / VIEW / EDIT / DELETE / ASSIGN */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {["CREATE", "VIEW", "EDIT", "DELETE", "ASSIGN"].map((perm) => (
          <div
            key={perm}
            className="flex items-center justify-between p-2 border rounded bg-white dark:bg-gray-800 border-[#e6e6e6] dark:border-[#2b2b2b]"
          >
            <div className="text-xs">{perm}</div>
            <ToggleSwitch
              size="sm"
              checked={main.includes(perm)}
              onChange={() => toggleMain(perm)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* Additional permission blocks for mapping, data transfer, setup, reports, audit, notifications, dashboard */
function SimplePermissionBlock({ title, groupKey, options, value, onChange }) {
  const group = value[groupKey] || [];

  const toggle = (opt) => {
    const next = group.includes(opt)
      ? group.filter((x) => x !== opt)
      : [...group, opt];
    onChange({ ...value, [groupKey]: next });
  };

  return (
    <div className="mb-5 border rounded-xl p-4 bg-white dark:bg-gray-900 border-[#e6e6e6] dark:border-[#2b2b2b]">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold dark:text-gray-200">{title}</h4>
        <Pill>{group.length}</Pill>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {options.map((opt) => (
          <div
            key={opt}
            className="flex items-center justify-between p-2 border rounded bg-white dark:bg-gray-800 border-[#e6e6e6] dark:border-[#2b2b2b]"
          >
            <div className="text-xs">{opt}</div>
            <ToggleSwitch
              size="sm"
              checked={group.includes(opt)}
              onChange={() => toggle(opt)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* PermissionsEditor - the full editor using all blocks */
function PermissionsEditor({ value = {}, onChange }) {
  const valueSafe = {
    ROPA: value.ROPA || [],
    ROPA_STAGE_PERMS: value.ROPA_STAGE_PERMS || {
      InfoVoyage: { VIEW: false, EDIT: false },
      CheckSync: { VIEW: false, EDIT: false },
      Beam: { VIEW: false, EDIT: false },
      OffDoff: { VIEW: false, EDIT: false },
    },
    ASSESSMENTS: value.ASSESSMENTS || [],
    MAPPING: value.MAPPING || [],
    DATA_TRANSFER: value.DATA_TRANSFER || [],
    SETUP: value.SETUP || [],
    REPORTS: value.REPORTS || [],
    AUDIT: value.AUDIT || [],
    NOTIFICATIONS: value.NOTIFICATIONS || [],
    DASHBOARD: value.DASHBOARD || [],
  };
  // value: grouped object
  const setGroup = (group, perms) => {
    const next = { ...value, [group]: perms };
    onChange(next);
  };

  const togglePerm = (group, perm) => {
    const cur = value[group] || [];
    const nextList = cur.includes(perm)
      ? cur.filter((x) => x !== perm)
      : [...cur, perm];
    setGroup(group, nextList);
  };

  return (
    <div className="space-y-4 dark:text-gray-400">
      <RopaPermissionBlock value={value} onChange={onChange} />

      <AssessmentPermissionBlock value={value} onChange={onChange} />

      <SimplePermissionBlock
        title="Data Mapping"
        groupKey="MAPPING"
        options={UI_GROUPS.MAPPING}
        value={value}
        onChange={onChange}
      />

      <SimplePermissionBlock
        title="Data Transfer"
        groupKey="DATA_TRANSFER"
        options={UI_GROUPS.DATA_TRANSFER}
        value={value}
        onChange={onChange}
      />

      <SimplePermissionBlock
        title="Setup / Config"
        groupKey="SETUP"
        options={UI_GROUPS.SETUP}
        value={value}
        onChange={onChange}
      />

      <SimplePermissionBlock
        title="Reports"
        groupKey="REPORTS"
        options={UI_GROUPS.REPORTS}
        value={value}
        onChange={onChange}
      />

      <SimplePermissionBlock
        title="Audit Logs"
        groupKey="AUDIT"
        options={UI_GROUPS.AUDIT}
        value={value}
        onChange={onChange}
      />

      <SimplePermissionBlock
        title="Notifications"
        groupKey="NOTIFICATIONS"
        options={UI_GROUPS.NOTIFICATIONS}
        value={value}
        onChange={onChange}
      />

      <SimplePermissionBlock
        title="Dashboard"
        groupKey="DASHBOARD"
        options={UI_GROUPS.DASHBOARD}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

/* ========== Main Component ========== */
export default function UserManagement() {
  const { addToast } = useToast();
  const { user, loading } = useAuth();

  // UI state (unchanged)
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);

  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState(null);

  const [showUserModal, setShowUserModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  const [query, setQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");

  const [loadingTeams, setLoadingTeams] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [permissionsStructure, setPermissionsStructure] = useState(null);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "warning",
    confirmText: "Confirm",
    cancelText: "Cancel",
    onConfirm: null,
  });

  const showConfirm = (config) => {
    setConfirmModal({
      isOpen: true,
      title: config.title || "Confirm Action",
      message: config.message || "",
      type: config.type || "warning",
      confirmText: config.confirmText || "Confirm",
      cancelText: config.cancelText || "Cancel",
      onConfirm: () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        config.onConfirm();
      },
    });
  };

  // Load users ONLY when teams have been loaded
  useEffect(() => {
    if (teams.length > 0) {
      fetchUsers();
    }
  }, [teams]);

  // Fetch initial data
  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAll = async () => {
    await fetchPermissionsStructure();
    await fetchTeams();
  };

  const fetchPermissionsStructure = async () => {
    try {
      const data = await apiGetPermissionsStructure();
      // backend returns { permissions: {...}, description }
      const perms = data?.permissions || FALLBACK_BACKEND_PERMISSIONS;
      setPermissionsStructure(perms);
    } catch (err) {
      console.warn("Could not fetch permissions structure; falling back.");
      setPermissionsStructure(FALLBACK_BACKEND_PERMISSIONS);
    }
  };

  const fetchTeams = async () => {
    setLoadingTeams(true);
    try {
      const data = await apiGetTeams({ limit: 100 }); // fetch many for management UI
      // backend returns { teams, pagination } or similar; adapt safely:
      const fetchedTeams = Array.isArray(data.teams)
        ? data.teams
        : data.teams || data;
      // Normalize team shape to match UI (id, name, description, permissions, createdAt)

      const normalized = (fetchedTeams || []).map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        permissions: normalizeBackendPermissions(
          t.permissions || {},
          permissionsStructure || FALLBACK_BACKEND_PERMISSIONS
        ),
        members: t.members || [],
        createdAt: t.created_at || t.createdAt || nowISO(),
      }));
      setTeams(normalized);
    } catch (err) {
      console.error("fetchTeams error", err);
      addToast("error", err?.response?.data?.error || "Failed to fetch teams");
    } finally {
      setLoadingTeams(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await apiGetUsers({ limit: 200 });

      const fetchedUsers = Array.isArray(data.users)
        ? data.users
        : data.users || data;

      let normalized = (fetchedUsers || []).map((u) => ({
        id: u.id,
        name: u.full_name || u.name || "",
        email: u.email,
        department: u.department || "",
        teams: [], // we fill this below from team.members
        createdAt: u.created_at || u.createdAt || nowISO(),
        role: u.role,
        status: u.status,
      }));

      // ---- TEAM → USER mapping ----
      const userTeamMap = {};
      teams.forEach((team) => {
        (team.members || []).forEach((m) => {
          if (!userTeamMap[m.id]) userTeamMap[m.id] = [];
          userTeamMap[m.id].push(team.id);
        });
      });

      // attach mapped teams
      normalized = normalized.map((u) => ({
        ...u,
        teams: userTeamMap[u.id] || [],
      }));

      setUsers(normalized);
    } catch (err) {
      console.error("fetchUsers error", err);
      addToast("error", err?.response?.data?.error || "Failed to fetch users");
    } finally {
      setLoadingUsers(false);
    }
  };

  /* ---------- Team operations ---------- */

  const handleSaveTeam = async (teamPayload) => {
    // teamPayload is the same structure as your original onSave emit
    // It should contain: id (or generated), name, description, permissions (grouped or backend)
    try {
      // ALWAYS convert grouped → backend flat permissions
      const backendPerms = buildBackendPermissions(
        teamPayload.permissions,
        permissionsStructure || FALLBACK_BACKEND_PERMISSIONS
      );

      if (teams.some((t) => t.id === teamPayload.id)) {
        // update
        await apiUpdateTeam(teamPayload.id, {
          name: teamPayload.name,
          description: teamPayload.description,
          permissions: backendPerms,
          status: "active",
        });
        addToast("success", "Team updated");
      } else {
        // create
        await apiCreateTeam({
          name: teamPayload.name,
          description: teamPayload.description,
          permissions: backendPerms,
        });
        addToast("success", "Team created");
      }

      // Refresh teams and users (members count may change)
      await fetchTeams();
      await fetchUsers();
      setShowTeamModal(false);
      setTeamToEdit(null);
    } catch (err) {
      console.error("handleSaveTeam error", err);
      addToast(
        "error",
        err?.response?.data?.error || "Failed to create/update team"
      );
    }
  };

  const handleDeleteTeam = async (teamId) => {
    showConfirm({
      title: "Delete Team?",
      message: "This will remove all user assignments for this team.",
      type: "danger",
      confirmText: "Delete",
      onConfirm: async () => {
        try {
          await apiDeleteTeam(teamId);
          addToast("success", "Team deleted");
          await fetchTeams();
          await fetchUsers();
        } catch (err) {
          console.error("handleDeleteTeam error", err);
          addToast(
            "error",
            err?.response?.data?.error || "Failed to delete team"
          );
        }
      },
    });
    return;
  };

  /* ---------- User operations ---------- */

  const handleSaveUser = async (userPayload) => {
    try {
      let newUserId = userPayload.id; // default for EDIT mode

      if (users.some((u) => u.id === userPayload.id)) {
        // UPDATE USER
        await apiUpdateUser(userPayload.id, {
          fullName: userPayload.name,
          department: userPayload.department,
          password: userPayload.password || undefined,
          role: userPayload.role,
          status: userPayload.status,
        });

        addToast("success", "User updated");
      } else {
        // CREATE USER
        const created = await apiCreateUser({
          email: userPayload.email,
          password: userPayload.password || "TempPass@123",
          fullName: userPayload.name,
          department: userPayload.department,
        });

        newUserId = created?.user?.id || created?.id;

        addToast("success", "User created");
      }

      // TEAM SYNC MUST RUN FOR BOTH CREATE & EDIT
      const oldTeams = users.find((u) => u.id === newUserId)?.teams || [];
      const newTeams = userPayload.teams || [];

      // ADD missing
      for (const tid of newTeams) {
        if (!oldTeams.includes(tid)) {
          await apiAddUserToTeam(tid, newUserId);
        }
      }

      // REMOVE extra
      for (const tid of oldTeams) {
        if (!newTeams.includes(tid)) {
          await apiRemoveUserFromTeam(tid, newUserId);
        }
      }

      await fetchUsers();
      await fetchTeams();

      setShowUserModal(false);
      setUserToEdit(null);
    } catch (err) {
      console.error("handleSaveUser error", err);
      addToast("error", err?.response?.data?.error || "Failed to save user");
    }
  };

  const handleDeleteUser = async (userId) => {
    showConfirm({
      title: "Delete User?",
      message: "This action cannot be undone.",
      type: "danger",
      confirmText: "Delete",
      onConfirm: async () => {
        try {
          await apiDeleteUser(userId);
          addToast("success", "User deleted");
          await fetchUsers();
          await fetchTeams();
        } catch (err) {
          console.error("handleDeleteUser error", err);
          addToast(
            "error",
            err?.response?.data?.error || "Failed to delete user"
          );
        }
      },
    });
    return;
  };

  const quickAssign = async (userId, teamId) => {
    if (!teamId) {
      addToast("error", "No team to assign");
      return;
    }
    try {
      await apiAddUserToTeam(teamId, userId);
      addToast("success", "User assigned to team");
      await fetchUsers();
      await fetchTeams();
    } catch (err) {
      console.error("quickAssign error", err);
      addToast("error", err?.response?.data?.error || "Failed to assign user");
    }
  };

  /* remove user from team */
  const removeUserFromTeam = async (teamId, userId) => {
    showConfirm({
      title: "Remove User?",
      message: "Remove this user from the team?",
      type: "warning",
      confirmText: "Remove",
      onConfirm: async () => {
        try {
          await apiRemoveUserFromTeam(teamId, userId);
          addToast("success", "User removed from team");
          await fetchUsers();
          await fetchTeams();
        } catch (err) {
          console.error("removeUserFromTeam error", err);
          addToast(
            "error",
            err?.response?.data?.error || "Failed to remove user"
          );
        }
      },
    });
    return;
  };

  /* ---------- Derived and filters (unchanged) ---------- */

  function effectivePermissionsForUser(user) {
    const agg = {};

    user.teams.forEach((tid) => {
      const t = teams.find((x) => x.id === tid);
      if (!t) return;

      // t.permissions is grouped UI permissions now, convert aggregated counts
      Object.entries(t.permissions || {}).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          agg[key] = Array.from(new Set([...(agg[key] || []), ...value]));
          return;
        }
        // if (value === true) {
        //   if (!agg[key]) agg[key] = [];
        //   agg[key].push(key);
        // }
      });
    });

    return agg;
  }

  const filteredUsers = users.filter((u) => {
    const q = query.trim().toLowerCase();
    if (teamFilter !== "all") {
      const tf = Number(teamFilter);
      if (!u.teams.includes(tf)) return false;
    }

    if (!q) return true;

    const userTeamNames = u.teams
      .map((tid) => teams.find((t) => t.id === tid)?.name || "")
      .join(" ")
      .toLowerCase();
      
    return (
      (u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      ((u.department || "") + "").toLowerCase().includes(q) ||
      userTeamNames.includes(q)
    );
  });

  const filteredTeams = teams.filter((t) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      (t.name || "").toLowerCase().includes(q) ||
      ((t.description || "") + "").toLowerCase().includes(q)
    );
  });

  const cardClass =
    "rounded-2xl border border-[#828282] bg-white dark:bg-[#0f1720] dark:border-[#2a2a2a] shadow-sm";

  /* ========== RENDER ========== */

  if (loading) {
    return <div className="p-6">Loading…</div>;
  }

  // Access control: only org admins should use this page
  if (!user || user.role !== "org_admin") {
    return (
      <div className="p-6">
        <div className="rounded-xl border p-6">
          <h2 className="text-lg font-semibold">Unauthorized</h2>
          <p className="text-sm text-gray-500 mt-2">
            This area is only accessible to Organization Administrators.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen" style={{ fontFamily: BRAND.font }}>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold dark:text-gray-200">
            User Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create teams, assign permissions, and manage users
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border rounded-md px-3 py-2 bg-white dark:bg-[#061018] border-[#828282] dark:border-gray-500">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              placeholder="Search users or teams..."
              className="bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="border px-3 py-2 rounded bg-white dark:bg-[#061018] border-[#828282] dark:border-gray-500 dark:text-gray-200 text-sm"
            >
              <option value="all">All teams</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                setShowTeamModal(true);
                setTeamToEdit(null);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded bg-[#5DEE92] text-black font-semibold"
            >
              <PlusCircle className="w-4 h-4" />{" "}
              <span className="text-sm">Create Team</span>
            </button>

            <button
              onClick={() => {
                setShowUserModal(true);
                setUserToEdit(null);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded border border-[#828282] bg-white dark:text-gray-200 dark:bg-[#061018]"
            >
              <UserPlus className="w-4 h-4" />{" "}
              <span className="text-sm">Add User</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: left=teams, right=users */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Teams column (left) */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.02 }}
            className={`${cardClass} p-5`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold dark:text-gray-300">
                  Teams
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {teams.length} teams
                </p>
              </div>
              <div>
                {loadingTeams ? (
                  <div className="text-sm">Loading...</div>
                ) : null}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {filteredTeams.map((t) => (
                <motion.div
                  key={t.id}
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="p-3 rounded-lg bg-white dark:bg-[#07121a] border border-[#e6e6e6] dark:border-[#1f2a2f]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                          {t.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-300">
                          {t.description}
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                        Members:{" "}
                        <strong>
                          {users.filter((u) => u.teams.includes(t.id)).length}
                        </strong>
                      </div>
                      <div className="mt-2 flex gap-2 flex-wrap">
                        {Object.entries(t.permissions || {}).map(
                          ([group, perms]) =>
                            Array.isArray(perms) && perms.length > 0 ? (
                              <div
                                key={group}
                                className="px-2 py-1 bg-[#f7fff9] dark:bg-[#8fddc3] border border-[#e6e6e6] dark:border-[#172425] rounded text-xs"
                              >
                                {group}: {perms.length}
                              </div>
                            ) : null
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => {
                          setTeamToEdit(t);
                          setShowTeamModal(true);
                        }}
                        className="px-2 py-1 rounded border border-[#e6e6e6] dark:text-gray-300 dark:border-gray-500"
                      >
                        <Edit2 />
                      </button>
                      <button
                        onClick={() => handleDeleteTeam(t.id)}
                        className="px-2 py-1 rounded border border-red-200 text-red-600"
                      >
                        <Trash2 />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {filteredTeams.length === 0 && (
                <div className="text-sm text-gray-500">No teams found</div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Users column (right) */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`${cardClass} p-5`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold dark:text-gray-300">
                  Users
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {users.length} total
                </p>
              </div>

              {/* <div className="flex items-center gap-2">
                {loadingUsers ? (
                  <div className="text-sm">Loading...</div>
                ) : (
                  <Filter className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                )}
              </div> */}
            </div>

            <div className="mt-4 space-y-3">
              {filteredUsers.map((u) => (
                <motion.div
                  key={u.id}
                  whileHover={{ y: -3 }}
                  className="p-4 rounded-lg bg-white dark:bg-[#07121a] border border-[#e6e6e6] dark:border-[#1f2a2f] flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-[#5DEE92] text-black flex items-center justify-center font-semibold">
                      {u.name
                        ? u.name
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")
                        : ""}
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                        {u.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-300">
                        {u.email} • {u.department}
                      </div>

                      <div className="mt-2 flex gap-2 flex-wrap">
                        {u.teams.map((tid) => {
                          const t = teams.find((x) => x.id === tid);
                          if (!t) return null;
                          return (
                            <div
                              key={tid}
                              className="px-2 py-1 rounded bg-white dark:bg-[#a5cbce] border border-[#e6e6e6] dark:border-[#1f2a2f] text-xs"
                            >
                              {t.name}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Joined: {new Date(u.createdAt).toLocaleDateString()}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setUserToEdit(u);
                          setShowUserModal(true);
                        }}
                        className="px-3 py-1 rounded border border-[#e6e6e6] dark:border-gray-300 dark:text-gray-300"
                      >
                        <Edit2 />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="px-3 py-1 rounded border border-red-200 text-red-600"
                      >
                        <Trash2 />
                      </button>
                      <button
                        onClick={() => quickAssign(u.id, teams[0]?.id)}
                        disabled={!teams[0]}
                        className="px-3 py-1 rounded bg-[#5DEE92] text-black"
                      >
                        Quick assign
                      </button>
                    </div>

                    {/* <div className="mt-2 text-xs">
                      <strong>Effective perms:</strong>
                      <div className="mt-1 flex gap-2 flex-wrap">
                        {Object.entries(effectivePermissionsForUser(u))
                          .length === 0 ? (
                          <div className="text-gray-500">None</div>
                        ) : (
                          Object.entries(effectivePermissionsForUser(u)).map(
                            ([g, perms]) => (
                              <div
                                key={g}
                                className="px-2 py-1 bg-white dark:bg-[#b3faff] border border-[#e6e6e6] dark:border-[#172425] rounded text-xs"
                              >
                                {g}: {perms.length}
                              </div>
                            )
                          )
                        )}
                      </div>
                    </div> */}
                  </div>
                </motion.div>
              ))}

              {filteredUsers.length === 0 && (
                <div className="text-sm text-gray-500">No users found</div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showTeamModal && (
          <TeamModal
            initial={teamToEdit}
            onClose={() => {
              setShowTeamModal(false);
              setTeamToEdit(null);
            }}
            onSave={handleSaveTeam}
            backendDefaults={
              permissionsStructure || FALLBACK_BACKEND_PERMISSIONS
            }
          />
        )}

        {showUserModal && (
          <UserModal
            initial={userToEdit}
            teams={teams}
            onClose={() => {
              setShowUserModal(false);
              setUserToEdit(null);
            }}
            onSave={handleSaveUser}
          />
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
      />
    </div>
  );
}
