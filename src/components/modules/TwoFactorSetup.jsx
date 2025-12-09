import { useState, useEffect } from "react";
import { Shield, Download, Copy, Check, Clock, X } from "lucide-react";
import { useToast } from "../ui/ToastProvider";
import { apiSetup2FA, apiVerify2FASetup } from "../../services/ProfileService";

export default function TwoFactorSetup({
  onSetupComplete,
  onCancel,
  currentEmail,
}) {
  const [step, setStep] = useState("intro"); // intro, setup, verify, complete
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [backupCodes, setBackupCodes] = useState([]);
  const [verificationToken, setVerificationToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60);

  const { addToast } = useToast();

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

  const handleSetup = async () => {
    setLoading(true);
    try {
      // This will call your backend /2fa/setup endpoint
      const response = await apiSetup2FA(currentEmail); // You'll need to create this service
      setQrCode(response.qrCode);
      setSecret(response.secret);
      setBackupCodes(response.backupCodes);
      setStep("setup");
      addToast("success", "2FA setup initiated");
    } catch (error) {
      addToast("error", error.error || "Failed to setup 2FA");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationToken || verificationToken.length !== 6) {
      addToast("error", "Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);
    try {
      await apiVerify2FASetup(verificationToken);
      setStep("complete");
      addToast("success", "2FA enabled successfully!");
      onSetupComplete();
    } catch (error) {
      addToast("error", error.error || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const copyBackupCodes = () => {
    const codesText = backupCodes.join("\n");
    navigator.clipboard.writeText(codesText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addToast("success", "Backup codes copied to clipboard");
  };

  const downloadBackupCodes = () => {
    const codesText = backupCodes.join("\n");
    const blob = new Blob([codesText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "backup-codes.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast("success", "Backup codes downloaded");
  };

  if (step === "intro") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/10 bg-opacity-50 z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold dark:text-gray-100">
              Enable Two-Factor Authentication
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
              <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Add an extra layer of security to your account
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  1
                </div>
                <div>
                  <h3 className="font-medium dark:text-gray-100">
                    Download an Authenticator App
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Install Google Authenticator, Authy, or Microsoft
                    Authenticator on your phone
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  2
                </div>
                <div>
                  <h3 className="font-medium dark:text-gray-100">
                    Scan QR Code
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Scan the QR code with your authenticator app
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  3
                </div>
                <div>
                  <h3 className="font-medium dark:text-gray-100">
                    Verify Setup
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Enter the 6-digit code from your app to verify
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={onCancel}
                className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSetup}
                disabled={loading}
                className="flex-1 py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 cursor-pointer"
              >
                {loading ? "Setting up..." : "Get Started"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "setup") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/10 bg-opacity-50 z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Setup Authenticator App</h2>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Scan the QR code with your authenticator app
              </p>

              <div className="flex justify-center mb-4">
                <img
                  src={qrCode}
                  alt="QR Code"
                  className="w-48 h-48 border rounded-lg"
                />
              </div>

              <div className="flex items-center justify-center text-sm text-gray-500 mb-2">
                <Clock className="w-4 h-4 mr-1" />
                <span>Code refreshes in {timeRemaining}s</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Can't scan the QR code?
              </p>
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md font-mono text-sm break-all">
                {secret}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(secret);
                  addToast("success", "Secret copied to clipboard");
                }}
                className="text-green-600 text-sm mt-2 hover:text-green-700 cursor-pointer"
              >
                Copy secret key
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Enter 6-digit code from app
              </label>
              <input
                type="text"
                value={verificationToken}
                onChange={(e) =>
                  setVerificationToken(
                    e.target.value.replace(/\D/g, "").slice(0, 6)
                  )
                }
                placeholder="123456"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-center text-lg tracking-widest bg-white dark:bg-gray-900 dark:text-gray-100"
                maxLength={6}
                autoFocus
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={onCancel}
                className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleVerify}
                disabled={loading || verificationToken.length !== 6}
                className="flex-1 py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 cursor-pointer"
              >
                {loading ? "Verifying..." : "Verify and Enable"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "complete") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-semibold mb-2">
              2FA Enabled Successfully!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Two-factor authentication is now enabled for your account
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-md p-4 mb-4">
            <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              Save Your Backup Codes
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
              These codes can be used to access your account if you lose your
              authenticator app. Each code can only be used once.
            </p>

            <div className="bg-white dark:bg-gray-800 p-3 rounded border font-mono text-sm space-y-1 max-h-32 overflow-y-auto">
              {backupCodes.map((code, index) => (
                <div key={index} className="text-gray-800 dark:text-gray-200">
                  {code}
                </div>
              ))}
            </div>

            <div className="flex space-x-2 mt-3">
              <button
                onClick={copyBackupCodes}
                className="flex-1 py-2 px-3 bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-200 rounded text-sm hover:bg-yellow-200 dark:hover:bg-yellow-700 flex items-center justify-center"
              >
                <Copy className="w-4 h-4 mr-2" />
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={downloadBackupCodes}
                className="flex-1 py-2 px-3 bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-200 rounded text-sm hover:bg-yellow-200 dark:hover:bg-yellow-700 flex items-center justify-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
            </div>
          </div>

          <button
            onClick={onCancel}
            className="w-full py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Done
          </button>
        </div>
      </div>
    );
  }
}
