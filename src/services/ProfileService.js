import axiosInstance from "../utils/axiosInstance";

/**
 * Fetch the authenticated user's profile
 * GET /portal/profile
 */
export const apiGetProfile = async () => {
  const res = await axiosInstance.get("/portal/profile");
  return res.data.user;
};

/**
 * Update authenticated user's profile
 * PUT /portal/profile
 * payload example:
 * {
 *   full_name,
 *   department,
 *   userName,
 *   userDept,
 *   userRole
 * }
 */
export const apiUpdateProfile = async (payload) => {
  const res = await axiosInstance.put("/portal/profile", payload);
  return res.data.user;
};

/**
 * Change user password
 * PUT /portal/profile/password
 * payload example:
 * {
 *   current_password,
 *   new_password
 * }
 */
export const apiChangePassword = async (payload) => {
  const res = await axiosInstance.put("/portal/profile/password", payload);
  return res.data;
};

/**
 * -------------------------
 * Two-Factor Authentication API
 * -------------------------
 */

export const apiSetup2FA = async (email) => {
  const res = await axiosInstance.post("/2fa/setup", { email });
  return res.data;
};

export const apiVerify2FASetup = async (token) => {
  const res = await axiosInstance.post("/2fa/verify-setup", { token });
  return res.data;
};

export const apiGet2FAStatus = async () => {
  const res = await axiosInstance.get("/2fa/status");
  return res.data;
};

export const apiDisable2FA = async ({ password, token, backupCode }) => {
  const res = await axiosInstance.post("/2fa/disable", {
    password,
    token,
    backupCode,
  });
  return res.data;
};

export const apiRegenerateBackupCodes = async ({ password, token }) => {
  const res = await axiosInstance.post("/2fa/regenerate", {
    password,
    token,
  });
  return res.data;
};

/**
 * Login-time 2FA Verification
 * POST /portal/2fa/verify
 */
export const apiVerify2FALogin = async ({ email, token, backupCode }) => {
  const res = await axiosInstance.post("/2fa/verify", {
    email,
    token,
    backupCode,
  });
  return res.data;
};

/**
 * -------------------------
 * Session Management API
 * -------------------------
 */

export const apiEndSession = async (sessionId) => {
  const res = await axiosInstance.delete(`/portal/sessions/${sessionId}`);
  return res.data;
};

export const apiEndAllSessions = async () => {
  const res = await axiosInstance.delete("/portal/sessions");
  return res.data;
};

export const apiSignOutFromAllDevices = async () => {
  const res = await axiosInstance.post("/portal/sessions/sign-out-all");
  return res.data;
};
