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
  MapPin
} from "lucide-react";

/**
 * SettingsPage.jsx
 *
 * - Tabbed Settings UI (General | Access | Security | Notifications | Backups | Compliance)
 * - Toggle switches, selects, inputs, modals
 * - Role creation with permission toggles (re-uses permission groups)
 * - Invite user (email invite local simulation)
 * - Local persistence via localStorage (key: settings:v1)
 * - Theme colors: #5DEE92 (primary), #828282 (border)
 *
 * Requirements:
 *  npm i framer-motion lucide-react
 *
 * Replace localStorage reads/writes with API calls where needed.
 */

/* ---------- CONFIG ---------- */
const STORAGE_KEY = "settings:v1";
const BRAND = { primary: "#5DEE92", border: "#828282", font: "Jakarta Sans, system-ui, -apple-system, 'Segoe UI', Roboto" };

/* Permission groups used in role creation — adapt as needed */
const PERMISSIONS = {
  ROPA: ["CREATE", "EDIT", "VIEW", "DELETE", "ASSIGN", "LINK", "ARCHIVE"],
  ASSESSMENTS: ["LIA", "DPIA", "TIA", "CREATE", "VIEW", "EDIT", "DELETE", "ARCHIVE"],
  MAPPING: ["CREATE_FLOW", "EDIT", "VIEW", "ARCHIVE", "DELETE"],
  SETUP: ["CONFIGURE", "BULK_IMPORT", "SECURITY_REVIEW", "ADD_ASSET"],
  AUDIT: ["VIEW", "USER_SPECIFIC", "ALL"],
  REPORTS: ["GENERATE", "SCHEDULE", "DOWNLOAD", "VIEW", "EDIT"]
};
const permissionGroups = Object.entries(PERMISSIONS).map(([g, p]) => ({ group: g, perms: p }));

/* ---------- Helpers ---------- */
const uid = (pref = "") => pref + Math.random().toString(36).slice(2, 9);
const nowISO = () => new Date().toISOString();
const indianLanguages = ["Hindi", "Bengali", "Telugu", "Marathi", "Tamil", "Urdu", "Gujarati", "Kannada", "Malayalam", "Odia", "Punjabi"];

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
    maskPersonalInfoInExports: false
  },
  access: {
    inviteQueue: [], // invited emails with status
    roles: [
      {
        id: "role_admin",
        name: "Org Admin",
        description: "Full access",
        permissions: Object.keys(PERMISSIONS).reduce((acc, k) => ({ ...acc, [k]: [...PERMISSIONS[k]] }), {})
      }
    ],
    users: [] // reference only for UI (real app would query users)
  },
  security: {
    passwordPolicy: { minLength: 8, requireNumbers: true, requireSpecial: false, expiryDays: 90 },
    twoFA: "optional", // optional | mandatory | disabled
    sessionTimeoutMinutes: 30,
    ipAllowlist: [],
    ipDenylist: [],
    encryption: { aes: "AES-256", tls: ["1.2", "1.3"] }
  },
  notifications: {
    onScreen: true,
    email: true,
    alertRules: [
      { id: "highRiskProc", name: "High-risk processing created", enabled: true, frequency: "immediate", recipients: ["Org Admin"] }
    ],
    notificationFrequency: "immediate"
  },
  backups: {
    manualExportEnabled: true,
    automatedBackupFrequency: "daily",
    backupStorage: "both", // internal | external | both
    backupExternalLocation: "",
    autoBackupEnabled: true
  },
  compliance: {
    dataRetentionYears: 6,
    lockAfterApproval: true,
    autoLockAfterDaysInactive: 365,
    roleFieldControl: true, // allow field-level view/edit control
    maskPersonalDataInExports: false
  }
};

