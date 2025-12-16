import { motion } from "framer-motion";
import { AlertTriangle, Download, Filter } from "lucide-react";
import Button from "../ui/Button";
import LogHistoryTable from "../modules/LogHistoryTable";
import { exportAuditLogs } from "../../services/AuditLogService";
import { useEffect, useState } from "react";
import { addTranslationNamespace } from "../../i18n/config";
import { useTranslation } from "react-i18next";

export default function AuditLogs() {

  const [ready , setReady] = useState(false);

  useEffect(() => {
    Promise.all([
      addTranslationNamespace("en" , "pages" , "AuditLogs"),
      addTranslationNamespace("hindi" , "pages" , "AuditLogs"),
      addTranslationNamespace("sanskrit" , "pages" , "AuditLogs"),
      addTranslationNamespace("telugu" , "pages" , "AuditLogs")
    ]).then(() => setReady(true));
  } , []);

  const { t } = useTranslation("pages" , {keyPrefix:"AuditLogs"})

  const [filters, setFilters] = useState({
    date_from: "",
    date_to: "",
    type: "",
    user_filter: "",
    search: "",
  });
  const [securityAlerts, setSecurityAlerts] = useState(0);

  const handleExport = async () => {
    try {
      const res = await exportAuditLogs({
        ...filters,
        format: "csv",
      });

      const blob = new Blob([res.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `audit_logs_${Date.now()}.csv`;
      link.click();
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  if (!ready) return <div> Loading... </div>

  return (
    <div className="space-y-6">
      {/* Quick Actions Container */}
      <div className="bg-white dark:bg-gray-800 dark:border-gray-700 border border-[#828282] rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#828282]">
          <h3 className="text-xl font-semibold dark:text-gray-100">
            {t("quick_actions")}
          </h3>
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
                {t("date_range")}
              </label>
              <div className="relative">
                <select
                  aria-label="Date range"
                  className="w-full text-sm px-4 py-2 rounded-md bg-[#F4F4F4] dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 border border-transparent focus:outline-none focus:ring-1 focus:ring-green-300 transition"
                  onChange={(e) => {
                    if (e.target.value === "last7") {
                      const d = new Date();
                      const to = d.toISOString().split("T")[0];
                      d.setDate(d.getDate() - 7);
                      const from = d.toISOString().split("T")[0];

                      setFilters((f) => ({
                        ...f,
                        date_from: from,
                        date_to: to,
                      }));
                    }
                  }}
                >
                  <option>{t("select_range")}</option>
                  <option>{t("last_7_days")}</option>
                  <option>{t("last_30_days")}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                {t("type")}
              </label>
              <select
                aria-label="Log type"
                className="w-full text-sm px-4 py-2 rounded-lg bg-[#F4F4F4] dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 border border-transparent focus:outline-none focus:ring-1 focus:ring-indigo-200 transition"
                onChange={(e) =>
                  setFilters((f) => ({ ...f, type: e.target.value }))
                }
              >
                <option value="">{t("all")}</option>
                <option value="login">{t("login")}</option>
                <option value="logout">{t("logout")}</option>
                <option value="create">{t("create")}</option>
                <option value="update">{t("update")}</option>
                <option value="delete">{t("delete")}</option>
                <option value="view">{t("view")}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                {t("user")}
              </label>
              <input
                type="text"
                placeholder={`${t("search_logs")}`}
                className="w-full bg-[#F4F4F4] dark:text-gray-400 dark:bg-gray-900 rounded-md px-3 py-2 text-sm"
                onChange={(e) =>
                  setFilters((f) => ({ ...f, search: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Right: Action buttons */}
          <div className="flex-shrink-0 flex items-center gap-3 mt-1 sm:mt-0">
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500 text-red-600 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/30 transition"
            >
              <AlertTriangle size={16} />
              {t("security_alerts")} ({securityAlerts})
            </button>

            <Button text={t("export_logs")} icon={Download} onClick={handleExport} />
          </div>
        </motion.div>
      </div>

      {/* Log History */}
      <LogHistoryTable filters={filters} onAlertCount={setSecurityAlerts} />
    </div>
  );
}
