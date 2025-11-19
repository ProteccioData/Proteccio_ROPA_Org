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
} from "lucide-react";

const STORAGE_KEY = "um:modern:v1";
const BRAND = {
  primary: "#5DEE92",
  border: "#828282",
  font: "Jakarta Sans, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto",
};

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
  ROPA_VIEW_STAGES: ["InfoVoyage", "CheckSync", "Beam", "OffDoff"],
  ROPA_EDIT_STAGES: ["InfoVoyage", "CheckSync", "Beam"],
};

const permissionGroups = Object.entries(PERMISSIONS).map(([group, perms]) => ({
  group,
  perms,
}));
const uid = (pre = "") => pre + Math.random().toString(36).slice(2, 9);
const nowISO = () => new Date().toISOString();

/* ========== Sample initial data (will be loaded if no localStorage) ========== */
const SAMPLE = {
  teams: [
    {
      id: "team_hr",
      name: "HR Team",
      description: "Employee lifecycle",
      permissions: {
        ROPA: ["VIEW"],
        ASSESSMENTS: ["VIEW"],
        MAPPING: ["VIEW"],
        SETUP: [],
        AUDIT: ["USER_SPECIFIC"],
        REPORTS: ["VIEW"],
      },
      createdAt: nowISO(),
    },
    {
      id: "team_sec",
      name: "Security Ops",
      description: "Security and compliance",
      permissions: {
        ROPA: ["VIEW", "EDIT", "ASSIGN"],
        ASSESSMENTS: ["CREATE", "VIEW", "EDIT"],
        MAPPING: ["VIEW", "EDIT"],
        SETUP: ["SECURITY_REVIEW"],
        AUDIT: ["ALL"],
        REPORTS: ["GENERATE"],
      },
      createdAt: nowISO(),
    },
  ],
  users: [
    {
      id: "user_1",
      name: "Alice Patel",
      email: "alice@company.com",
      department: "HR",
      password: "•••••••",
      teams: ["team_hr"],
      createdAt: nowISO(),
    },
    {
      id: "user_2",
      name: "Bob Singh",
      email: "bob@company.com",
      department: "Security",
      password: "•••••••",
      teams: ["team_sec"],
      createdAt: nowISO(),
    },
  ],
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SAMPLE;
    return JSON.parse(raw);
  } catch {
    return SAMPLE;
  }
}
function saveState(payload) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

/* ========== UI Primitives ========== */

/* ToggleSwitch - modern animated toggle */
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

/* Small pill label for chips */
function Pill({ children }) {
  return (
    <span className="text-xs px-2 py-1 rounded-md bg-white/60 dark:bg-white/6 border border-[#828282] text-gray-800 dark:text-gray-100">
      {children}
    </span>
  );
}

/* Modal shell - full width feel but centered */
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

