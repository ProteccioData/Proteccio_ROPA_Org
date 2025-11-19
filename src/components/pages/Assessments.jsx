// pages/Assessments.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList,
  ShieldCheck,
  ArrowLeftRight,
  Eye,
  Edit2,
  Trash2,
  Copy,
  Filter,
} from "lucide-react";
import { Tabs } from "../ui/tabs";
import LIAssessmentModal from "../modules/AddLIA";
import DPIAModal from "../modules/AddDPIA";
import TIAModal from "../modules/AddTIA";
import { getAssessmentStats } from "../../services/AssessmentService";
import CreateAssessmentModal from "../modules/CreateAssessmentModel";

// Reusable Stat Card
const StatCard = ({
  icon: Icon,
  title,
  description,
  count,
  buttonText,
  onButtonClick,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="flex flex-col justify-between rounded-xl border border-[#828282] dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm"
  >
    <div className="flex items-start gap-3">
      <Icon className="h-16 w-16 text-gray-700 dark:text-gray-200" />
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h3>
        <p className="text-md text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
    </div>
    <div className="mt-4 flex items-center justify-between">
      <div className="flex flex-col ">
        <span className="text-4xl pl-4 font-bold text-gray-900 dark:text-gray-100">
          {count}
        </span>
        <p className="pl-4 dark:text-gray-100">Assessments</p>
      </div>

      <button
        onClick={onButtonClick}
        className="rounded-md bg-[#5DEE92] px-3 py-1.5 text-sm font-medium text-gray-900 hover:opacity-90 transition hover:cursor-pointer"
      >
        {buttonText}
      </button>
    </div>
  </motion.div>
);

const tabData = [
  { title: "Legitimate Interest Assessment", value: "lia" },
  { title: "Data Protection Impact Assessment", value: "dpia" },
  { title: "Transfer Impact Assessment", value: "tia" },
];

export default function Assessments() {
  const [openModal, setOpenModal] = useState(null); // "lia" | "dpia" | "tia"
  const [stats, setStats] = useState({ byType: { LIA: 0, DPIA: 0, TIA: 0 } });
  const [loadingStats, setLoadingStats] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createType, setCreateType] = useState(null);
  const [createdAssessment, setCreatedAssessment] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);


  const handleClose = () => setOpenModal(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoadingStats(true);
        const res = await getAssessmentStats();
        // defensive: ensure byType exists
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load assessment stats", err);
      } finally {
        setLoadingStats(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="min-h-screen w-full">
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={ShieldCheck}
          title="Data Protection Impact Assessment"
          description="Assess privacy risks and mitigation measures"
          count={loadingStats ? "..." : stats.byType.DPIA}
          buttonText="Start new DPIA"
          onButtonClick={() => {
            setCreateType("DPIA");
            setCreateModalOpen(true);
          }}
        />
        <StatCard
          icon={ClipboardList}
          title="Legitimate Interest Assessment"
          description="Evaluate legitimate interests for data processing"
          count={loadingStats ? "..." : stats.byType.LIA}
          buttonText="Start new LIA"
          onButtonClick={() => {
            setCreateType("LIA");
            setCreateModalOpen(true);
          }}
        />
        <StatCard
          icon={ArrowLeftRight}
          title="Transfer Impact Assessment"
          description="Evaluate risks of cross-border data transfers"
          count={loadingStats ? "..." : stats.byType.TIA}
          buttonText="Start new TIA"
          onButtonClick={() => {
            setCreateType("TIA");
            setCreateModalOpen(true);
          }}
        />
      </div>

      {/* Tabs */}
      <div className="pt-8">
        <Tabs tabs={tabData} reloadKey={reloadKey} />
      </div>

      <CreateAssessmentModal
        open={createModalOpen}
        type={createType}
        onClose={() => setCreateModalOpen(false)}
        onCreated={(assessment) => {
          setCreateModalOpen(false);
          setCreatedAssessment(assessment); // store backend response
        }}
      />

      {/* Open the real wizard only after backend created assessment */}
      {createdAssessment?.type === "DPIA" && (
        <DPIAModal
          isOpen={true}
          onClose={() => setCreatedAssessment(null)}
          assessmentId={createdAssessment.id}
          onCreated={() => setReloadKey(Date.now())}
        />
      )}

      {createdAssessment?.type === "LIA" && (
        <LIAssessmentModal
          isOpen={true}
          onClose={() => setCreatedAssessment(null)}
          assessmentId={createdAssessment.id}
          onCreated={() => setReloadKey(Date.now())}
        />
      )}

      {createdAssessment?.type === "TIA" && (
        <TIAModal
          isOpen={true}
          onClose={() => setCreatedAssessment(null)}
          assessmentId={createdAssessment.id}
          onCreated={() => setReloadKey(Date.now())}
        />
      )}
    </div>
  );
}
