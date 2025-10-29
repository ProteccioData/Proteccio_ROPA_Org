import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  CheckCircle,
  ShieldCheck,
  Globe,
  LogOut,
  Lock,
  List,
  X,
  Trash,
  Key,
  Settings as Cog,
} from "lucide-react";

export default function ProfileSettings({ currentUser = null, isAdmin = false }) {
  // Example user data (would come from API)
  const defaultUser = currentUser || {
    id: "u_001",
    firstName: "Example",
    lastName: "User",
    jobTitle: "Product Engineer",
    department: "Frontend",
    timezone: "Asia/Kolkata",
    email: "utkarsh@email.com",
    role: "Editor",
    status: "Active",
    avatarInitial: "E",
    lastLogin: {
      time: "2025-10-28T18:32:00+05:30",
      ip: "203.0.113.42",
    },
  };

  const [user, setUser] = useState(defaultUser);
  const [open, setOpen] = useState(true);
  const [lang, setLang] = useState("en");
  const [fontSize, setFontSize] = useState("md"); // sm/md/lg
  const [darkMode, setDarkMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [keyboardNav, setKeyboardNav] = useState(true);
  const [screenReaderMode, setScreenReaderMode] = useState(false);
  const [twoFA, setTwoFA] = useState(false);
  const [sessions, setSessions] = useState(sampleSessions());
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [requestingAccess, setRequestingAccess] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState(sampleAuditLogs());
  const containerRef = useRef(null);

  useEffect(() => {
    // Font size adjustments
    const map = { sm: "text-sm", md: "text-base", lg: "text-lg" };
    document.documentElement.classList.remove("text-sm", "text-base", "text-lg");
    document.documentElement.classList.add(map[fontSize]);
  }, [fontSize]);

  // Simple i18n object for the 4 required languages
  const t = translations[lang] || translations.en;

  function handleEndSession(sessionId) {
    setSessions((s) => s.filter((x) => x.id !== sessionId));
  }

  function handleEndAllSessions() {
    setSessions([]);
  }

  function handleSignOutAll() {
    // placeholder for API call
    alert(t["signed_out_all"]);
    handleEndAllSessions();
  }

  function handleRequestAccess() {
    setRequestingAccess(true);
    // Simulate approval flow trigger
    setTimeout(() => {
      setRequestingAccess(false);
      alert(t["access_requested"]);
    }, 1200);
  }

  function handleToggle2FA() {
    // in real app, initiate 2FA enrollment flow
    setTwoFA((v) => !v);
  }

  function handleLockAccount() {
    if (!isAdmin) {
      alert(t["admin_only"]);
      return;
    }
    // toggle account lock
    setUser((u) => ({ ...u, status: u.status === "Locked" ? "Active" : "Locked" }));
  }

  function handleChangePassword({ currentPwd, newPwd, confirmPwd }) {
    const errors = [];
    if (!currentPwd || !newPwd || !confirmPwd) errors.push(t["pwd_all_required"]);
    if (newPwd !== confirmPwd) errors.push(t["pwd_mismatch"]);
    if (newPwd.length < 8) errors.push(t["pwd_min_len"]);
    if (!/[A-Z]/.test(newPwd)) errors.push(t["pwd_uppercase"]);
    if (!/[0-9]/.test(newPwd)) errors.push(t["pwd_number"]);

    setPasswordErrors(errors);

    if (errors.length === 0) {
      // call API
      setShowChangePassword(false);
      alert(t["pwd_changed"]);
    }
  }

  // keyboard accessibility: close on Escape
  useEffect(() => {
    function onKey(e) {
      if (!keyboardNav) return;
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [keyboardNav]);

  return (
    <div ref={containerRef} className="dark:bg-gray-900 transition-colors duration-300">
      <div className="mx-auto p-6">
        <motion.header
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t["profile_settings"]}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t["profile_subtitle"]}</p>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSelector lang={lang} setLang={setLang} />
          </div>
        </motion.header>

        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Left Column - Profile Card + Accessibility */}
          <section className="col-span-1 bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#5DEE92] to-[#38b36c] flex items-center justify-center text-black text-xl font-semibold">
                {user.avatarInitial}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{user.firstName} {user.lastName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user.jobTitle} • {user.department}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t["role"]}: <span className="font-medium text-gray-700 dark:text-gray-200">{user.role}</span></p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <small className="text-xs text-gray-500 dark:text-gray-400">{t["status"]}</small>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs ${user.status === "Active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{user.status}</span>
                <div className="ml-auto flex gap-2">
                  {/* {isAdmin && ( */}
                    <button onClick={handleLockAccount} className="text-sm px-3 py-1 rounded-md border hover:opacity-90 transition bg-gray-50 dark:bg-gray-700/60 dark:text-white ">{user.status === "Locked" ? t["unlock"] : t["lock_account"]}</button>
                  {/* )} */}
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-gray-700/40 mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">{t["last_login"]}</p>
                <p className="text-sm text-gray-700 dark:text-gray-200">{formatDate(user.lastLogin.time)} • {user.lastLogin.ip}</p>
              </div>
            </div>

            <div className="mt-4 border-t border-gray-100 dark:border-gray-700/40 pt-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t["accessibility"]}</h3>
              <div className="mt-3 space-y-2">
                <Select label={t["font_size"]} value={fontSize} onChange={setFontSize} options={[{ value: "sm", label: t["small"] }, { value: "md", label: t["medium"] }, { value: "lg", label: t["large"] }]} />
                <Toggle label={t["high_contrast"]} checked={highContrast} setChecked={setHighContrast} />
                <Toggle label={t["keyboard_nav"]} checked={keyboardNav} setChecked={setKeyboardNav} />
                <Toggle label={t["screen_reader"]} checked={screenReaderMode} setChecked={setScreenReaderMode} />
              </div>
            </div>
          </section>

          {/* Middle Column - Personal & Account Settings */}
          <section className="col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t["personal_information"]}</h2>

              <div className="flex items-center gap-2">
                <button onClick={() => alert(t["edit_profile_placeholder"])} className="px-3 py-2 bg-[#5DEE92] hover:opacity-95 text-black rounded-md">{t["edit"]}</button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow label={t["first_name"]} value={user.firstName} />
              <InfoRow label={t["last_name"]} value={user.lastName} />
              <InfoRow label={t["job_title"]} value={user.jobTitle} />
              <InfoRow label={t["department"]} value={user.department} />
              <InfoRow label={t["timezone"]} value={user.timezone} />
              <InfoRow label={t["email"]} value={user.email} />
              <InfoRow label={t["role"]} value={user.role} />
              <InfoRow label={t["access_level"]} value={t["access_desc"]} />
            </div>

            <div className="mt-6 border-t border-gray-100 dark:border-gray-700/40 pt-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">{t["security"]}</h3>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-[#5DEE92]" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{twoFA ? t["2fa_enabled"] : t["2fa_disabled"]}</p>
                      </div>
                    </div>
                    <div>
                      <Toggle checked={twoFA} setChecked={setTwoFA} label="" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{t["change_password"]}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t["pwd_rules_preview"]}</p>
                    </div>
                    <button onClick={() => setShowChangePassword(true)} className="px-3 py-2 rounded-md border dark:text-white">{t["change"]}</button>
                  </div>

                  <div className="flex items-center gap-3 justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{t["session_timeout"]}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t["session_timeout_desc"]}</p>
                    </div>
                    <Select label="" value={"15m"} onChange={() => {}} options={[{ value: "15m", label: "15 min" }, { value: "30m", label: "30 min" }, { value: "60m", label: "60 min" }]} />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{t["recent_activity"]}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t["recent_activity_desc"]}</p>
                    </div>
                    <div>
                      <button onClick={() => {}} className="px-3 py-2 rounded-md border dark:text-white">{t["view_all"]}</button>
                    </div>
                  </div>

                  <div className="mt-2 space-y-2">
                    {sessions.slice(0, 5).map((s) => (
                      <div key={s.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/30 p-3 rounded-md">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{s.device} • {s.browser}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{s.ip} • {formatDate(s.time)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleEndSession(s.id)} className="px-2 py-1 text-xs rounded-md border text-red-500">{t["end_session"]}</button>
                        </div>
                      </div>
                    ))}

                    <div className="flex gap-2">
                      <button onClick={handleEndAllSessions} className="px-3 py-2 rounded-md border dark:text-white">{t["end_all_sessions"]}</button>
                      <button onClick={handleSignOutAll} className="px-3 py-2 bg-[#5DEE92] text-black rounded-md">{t["sign_out_all"]}</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{t["support_langs"]}</p>
              </div>
              <div>
                <select value={lang} onChange={(e) => setLang(e.target.value)} className="rounded-md border px-3 py-2 bg-white dark:bg-gray-800 dark:text-white">
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="es">Español</option>
                </select>
              </div>
            </div>

            <div className="mt-6 border-t border-gray-100 dark:border-gray-700/40 pt-4 flex flex-col md:flex-row gap-3">
              <button onClick={() => handleRequestAccess()} disabled={requestingAccess} className="px-4 py-2 rounded-md border hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:text-white">{t["request_access"]}</button>
              <button onClick={() => alert(t["download_user_data"])} className="px-4 py-2 bg-[#5DEE92] text-black rounded-md">{t["download_data"]}</button>
            </div>
          </section>

          {/* Right column - Sessions & Admin tools (if admin) */}
          <aside className="col-span-1 bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t["active_sessions"]}</h3>
            <div className="mt-3 space-y-2">
              {sessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-2 rounded-md bg-gray-50 dark:bg-gray-700/30">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{s.device}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{s.browser} • {s.ip}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEndSession(s.id)} className="px-2 py-1 text-xs rounded-md border text-red-500">{t["end"]}</button>
                  </div>
                </div>
              ))}

              <div className="mt-2 flex gap-2">
                <button onClick={handleEndAllSessions} className="px-3 py-2 rounded-md border dark:text-white">{t["end_all"]}</button>
                <button onClick={() => alert(t["session_warn_modal"])} className="px-3 py-2 bg-[#5DEE92] text-black rounded-md">{t["warn_users"]}</button>
              </div>

              {isAdmin && (
                <div className="mt-4 border-t border-gray-100 dark:border-gray-700/40 pt-3">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{t["admin_tools"]}</h4>
                  <div className="mt-2 flex flex-col gap-2">
                    <button onClick={() => alert(t["view_role_assignments"])} className="px-3 py-2 rounded-md border">{t["view_role_assignments"]}</button>
                    <button onClick={() => alert(t["force_lock"])} className="px-3 py-2 rounded-md border">{t["force_lock"]}</button>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </motion.main>

        {/* Change Password Modal */}
        <AnimatePresence>
          {showChangePassword && (
            <Modal onClose={() => setShowChangePassword(false)}>
              <ChangePasswordForm onSubmit={handleChangePassword} errors={passwordErrors} />
            </Modal>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------------------- Helper components ---------------------- */

function InfoRow({ label, value }) {
  return (
    <div className="p-3 rounded-md bg-gray-50 dark:bg-gray-700/30 border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-sm text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

function Select({ label, value, onChange, options = [] }) {
  return (
    <div>
      {label && <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="rounded-md border px-3 py-2 bg-white dark:bg-gray-800 dark:text-white ">
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function Toggle({ label, checked, setChecked }) {
  return (
    <label className="flex items-center gap-3">
      <div className="flex flex-col">
        {label && <span className="text-sm text-gray-700 dark:text-gray-200">{label}</span>}
      </div>
      <button
        onClick={() => setChecked(!checked)}
        aria-pressed={checked}
        className={`relative inline-flex items-center h-6 w-10 rounded-full transition-colors focus:outline-none ${checked ? "bg-[#5DEE92]" : "bg-gray-300 dark:bg-gray-600"}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-4" : "translate-x-1"}`} />
      </button>
    </label>
  );
}

function LanguageSelector({ lang, setLang }) {
  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-gray-500 dark:text-gray-300" />
      <select value={lang} onChange={(e) => setLang(e.target.value)} className="rounded-md border dark:text-white px-2 py-1 bg-white dark:bg-gray-800 text-sm">
        <option value="en">EN</option>
        <option value="fr">FR</option>
        <option value="de">DE</option>
        <option value="es">ES</option>
      </select>
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.98, y: 8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.98, y: 8 }} className="relative z-10 w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-2xl">
        {children}
      </motion.div>
    </motion.div>
  );
}

function ChangePasswordForm({ onSubmit, errors = [] }) {
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Change password</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your new password must be at least 8 characters, contain an uppercase letter and a number.</p>

      <div className="mt-4 space-y-3">
        <input value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} placeholder="Current password" type="password" className="w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-800" />
        <input value={newPwd} onChange={(e) => setNewPwd(e.target.value)} placeholder="New password" type="password" className="w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-800" />
        <input value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} placeholder="Confirm new password" type="password" className="w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-800" />

        {errors.length > 0 && (
          <div className="p-2 rounded-md bg-red-50 text-red-700">
            <ul className="text-xs">
              {errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-end gap-2">
          <button onClick={() => onSubmit({ currentPwd, newPwd, confirmPwd })} className="px-4 py-2 bg-[#5DEE92] text-black rounded-md">Save</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------- Utilities & Mock Data ---------------------- */

function sampleSessions() {
  return [
    { id: "s1", device: "MacBook Pro 14\"", browser: "Chrome", ip: "203.0.113.12", time: new Date().toISOString() },
    { id: "s2", device: "iPhone 13", browser: "Safari", ip: "198.51.100.7", time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
    { id: "s3", device: "Windows Desktop", browser: "Edge", ip: "203.0.113.42", time: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString() },
  ];
}

function sampleAuditLogs() {
  return [
    { id: "a1", time: new Date().toISOString(), actor: "system", action: "Password changed" },
    { id: "a2", time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), actor: "admin_jane", action: "Role changed: Viewer → Editor" },
    { id: "a3", time: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), actor: "system", action: "2FA enabled" },
  ];
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch (e) {
    return iso;
  }
}

const translations = {
  en: {
    profile_settings: "Profile settings",
    profile_subtitle: "Manage your account, security and accessibility settings.",
    dark_mode: "Dark mode",
    role: "Role",
    status: "Status",
    last_login: "Last login",
    accessibility: "Accessibility",
    font_size: "Font size",
    small: "Small",
    medium: "Medium",
    large: "Large",
    high_contrast: "High contrast",
    keyboard_nav: "Keyboard navigation",
    screen_reader: "Screen reader mode",
    personal_information: "Personal information",
    view_logs: "View logs",
    edit: "Edit",
    first_name: "First name",
    last_name: "Last name",
    job_title: "Job title",
    department: "Department / Business unit",
    timezone: "Time zone",
    email: "Email address",
    access_level: "Access level",
    access_desc: "Can create and edit content, but cannot manage users or billing.",
    security: "Security",
    change_password: "Change password",
    pwd_rules_preview: "Minimum 8 chars, uppercase & number required",
    change: "Change",
    session_timeout: "Session timeout",
    session_timeout_desc: "Signed out after inactivity.",
    recent_activity: "Recent activity",
    recent_activity_desc: "Last 5 sessions",
    view_all: "View all",
    end_session: "End session",
    end_all_sessions: "End all sessions",
    sign_out_all: "Sign out of all devices",
    support_langs: "Supported languages: English, French, German, Spanish",
    request_access: "Request access change",
    download_data: "Download user data",
    access_requested: "Access request submitted — workflow triggered.",
    admin_only: "Action allowed for admins only.",
    pwd_all_required: "All password fields are required.",
    pwd_mismatch: "Passwords do not match.",
    pwd_min_len: "Password must be at least 8 characters.",
    pwd_uppercase: "Password must include an uppercase letter.",
    pwd_number: "Password must include a number.",
    pwd_changed: "Password changed successfully.",
    signed_out_all: "Signed out from all devices.",
    audit_logs: "Audit logs",
    edit_profile_placeholder: "Edit profile flow — coming soon",
    session_warn_modal: "Show session timeout warning — placeholder",
    view_role_assignments: "View role assignments",
    force_lock: "Force account lock",
    admin_tools: "Admin tools",
    end: "End",
    end_all: "End all",
    warn_users: "Warn users",
    download_user_data: "Download user data",
    lock_account: "Lock account",
    unlock: "Unlock",
    request_access: "Request access",
  },
  fr: {
    profile_settings: "Paramètres du profil",
    profile_subtitle: "Gérez votre compte, la sécurité et les préférences d'accessibilité.",
    dark_mode: "Mode sombre",
    role: "Rôle",
    status: "Statut",
    last_login: "Dernière connexion",
    accessibility: "Accessibilité",
    font_size: "Taille de police",
    small: "Petit",
    medium: "Moyen",
    large: "Grand",
    high_contrast: "Haut contraste",
    keyboard_nav: "Navigation clavier",
    screen_reader: "Mode lecteur d'écran",
    personal_information: "Informations personnelles",
    view_logs: "Voir les journaux",
    edit: "Modifier",
    first_name: "Prénom",
    last_name: "Nom",
    job_title: "Poste",
    department: "Département / Unité",
    timezone: "Fuseau horaire",
    email: "E-mail",
    access_level: "Niveau d'accès",
    access_desc: "Peut créer et modifier du contenu, mais ne peut pas gérer les utilisateurs ou la facturation.",
    security: "Sécurité",
    change_password: "Changer le mot de passe",
    pwd_rules_preview: "Min 8 caractères, majuscule & chiffre requis",
    change: "Changer",
    session_timeout: "Expiration de session",
    session_timeout_desc: "Déconnecté après inactivité.",
    recent_activity: "Activité récente",
    recent_activity_desc: "5 dernières sessions",
    view_all: "Voir tout",
    end_session: "Terminer la session",
    end_all_sessions: "Terminer toutes les sessions",
    sign_out_all: "Déconnecter tous les appareils",
    support_langs: "Langues prises en charge : anglais, français, allemand, espagnol",
    request_access: "Demander un changement d'accès",
    download_data: "Télécharger les données utilisateur",
    access_requested: "Demande d'accès soumise — flux déclenché.",
    admin_only: "Action réservée aux administrateurs.",
    pwd_all_required: "Tous les champs de mot de passe sont requis.",
    pwd_mismatch: "Les mots de passe ne correspondent pas.",
    pwd_min_len: "Le mot de passe doit contenir au moins 8 caractères.",
    pwd_uppercase: "Le mot de passe doit contenir une majuscule.",
    pwd_number: "Le mot de passe doit contenir un chiffre.",
    pwd_changed: "Mot de passe modifié avec succès.",
    signed_out_all: "Déconnecté de tous les appareils.",
    audit_logs: "Journaux d'audit",
    edit_profile_placeholder: "Flux de modification du profil — bientôt disponible",
    session_warn_modal: "Afficher l'avertissement d'expiration — placeholder",
    view_role_assignments: "Voir les affectations de rôle",
    force_lock: "Forcer le verrouillage du compte",
    admin_tools: "Outils admin",
    end: "Terminer",
    end_all: "Tout terminer",
    warn_users: "Avertir les utilisateurs",
    download_user_data: "Télécharger les données utilisateur",
    lock_account: "Verrouiller le compte",
    unlock: "Déverrouiller",
    request_access: "Demander l'accès",
  },
  de: {
    profile_settings: "Profil-Einstellungen",
    profile_subtitle: "Verwalten Sie Ihr Konto, Sicherheit und Barrierefreiheitseinstellungen.",
    dark_mode: "Dunkler Modus",
    role: "Rolle",
    status: "Status",
    last_login: "Letzte Anmeldung",
    accessibility: "Barrierefreiheit",
    font_size: "Schriftgröße",
    small: "Klein",
    medium: "Mittel",
    large: "Groß",
    high_contrast: "Hoher Kontrast",
    keyboard_nav: "Tastaturnavigation",
    screen_reader: "Screenreader-Modus",
    personal_information: "Persönliche Informationen",
    view_logs: "Protokolle ansehen",
    edit: "Bearbeiten",
    first_name: "Vorname",
    last_name: "Nachname",
    job_title: "Jobtitel",
    department: "Abteilung / Geschäftseinheit",
    timezone: "Zeitzone",
    email: "E-Mail-Adresse",
    access_level: "Zugriffsebene",
    access_desc: "Kann Inhalte erstellen und bearbeiten, aber keine Benutzer oder Abrechnung verwalten.",
    security: "Sicherheit",
    change_password: "Passwort ändern",
    pwd_rules_preview: "Mind. 8 Zeichen, Großbuchstabe & Zahl erforderlich",
    change: "Ändern",
    session_timeout: "Sitzungszeitüberschreitung",
    session_timeout_desc: "Nach Inaktivität abgemeldet.",
    recent_activity: "Kürzliche Aktivitäten",
    recent_activity_desc: "Letzte 5 Sitzungen",
    view_all: "Alle ansehen",
    end_session: "Sitzung beenden",
    end_all_sessions: "Alle Sitzungen beenden",
    sign_out_all: "Von allen Geräten abmelden",
    support_langs: "Unterstützte Sprachen: Englisch, Französisch, Deutsch, Spanisch",
    request_access: "Zugriffsänderung anfordern",
    download_data: "Benutzerdaten herunterladen",
    access_requested: "Zugriffsanforderung gesendet — Workflow ausgelöst.",
    admin_only: "Aktion nur für Administratoren.",
    pwd_all_required: "Alle Passwortfelder sind erforderlich.",
    pwd_mismatch: "Passwörter stimmen nicht überein.",
    pwd_min_len: "Passwort muss mindestens 8 Zeichen enthalten.",
    pwd_uppercase: "Passwort muss einen Großbuchstaben enthalten.",
    pwd_number: "Passwort muss eine Zahl enthalten.",
    pwd_changed: "Passwort erfolgreich geändert.",
    signed_out_all: "Von allen Geräten abgemeldet.",
    audit_logs: "Audit-Protokolle",
    edit_profile_placeholder: "Profilbearbeitungsfluss — demnächst",
    session_warn_modal: "Sitzungswarnung anzeigen — Platzhalter",
    view_role_assignments: "Rollen-Zuweisungen anzeigen",
    force_lock: "Konto sperren erzwingen",
    admin_tools: "Admin-Tools",
    end: "Beenden",
    end_all: "Alle beenden",
    warn_users: "Benutzer warnen",
    download_user_data: "Benutzerdaten herunterladen",
    lock_account: "Konto sperren",
    unlock: "Entsperren",
    request_access: "Zugriff anfragen",
  },
  es: {
    profile_settings: "Ajustes de perfil",
    profile_subtitle: "Administra tu cuenta, seguridad y accesibilidad.",
    dark_mode: "Modo oscuro",
    role: "Rol",
    status: "Estado",
    last_login: "Último inicio de sesión",
    accessibility: "Accesibilidad",
    font_size: "Tamaño de fuente",
    small: "Pequeño",
    medium: "Medio",
    large: "Grande",
    high_contrast: "Alto contraste",
    keyboard_nav: "Navegación por teclado",
    screen_reader: "Modo lector de pantalla",
    personal_information: "Información personal",
    view_logs: "Ver registros",
    edit: "Editar",
    first_name: "Nombre",
    last_name: "Apellido",
    job_title: "Cargo",
    department: "Departamento / Unidad",
    timezone: "Zona horaria",
    email: "Correo electrónico",
    access_level: "Nivel de acceso",
    access_desc: "Puede crear y editar contenido, pero no administrar usuarios ni facturación.",
    security: "Seguridad",
    change_password: "Cambiar contraseña",
    pwd_rules_preview: "Mín 8 caracteres, mayúscula y número requeridos",
    change: "Cambiar",
    session_timeout: "Tiempo de espera de sesión",
    session_timeout_desc: "Cierre de sesión tras inactividad.",
    recent_activity: "Actividad reciente",
    recent_activity_desc: "Últimas 5 sesiones",
    view_all: "Ver todo",
    end_session: "Finalizar sesión",
    end_all_sessions: "Finalizar todas las sesiones",
    sign_out_all: "Cerrar sesión en todos los dispositivos",
    support_langs: "Idiomas compatibles: Inglés, Francés, Alemán, Español",
    request_access: "Solicitar cambio de acceso",
    download_data: "Descargar datos de usuario",
    access_requested: "Solicitud de acceso enviada — flujo activado.",
    admin_only: "Acción permitida solo para administradores.",
    pwd_all_required: "Todos los campos de contraseña son obligatorios.",
    pwd_mismatch: "Las contraseñas no coinciden.",
    pwd_min_len: "La contraseña debe tener al menos 8 caracteres.",
    pwd_uppercase: "La contraseña debe incluir una letra mayúscula.",
    pwd_number: "La contraseña debe incluir un número.",
    pwd_changed: "Contraseña cambiada con éxito.",
    signed_out_all: "Cerró sesión en todos los dispositivos.",
    audit_logs: "Registros de auditoría",
    edit_profile_placeholder: "Flujo de edición de perfil — próximamente",
    session_warn_modal: "Mostrar advertencia de tiempo de espera — placeholder",
    view_role_assignments: "Ver asignaciones de roles",
    force_lock: "Forzar bloqueo de cuenta",
    admin_tools: "Herramientas de administrador",
    end: "Finalizar",
    end_all: "Finalizar todo",
    warn_users: "Advertir a los usuarios",
    download_user_data: "Descargar datos de usuario",
    lock_account: "Bloquear cuenta",
    unlock: "Desbloquear",
    request_access: "Solicitar acceso",
  }
};