/* ---------- Storage helpers ---------- */
function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_STATE;
  }
}
function saveSettings(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/* ---------- UI primitives ---------- */
function Toggle({
  checked = false,
  onChange,
  size = "md",
  ariaLabel,
}) {
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
    <div className="rounded-2xl border" style={{ borderColor: BRAND.border, background: "var(--card-bg)" }}>
      <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(130,130,130,0.08)" }}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-lg font-semibold">{title}</div>
            {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
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
        <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: "rgba(130,130,130,0.08)" }}>
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose}><X /></button>
        </div>
        <div className="p-4 max-h-[60vh] overflow-y-auto">{children}</div>
        <div className="px-4 py-3 border-t flex justify-end gap-2" style={{ borderColor: "rgba(130,130,130,0.08)" }}>
          {footer}
        </div>
      </motion.div>
    </div>
  );
}

/* ---------- Main Settings Page ---------- */
export default function SettingsPage() {
  const initial = useMemo(() => loadSettings(), []);
  const [state, setState] = useState(initial);

  const [activeTab, setActiveTab] = useState("General"); // tabs: General, Access, Security, Notifications, Backups, Compliance

  /* Modals */
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  /* Keep settings saved */
  useEffect(() => {
    saveSettings(state);
  }, [state]);

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
  function saveRole(role) {
    setState((s) => {
      const next = { ...s };
      const exists = next.access.roles.find((r) => r.id === role.id);
      if (exists) next.access.roles = next.access.roles.map((r) => (r.id === role.id ? role : r));
      else next.access.roles = [role, ...next.access.roles];
      return next;
    });
    setShowRoleModal(false);
    setRoleToEdit(null);
  }
  function deleteRole(roleId) {
    if (!confirm("Delete this role?")) return;
    setState((s) => {
      const next = { ...s };
      next.access.roles = next.access.roles.filter((r) => r.id !== roleId);
      return next;
    });
  }

  /* Invite user simulation */
  function sendInvite(email) {
    const invite = { id: uid("inv_"), email, status: "pending", invitedAt: nowISO() };
    setState((s) => ({ ...s, access: { ...s.access, inviteQueue: [invite, ...(s.access.inviteQueue || [])] } }));
  }
  function revokeInvite(inviteId) {
    setState((s) => ({ ...s, access: { ...s.access, inviteQueue: s.access.inviteQueue.filter((i) => i.id !== inviteId) } }));
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
      next.security[listName] = (next.security[listName] || []).filter((x) => x !== ip);
      return next;
    });
  }

  /* Logo upload handling (store objectURL locally for demo) */
  function handleLogoUpload(file) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    update("general.logoUrl", url);
  }

  /* ---------- Render: Tabs Nav ---------- */
  const tabs = ["General", "Access", "Security", "Notifications", "Backups", "Compliance"];

  return (
    <div className="p-6" style={{ fontFamily: BRAND.font }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-gray-500">Centralize org-wide configuration, security, compliance and auditing</p>
        </div>

        <div className="flex gap-2 items-center">
          <div className="text-sm text-gray-600">Active tab</div>
          <div className="px-3 py-1 rounded border" style={{ borderColor: BRAND.border }}>{activeTab}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex gap-2 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-2 rounded-2xl font-medium ${activeTab === t ? "bg-[#5DEE92] text-black" : "bg-white dark:bg-[#071019] border"}`}
              style={{ borderColor: BRAND.border }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="space-y-6">
        {/* GENERAL */}
        {activeTab === "General" && (
          <Card title="General Settings" subtitle="Organization information and default preferences">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium">Organization name</label>
                <input className="mt-1 w-full border rounded px-3 py-2" value={state.general.organizationName} onChange={(e)=>update("general.organizationName", e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium">Logo</label>
                <div className="mt-2 flex items-center gap-3">
                  <div className="w-20 h-20 rounded bg-[#f3fff7] flex items-center justify-center border" style={{ borderColor: BRAND.border }}>
                    {state.general.logoUrl ? <img src={state.general.logoUrl} alt="logo" className="object-cover w-full h-full rounded" /> : <Upload />}
                  </div>
                  <div>
                    <input type="file" accept="image/*" onChange={(e)=>handleLogoUpload(e.target.files[0])} />
                    <div className="text-xs text-gray-500 mt-1">Recommended: 400x400 PNG or SVG</div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium">Address</label>
                <textarea className="mt-1 w-full border rounded px-3 py-2" value={state.general.address} onChange={(e)=>update("general.address", e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium">Registration number</label>
                <input className="mt-1 w-full border rounded px-3 py-2" value={state.general.registrationNumber} onChange={(e)=>update("general.registrationNumber", e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium">Time zone</label>
                <select className="mt-1 w-full border rounded px-3 py-2" value={state.general.timeZone} onChange={(e)=>update("general.timeZone", e.target.value)}>
                  <option value="Asia/Kolkata">Asia/Kolkata</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">Default language</label>
                <select className="mt-1 w-full border rounded px-3 py-2" value={state.general.defaultLanguage} onChange={(e)=>update("general.defaultLanguage", e.target.value)}>
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Spanish</option>
                </select>

                <div className="mt-2 text-sm">
                  <label className="block text-sm font-medium">Indian languages (optional)</label>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {indianLanguages.map((l) => {
                      const active = state.general.secondaryLanguages.includes(l);
                      return (
                        <button key={l} onClick={() => {
                          const cur = state.general.secondaryLanguages || [];
                          update("general.secondaryLanguages", cur.includes(l) ? cur.filter(x=>x!==l) : [...cur, l]);
                        }} className={`px-2 py-1 rounded ${active ? "bg-[#5DEE92] text-black" : "border"}`} style={{ borderColor: BRAND.border }}>
                          {l}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium">Default country</label>
                <select className="mt-1 w-full border rounded px-3 py-2" value={state.general.defaultCountry} onChange={(e)=>update("general.defaultCountry", e.target.value)}>
                  <option>India</option>
                  <option>United States</option>
                  <option>United Kingdom</option>
                </select>
              </div>

              <div className="md:col-span-2 flex items-center gap-4">
                <div>
                  <label className="block text-sm font-medium">Configure templates</label>
                  <div className="text-sm text-gray-500">Enable templates and defaults to streamline RoPA entry</div>
                </div>
                <div>
                  <Toggle checked={state.general.templatesEnabled} onChange={(v)=>update("general.templatesEnabled", v)} />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium">Mask personal names/emails in exports/logs</label>
                <div className="flex items-center gap-3 mt-2">
                  <Toggle checked={state.general.maskPersonalInfoInExports} onChange={(v)=>update("general.maskPersonalInfoInExports", v)} />
                  <div className="text-sm text-gray-500">Toggle to mask PII in exports and logs</div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* ACCESS */}
        {activeTab === "Access" && (
          <Card title="Access Control" subtitle="Manage invites, roles, and role assignment history">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Invite */}
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">Invite by email</div>
                    <div className="text-xs text-gray-500">Send invitation to join org</div>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <input id="inviteEmail" placeholder="email@example.com" className="flex-1 border rounded px-3 py-2" />
                  <button onClick={() => {
                    const el = document.getElementById("inviteEmail");
                    if (!el || !el.value) return alert("Enter email");
                    sendInvite(el.value);
                    el.value = "";
                  }} className="px-4 py-2 rounded bg-[#5DEE92] text-black flex items-center gap-2"><Mail /> Invite</button>
                </div>

                <div className="mt-4">
                  <div className="text-sm font-medium">Invite queue</div>
                  <div className="mt-2 space-y-2">
                    {(state.access.inviteQueue || []).map((i) => (
                      <div key={i.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="text-sm">{i.email} <span className="text-xs text-gray-400">({i.status})</span></div>
                        <div className="flex gap-2">
                          <button onClick={() => revokeInvite(i.id)} className="px-2 py-1 rounded border"><Trash2 /></button>
                        </div>
                      </div>
                    ))}
                    {(state.access.inviteQueue || []).length === 0 && <div className="text-sm text-gray-500">No invites queued</div>}
                  </div>
                </div>
              </div>

              {/* Role assignment history placeholder */}
              <div className="md:col-span-2 mt-2">
                <div className="text-sm font-semibold mb-2">Role assignment history</div>
                <div className="p-3 border rounded">
                  <div className="text-sm text-gray-500">View history of who changed role assignments (who, when, what). For demo this is a placeholder — wire to audit logs backend for real data.</div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* SECURITY */}
        {activeTab === "Security" && (
          <Card title="Security Settings" subtitle="Passwords, 2FA, session & IP controls">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm font-semibold">Password policy</div>
                <div className="mt-2 space-y-2">
                  <label className="text-xs">Minimum length</label>
                  <input type="number" min={6} className="w-24 border rounded px-2 py-1" value={state.security.passwordPolicy.minLength} onChange={(e)=>update("security.passwordPolicy.minLength", Number(e.target.value))} />

                  <div className="flex items-center gap-3 mt-2">
                    <div className="text-sm">Require numbers</div>
                    <Toggle checked={state.security.passwordPolicy.requireNumbers} onChange={(v)=>update("security.passwordPolicy.requireNumbers", v)} />
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="text-sm">Require special characters</div>
                    <Toggle checked={state.security.passwordPolicy.requireSpecial} onChange={(v)=>update("security.passwordPolicy.requireSpecial", v)} />
                  </div>

                  <div className="mt-2">
                    <label className="text-xs">Password expiry (days)</label>
                    <input type="number" min={0} className="w-32 border rounded px-2 py-1" value={state.security.passwordPolicy.expiryDays} onChange={(e)=>update("security.passwordPolicy.expiryDays", Number(e.target.value))} />
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold">Two-Factor Authentication (2FA)</div>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-3">
                    <label className="text-sm">Mode</label>
                    <select value={state.security.twoFA} onChange={(e)=>update("security.twoFA", e.target.value)} className="border rounded px-3 py-1">
                      <option value="optional">Optional</option>
                      <option value="mandatory">Mandatory</option>
                      <option value="disabled">Disabled</option>
                    </select>
                  </div>

                  <div className="mt-2">
                    <label className="text-sm">Session timeout (minutes)</label>
                    <input type="number" className="w-24 border rounded px-2 py-1" value={state.security.sessionTimeoutMinutes} onChange={(e)=>update("security.sessionTimeoutMinutes", Number(e.target.value))} />
                  </div>
                </div>
              </div>

              {/* IP lists */}
              <div>
                <div className="text-sm font-semibold">IP allowlist</div>
                <div className="mt-2">
                  <div className="flex gap-2">
                    <input id="ipAllow" className="flex-1 border rounded px-3 py-2" placeholder="x.x.x.x or CIDR" />
                    <button onClick={()=>{ const el=document.getElementById("ipAllow"); if(!el.value) return; addIP("ipAllowlist", el.value); el.value=""; }} className="px-3 py-1 rounded bg-[#5DEE92]">Add</button>
                  </div>
                  <div className="mt-3 space-y-2">
                    {(state.security.ipAllowlist || []).map((ip)=>(
                      <div key={ip} className="flex items-center justify-between p-2 border rounded">
                        <div className="text-sm">{ip}</div>
                        <button onClick={()=>removeIP("ipAllowlist", ip)} className="text-red-600 px-2">Remove</button>
                      </div>
                    ))}
                    {(state.security.ipAllowlist || []).length === 0 && <div className="text-sm text-gray-500">No IPs added</div>}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold">IP denylist</div>
                <div className="mt-2">
                  <div className="flex gap-2">
                    <input id="ipDeny" className="flex-1 border rounded px-3 py-2" placeholder="x.x.x.x or CIDR" />
                    <button onClick={()=>{ const el=document.getElementById("ipDeny"); if(!el.value) return; addIP("ipDenylist", el.value); el.value=""; }} className="px-3 py-1 rounded bg-[#5DEE92]">Add</button>
                  </div>
                  <div className="mt-3 space-y-2">
                    {(state.security.ipDenylist || []).map((ip)=>(
                      <div key={ip} className="flex items-center justify-between p-2 border rounded">
                        <div className="text-sm">{ip}</div>
                        <button onClick={()=>removeIP("ipDenylist", ip)} className="text-red-600 px-2">Remove</button>
                      </div>
                    ))}
                    {(state.security.ipDenylist || []).length === 0 && <div className="text-sm text-gray-500">No IPs blocked</div>}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="text-sm font-semibold">Encryption & Transport</div>
                <div className="mt-2 p-3 border rounded">
                  <div className="text-sm">AES: {state.security.encryption.aes}</div>
                  <div className="text-sm mt-1">TLS supported: {state.security.encryption.tls.join(", ")}</div>
                  <div className="text-xs text-gray-500 mt-2">Visibility only — configure actual encryption at infra level.</div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* NOTIFICATIONS */}
        {activeTab === "Notifications" && (
          <Card title="Notifications & Alerts" subtitle="Configure system alerts, frequency and recipients">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">System notifications</div>
                    <div className="text-xs text-gray-500">On-screen and email notifications</div>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="text-sm">On-screen</div>
                    <Toggle checked={state.notifications.onScreen} onChange={(v)=>update("notifications.onScreen", v)} />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm">Email</div>
                    <Toggle checked={state.notifications.email} onChange={(v)=>update("notifications.email", v)} />
                  </div>

                  <div className="mt-3">
                    <label className="text-sm font-medium">Default notification frequency</label>
                    <select className="mt-1 border rounded px-3 py-1" value={state.notifications.notificationFrequency} onChange={(e)=>update("notifications.notificationFrequency", e.target.value)}>
                      <option value="immediate">Immediate</option>
                      <option value="daily">Daily digest</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold">Alert rules</div>
                <div className="mt-2 space-y-2">
                  {state.notifications.alertRules.map((rule) => (
                    <div key={rule.id} className="p-2 border rounded flex items-center justify-between">
                      <div>
                        <div className="font-medium">{rule.name}</div>
                        <div className="text-xs text-gray-500">Frequency: {rule.frequency} • Enabled: {rule.enabled ? "Yes" : "No"}</div>
                        <div className="text-xs text-gray-500">Recipients: {rule.recipients.join(", ")}</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={()=> {
                          setState(s => ({ ...s, notifications: { ...s.notifications, alertRules: s.notifications.alertRules.map(r => r.id === rule.id ? { ...r, enabled: !r.enabled } : r) } }));
                        }} className="px-2 py-1 border rounded">{rule.enabled ? "Disable" : "Enable"}</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="text-sm font-semibold">Define recipients</div>
                <div className="mt-2 text-xs text-gray-500">Assign recipients by Role name or user group. For demo enter role names.</div>
                <div className="mt-2">
                  <input placeholder="Role or user group comma-separated" className="w-full border rounded px-3 py-2" defaultValue="Org Admin" onBlur={(e)=>{/* demo only */}} />
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* BACKUPS */}
        {activeTab === "Backups" && (
          <Card title="Backups & Export" subtitle="Configure exports, backups and storage">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm font-semibold">Manual Export</div>
                <div className="mt-2 flex items-center gap-3">
                  <Toggle checked={state.backups.manualExportEnabled} onChange={(v)=>update("backups.manualExportEnabled", v)} />
                  <div className="text-sm text-gray-500">Enable manual data export</div>
                </div>

                <div className="mt-4">
                  <button onClick={()=>alert("Trigger export (demo)")} className="px-4 py-2 rounded bg-[#5DEE92] text-black">Export Now</button>
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold">Automated backups</div>
                <div className="mt-2">
                  <label className="text-xs">Frequency</label>
                  <select className="mt-1 border rounded px-3 py-1" value={state.backups.automatedBackupFrequency} onChange={(e)=>update("backups.automatedBackupFrequency", e.target.value)}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div className="mt-3">
                  <label className="text-xs">Storage</label>
                  <select className="mt-1 border rounded px-3 py-1" value={state.backups.backupStorage} onChange={(e)=>update("backups.backupStorage", e.target.value)}>
                    <option value="internal">Internal</option>
                    <option value="external">External</option>
                    <option value="both">Both</option>
                  </select>
                </div>

                <div className="mt-3">
                  <label className="text-xs">External location (if applicable)</label>
                  <input className="mt-1 w-full border rounded px-3 py-2" value={state.backups.backupExternalLocation} onChange={(e)=>update("backups.backupExternalLocation", e.target.value)} />
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="mt-3 text-sm text-gray-500">Backups should be verified regularly. You can toggle automated backups and configure external storage providers in the infra layer.</div>
              </div>
            </div>
          </Card>
        )}

        {/* COMPLIANCE */}
        {activeTab === "Compliance" && (
          <Card title="Compliance & Retention" subtitle="Retention, locks, field-level controls and export masking">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium">Default data retention (years)</label>
                <input type="number" min={0} className="mt-1 border rounded px-3 py-2 w-36" value={state.compliance.dataRetentionYears} onChange={(e)=>update("compliance.dataRetentionYears", Number(e.target.value))} />
              </div>

              <div>
                <label className="text-sm font-medium">Lock RoPA records after approval / audit submission</label>
                <div className="mt-2 flex items-center gap-3">
                  <Toggle checked={state.compliance.lockAfterApproval} onChange={(v)=>update("compliance.lockAfterApproval", v)} />
                  <div className="text-sm text-gray-500">Lock records to prevent edits after approval</div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Auto-lock after inactivity (days)</label>
                <input type="number" min={0} className="mt-1 border rounded px-3 py-2 w-36" value={state.compliance.autoLockAfterDaysInactive} onChange={(e)=>update("compliance.autoLockAfterDaysInactive", Number(e.target.value))} />
              </div>

              <div>
                <label className="text-sm font-medium">Mask personal names / emails in exports</label>
                <div className="mt-2 flex items-center gap-3">
                  <Toggle checked={state.compliance.maskPersonalDataInExports} onChange={(v)=>update("compliance.maskPersonalDataInExports", v)} />
                  <div className="text-sm text-gray-500">When enabled exported reports/logs will mask PII</div>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium">Field visibility & role-based control</label>
                <div className="mt-2 text-sm text-gray-500">Manage field-level visibility and whether fields are required/optional by role. For demo, this opens a role-based editor.</div>
                <div className="mt-3">
                  <button onClick={() => { setShowRoleModal(true); setRoleToEdit(null); }} className="px-3 py-2 rounded bg-[#5DEE92] text-black">Open Role Editor</button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Role Modal */}
      <AnimatePresence>
        {showRoleModal && (
          <Modal title={roleToEdit ? "Edit Role" : "Create Role"} onClose={() => { setShowRoleModal(false); setRoleToEdit(null); }}>
            <RoleEditor initialRole={roleToEdit} onSave={saveRole} onCancel={() => { setShowRoleModal(false); setRoleToEdit(null); }} />
          </Modal>
        )}
      </AnimatePresence>

      {/* Invite modal (simple) */}
      <AnimatePresence>
        {showInviteModal && (
          <Modal title="Invite User" onClose={() => setShowInviteModal(false)}>
            <div>
              <label className="block text-sm">Email</label>
              <input id="inviteModalEmail" className="mt-1 w-full border rounded px-3 py-2" />
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setShowInviteModal(false)} className="px-3 py-1 rounded border">Cancel</button>
                <button onClick={() => {
                  const el = document.getElementById("inviteModalEmail");
                  if (!el.value) return alert("enter email");
                  sendInvite(el.value);
                  setShowInviteModal(false);
                }} className="px-3 py-1 rounded bg-[#5DEE92]">Send Invite</button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
