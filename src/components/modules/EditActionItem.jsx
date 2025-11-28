import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function EditActionItemModal({
  isOpen,
  onClose,
  item,
  onSave,
}) {
  if (!isOpen || !item) return null;

  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm({
      title: item.title || "",
      status: item.status || "",
      department: item.department || "",
      due_date: item.due_date || "",
      likelihood: item.likelihood,
      impact: item.impact,
      description: item.description || "",
    });
  }, [item]);

  const validate = () => {
    let e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.status) e.status = "Status is required";
    if (!form.department) e.department = "Department is required";
    if (!form.due_date) e.due_date = "Due date required";
    if (!form.likelihood) e.likelihood = "Likelihood required";
    if (!form.impact) e.impact = "Impact required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSave(form); // No backend yet
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold dark:text-white">
            Edit Action Item
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {["title", "department", "due_date", "status"].map((field) => (
            <div key={field}>
              <label className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {field.replace("_", " ")}
              </label>
              <input
                type={field === "due_date" ? "date" : "text"}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700"
              />
              {errors[field] && (
                <p className="text-xs text-red-500 mt-1">{errors[field]}</p>
              )}
            </div>
          ))}

          {/* Likelihood */}
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400">
              Likelihood
            </label>
            <select
              value={form.likelihood}
              onChange={(e) =>
                setForm({ ...form, likelihood: Number(e.target.value) })
              }
              className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700"
            >
              <option value="">Select</option>
              {[1, 2, 3, 4, 5].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
            {errors.likelihood && (
              <p className="text-xs text-red-500">{errors.likelihood}</p>
            )}
          </div>

          {/* Impact */}
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400">
              Impact
            </label>
            <select
              value={form.impact}
              onChange={(e) =>
                setForm({ ...form, impact: Number(e.target.value) })
              }
              className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700"
            >
              <option value="">Select</option>
              {[1, 2, 3, 4, 5].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
            {errors.impact && (
              <p className="text-xs text-red-500">{errors.impact}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mt-4">
          <label className="text-xs text-gray-500 dark:text-gray-400">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700"
            rows={4}
          />
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded-md">
            Cancel
          </button>
          <button
            onClick={submit}
            className="px-4 py-2 bg-[#5DEE92] text-black rounded-md shadow"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
