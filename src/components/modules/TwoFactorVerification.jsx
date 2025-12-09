import { useEffect, useState } from "react";
import { Shield, RefreshCw, Key, Clock } from "lucide-react";
import { apiVerify2FALogin } from "../../services/ProfileService";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../ui/ToastProvider";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

export default function TwoFactorVerification({ pendingUser, onBack , onSuccess }) {
  const [token, setToken] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const { loginUser } = useAuth();
  const { addToast } = useToast();

  const navigate = useNavigate();

  // Timer for TOTP codes
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) return 60;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!useBackupCode && !token) {
      addToast("error", "Please enter your 6-digit code");
      return;
    }

    if (useBackupCode && !backupCode) {
      addToast("error", "Please enter your backup code");
      return;
    }

    setLoading(true);

    try {
      const payload = useBackupCode
        ? { email: pendingUser.email, backupCode }
        : { email: pendingUser.email, token };
      const response = await apiVerify2FALogin(payload);

      // console.log(response)

      loginUser(response.user, response.token);

      const verifyRes = await axiosInstance.get("/auth/verify");
      loginUser(
        verifyRes.data.user,
        response.token,
        verifyRes.data.permissions
      );
      onSuccess()
      navigate("/");
      addToast("success", "Login successful!");
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "2FA verification failed";

      addToast("error", message);

      // Clear fields on error
      if (!useBackupCode) setToken("");
      if (useBackupCode) setBackupCode("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="space-y-6">
          <div className="text-center">
            <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Two-Factor Authentication
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {useBackupCode
                ? "Enter your backup code"
                : "Enter the 6-digit code from your authenticator app"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              for {pendingUser.email}
            </p>

            {!useBackupCode && (
              <div className="flex items-center justify-center mt-2 text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                <span>Code refreshes in {timeRemaining}s</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!useBackupCode ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  6-digit Code
                </label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) =>
                    setToken(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="123456"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-center text-lg tracking-widest"
                  maxLength={6}
                  autoFocus
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Backup Code
                </label>
                <input
                  type="text"
                  value={backupCode}
                  onChange={(e) =>
                    setBackupCode(
                      e.target.value
                        .toUpperCase()
                        .replace(/[^A-Z0-9]/g, "")
                        .slice(0, 8)
                    )
                  }
                  placeholder="A1B2C3D4"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-center font-mono uppercase"
                  maxLength={8}
                  autoFocus
                />
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setUseBackupCode(!useBackupCode);
                setToken("");
                setBackupCode("");
              }}
              className="flex items-center justify-center w-full text-sm text-green-600 hover:text-green-700 py-2"
            >
              <Key className="w-4 h-4 mr-2" />
              {useBackupCode ? "Use authenticator app" : "Use backup code"}
            </button>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onBack}
                disabled={loading}
                className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={
                  loading ||
                  (!useBackupCode && token.length !== 6) ||
                  (useBackupCode && !backupCode)
                }
                className="flex-1 py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify"
                )}
              </button>
            </div>
          </form>

          {useBackupCode && (
            <div className="text-xs text-gray-500 text-center">
              <p>Backup codes are 8-character alphanumeric codes</p>
              <p>Each code can only be used once</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
