import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getAuditLogs } from "../../services/AuditLogService";
import { addTranslationNamespace } from "../../i18n/config";
import { useTranslation } from "react-i18next";

export default function LogHistoryTable({ filters, onAlertCount }) {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });

  useEffect(() => {
    addTranslationNamespace("en" , "modules" , "LogHistoryTable");
    addTranslationNamespace("hindi" , "modules" , "LogHistoryTable");
    addTranslationNamespace("sanskrit" , "modules" , "LogHistoryTable");
    addTranslationNamespace("telugu" , "modules" , "LogHistoryTable");
  } , []);

  const { t } = useTranslation("modules" , {keyPrefix:"LogHistoryTable"})

  useEffect(() => {
    setPagination((p) => ({ ...p, page: 1 }));
  }, [filters]);

  const fetchLogs = async () => {
    try {
      const res = await getAuditLogs({
        page: pagination.page,
        limit: 20,
        ...filters,
      });

      const alertCount = res.data.logs.filter(
        (log) =>
          log.status === "failed" ||
          (log.type && log.type.toLowerCase().includes("fail")) ||
          (log.message && log.message.toLowerCase().includes("unauthorized")) ||
          (log.message && log.message.toLowerCase().includes("denied"))
      ).length;

      if (onAlertCount) onAlertCount(alertCount);

      setLogs(res.data.logs);
      setPagination((prev) => ({
        ...prev,
        pages: res.data.pagination.pages,
        total: res.data.pagination.total,
      }));
    } catch (err) {
      console.error("Audit logs loading failed", err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filters, pagination.page]);

  // 🔥 Color badges based on BE log type
  const getBadgeStyle = (log) => {
    const type = log.type?.toLowerCase();

    if (type.includes("fail") || log.status === "failed")
      return "bg-red-500 text-white";
    if (type.includes("login")) return "bg-green-400 text-black";
    if (type.includes("logout")) return "bg-yellow-400 text-black";
    if (type.includes("update")) return "bg-blue-400 text-white";
    if (type.includes("delete")) return "bg-red-600 text-white";
    if (type.includes("create")) return "bg-purple-500 text-white";

    return "bg-gray-400 text-black";
  };

  return (
    <div className="bg-white dark:bg-gray-800 dark:border-gray-700 border border-[#828282] rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#828282] dark:border-gray-700">
        <h2 className="text-lg font-semibold dark:text-gray-100">
          {t("log_history")}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("system_activity_logs_and_security_events")}
        </p>
      </div>

      {/* Table */}
      <div className="p-4">
        {/* Column headers */}
        <div className="grid grid-cols-5 gap-4 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400">
          <div>{t("user")}</div>
          <div>{t("time")}</div>
          <div>{t("ip_address")}</div>
          <div>{t("type")}</div>
          <div>{t("message")}</div>
        </div>

        {/* Rows */}
        <div className="space-y-3 mt-2">
          {logs.map((log, i) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: i * 0.04 }}
              className="grid grid-cols-5 gap-4 items-center bg-[#F4F4F4] dark:bg-gray-900 rounded-lg px-4 py-3 hover:shadow-md transition transform hover:-translate-y-0.5"
            >
              <div className="text-sm font-medium dark:text-gray-100">
                {log.user?.full_name || log.email || "Unknown"}
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-300">
                {new Date(log.createdAt).toLocaleString()}
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-300">
                {log.ip_address || "N/A"}
              </div>

              <div>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getBadgeStyle(
                    log
                  )}`}
                >
                  {log.type}
                </span>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-300">
                {log.message}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-end mt-4 gap-2">
          <button
            disabled={pagination.page === 1}
            onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
            className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-sm disabled:opacity-40"
          >
            {t("prev")}
          </button>

          <span className="text-sm dark:text-gray-300 px-2 py-1">
            {t("page")} {pagination.page} {t("of")} {pagination.pages}
          </span>

          <button
            disabled={pagination.page === pagination.pages}
            onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
            className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-sm disabled:opacity-40"
          >
            {t("next")}
          </button>
        </div>
      </div>
    </div>
  );
}
