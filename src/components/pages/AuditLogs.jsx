import { motion } from "framer-motion";
import { AlertTriangle, Download, Filter } from "lucide-react";
import Button from "../ui/Button";
import LogHistoryTable from "../modules/LogHistoryTable";

export default function AuditLogs() {

  return (
    <div className="space-y-6">
      {/* Quick Actions Container */}
      <div className="bg-white dark:bg-gray-800 dark:border-gray-700 border border-[#828282] rounded-lg shadow-sm overflow-hidden">

        <div className="px-6 py-4 border-b border-[#828282]">
          <h3 className="text-xl font-semibold dark:text-gray-100">Quick Actions</h3>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="dark:border-gray-700 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                Date Range
              </label>
              <div className="relative">
                <select
                  aria-label="Date range"
                  className="w-full text-sm px-4 py-2 rounded-md bg-[#F4F4F4] dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 border border-transparent focus:outline-none focus:ring-1 focus:ring-green-300 transition"
                >
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>Custom Range</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                Type
              </label>
              <select
                aria-label="Log type"
                className="w-full text-sm px-4 py-2 rounded-lg bg-[#F4F4F4] dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 border border-transparent focus:outline-none focus:ring-1 focus:ring-indigo-200 transition"
              >
                <option>User Login</option>
                <option>Failed Login</option>
                <option>Role Updated</option>
                <option>RoPA Created</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                User
              </label>
              <select
                aria-label="User"
                className="w-full text-sm px-4 py-2 rounded-lg bg-[#F4F4F4] dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 border border-transparent focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
              >
                <option>USR-001-001</option>
                <option>USR-002-003</option>
              </select>
            </div>
          </div>

          {/* Right: Action buttons */}
          <div className="flex-shrink-0 flex items-center gap-3 mt-1 sm:mt-0">
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500 text-red-600 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/30 transition"
            >
              <AlertTriangle size={16} />
              Security Alerts (2)
            </button>

            <Button text="Expot Logs" icon={Download} />
          </div>
        </motion.div>
      </div>

      {/* Log History */}
      <LogHistoryTable />
    </div>
  );
}
