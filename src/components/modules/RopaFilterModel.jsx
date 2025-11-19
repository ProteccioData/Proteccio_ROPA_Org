import { motion } from "framer-motion";
import { X, Filter } from "lucide-react";
import { useState, useEffect } from "react";

export default function RopaFilterModal({
  isOpen,
  onClose,
  onApply,
  initial = {},
}) {
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    flow_stage: "",
    status: "",
    level: "",
  });

  useEffect(() => {
    setFilters(initial);
  }, [initial]);

  const set = (key, value) => {
    setFilters((p) => ({ ...p, [key]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Background */}
      <div
        className="absolute inset-0 bg-black/5"
        onClick={onClose}
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "tween", duration: 0.25 }}
        className="relative ml-auto w-full max-w-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6 shadow-xl h-full overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Filter size={18} /> Filters
          </h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="mt-6 space-y-5">
          {/* SEARCH */}
          <div>
            <label className="text-sm font-medium">Search</label>
            <input
              value={filters.search}
              onChange={(e) => set("search", e.target.value)}
              placeholder="Search RoPA..."
              className="w-full mt-1 px-3 py-2 rounded-lg border bg-gray-50 dark:bg-gray-800"
            />
          </div>

          {/* CATEGORY */}
          <div>
            <label className="text-sm font-medium">Category</label>
            <select
              value={filters.category}
              onChange={(e) => set("category", e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg border bg-gray-50 dark:bg-gray-800"
            >
              <option value="">All</option>
              <option value="InfoVoyage">InfoVoyage</option>
              <option value="CheckSync">CheckSync</option>
              <option value="Beam">Beam</option>
              <option value="OffDoff">OffDoff</option>
            </select>
          </div>

          {/* FLOW STAGE */}
          <div>
            <label className="text-sm font-medium">Flow Stage</label>
            <select
              value={filters.flow_stage}
              onChange={(e) => set("flow_stage", e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg border bg-gray-50 dark:bg-gray-800"
            >
              <option value="">All</option>
              <option value="OperationalLens">Operational Lens</option>
              <option value="ProcessGrid">Process Grid</option>
              <option value="DefenceGrid">Defence Grid</option>
              <option value="DataTransit">Data Transit</option>
            </select>
          </div>

          {/* STATUS */}
          <div>
            <label className="text-sm font-medium">Status</label>
            <select
              value={filters.status}
              onChange={(e) => set("status", e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg border bg-gray-50 dark:bg-gray-800"
            >
              <option value="">All</option>
              <option value="draft">Draft</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="approved">Approved</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* LEVEL */}
          <div>
            <label className="text-sm font-medium">Level</label>
            <input
              value={filters.level}
              onChange={(e) => set("level", e.target.value)}
              placeholder="e.g. 1.2"
              className="w-full mt-1 px-3 py-2 rounded-lg border bg-gray-50 dark:bg-gray-800"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-3">
          <button
            className="flex-1 py-2 rounded-lg border cursor-pointer"
            onClick={() => {
              setFilters({
                search: "",
                category: "",
                flow_stage: "",
                status: "",
                level: "",
              });
              onApply({
                search: "",
                category: "",
                flow_stage: "",
                status: "",
                level: "",
              });
            }}
          >
            Reset
          </button>

          <button
            className="flex-1 py-2 rounded-lg bg-[#5DEE92] text-black font-medium cursor-pointer"
            onClick={() => onApply(filters)}
          >
            Apply
          </button>
        </div>
      </motion.div>
    </div>
  );
}
