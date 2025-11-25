import { useState } from "react";
import { motion } from "framer-motion";
import { requestPasswordReset } from "../../services/AuthService";
import { useToast } from "../ui/ToastProvider";

export default function ForgotPassword({ onClose }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await requestPasswordReset(email);
      addToast("success", "Reset link sent! Check your email.");
      onClose();
    } catch (err) {
      addToast("error", err?.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-md shadow-xl"
      >
        <h2 className="text-xl font-bold mb-4">Forgot Password</h2>

        <p className="text-gray-500 text-sm mb-4">
          Enter your registered email. We will send you a reset link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-xl dark:bg-gray-700"
          />

          <button
            className="w-full py-2 bg-[#5DEE92] text-green-900 font-semibold rounded-xl cursor-pointer"
            disabled={loading || !email}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 hover:cursor-pointer"
          >
            Cancel
          </button>
        </form>
      </motion.div>
    </div>
  );
}
