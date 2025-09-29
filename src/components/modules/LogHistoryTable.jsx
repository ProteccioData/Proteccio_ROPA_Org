import { useState } from "react";
import { motion } from "framer-motion";

const logsData = [
  {
    id: "USR-001-001",
    time: "2025-01-15 14:32:15",
    ip: "192.168.1.100",
    type: "User Login",
    badge: "bg-green-400 text-black",
    message: "Successful login from Chrome browser",
  },
  {
    id: "USR-001-002",
    time: "2025-01-15 14:32:15",
    ip: "192.168.1.100",
    type: "RoPA Created",
    badge: "bg-blue-400 text-white",
    message: "Successful login from Chrome browser",
  },
  {
    id: "USR-002-003",
    time: "2025-01-15 14:32:15",
    ip: "192.168.1.100",
    type: "Role Updated",
    badge: "bg-yellow-400 text-black",
    message: "Successful login from Chrome browser",
  },
  {
    id: "USR-001-004",
    time: "2025-01-15 14:32:15",
    ip: "192.168.1.100",
    type: "Report",
    badge: "bg-purple-400 text-white",
    message: "Successful login from Chrome browser",
  },
  {
    id: "USR-001-005",
    time: "2025-01-15 14:32:15",
    ip: "192.168.1.100",
    type: "Failed Login",
    badge: "bg-red-400 text-white",
    message: "Failed login attempt from unknown device",
  },
];

export default function LogHistoryTable() {
  const [logs] = useState(logsData);
  return (
    <div className="bg-white dark:bg-gray-800 dark:border-gray-700 border border-[#828282] rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#828282] dark:border-gray-700">
        <h2 className="text-lg font-semibold dark:text-gray-100">
          Log History
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          System activity logs and security events
        </p>
      </div>

      {/* Table */}
      <div className="p-4">
        {/* Column headers */}
        <div className="grid grid-cols-5 gap-4 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400">
          <div>User</div>
          <div>Time</div>
          <div>IP Address</div>
          <div>Type</div>
          <div>Message</div>
        </div>

        {/* Rows */}
        <div className="space-y-3 mt-2">
          {logs.map((log, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: i * 0.04 }}
              className="grid grid-cols-5 gap-4 items-center bg-[#F4F4F4] dark:bg-gray-900 rounded-lg px-4 py-3 hover:shadow-md transition transform hover:-translate-y-0.5"
            >
              <div className="text-sm font-medium text-gray-800 dark:text-gray-100">
                {log.id}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {log.time}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {log.ip}
              </div>
              <div>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${log.badge}`}
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
      </div>
    </div>
  );
}