function RopaPermissionBlock({ value, onChange }) {
  const main = value.ROPA || [];
  const viewStages = value.ROPA_VIEW_STAGES || [];
  const editStages = value.ROPA_EDIT_STAGES || [];

  const toggleMain = (perm) => {
    const next = main.includes(perm)
      ? main.filter((x) => x !== perm)
      : [...main, perm];

    onChange({ ...value, ROPA: next });
  };

  const toggleViewStage = (stage) => {
    const next = viewStages.includes(stage)
      ? viewStages.filter((x) => x !== stage)
      : [...viewStages, stage];

    onChange({ ...value, ROPA_VIEW_STAGES: next });
  };

  const toggleEditStage = (stage) => {
    const next = editStages.includes(stage)
      ? editStages.filter((x) => x !== stage)
      : [...editStages, stage];

    onChange({ ...value, ROPA_EDIT_STAGES: next });
  };

  return (
    <div className="mb-5 border rounded-xl p-4 bg-white dark:bg-gray-900 border-[#e6e6e6] dark:border-[#2b2b2b]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold dark:text-gray-200">
          ROPA Permissions
        </h3>
      </div>

      {/* MAIN ROPA PERMISSIONS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {["CREATE", "ASSIGN", "LINK", "ARCHIVE"].map((perm) => (
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

      {/* VIEW STAGES */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-medium dark:text-gray-300">
            VIEW — Stages
          </div>
          <Pill>{viewStages.length}</Pill>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PERMISSIONS.ROPA_VIEW_STAGES.map((stage) => (
            <div
              key={stage}
              className="flex items-center justify-between p-2 border rounded bg-white dark:bg-gray-800 border-[#e6e6e6] dark:border-[#2b2b2b]"
            >
              <div className="text-xs">{stage}</div>
              <ToggleSwitch
                size="sm"
                checked={viewStages.includes(stage)}
                onChange={() => toggleViewStage(stage)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* EDIT STAGES */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-medium dark:text-gray-300">
            EDIT — Stages
          </div>
          <Pill>{editStages.length}</Pill>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PERMISSIONS.ROPA_EDIT_STAGES.map((stage) => (
            <div
              key={stage}
              className="flex items-center justify-between p-2 border rounded bg-white dark:bg-gray-800 border-[#e6e6e6] dark:border-[#2b2b2b]"
            >
              <div className="text-xs">{stage}</div>
              <ToggleSwitch
                size="sm"
                checked={editStages.includes(stage)}
                onChange={() => toggleEditStage(stage)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AssessmentPermissionBlock({ value, onChange }) {
  const main = value.ASSESSMENTS || [];
  const lia = value.ASSESS_LIA || [];
  const dpia = value.ASSESS_DPIA || [];
  const tia = value.ASSESS_TIA || [];

  const toggleMain = (perm) => {
    const next = main.includes(perm)
      ? main.filter((x) => x !== perm)
      : [...main, perm];
    onChange({ ...value, ASSESSMENTS: next });
  };

  const toggleStage = (key, list, stagePerm) => {
    const next = list.includes(stagePerm)
      ? list.filter((x) => x !== stagePerm)
      : [...list, stagePerm];
    onChange({ ...value, [key]: next });
  };

  return (
    <div className="mb-5 border rounded-xl p-4 bg-white dark:bg-gray-900 border-[#e6e6e6] dark:border-[#2b2b2b]">
      <h3 className="text-sm font-semibold dark:text-gray-200 mb-3">
        Assessments Permissions
      </h3>

      {/* Main permissions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {["CREATE", "VIEW", "EDIT", "DELETE", "ARCHIVE"].map((perm) => (
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

      {/* Stage blocks */}
      {[
        { key: "ASSESS_LIA", title: "LIA", list: lia },
        { key: "ASSESS_DPIA", title: "DPIA", list: dpia },
        { key: "ASSESS_TIA", title: "TIA", list: tia },
      ].map(({ key, title, list }) => (
        <div key={key} className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-xs font-medium dark:text-gray-300">
              {title} — View / Edit
            </span>
            <Pill>{list.length}</Pill>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {["VIEW", "EDIT"].map((p) => (
              <div
                key={p}
                className="flex items-center justify-between p-2 border rounded bg-white dark:bg-gray-800 border-[#e6e6e6] dark:border-[#2b2b2b]"
              >
                <div className="text-xs">{p}</div>
                <ToggleSwitch
                  size="sm"
                  checked={list.includes(p)}
                  onChange={() => toggleStage(key, list, p)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* PermissionsEditor - group of rows */
function PermissionsEditor({ value = {}, onChange }) {
  // value: { group: [perms] }
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
      {/* {permissionGroups.map(({ group, perms }) => (
        <PermissionGroupRow
          key={group}
          group={group}
          perms={perms}
          stateGroup={value[group] || []}
          onToggle={(perm) => togglePerm(group, perm)}
        />
      ))} */}

      <RopaPermissionBlock value={value} onChange={onChange} />

      <AssessmentPermissionBlock value={value} onChange={onChange} />

      {permissionGroups
        .filter(
          ({ group }) =>
            !["ROPA", "ROPA_VIEW_STAGES", "ROPA_EDIT_STAGES" , "ASSESSMENTS"].includes(group)
        )
        .map(({ group, perms }) => (
          <PermissionGroupRow
            key={group}
            group={group}
            perms={perms}
            stateGroup={value[group] || []}
            onToggle={(perm) => {
              const cur = value[group] || [];
              const next = cur.includes(perm)
                ? cur.filter((x) => x !== perm)
                : [...cur, perm];
              onChange({ ...value, [group]: next });
            }}
          />
        ))}
    </div>
  );
}

/* ========== Team Modal (create / edit) ========== */
function TeamModal({ initial = null, onClose, onSave }) {
  const isEdit = Boolean(initial);
  const [name, setName] = useState(initial?.name || "");
  const [desc, setDesc] = useState(initial?.description || "");
  const [permissions, setPermissions] = useState(initial?.permissions || {});

  useEffect(() => {
    // ensure all groups exist
    permissionGroups.forEach(({ group }) => {
      if (!permissions[group]) {
        setPermissions((p) => ({
          ...p,
          [group]: initial?.permissions?.[group] || [],
        }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSave() {
    if (!name.trim()) return alert("Please provide team name");

    const flatPermissions = {};

    // main
    if (permissions.ROPA?.includes("CREATE"))
      flatPermissions.create_ropa = true;
    if (permissions.ROPA?.includes("ASSIGN"))
      flatPermissions.assign_ropa = true;
    if (permissions.ROPA?.includes("LINK")) flatPermissions.link_ropa = true;
    if (permissions.ROPA?.includes("ARCHIVE"))
      flatPermissions.archive_ropa = true;

    // view stages
    permissions.ROPA_VIEW_STAGES?.forEach((s) => {
      flatPermissions[`view_ropa_${s.toLowerCase()}`] = true;
    });

    // edit stages
    permissions.ROPA_EDIT_STAGES?.forEach((s) => {
      flatPermissions[`edit_ropa_${s.toLowerCase()}`] = true;
    });

    const payload = {
      id: initial?.id || uid("team_"),
      name: name.trim(),
      description: desc.trim(),
      permissions: flatPermissions,
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
            <PermissionsEditor value={permissions} onChange={setPermissions} />
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

/* ========== User Modal (create / edit) ========== */
function UserModal({ initial = null, onClose, onSave, teams = [] }) {
  const isEdit = Boolean(initial);
  const [name, setName] = useState(initial?.name || "");
  const [email, setEmail] = useState(initial?.email || "");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState(initial?.department || "");
  const [assigned, setAssigned] = useState(initial?.teams || []);

  function toggleTeam(tid) {
    setAssigned((s) =>
      s.includes(tid) ? s.filter((x) => x !== tid) : [...s, tid]
    );
  }
  function handleSave() {
    if (!name.trim() || !email.trim()) return alert("Name and email required");
    const payload = {
      id: initial?.id || uid("user_"),
      name: name.trim(),
      email: email.trim(),
      password: password ? password : initial?.password || "••••••",
      department,
      teams: assigned,
      createdAt: initial?.createdAt || nowISO(),
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium dark:text-gray-400">
            Full name
          </label>
          <input
            className="mt-2 w-full border rounded px-3 py-2 dark:text-gray-200 bg-white dark:bg-gray-800"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium dark:text-gray-400">
            Email
          </label>
          <input
            className="mt-2 w-full border rounded px-3 py-2 bg-white dark:text-gray-200 dark:bg-gray-800"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium dark:text-gray-400">
            Password
          </label>
          <input
            type="password"
            className="mt-2 w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 dark:text-gray-200"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isEdit ? "leave empty to keep" : ""}
          />
        </div>

        <div>
          <label className="block text-sm font-medium dark:text-gray-400">
            Department
          </label>
          <input
            className="mt-2 w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 dark:text-gray-200"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-2 dark:text-gray-400">
            Assign to teams
          </label>
          <div className="flex flex-wrap gap-2">
            {teams.map((t) => (
              <button
                key={t.id}
                onClick={() => toggleTeam(t.id)}
                className={`px-3 py-1 rounded-md text-sm transition ${
                  assigned.includes(t.id)
                    ? "bg-[#5DEE92] text-black border border-[#5DEE92]"
                    : "bg-white dark:bg-gray-800 border border-[#e6e6e6] dark:border-[#2b2b2b] text-gray-700 dark:text-gray-200"
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

/* ========== Main Page ========== */
export default function ModernUserManagement() {
  // load initial state once
  const initial = useMemo(() => loadState(), []);
  const [teams, setTeams] = useState(initial.teams || []);
  const [users, setUsers] = useState(initial.users || []);

  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState(null);

  const [showUserModal, setShowUserModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  const [query, setQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");

  // Persist on change
  useEffect(() => {
    saveState({ teams, users });
  }, [teams, users]);

  /* Team handlers */
  function handleSaveTeam(team) {
    setTeams((prev) => {
      const exists = prev.some((t) => t.id === team.id);
      if (exists) return prev.map((t) => (t.id === team.id ? team : t));
      return [team, ...prev];
    });
    setShowTeamModal(false);
    setTeamToEdit(null);
  }
  function handleDeleteTeam(teamId) {
    if (!confirm("Delete team? This will remove team assignment from users."))
      return;
    setTeams((prev) => prev.filter((t) => t.id !== teamId));
    setUsers((prev) =>
      prev.map((u) => ({ ...u, teams: u.teams.filter((id) => id !== teamId) }))
    );
  }

  /* User handlers */
  function handleSaveUser(user) {
    setUsers((prev) => {
      const exists = prev.some((u) => u.id === user.id);
      if (exists)
        return prev.map((u) => (u.id === user.id ? { ...u, ...user } : u));
      return [user, ...prev];
    });
    setShowUserModal(false);
    setUserToEdit(null);
  }
  function handleDeleteUser(userId) {
    if (!confirm("Delete user?")) return;
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  }

  function quickAssign(userId, teamId) {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              teams: u.teams.includes(teamId) ? u.teams : [...u.teams, teamId],
            }
          : u
      )
    );
  }

  /* Derived: effective permissions for user (union of teams) */
  function effectivePermissionsForUser(user) {
    const agg = {};

    user.teams.forEach((tid) => {
      const t = teams.find((x) => x.id === tid);
      if (!t) return;

      Object.entries(t.permissions || {}).forEach(([key, value]) => {
        // Case 1: array permissions (like old system)
        if (Array.isArray(value)) {
          agg[key] = Array.from(new Set([...(agg[key] || []), ...value]));
          return;
        }

        // Case 2: boolean permissions (new flattened system)
        if (value === true) {
          if (!agg[key]) agg[key] = [];
          agg[key].push(key); // store the permission name itself
        }
      });
    });

    return agg;
  }

  /* Filters */
  const filteredUsers = users.filter((u) => {
    const q = query.trim().toLowerCase();
    if (teamFilter !== "all" && !u.teams.includes(teamFilter)) return false;
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.department || "").toLowerCase().includes(q)
    );
  });

  const filteredTeams = teams.filter((t) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      t.name.toLowerCase().includes(q) ||
      (t.description || "").toLowerCase().includes(q)
    );
  });

  /* UI colors for dark mode improvements */
  const cardClass =
    "rounded-2xl border border-[#828282] bg-white dark:bg-[#0f1720] dark:border-[#2a2a2a] shadow-sm";

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
                        {Object.entries(t.permissions || {}).map(([g, perms]) =>
                          perms.length > 0 ? (
                            <div
                              key={g}
                              className="px-2 py-1 bg-[#f7fff9] dark:bg-[#8fddc3] border border-[#e6e6e6] dark:border-[#172425] rounded text-xs"
                            >
                              {g} · {perms.length}
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

              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {filteredUsers.map((u) => (
                <motion.div
                  key={u.id}
                  whileHover={{ y: -3 }}
                  className="p-4 rounded-lg bg-white dark:bg-[#07121a] border border-[#e6e6e6] dark:border-[#1f2a2f] flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-[#5DEE92] text-black flex items-center justify-center font-semibold">
                      {u.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
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

                    <div className="mt-2 text-xs">
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
                    </div>
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
    </div>
  );
}
