import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Eye,
  Edit2,
  Trash2,
  Copy,
  Filter,
  SquarePen,
  Archive,
} from "lucide-react";
import { useEffect } from "react";
import {
  getAssessments,
  archiveAssessment,
} from "../../services/AssessmentService";
import ViewAssessmentModal from "../modules/ViewAssessmentModal";
import { useAssessmentView } from "../hooks/useAssessmentView";
import ConfirmationModal from "./ConfirmationModal";
import { useToast } from "./ToastProvider";
import { useTranslation } from "react-i18next";
import { addTranslationNamespace } from "../../i18n/config";

const Badge = ({ text, color }) => (
  <span
    className={`px-3 py-1 text-xs font-medium rounded-md ${color === "green"
        ? "bg-green-100 text-green-700"
        : "bg-yellow-100 text-yellow-700"
      }`}
  >
    {text}
  </span>
);

const TableRow = ({
  id,
  stage,
  impact,
  likelihood,
  createdBy,
  date,
  onView,
  onArchive,
}) => (
  <motion.tr
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="border-b border-gray-200 dark:border-gray-700"
  >
    <td className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200">
      {id}
    </td>
    <td className="px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="h-2 w-full max-w-[80px] rounded bg-gray-200 dark:bg-gray-700">
          <div className="h-2 w-full rounded bg-[#5DEE92]" />
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {stage}
        </span>
      </div>
    </td>
    <td className="px-4 py-3">
      <Badge text={impact} color="yellow" />
    </td>
    <td className="px-4 py-3">
      <Badge text={likelihood} color="green" />
    </td>
    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
      {createdBy}
    </td>
    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
      {date}
    </td>
    <td className="px-4 py-3 flex items-center gap-3 text-gray-500">
      <Eye
        onClick={() => onView(id)}
        className="h-4 w-4 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
      />
      <SquarePen className="h-4 w-4 cursor-pointer hover:text-blue-500" />
      <Archive
        onClick={() => onArchive(id)}
        className="h-4 w-4 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
      />
    </td>
  </motion.tr>
);

