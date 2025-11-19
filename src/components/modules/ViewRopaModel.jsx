import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function ViewROPAModal({ isOpen, onClose, ropa }) {
  if (!ropa) return null;

  // Formatting helpers
  const formatValue = (value) => {
    if (value === null || value === undefined) return "—";

    if (Array.isArray(value)) {
      if (value.length === 0) return "—";
      return (
        <div className="flex flex-wrap gap-2">
          {value.map((item, i) => (
            <span
              key={i}
              className="px-2 py-1 text-xs rounded-lg bg-[#5DEE92]/20 dark:text-green-400 text-[#1a7f4d]"
            >
              {String(item)}
            </span>
          ))}
        </div>
      );
    }

    if (typeof value === "object") {
      return (
        <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded-lg whitespace-pre-wrap">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    }

    if (String(value).includes("T") && !isNaN(Date.parse(value))) {
      return new Date(value).toLocaleString();
    }

    return String(value);
  };

  const normalizedRopa = {
    ...ropa,
    creator: ropa.creator?.full_name || "N/A",
  };

  const entries = Object.entries(normalizedRopa).filter(
    ([key]) => key !== "id" // Hides DB id
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0 }}
            className="w-full max-w-5xl max-h-[85vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-xl"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">RoPA Details</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Dynamic Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {entries.map(([key, value], idx) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="p-4 rounded-xl border border-[#828282] dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/60"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                    {key.replace(/_/g, " ")}
                  </p>
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {formatValue(value)}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex justify-end mt-8">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-[#5DEE92] text-black rounded-xl font-medium hover:bg-[#4cd87f] transition"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
