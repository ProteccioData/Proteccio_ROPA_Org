import { useState } from "react";
import { Shield, X } from "lucide-react";
import { useToast } from "../ui/ToastProvider";
import { apiDisable2FA } from "../../services/ProfileService";

export default function TwoFactorDisable({ onDisableComplete, onCancel }) {
  const [password, setPassword] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [loading, setLoading] = useState(false);

  const { addToast } = useToast();

  const handleDisable = async () => {
    if (!password) {
      addToast("error", "Please enter your password");
      return;
    }

    if (!verificationToken || verificationToken.length !== 6) {
      addToast(
        "error",
        "Please enter a valid 6-digit code from your authenticator app"
      );
      return;
    }

    setLoading(true);
    try {
      await apiDisable2FA({ password, token: verificationToken });
      addToast("success", "2FA disabled successfully!");
      onDisableComplete();
    } catch (error) {
      addToast("error", error.error || "Failed to disable 2FA");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/10 bg-opacity-50 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold dark:text-gray-100">
            Disable Two-Factor Authentication
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-400 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="text-center">
            <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              For security reasons, please enter your password and a
              verification code to disable 2FA.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-100">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 dark:text-gray-100"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-100">
              Verification Code
            </label>
            <input
              type="text"
              value={verificationToken}
              onChange={(e) =>
                setVerificationToken(
                  e.target.value.replace(/\D/g, "").slice(0, 6)
                )
              }
              placeholder="Enter 6-digit code"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-center text-lg tracking-widest bg-white dark:bg-gray-900 dark:text-gray-100"
              maxLength={6}
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDisable}
              disabled={loading || !password || verificationToken.length !== 6}
              className="flex-1 py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400 cursor-pointer"
            >
              {loading ? "Disabling..." : "Disable 2FA"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