const mapImpact = (value) => {
  if (value >= 4) return "High";
  if (value === 3) return "Medium";
  return "Low";
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const AssessmentTable = ({ title, data, onViewAssessment, onArchive }) => (
  <div className="rounded-xl border border-[#828282] dark:border-gray-700 bg-white dark:bg-gray-900 mt-4 shadow-sm">
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h2>
      <button className="flex items-center gap-2 rounded-md bg-[#5DEE92] px-3 py-1.5 text-sm font-medium text-gray-900 hover:opacity-90 transition hover:cursor-pointer">
        <Filter className="h-4 w-4" /> Filter
      </button>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr>
            {[
              "Assessment Id",
              "Stage",
              "Impact",
              "Likelihood",
              "Created By",
              "Next Review Date",
              "Actions",
            ].map((header, i) => (
              <th
                key={i}
                className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {data.length === 0 && (
            <tr>
              <td
                className="px-4 py-6 text-center text-gray-500 dark:text-gray-400"
                colSpan={7}
              >
                No assessment records found.
              </td>
            </tr>
          )}

          {data.map((item) => (
            <TableRow
              key={item.id}
              id={item.assessment_id}
              stage={`${item.current_stage}/${item.total_stages}`}
              impact={mapImpact(item.impact)}
              likelihood={mapImpact(item.likelihood)}
              createdBy={item.creator?.full_name || "Unknown"}
              date={
                item.next_review_date ? formatDate(item.next_review_date) : "-"
              }
              onView={(id) => onViewAssessment(item.id)}
              onArchive={(id) => onArchive(item.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const Tabs = ({
  tabs: propTabs,
  containerClassName,
  activeTabClassName,
  tabClassName,
  contentClassName,
  reloadKey,
}) => {
  const [active, setActive] = useState(propTabs[0]);
  const [tabs, setTabs] = useState(propTabs);
  const [hovering, setHovering] = useState(false);
  const [records, setRecords] = useState([]);
  const [confirmArchiveOpen, setConfirmArchiveOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const { addToast } = useToast();

  // View modal hook
  const { assessment, loadAssessment } = useAssessmentView();
  const [viewOpen, setViewOpen] = useState(false);

  useEffect(() => {
    addTranslationNamespace("en", "ui", "tabs");
    addTranslationNamespace("hindi", "ui", "tabs");
    addTranslationNamespace("sanskrit", "ui", "tabs");
    addTranslationNamespace("telugu", "ui", "tabs");
  }, []);

  const { t } = useTranslation("ui", { keyPrefix: "tabs" });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAssessments();
        setRecords(res.data.assessments);
      } catch (e) {
        console.error("Failed loading assessments", e);
      }
    };
    load();
  }, [reloadKey]);

  const handleArchiveClick = (id) => {
    setSelectedId(id);
    setConfirmArchiveOpen(true);
  };

  const confirmArchive = async () => {
    setProcessing(true);
    try {
      await archiveAssessment(selectedId);

      addToast("success", "Assessment Archived successfully.");

      // Update UI
      setRecords((prev) =>
        prev.filter((item) => item.id !== selectedId)
      );
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to archive assessment.",
        variant: "destructive",
      });
    }

    setProcessing(false);
    setConfirmArchiveOpen(false);
  };

  // FIX 1 — this must be inside the Tabs component
  const onViewAssessment = (id) => {
    loadAssessment(id);
    setViewOpen(true);
  };

  const moveSelectedTabToTop = (idx) => {
    const newTabs = [...propTabs];
    const selectedTab = newTabs.splice(idx, 1);
    newTabs.unshift(selectedTab[0]);
    setTabs(newTabs);
    setActive(newTabs[0]);
  };

  return (
    <>
      {/* FIX 2 — Render modal inside return */}
      <ViewAssessmentModal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        assessment={assessment}
      />

      {/* ARCHIVE CONFIRMATION */}
      <ConfirmationModal
        isOpen={confirmArchiveOpen}
        onClose={() => setConfirmArchiveOpen(false)}
        onConfirm={confirmArchive}
        title="Archive Assessment"
        message="Are you sure you want to archive this assessment? You can unarchive it later from the settings if needed."
        type="warning"
        confirmText="Archive"
        cancelText="Cancel"
        isLoading={processing}
      />

      <div
        className={cn(
          "flex flex-row items-center justify-start [perspective:1000px] relative overflow-auto sm:overflow-visible no-visible-scrollbar max-w-full w-full",
          containerClassName
        )}
      >
        {propTabs.map((tab, idx) => (
          <button
            key={tab.title}
            onClick={() => moveSelectedTabToTop(idx)}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            className={cn(
              "relative px-4 py-2 rounded-ful hover:cursor-pointer",
              tabClassName
            )}
            style={{ transformStyle: "preserve-3d" }}
          >
            {active.value === tab.value && (
              <motion.div
                layoutId="clickedbutton"
                transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                className={cn(
                  "absolute inset-0 bg-gray-200 dark:bg-zinc-800 rounded-full",
                  activeTabClassName
                )}
              />
            )}
            <span className="relative block text-black dark:text-white">
              {tab.title}
            </span>
          </button>
        ))}
      </div>

      <FadeInDiv
        tabs={tabs}
        active={active}
        hovering={hovering}
        records={records}
        onViewAssessment={onViewAssessment} // Pass it down
        key={active.value}
        className={cn("mt-10", contentClassName)}
        onArchive={handleArchiveClick}
      />
    </>
  );
};

export const FadeInDiv = ({
  className,
  tabs,
  hovering,
  active,
  records,
  onViewAssessment,
  onArchive,
}) => {
  const isActive = (tab) => tab.value === tabs[0].value;

  const filterByType = (type) => {
    if (type === "lia") return records.filter((r) => r.type === "LIA");
    if (type === "dpia") return records.filter((r) => r.type === "DPIA");
    if (type === "tia") return records.filter((r) => r.type === "TIA");
    return [];
  };

  return (
    <div className="relative w-full h-full min-h-[400px]">
      {tabs.map((tab, idx) => (
        <motion.div
          key={tab.value}
          layoutId={tab.value}
          style={{
            scale: hovering ? 1 - idx * 0.05 : 1, // shrink only on hover
            top: hovering ? idx * -25 : 0, // separate only on hover
            zIndex: tabs.length - idx,
            opacity: hovering
              ? idx === 0
                ? 1
                : 1 - idx * 0.05
              : idx === 0
                ? 1
                : 0, // hide background cards until hover
          }}
          animate={{
            y: isActive(tab) ? [0, 20, 0] : 0,
          }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className={cn(
            "absolute top-0 left-0 w-full",
            idx > 0 && "pointer-events-none",
            className
          )}
        >
          <div className="shadow-lg rounded-xl overflow-hidden">
            <AssessmentTable
              title={tab.title}
              data={filterByType(tab.value)}
              onViewAssessment={onViewAssessment}
              onArchive={onArchive}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
};
