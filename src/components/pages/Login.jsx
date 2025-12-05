import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { login } from "../../services/AuthService";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { useToast } from "../ui/ToastProvider";
import axiosInstance from "../../utils/axiosInstance";
import ForgotPassword from "./ForgotPassword";

export default function Login() {
  const { loginUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // ✅ Added
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);

  const { addToast } = useToast();

  const isFormValid = email && password && acceptTerms && acceptPrivacy;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!acceptTerms) {
      addToast("error", "You must accept the Terms & Conditions.");
      setLoading(false);
      return;
    }
    if (!acceptPrivacy) {
      addToast("error", "You must accept the Privacy Notice.");
      setLoading(false);
      return;
    }
    try {
      const res = await login(email, password);
      

      if (res.user.role === "super_admin") {
        addToast("error", "Super Admin is not allowed to access this portal.");
        return;
      }

      if (res.requires2FA) {
        addToast("warning", "2FA required (we will add UI soon)");
        return;
      }

      loginUser(res.user, res.token);

      const verifyRes = await axiosInstance.get("/auth/verify");

      loginUser(verifyRes.data.user, res.token, verifyRes.data.permissions);
      window.location.href = "/";
    } catch (err) {
      addToast("error", err?.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#FAFAFA] dark:bg-gray-900">
      {/* LEFT SIDE */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 border border-gray-100 dark:border-gray-700"
        >
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Sign In
          </h1>
          <p className="text-gray-500 text-sm mt-1 mb-6">
            Access your workspace securely.
          </p>

          <form className="space-y-5" onSubmit={handleLogin}>
            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-800 shadow-sm focus-within:ring-2 focus-within:ring-green-400">
                <Mail size={18} className="text-gray-400 mr-2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-transparent outline-none text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-800 shadow-sm focus-within:ring-2 focus-within:ring-green-400">
                <Lock size={18} className="text-gray-400 mr-2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent outline-none text-gray-900 dark:text-gray-100"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="ml-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {/* FORGOT PASSWORD LINK */}
            <div className="flex justify-end mt-1">
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-sm text-green-600 hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            {/* ✅ TERMS & CONDITIONS */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="cursor-pointer"
                />
                I agree to the{" "}
                <a href="/terms" className="text-green-600 underline">
                  Terms & Conditions
                </a>
              </label>

              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={acceptPrivacy}
                  onChange={(e) => setAcceptPrivacy(e.target.checked)}
                  className="cursor-pointer"
                />
                I agree to the{" "}
                <a href="/privacy-notice" className="text-green-600 underline">
                  Privacy Notice
                </a>
              </label>
            </div>

            {/* BUTTON */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={!isFormValid || loading}
              className={`w-full py-2 rounded-xl text-green-900 font-medium shadow cursor-pointer 
                ${
                  isFormValid && !loading
                    ? "bg-[#5DEE92] hover:bg-green-500"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
            >
              {loading ? "Signing in..." : "Login"}
            </motion.button>
          </form>
        </motion.div>
      </div>

      {/* RIGHT SIDE */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-[#E9FFF2] to-[#C4F9DC] dark:from-gray-800 dark:to-gray-900">
        <img
          src="/assets/logo.svg"
          alt="logo"
          className="w-72 h-auto drop-shadow-lg"
        />
        <p className="text-gray-600 mt-8 p-10 text-center">
          Your compliance hub — secure, powerful and beautifully simple.
        </p>
      </div>

      {showForgotModal && (
        <ForgotPassword onClose={() => setShowForgotModal(false)} />
      )}
    </div>
  );
}
