import React from "react";
import { X } from "lucide-react";

export default function ViewActionItemModal({ isOpen, onClose, item }) {
  if (!isOpen || !item) return null;

  const field = (label, value) => (
    <div className="flex flex-col mb-3">
      <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-white">
        {value || "-"}
      </span>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold dark:text-white">
            View Action Item
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field("Action ID", item.action_id)}
          {field("Title", item.title)}
          {field("Assigned To", item.assignee?.full_name)}
          {field("Created By", item.creator?.full_name)}
          {field("Department", item.department)}
          {field("Status", item.status)}
          {field("Due Date", item.due_date)}
          {field("Likelihood", item.likelihood)}
          {field("Impact", item.impact)}
          {field("Risk Score", item.risk_score)}
          {field("Risk Category", item.risk_category)}
        </div>

        {/* Description */}
        <div className="mt-4">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Description
          </span>
          <p className="mt-1 text-sm dark:text-gray-200">
            {item.description || "No description provided"}
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md dark:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
