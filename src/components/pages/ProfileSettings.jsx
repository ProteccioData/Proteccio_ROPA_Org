import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  apiGetProfile,
  apiUpdateProfile,
  apiChangePassword,
  apiSetup2FA,
  apiVerify2FASetup,
  apiGet2FAStatus,
  apiDisable2FA,
  apiRegenerateBackupCodes,
  apiVerify2FALogin,
  apiEndSession,
  apiEndAllSessions,
  apiSignOutFromAllDevices,
} from "../../services/ProfileService";
import { useToast } from "../ui/ToastProvider";
import TwoFactorDisable from "../modules/TwoFactorDisable";
import TwoFactorSetup from "../modules/TwoFactorSetup";
import { changeLanguage } from "../../i18n/config";
import { useKeyboardNav } from "../../context/KeyboardNavContext";

/* ---------------------- Main component ---------------------- */

export default function ProfileSettings({
  currentUser = null,
  isAdmin = false,
}) {
  const containerRef = useRef(null);

  // profile states
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState(null);

  // i18n
  const { t, i18n } = useTranslation("pages", { keyPrefix: "ProfileSettings" });

  // UI states
  const [lang, setLang] = useState(
    localStorage.getItem("app_language") || i18n.language || "en"
  );

  const [fontSize, setFontSize] = useState("md");
  // Initialize keyboardNav from localStorage (string 'false' disables)
  // const [keyboardNav, setKeyboardNav] = useState(() =>
  //   localStorage.getItem("keyboardNav") === "false" ? false : true
  // );

  const { keyboardNavEnabled, setKeyboardNavEnabled } = useKeyboardNav();

  // Handle language change
  const handleLanguageChange = (newLang) => {
    setLang(newLang);
    localStorage.setItem("app_language", newLang);
    changeLanguage(newLang);
  };
  // 2FA state
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [showSetup2FA, setShowSetup2FA] = useState(false);
  const [showDisable2FA, setShowDisable2FA] = useState(false);

  // modals / forms
  const [editOpen, setEditOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [busy, setBusy] = useState(false);

  // mock sessions/audit remain unchanged
  const [sessions, setSessions] = useState(sampleSessions());
  const [auditLogs] = useState(sampleAuditLogs());

  const { addToast } = useToast();

  // Load profile on mount
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoadingProfile(true);
      setProfileError(null);
      try {
        const payload = await apiGetProfile();
        if (!mounted) return;

        const mapped = mapBackendProfileToUI(payload);
        setProfile(mapped);

        // if backend supplies 2fa status or language in future, set here:
        // setTwoFA(Boolean(payload.twoFA));
        // setLang(payload.language || "en");
      } catch (err) {
        console.error("Failed to load profile:", err);
        setProfileError(err.response?.data?.error || "Failed to load profile");
        // keep a minimal fallback so UI doesn't break
        if (mounted) setProfile(mapBackendProfileToUI(currentUser || {}));
      } finally {
        if (mounted) setLoadingProfile(false);
      }
    }
    load();
    return () => (mounted = false);
  }, [currentUser]);

  useEffect(() => {
    async function load2FAStatus() {
      try {
        const res = await apiGet2FAStatus();
        setTwoFAEnabled(res.enabled);
      } catch (err) {
        console.error("Failed to load 2FA status", err);
      }
    }

    load2FAStatus();
  }, []);

  // font-size effect (accessibility)
  useEffect(() => {
    const map = { sm: "text-sm", md: "text-base", lg: "text-lg" };
    document.documentElement.classList.remove(
      "text-sm",
      "text-base",
      "text-lg"
    );
    document.documentElement.classList.add(map[fontSize]);
  }, [fontSize]);

  // keyboard escape close - keep simple
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") {
        setEditOpen(false);
        setShowChangePassword(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Sync .keyboard-nav-disabled class and persist preference
  // useEffect(() => {
  //   const node = document.documentElement;
  //   if (!keyboardNav) {
  //     node.classList.add("keyboard-nav-disabled");
  //   } else {
  //     node.classList.remove("keyboard-nav-disabled");
  //   }
  //   localStorage.setItem("keyboardNav", keyboardNav ? "true" : "false");
  //   return () => node.classList.remove("keyboard-nav-disabled");
  // }, [keyboardNav]);

  // Session Handlers
  async function handleEndSession(sessionId) {
    try {
      await apiEndSession(sessionId);
      setSessions((s) => s.filter((x) => x.id !== sessionId));
      addToast("success", t("session_ended"));
    } catch (err) {
      console.error("Failed to end session", err);
      addToast("error", t("failed_end_session"));
    }
  }

  async function handleEndAllSessions() {
    if (!confirm(t("confirm_end_all"))) return;
    try {
      await apiEndAllSessions();
      setSessions([]); // Clear all in UI
      addToast("success", t("all_sessions_ended"));
    } catch (err) {
      console.error("Failed to end all sessions", err);
      addToast("error", t("failed_end_all"));
    }
  }

  async function handleSignOutAll() {
    if (!confirm(t("confirm_sign_out_all"))) return;
    try {
      await apiSignOutFromAllDevices();
      // Redirect to login or logout
      window.location.href = "/login";
    } catch (err) {
      console.error("Failed to sign out all", err);
      addToast("error", t("failed_sign_out_all"));
    }
  }

  // LOCK account remains UI-only until backend exists
  function handleLockAccount() {
    if (!isAdmin) {
      alert(translations[lang].admin_only);
      return;
    }
    setProfile((u) => ({
      ...u,
      status: u.status === "Locked" ? "Active" : "Locked",
    }));
  }

  // Open edit modal and pass current profile data into modal when saved
  async function handleSaveProfile(payload) {
    setBusy(true);
    try {
      const updated = await apiUpdateProfile(payload);
      const mapped = mapBackendProfileToUI(updated);
      setProfile(mapped);
      setEditOpen(false);
    } catch (err) {
      console.error("Update profile failed:", err);
      alert(err.response?.data?.error || "Failed to update profile");
    } finally {
      setBusy(false);
    }
  }

  // Change password handler - uses apiChangePassword
  async function handleChangePassword({ currentPwd, newPwd, confirmPwd }) {
    const errors = [];

    if (!currentPwd || !newPwd || !confirmPwd)
      errors.push(t("pwd_all_required"));
    if (newPwd !== confirmPwd) errors.push(t("pwd_mismatch"));
    if (newPwd.length < 8) errors.push(t("pwd_min_len"));
    if (!/[A-Z]/.test(newPwd)) errors.push(t("pwd_uppercase"));
    if (!/[0-9]/.test(newPwd)) errors.push(t("pwd_number"));

    setPasswordErrors(errors);

    if (errors.length > 0) return;

    // SEND API REQUEST
    try {
      await apiChangePassword({
        current_password: currentPwd,
        new_password: newPwd,
      });

      setShowChangePassword(false);
      addToast("success", t("pwd_changed"));
    } catch (err) {
      const message =
        err.response?.data?.error || "Failed to change password. Try again.";
      addToast("error", "Failed to change password. Try again.");
      setPasswordErrors([message]);
    }
  }

  return (
    <div
      ref={containerRef}
      className="dark:bg-gray-900 transition-colors duration-300"
    >
      <div className="mx-auto p-6">
        <motion.header
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t("profile_settings")}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t("profile_subtitle")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSelector lang={lang} setLang={handleLanguageChange} />
          </div>
        </motion.header>

        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* left */}
          <section className="col-span-1 bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow">
            {loadingProfile ? (
              <div className="animate-pulse">
                <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="mt-3 h-4 bg-gray-200 dark:bg-gray-700 rounded w-48" />
                <div className="mt-2 h-3 bg-gray-200 dark:bg-gray-700 rounded w-32" />
              </div>
            ) : profileError ? (
              <div className="text-red-600">{profileError}</div>
            ) : profile ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#5DEE92] to-[#38b36c] flex items-center justify-center text-black text-xl font-semibold">
                    {profile.avatarInitial}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {profile.firstName} {profile.lastName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {profile.jobTitle} • {profile.department}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {t("role")}:{" "}
                      <span className="font-medium text-gray-700 dark:text-gray-200">
                        {profile.role}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <small className="text-xs text-gray-500 dark:text-gray-400">
                    {t("status")}
                  </small>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${profile.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                        }`}
                    >
                      {profile.status}
                    </span>
                    {/* <div className="ml-auto flex gap-2">
                      <button
                        onClick={handleLockAccount}
                        className="text-sm px-3 py-1 rounded-md border hover:opacity-90 transition bg-gray-50 dark:bg-gray-700/60 dark:text-white "
                      >
                        {profile.status === "Locked"
                          ? t('unlock')
                          : t('lock_account')}
                      </button>
                    </div> */}
                  </div>

                  <div className="pt-2 border-t border-gray-100 dark:border-gray-700/40 mt-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t("last_login")}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-200">
                      {formatDate(profile.lastLogin.time)} • {profile.lastLogin.ip}
                    </p>
                  </div>
                </div>

                <div className="mt-4 border-t border-gray-100 dark:border-gray-700/40 pt-3">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {t("accessibility")}
                  </h3>
                  <div className="mt-3 space-y-2">
                    <Select
                      label={t("font_size")}
                      value={fontSize}
                      onChange={setFontSize}
                      options={[
                        { value: "sm", label: t("small") },
                        { value: "md", label: t("medium") },
                        { value: "lg", label: t("large") },
                      ]}
                    />
                    <Toggle
                      label={t("keyboard_nav")}
                      checked={keyboardNavEnabled}
                      setChecked={setKeyboardNavEnabled}
                    />
                  </div>
                </div>

                {profile.role === "org_admin" && (
                  <aside className="col-span-1 mt-8 rounded-2xl  ">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {t("active_sessions") || "Active Users Sessions"}
                    </h3>
                    <div className="mt-3 space-y-2">
                      {sessions.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between p-2 rounded-md bg-gray-50 dark:bg-gray-700/30"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {s.device}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {s.browser} • {s.ip}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEndSession(s.id)}
                              className="px-2 py-1 text-xs rounded-md border text-red-500"
                            >
                              {t("end")}
                            </button>
                          </div>
                        </div>
                      ))}

                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={handleEndAllSessions}
                          className="px-3 py-2 rounded-md border dark:text-white"
                        >
                          {t("end_all")}
                        </button>
                        <button
                          onClick={() => alert(t("session_warn_modal"))}
                          className="px-3 py-2 bg-[#5DEE92] text-black rounded-md"
                        >
                          {t("warn_users")}
                        </button>
                      </div>

                      {isAdmin && (
                        <div className="mt-4 border-t border-gray-100 dark:border-gray-700/40 pt-3">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                            {t("admin_tools")}
                          </h4>
                          <div className="mt-2 flex flex-col gap-2">
                            <button
                              onClick={() => alert(t("view_role_assignments"))}
                              className="px-3 py-2 rounded-md border"
                            >
                              {t("view_role_assignments")}
                            </button>
                            <button
                              onClick={() => alert(t("force_lock"))}
                              className="px-3 py-2 rounded-md border"
                            >
                              {t("force_lock")}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </aside>
                )}
              </>
            ) : null}
          </section>

          {/* middle */}
          <section className="col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("personal_information")}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditOpen(true)}
                  className="px-3 py-2 bg-[#5DEE92] hover:opacity-95 text-black rounded-md"
                >
                  {t("edit")}
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow label={t("first_name")} value={profile?.firstName || "-"} />
              <InfoRow label={t("last_name")} value={profile?.lastName || "-"} />
              {/* <InfoRow label={t('job_title')} value={profile?.jobTitle || "-"} /> */}
              <InfoRow
                label={t("department")}
                value={profile?.department || "-"}
              />
              <InfoRow label={t("timezone")} value={profile?.timezone || "-"} />
              <InfoRow label={t("email")} value={profile?.email || "-"} />
              <InfoRow label={t("role")} value={profile?.role || "-"} />
              {/* <InfoRow label={t('access_level')} value={t('access_desc')} /> */}
            </div>

            <div className="mt-6 border-t border-gray-100 dark:border-gray-700/40 pt-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t("security")}
              </h3>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-[#5DEE92]" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Two-Factor Authentication
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {twoFAEnabled ? t("2fa_enabled") : t("2fa_disabled")}
                        </p>
                      </div>
                    </div>
                    <div>
                      <Toggle
                        checked={twoFAEnabled}
                        setChecked={() => {
                          if (!twoFAEnabled) {
                            setShowSetup2FA(true);
                          } else {
                            setShowDisable2FA(true);
                          }
                        }}
                        label=""
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {t("change_password")}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t("pwd_rules_preview")}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowChangePassword(true)}
                      className="px-3 py-2 rounded-md border dark:text-white"
                    >
                      {t("change")}
                    </button>
                  </div>

                  <div className="flex items-center gap-3 justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {t("session_timeout")}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t("session_timeout_desc")}
                      </p>
                    </div>
                    <Select
                      label=""
                      value={"15m"}
                      onChange={() => { }}
                      options={[
                        { value: "15m", label: "15 min" },
                        { value: "30m", label: "30 min" },
                        { value: "60m", label: "60 min" },
                      ]}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {t("recent_activity")}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t("recent_activity_desc")}
                      </p>
                    </div>
                    <div>
                      <button
                        onClick={() => { }}
                        className="px-3 py-2 rounded-md border dark:text-white"
                      >
                        {t("view_all")}
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 space-y-2">
                    {sessions.slice(0, 5).map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/30 p-3 rounded-md"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {s.device} • {s.browser}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {s.ip} • {formatDate(s.time)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEndSession(s.id)}
                            className="px-2 py-1 text-xs rounded-md border text-red-500"
                          >
                            {t("end_session")}
                          </button>
                        </div>
                      </div>
                    ))}

                    <div className="flex gap-2">
                      <button
                        onClick={handleEndAllSessions}
                        className="px-3 py-2 rounded-md border dark:text-white"
                      >
                        {t("end_all_sessions")}
                      </button>
                      <button
                        onClick={handleSignOutAll}
                        className="px-3 py-2 bg-red-500 text-white rounded-md"
                      >
                        {t("sign_out_all")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t("support_langs")}
                </p>
              </div>
              <div>
                <select
                  value={lang}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="rounded-md border px-3 py-2 bg-white dark:bg-gray-800 dark:text-white"
                >
                  <option value="en">{t("english")}</option>
                  <option value="hindi">{t("hindi")}</option>
                  <option value="sanskrit">{t("sanskrit")}</option>
                  <option value="telugu">{t("telugu")}</option>
                </select>
              </div>
            </div>

            <div className="mt-6 border-t border-gray-100 dark:border-gray-700/40 pt-4 flex flex-col md:flex-row gap-3">
              <button
                onClick={() => {
                  alert(t("access_requested"));
                }}
                className="px-4 py-2 rounded-md border hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:text-white"
              >
                {t("request_access")}
              </button>
              <button
                onClick={() => alert(t("download_user_data"))}
                className="px-4 py-2 bg-[#5DEE92] text-black rounded-md"
              >
                {t("download_data")}
              </button>
            </div>
          </section >
        </motion.main >

        {/* Edit Profile Modal */}
        < AnimatePresence >
          {editOpen && profile && (
            <Modal onClose={() => setEditOpen(false)}>
              <EditProfileForm
                initial={mapUIToBackendProfile(profile)}
                onCancel={() => setEditOpen(false)}
                onSave={handleSaveProfile}
                busy={busy}
              />
            </Modal>
          )
          }
        </AnimatePresence >

        {/* Change Password Modal */}
        < AnimatePresence >
          {showChangePassword && (
            <Modal onClose={() => setShowChangePassword(false)}>
              <ChangePasswordForm
                onSubmit={handleChangePassword}
                errors={passwordErrors}
                busy={busy}
              />
            </Modal>
          )}
        </AnimatePresence >
      </div >
      {/* 2FA Setup Modal */}
      {
        showSetup2FA && (
          <TwoFactorSetup
            currentEmail={profile.email}
            onSetupComplete={() => {
              setTwoFAEnabled(true);
              setShowSetup2FA(false);
            }}
            onCancel={() => setShowSetup2FA(false)}
          />
        )
      }

      {/* 2FA Disable Modal */}
      {
        showDisable2FA && (
          <TwoFactorDisable
            onDisableComplete={() => {
              setTwoFAEnabled(false);
              setShowDisable2FA(false);
            }}
            onCancel={() => setShowDisable2FA(false)}
          />
        )
      }
    </div >
  );
}

/* ---------------------- Helper UI components ---------------------- */

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
      {label && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border px-3 py-2 bg-white dark:bg-gray-800 dark:text-white "
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Toggle({ label, checked, setChecked }) {
  return (
    <label className="flex items-center gap-3">
      <div className="flex flex-col">
        {label && (
          <span className="text-sm text-gray-700 dark:text-gray-200">
            {label}
          </span>
        )}
      </div>
      <button
        onClick={() => setChecked(!checked)}
        aria-pressed={checked}
        className={`relative inline-flex items-center h-6 w-10 rounded-full transition-colors focus:outline-none ${checked ? "bg-[#5DEE92]" : "bg-gray-300 dark:bg-gray-600"
          }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-4" : "translate-x-1"
            }`}
        />
      </button>
    </label>
  );
}

function LanguageSelector({ lang, setLang }) {
  const { t } = useTranslation("pages", { keyPrefix: "ProfileSettings" });

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-gray-500 dark:text-gray-300" />
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        className="rounded-md border dark:text-white px-2 py-1 bg-white dark:bg-gray-800 text-sm"
      >
        <option value="en">{t("en")}</option>
        <option value="hindi">{t("hi")}</option>
        <option value="sanskrit">{t("sa")}</option>
        <option value="telugu">{t("te")}</option>
      </select>
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ scale: 0.98, y: 8 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.98, y: 8 }}
        className="relative z-10 w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-2xl"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/* ---------------------- Edit Profile Form (modal) ---------------------- */

function EditProfileForm({ initial = {}, onCancel, onSave, busy }) {
  const { t } = useTranslation("pages", { keyPrefix: "ProfileSettings" });
  const [full_name, setFullName] = useState(initial.full_name || "");
  const [department, setDepartment] = useState(initial.department || "");
  const [profileName, setUserName] = useState(initial.profileName || "");
  const [profileDept, setUserDept] = useState(initial.profileDept || "");
  const [profileRole, setUserRole] = useState(initial.profileRole || "");

  async function handleSubmit(e) {
    e.preventDefault();
    // minimal client validation
    if (full_name.trim().length < 2) {
      alert("Full name must be at least 2 characters");
      return;
    }
    await onSave({ full_name, department, profileName, profileDept, profileRole });
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Edit profile
      </h3>
      <div className="mt-4 grid grid-cols-1 gap-3">
        <input
          value={full_name}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full name"
          className="w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-800"
        />
        <input
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          placeholder="Department"
          className="w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-800"
        />
        <input
          value={profileName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Username"
          className="w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-800"
        />
        <input
          value={profileDept}
          onChange={(e) => setUserDept(e.target.value)}
          placeholder="User Dept"
          className="w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-800"
        />
        <input
          value={profileRole}
          onChange={(e) => setUserRole(e.target.value)}
          placeholder="Role"
          className="w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-800"
        />
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-md border"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={busy}
          className="px-4 py-2 rounded-md bg-[#5DEE92] text-black"
        >
          {busy ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}

/* ---------------------- Change Password Form ---------------------- */

function ChangePasswordForm({ onSubmit, errors = [], busy }) {
  const { t } = useTranslation("pages", { keyPrefix: "ProfileSettings" });
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Change password
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        Your new password must be at least 8 characters, contain an uppercase
        letter and a number.
      </p>

      <div className="mt-4 space-y-3">
        <input
          value={currentPwd}
          onChange={(e) => setCurrentPwd(e.target.value)}
          placeholder="Current password"
          type="password"
          className="w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-800"
        />
        <input
          value={newPwd}
          onChange={(e) => setNewPwd(e.target.value)}
          placeholder="New password"
          type="password"
          className="w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-800"
        />
        <input
          value={confirmPwd}
          onChange={(e) => setConfirmPwd(e.target.value)}
          placeholder="Confirm new password"
          type="password"
          className="w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-800"
        />

        {errors.length > 0 && (
          <div className="p-2 rounded-md bg-red-50 text-red-700">
            <ul className="text-xs">
              {errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onSubmit({ currentPwd, newPwd, confirmPwd })}
            disabled={busy}
            className="px-4 py-2 bg-[#5DEE92] text-black rounded-md"
          >
            {busy ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------- Utilities & small helpers ---------------------- */

function formatDate(iso) {
  try {
    const d = new Date(iso);

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // convert 0 to 12

    return `${day}/${month}/${year} • ${hours}:${minutes} ${ampm}`;
  } catch {
    return iso;
  }
}

function mapBackendProfileToUI(payload = {}) {
  // Expected backend shape: payload.profile-like or payload itself (we handled service)
  const p = payload || {};
  const full = p.full_name || `${p.firstName || ""} ${p.lastName || ""}`.trim();
  const [firstName = "", ...rest] = full.split(" ");
  const lastName = rest.join(" ") || p.lastName || "";
  return {
    id: p.id || p.profileId || null,
    full_name: full,
    firstName,
    lastName,
    profileName: p.profileName || "",
    profileDept: p.profileDept || p.department || "",
    profileRole: p.profileRole || p.role || "",
    department: p.department || p.profileDept || "",
    jobTitle: p.jobTitle || p.profileRole || "",
    timezone: p.timezone || "Asia/Kolkata",
    email: p.email || "",
    role: p.profileRole || p.role || "",
    status: p.status || "Active",
    avatarInitial:
      (full && full.charAt(0).toUpperCase()) ||
      (p.email && p.email.charAt(0).toUpperCase()) ||
      "U",
    lastLogin: p.lastLogin || {
      time: p.last_login || "",
      ip: p.last_login_ip || "",
    },
  };
}

function mapUIToBackendProfile(u = {}) {
  // Convert UI profile object back to payload for editing
  return {
    full_name: u.full_name || `${u.firstName || ""} ${u.lastName || ""}`.trim(),
    department: u.department,
    profileName: u.profileName,
    profileDept: u.profileDept,
    profileRole: u.profileRole,
  };
}

/* ---------------------- Mock Data (unchanged) ---------------------- */

function sampleSessions() {
  return [
    {
      id: "s1",
      device: 'MacBook Pro 14"',
      browser: "Chrome",
      ip: "203.0.113.12",
      time: new Date().toISOString(),
    },
    {
      id: "s2",
      device: "iPhone 13",
      browser: "Safari",
      ip: "198.51.100.7",
      time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: "s3",
      device: "Windows Desktop",
      browser: "Edge",
      ip: "203.0.113.42",
      time: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    },
  ];
}
function sampleAuditLogs() {
  return [
    {
      id: "a1",
      time: new Date().toISOString(),
      actor: "system",
      action: "Password changed",
    },
    {
      id: "a2",
      time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      actor: "admin_jane",
      action: "Role changed: Viewer → Editor",
    },
    {
      id: "a3",
      time: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
      actor: "system",
      action: "2FA enabled",
    },
  ];
}
