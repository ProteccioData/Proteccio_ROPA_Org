import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../../services/AuthService";
import { useToast } from "../../components/ui/ToastProvider";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock } from "lucide-react";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");

  const navigate = useNavigate();
  const { addToast } = useToast();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [success, setSuccess] = useState(false);
  const [timer, setTimer] = useState(10);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!token) {
      addToast("error", "Access Denied");
      navigate("/login");
    }
  }, []);

  const isStrongPassword = (pwd) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}[\]|;:'",.<>/?]).{6,}$/;
    return regex.test(pwd);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      addToast("error", "Passwords do not match");
      return;
    }

    if (!isStrongPassword(password)) {
      addToast(
        "error",
        "Password must be 6+ chars, include uppercase, lowercase, number & special char"
      );
      return;
    }

    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      addToast("error", err?.response?.data?.error || "Reset failed");
    }
  };

  useEffect(() => {
    if (success) {
      const interval = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) {
            navigate("/login");
          }
          return t - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [success]);

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-[#FAFAFA] dark:bg-gray-900">
      {/* LEFT SIDE ILLUSTRATION AREA */}
      <div className="hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-[#E9FFF2] to-[#C4F9DC] dark:from-gray-800 dark:to-gray-900">
        <img
          src="/assets/logo.svg"
          alt="logo"
          className="w-64 h-auto drop-shadow-lg"
        />
        <p className="text-gray-600 mt-8 p-10 text-center text-lg">
          Reset your password securely and regain access to your workspace.
        </p>
      </div>

      {/* RIGHT SIDE FORM */}
      <div className="flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 border border-gray-100 dark:border-gray-700"
        >
          {!success ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Reset Password
              </h1>
              <p className="text-gray-500 text-sm mt-1 mb-6">
                Create a strong new password to secure your account.
              </p>

              {/* PASSWORD INSTRUCTIONS */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600 mb-6">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Password must contain:
                </p>
                <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>At least 6 characters</li>
                  <li>One uppercase letter (A–Z)</li>
                  <li>One lowercase letter (a–z)</li>
                  <li>One number (0–9)</li>
                  <li>One special character (!@#$%^&*)</li>
                </ul>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    New Password
                  </label>
                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-800">
                    <Lock size={18} className="text-gray-400 mr-2" />

                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent outline-none text-gray-900 dark:text-gray-100"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="ml-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm Password
                  </label>
                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-800">
                    <Lock size={18} className="text-gray-400 mr-2" />

                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="w-full bg-transparent outline-none text-gray-900 dark:text-gray-100"
                    />

                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="ml-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* SUBMIT */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-2 bg-[#5DEE92] hover:bg-green-500 text-green-900 font-semibold rounded-xl shadow cursor-pointer"
                >
                  Reset Password
                </motion.button>
              </form>
            </>
          ) : (
            <div className="text-center py-10">
              <h1 className="text-2xl font-bold text-green-600 mb-3">
                Password reset successfully!
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Redirecting to login in {timer} seconds...
              </p>

              <button
                onClick={() => navigate("/login")}
                className="px-6 py-2 bg-[#5DEE92] text-green-900 rounded-xl font-semibold cursor-pointer"
              >
                Go to Login Now
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
