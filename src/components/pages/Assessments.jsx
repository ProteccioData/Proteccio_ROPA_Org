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

// Reusable Stat Card
const StatCard = ({ icon: Icon, title, description, count, buttonText }) => (
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
        <p className="pl-4">Assessments</p>
      </div>

      <button className="rounded-md bg-[#5DEE92] px-3 py-1.5 text-sm font-medium text-gray-900 hover:opacity-90 transition hover:cursor-pointer">
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

// Reusable Badge
const Badge = ({ text, color }) => (
  <span
    className={`px-3 py-1 text-xs font-medium rounded-md ${
      color === "green"
        ? "bg-green-100 text-green-700"
        : "bg-yellow-100 text-yellow-700"
    }`}
  >
    {text}
  </span>
);

// Table Row
const TableRow = ({ id, stage, impact, likelihood, createdBy, date }) => (
  <motion.tr
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
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
      <Eye className="h-4 w-4 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300" />
      <Edit2 className="h-4 w-4 cursor-pointer hover:text-blue-500" />
      <Trash2 className="h-4 w-4 cursor-pointer hover:text-red-500" />
      <Copy className="h-4 w-4 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300" />
    </td>
  </motion.tr>
);

export default function Assessments() {
  return (
    <div className="min-h-screen w-full">
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={ShieldCheck}
          title="Data Protection Impact Assessment"
          description="Assess privacy risks and mitigation measures"
          count="1"
          buttonText="Start new DPIA"
        />
        <StatCard
          icon={ClipboardList}
          title="Legitimate Interest Assessment"
          description="Evaluate legitimate interests for data processing"
          count="2"
          buttonText="Start new LIA"
        />
        <StatCard
          icon={ArrowLeftRight}
          title="Transfer Impact Assessment"
          description="Evaluate risks of cross-border data transfers"
          count="0"
          buttonText="Start new TIA"
        />
      </div>
      {/* Tabs */}
      <div className="pt-8">
        <Tabs tabs={tabData} />
      </div>
    </div>
  );
}
