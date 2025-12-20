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
import { Tabs } from "../ui/tabs.jsx";
import LIAssessmentModal from "../modules/AddLIA";
import DPIAModal from "../modules/AddDPIA";
import TIAModal from "../modules/AddTIA";
import { getAssessmentStats, archiveAssessment } from "../../services/AssessmentService";
import CreateAssessmentModal from "../modules/CreateAssessmentModel";
import { useTranslation } from "react-i18next";
import { addTranslationNamespace } from "../../i18n/config";

export default function Assessments() {
  const [openModal, setOpenModal] = useState(null); // "lia" | "dpia" | "tia"
  const [stats, setStats] = useState({ byType: { LIA: 0, DPIA: 0, TIA: 0 } });
  const [loadingStats, setLoadingStats] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createType, setCreateType] = useState(null);
  const [createdAssessment, setCreatedAssessment] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([
      addTranslationNamespace("en", "pages", "Assessments"),
      addTranslationNamespace("hindi", "pages", "Assessments"),
      addTranslationNamespace("sanskrit", "pages", "Assessments"),
      addTranslationNamespace("telugu", "pages", "Assessments"),
    ]).then(() => setReady(true));
  }, []);


  const { t } = useTranslation("pages", { keyPrefix: "Assessments" });

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
          <p className="pl-4 dark:text-gray-100">{t("assessments")}</p>
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
    { title: `${t("data_protection_impact_assessment")}`, value: "dpia" },
    { title: `${t("legitimate_interest_assessment")}`, value: "lia" },
    { title: `${t("transfer_impact_assessment")}`, value: "tia" },
  ];

  if (!ready) return <div> Loading... </div>

  return (
    <div className="min-h-screen w-full">
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={ShieldCheck}
          title={`${t("data_protection_impact_assessment")}`}
          description={`${t("assess_privacy_risks_and_mitigation_measures")}`}
          count={loadingStats ? "..." : stats.byType.DPIA}
          buttonText={`${t("start_new_dpia")}`}
          onButtonClick={() => {
            setCreateType("DPIA");
            setCreateModalOpen(true);
          }}
        />
        <StatCard
          icon={ClipboardList}
          title={`${t("legitimate_interest_assessment")}`}
          description={`${t("evaluate_legitimate_interests_for_data_processing")}`}
          count={loadingStats ? "..." : stats.byType.LIA}
          buttonText={`${t("start_new_lia")}`}
          onButtonClick={() => {
            setCreateType("LIA");
            setCreateModalOpen(true);
          }}
        />
        <StatCard
          icon={ArrowLeftRight}
          title={`${t("transfer_impact_assessment")}`}
          description={`${t("evaluate_risks_of_cross_border_data_transfers")}`}
          count={loadingStats ? "..." : stats.byType.TIA}
          buttonText={`${t("start_new_tia")}`}
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
