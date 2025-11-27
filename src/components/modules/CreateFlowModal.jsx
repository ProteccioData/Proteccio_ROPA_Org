import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Button from "../ui/Button";

export default function CreateFlowModal({
  open,
  onClose,
  initialData = null,
  onCreate,
  onUpdate,
  onOpenDiagram,
  viewMode = false, // NEW → when true, all fields disabled
}) {
  const CATEGORY_OPTIONS = [
    "Personal Data Flow",
    "System Integration",
    "Third-Party Transfer",
    "Internal Process",
    "Data Storage",
    "Other",
  ];

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [category, setCategory] = useState("");
  const [otherCategory, setOtherCategory] = useState("");

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setStatus(initialData.status || "active");
      // if (!category) return alert("Please select category");

      // determine if category is valid or custom
      if (CATEGORY_OPTIONS.includes(initialData.category)) {
        setCategory(initialData.category);
        setOtherCategory("");
      } else {
        setCategory("Other");
        setOtherCategory(initialData.category || "");
      }
    } else if (open) {
      setName("");
      setDescription("");
      setStatus("active");
      setCategory("");
      setOtherCategory("");
    }
  }, [open, initialData]);

  const finalCategory = category === "Other" ? "Other" : category;

  const handleCreate = async () => {
    if (!name.trim()) return alert("Title is required");
    if (!finalCategory) return alert("Category is required");

    setSubmitting(true);
    try {
      await onCreate({
        name: name.trim(),
        description: description.trim(),
        status,
        category: finalCategory,
      });
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  const handleUpdate = async () => {
    if (!initialData) return;
    if (!name.trim()) return alert("Title is required");
    if (!finalCategory) return alert("Category is required");

    setSubmitting(true);
    try {
      await onUpdate(initialData.id, {
        name: name.trim(),
        description: description.trim(),
        status,
        category: finalCategory,
      });
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  const handleOpenDiagramClick = () => {
    if (!initialData?.id) return;
    onOpenDiagram(initialData.id);
  };

  if (!open) return null;

  const disabled = viewMode || submitting;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => !submitting && onClose()}
      />
      <div className="relative w-[720px] max-w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg border dark:border-gray-800 p-6 z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {viewMode
              ? "View Data Mapping"
              : initialData
              ? "Edit Data Mapping"
              : "Create Data Mapping"}
          </h3>
          <button
            onClick={() => onClose()}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300"
          >
            <X size={18} />
          </button>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              disabled={disabled}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
              placeholder="Enter title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              disabled={disabled}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
              rows={4}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={disabled}
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
            >
              <option value="">Select Category</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Other Category input */}
          {/* {category === "Other" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Specify Category
              </label>
              <input
                disabled={disabled}
                value={otherCategory}
                onChange={(e) => setOtherCategory(e.target.value)}
                placeholder="Enter custom category"
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
              />
            </div>
          )} */}

          {/* Status */}
          {!viewMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                disabled={disabled}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
              >
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="mt-6 flex items-center justify-end gap-2">
          {/* View Mode Buttons */}
          {viewMode && initialData && (
            <>
              <button
                onClick={handleOpenDiagramClick}
                className="px-3 py-2 rounded border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800"
              >
                View Diagram
              </button>

              <button
                onClick={onClose}
                className="px-3 py-2 rounded border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800"
              >
                Close
              </button>
            </>
          )}

          {/* Edit Mode Buttons */}
          {!viewMode && initialData && (
            <>
              <button
                onClick={handleOpenDiagramClick}
                className="px-3 py-2 rounded border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800"
              >
                Open Diagram
              </button>

              <button
                onClick={handleUpdate}
                disabled={disabled}
                className="px-4 py-2 rounded bg-[#5DEE92] text-black"
              >
                {submitting ? "Updating..." : "Update"}
              </button>

              <button
                onClick={onClose}
                className="px-3 py-2 rounded border border-gray-200 dark:border-gray-700 text-sm"
              >
                Cancel
              </button>
            </>
          )}

          {/* Create Mode Buttons */}
          {!viewMode && !initialData && (
            <>
              <button
                onClick={handleCreate}
                disabled={disabled}
                className="px-4 py-2 rounded bg-[#5DEE92] text-black"
              >
                {submitting ? "Creating..." : "Create"}
              </button>
              <button
                onClick={onClose}
                className="px-3 py-2 rounded border border-gray-200 dark:border-gray-700 text-sm"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
