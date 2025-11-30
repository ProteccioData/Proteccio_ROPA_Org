import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";

export default function ViewFlowModal({ open, onClose, flow, onViewDiagram }) {
  if (!flow) return null;

  const {
    id,
    name,
    description,
    category,
    status,
    creator,
    createdAt,
    updatedAt,
    lastModifier,
  } = flow;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="min-w-3xl max-h-[90vh] overflow-y-auto dark:bg-gray-900">
        {/* HEADER */}
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            View Data Mapping
          </DialogTitle>
        </DialogHeader>

        {/* BASIC INFO GRID */}
        <section className="mt-4 grid grid-cols-2 gap-4">
          <InfoCard label="Title" value={name} />
          <InfoCard label="Description" value={description} />
          <InfoCard label="Category" value={category} />
          <InfoCard label="Status" value={status} />
          <InfoCard label="Created By" value={creator?.full_name || "-"} />
          <InfoCard
            label="Created At"
            value={
              createdAt
                ? new Date(createdAt).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                : "—"
            }
          />
          <InfoCard
            label="Last Modified By"
            value={lastModifier?.full_name || "—"}
          />
          <InfoCard
            label="Last Updated"
            value={
              updatedAt
                ? new Date(updatedAt).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                : "—"
            }
          />
        </section>

        {/* ACTION SECTION — NO TABS */}
        <div className="mt-8 border rounded-lg p-5 flex items-center justify-between dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            View the complete data flow diagram for this mapping.
          </p>

          <button
            onClick={() => onViewDiagram(id)}
            className="px-4 py-2 rounded bg-[#5DEE92] text-black font-medium hover:opacity-90"
          >
            View Diagram
          </button>
        </div>

        {/* FOOTER BUTTONS */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 text-sm font-medium dark:text-gray-200"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* INFO CARD COMPONENT */
const InfoCard = ({ label, value }) => (
  <motion.div
    initial={{ opacity: 0, y: 5 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
  >
    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
      {label}
    </p>
    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
      {value || "-"}
    </p>
  </motion.div>
);
