import { useState, useEffect } from "react";
import useTheme from "../hooks/useTheme";
import { RoundedPieChart } from "../ui/rounded-pie-chart";
import { DottedMultiLineChart } from "../ui/dotted-multi-line";
import { GlowingStrokeRadarChart } from "../ui/glowing-stroke-radar-chart";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { NetworkDiagram } from "../ui/network-diagram";
import { Modal } from "../ui/modal";
import { TransferDetailsModal } from "../ui/transfer-detail-modal";
import { motion } from "framer-motion";
import {
  BarChart3,
  Calendar,
  CirclePlus,
  Download,
  FileText,
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const TopCardHeight = "h-[320px]"; // fixed top card height
const SmallCardHeight = "h-[160px]"; // smaller cards used inside middle column

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  const [animateNumbers, setAnimateNumbers] = useState({
    ropa: 0,
    assessments: 0,
    transfers: 0,
    compliance: 0,
    risk: 0,
  });

  // sample data (kept same as your previous)
  const chartData = [
    { label: "InfoVoyage", value: 200, color: "var(--color-chart-1)" },
    { label: "CheckSync", value: 275, color: "var(--color-chart-2)" },
    { label: "Beam", value: 90, color: "var(--color-chart-3)" },
    { label: "OffDoff", value: 187, color: "var(--color-chart-4)" },
  ];

  const reportStats = {
    totalReports: 12,
    thisMonthCount: 4,
  };

  const recentReports = [
    {
      id: 1,
      name: "RoPA Overview Q3",
      date: "14 Oct 2025",
      type: "RoPA",
      status: "Completed",
    },
    {
      id: 2,
      name: "Assessment Metrics",
      date: "10 Oct 2025",
      type: "Assessment",
      status: "In Progress",
    },
    {
      id: 3,
      name: "DPIA Report",
      date: "07 Oct 2025",
      type: "DPIA",
      status: "Completed",
    },
    {
      id: 4,
      name: "Risk Exposure Summary",
      date: "03 Oct 2025",
      type: "Risk",
      status: "Pending",
    },
    {
      id: 5,
      name: "Transfer Insights",
      date: "29 Sep 2025",
      type: "Transfer",
      status: "Completed",
    },
  ];

  const recentTransfers = [
    {
      id: 1,
      region: "EU → US",
      dataType: "Customer Data",
      risk: "Low",
      date: "15 Oct",
    },
    {
      id: 2,
      region: "IN → UK",
      dataType: "Employee Data",
      risk: "Medium",
      date: "12 Oct",
    },
    {
      id: 3,
      region: "SG → FR",
      dataType: "Analytics Logs",
      risk: "High",
      date: "09 Oct",
    },
    {
      id: 4,
      region: "US → DE",
      dataType: "Vendor Info",
      risk: "Low",
      date: "06 Oct",
    },
    {
      id: 5,
      region: "IN → EU",
      dataType: "Marketing Data",
      risk: "Medium",
      date: "02 Oct",
    },
  ];

  const activities = [
    {
      id: 1,
      activity: "DPIA Completed",
      date: "2025-04-01",
      time: "13:01",
      type: "DPIA",
      performedBy: "Admin",
    },
    {
      id: 2,
      activity: "RoPA Updated",
      date: "2025-04-03",
      time: "15:20",
      type: "RoPA",
      performedBy: "John",
    },
    {
      id: 3,
      activity: "TIA Approved",
      date: "2025-04-05",
      time: "09:45",
      type: "TIA",
      performedBy: "Manager",
    },
  ];

  const upcomingAudits = [
    {
      id: 1,
      dept: "LIA Review",
      date: "20 Oct",
      team: "Privacy team",
      status: "Scheduled",
    },
    {
      id: 2,
      dept: "DPIA Renewal",
      date: "02 Nov",
      team: "Legal",
      status: "Pending",
    },
    {
      id: 3,
      dept: "Security Audit",
      date: "10 Nov",
      team: "IT Security",
      status: "In Review",
    },
  ];

  // Compliance small bar data
  const ropaStages = { Infovoyage: 350, CheckSync: 450, Beam: 200 };
  const ropaOptions = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { stacked: true, display: false },
      y: { stacked: true, display: false },
    },
    elements: { bar: { borderSkipped: false } },
  };
  const ropaData = {
    labels: [""],
    datasets: [
      {
        label: ">90%",
        data: [ropaStages.Infovoyage],
        backgroundColor: "#10b981",
        borderRadius: { topLeft: 12, bottomLeft: 12 },
      },
      {
        label: "60%-90%",
        data: [ropaStages.CheckSync],
        backgroundColor: "#facc15",
      },
      {
        label: "<60%",
        data: [ropaStages.Beam],
        backgroundColor: "#ef4444",
        borderRadius: { topRight: 12, bottomRight: 12 },
      },
    ],
  };

  useEffect(() => {
    setMounted(true);

    const animateNumber = (target, key, duration = 1500) => {
      const step = Math.max(1, Math.floor(target / (duration / 16)));
      let cur = 0;
      const t = setInterval(() => {
        cur += step;
        if (cur >= target) {
          cur = target;
          clearInterval(t);
        }
        setAnimateNumbers((prev) => ({ ...prev, [key]: 24 }));
      }, 16);
      return t;
    };

    const timers = [];
    timers.push(
      setTimeout(() => timers.push(animateNumber(246, "ropa", 1200)), 200)
    );
    timers.push(
      setTimeout(() => timers.push(animateNumber(18, "assessments", 900)), 350)
    );
    timers.push(
      setTimeout(() => timers.push(animateNumber(52, "transfers", 1000)), 450)
    );
    timers.push(
      setTimeout(() => timers.push(animateNumber(55, "compliance", 1000)), 550)
    );
    timers.push(
      setTimeout(() => timers.push(animateNumber(78, "risk", 1200)), 650)
    );

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, []);

  const cardAnim = {
    hidden: { opacity: 0, y: 8 },
    show: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.06,
        ease: [0.25, 0.46, 0.45, 0.94],
        duration: 0.45,
      },
    }),
  };

  // Stroke dash handling for radial gauge
  // Using a 100-length circumference shorthand so strokeDasharray can be percentage based
  const radialStroke = (percent) =>
    `${Math.max(0, Math.min(100, percent))} ${
      100 - Math.max(0, Math.min(100, percent))
    }`;

  return (
    <>
      <div className="space-y-8">
        {/* TOP ROW: 3 cards across */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* RoPA Donut */}
          <div className="flex flex-col gap-4">
            <motion.div
              initial="hidden"
              animate="show"
              variants={cardAnim}
              custom={0}
              className={`rounded-2xl p-5 shadow-sm transition-all hover:shadow-lg duration-300 border border-[#828282] dark:bg-gray-800 bg-white h-[240px] flex flex-col justify-center`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-md font-medium text-gray-700 dark:text-gray-300">
                    Total RoPA Records
                  </p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <h2 className="text-4xl font-extrabold text-[#5DE992] dark:text-[#5DE992]">
                      {animateNumbers.ropa}
                    </h2>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">+ 12 This month</p>
                </div>
                <div className="w-48 h-48">
                  <RoundedPieChart />
                </div>
              </div>
              <div className="flex-1 mt-2 text-xs text-gray-600 dark:text-gray-300">
                <div className="flex justify-around gap-3">
                  {chartData.map((c, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: c.color }}
                      />
                      <span>{c.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Compliance Info */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={cardAnim}
              custom={3}
              className="rounded-2xl p-4 shadow-sm transition-all hover:shadow-lg duration-300 border border-[#828282] dark:bg-gray-800 bg-white flex flex-col justify-between"
              // style={{ height: "420px" }} // equal column height
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    RoPA Compliance
                  </h3>
                  <div className="mt-3">
                    <div className="text-3xl font-extrabold text-[#1F6B3B]">
                      {animateNumbers.compliance}%
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Overall compliance across tracked RoPA entries
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs">&gt; 90%</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-400" />
                    <span className="text-xs">60–90%</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-xs">&lt; 60%</span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="w-full h-6">
                  <Bar data={ropaData} options={ropaOptions} />
                </div>
              </div>
            </motion.div>

            <div className="max-h-[340px]">
              <div className="bg-white dark:bg-gray-800 border border-[#828282] dark:border-gray-600 rounded-xl shadow-sm p-3 md:p-4 transition-all duration-300 hover:shadow-lg h-full">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 md:w-6 md:h-6 text-gray-600 dark:text-gray-100" />
                    <h3 className="text-gray-700 dark:text-gray-300 text-base md:text-lg font-medium">
                      Reports
                    </h3>
                  </div>
                  <button
                    onClick={() => navigate("/reports")}
                    className="text-xs md:text-sm text-[#009938] hover:text-green-900 cursor-pointer font-medium"
                  >
                    View All
                  </button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2 md:gap-3 mb-3 md:mb-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 md:p-3">
                    <div className="flex items-center gap-1 md:gap-2 mb-1">
                      <BarChart3 className="w-3 h-3 md:w-4 md:h-4 text-blue-500" />
                      <span className="text-xs text-gray-600 dark:text-gray-300">
                        Total Reports
                      </span>
                    </div>
                    <div className="text-lg md:text-xl font-bold text-blue-600 dark:text-blue-400">
                      {reportStats.totalReports || 0}
                    </div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 md:p-3">
                    <div className="flex items-center gap-1 md:gap-2 mb-1">
                      <Calendar className="w-3 h-3 md:w-4 md:h-4 text-green-500" />
                      <span className="text-xs text-gray-600 dark:text-gray-300">
                        This Month
                      </span>
                    </div>
                    <div className="text-lg md:text-xl font-bold text-green-600 dark:text-green-400">
                      {reportStats.thisMonthCount | 0}
                    </div>
                  </div>
                </div>

                {/* Recent Reports List */}
                <div className="mb-3 md:mb-4">
                  <h4 className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 md:mb-3">
                    Recent Reports
                  </h4>
                  <div className="space-y-1 md:space-y-2 max-h-32 md:max-h-240px overflow-y-auto">
                    {recentReports.map((report, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-1 md:p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                            {report.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {report.date} • {report.type}
                          </div>
                        </div>
                        <Download className="w-3 h-3 md:w-4 md:h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0 ml-1" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {/* Assessments line */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={cardAnim}
              custom={1}
              className={`rounded-2xl p-5 shadow-sm transition-all hover:shadow-lg duration-300 border border-[#828282] dark:bg-gray-800 bg-white ${TopCardHeight} flex flex-col`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-md font-medium text-gray-700 dark:text-gray-300">
                    Assessments
                  </p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <h2 className="text-4xl font-extrabold text-[#5DE992]">
                      {animateNumbers.assessments}
                    </h2>
                    <p className="text-sm text-gray-500">+ 12 This month</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <select className="text-xs px-2 py-1 rounded border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                    <option>Monthly</option>
                  </select>
                  <select className="text-xs px-2 py-1 rounded border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                    <option>2025</option>
                  </select>
                </div>
              </div>

              <div className=" flex-1">
                <div className="w-full h-[220px]">
                  <DottedMultiLineChart />
                </div>
              </div>
            </motion.div>

            <div style={{ height: "420px" }} className="flex flex-col gap-4">
              {/* Risk Overview (top half) */}
              <motion.div
                initial="hidden"
                animate="show"
                variants={cardAnim}
                custom={4}
                className="rounded-2xl p-4 shadow-sm transition-all hover:shadow-lg duration-300 border border-[#828282] dark:bg-gray-800 bg-white flex flex-col items-center justify-center"
              >
                <div className="w-full">
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Risk Overview
                  </h3>

                  <div className="flex justify-between items-center gap-6">
                    {/* SVG radial gauge */}
                    <div className="relative flex items-center justify-center w-28 h-28">
                      <svg viewBox="0 0 36 36" className="w-28 h-28">
                        <defs>
                          <linearGradient id="gaugeGrad" x1="0%" x2="100%">
                            <stop offset="0%" stopColor="#10B981" />
                            <stop offset="50%" stopColor="#FACC15" />
                            <stop offset="100%" stopColor="#EF4444" />
                          </linearGradient>
                        </defs>

                        {/* track */}
                        <path
                          d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#eef2f6"
                          strokeWidth="2.6"
                          strokeLinecap="round"
                        />
                        {/* progress */}
                        <path
                          d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="url(#gaugeGrad)"
                          strokeWidth="2.6"
                          strokeLinecap="round"
                          strokeDasharray={radialStroke(animateNumbers.risk)}
                          style={{ transition: "stroke-dasharray 0.9s ease" }}
                        />
                      </svg>

                      <div className="absolute text-2xl font-semibold text-gray-900 dark:text-white">
                        {animateNumbers.risk}%
                      </div>
                    </div>

                    <div className="">
                      <div className="space-y-3 flex justify-center flex-col ">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-6 bg-green-50 text-green-700 rounded flex items-center justify-center font-semibold">
                            11
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                              Low Risk
                            </div>
                            <div className="text-xs text-gray-500">
                              Low risk dataset count
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-8 h-6 bg-yellow-50 text-yellow-700 rounded flex items-center justify-center font-semibold">
                            5
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                              Medium Risk
                            </div>
                            <div className="text-xs text-gray-500">
                              Watchlist
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-8 h-6 bg-red-50 text-red-700 rounded flex items-center justify-center font-semibold">
                            5
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                              High Risk
                            </div>
                            <div className="text-xs text-gray-500">
                              Immediate attention
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-3">
                    Overall risk gauge — higher percent indicates more risk
                    exposure
                  </p>
                </div>
              </motion.div>

              {/* Upcoming Audits (bottom half) */}
              <motion.div
                initial="hidden"
                animate="show"
                variants={cardAnim}
                custom={5}
                className="rounded-2xl p-4 shadow-sm transition-all hover:shadow-lg duration-300 border border-[#828282] dark:bg-gray-800 bg-white"
                // style={{ flex: 1, minHeight: 0 }}
              >
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Upcoming Audits
                </h3>
                <div className="space-y-3">
                  {upcomingAudits.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {a.dept}
                        </div>
                        <div className="text-xs text-gray-500">{a.team}</div>
                      </div>
                      <div className="text-sm text-gray-500">{a.date}</div>
                      <div className="ml-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            a.status === "Scheduled"
                              ? "bg-green-100 text-green-700"
                              : a.status === "Pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {a.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Data Mapping */}
          <div className="flex flex-col gap-4">
            <motion.div
              initial="hidden"
              animate="show"
              variants={cardAnim}
              custom={2}
              className={`rounded-2xl p-5 shadow-sm transition-all hover:shadow-lg duration-300 border border-[#828282] dark:bg-gray-800 bg-white ${TopCardHeight} flex flex-col items-center justify-between`}
            >
              <div className="w-full flex flex-col">
                <div className="flex w-full justify-between items-start">
                  <p className="text-md font-medium text-gray-700 dark:text-gray-300">
                    Data Mapping
                  </p>
                  <div className="flex flex-col">
                    <h2 className="text-4xl text-right font-extrabold text-gray-900 dark:text-white">
                      {animateNumbers.transfers}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">+ 8 This Week</p>
                  </div>
                </div>
                <div className="w-full max-h-40">
                  <GlowingStrokeRadarChart />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              animate="show"
              variants={cardAnim}
              custom={6}
              className="rounded-2xl p-4 shadow-sm transition-all hover:shadow-lg duration-300 border border-[#828282] dark:bg-gray-800 bg-white flex flex-col justify-between"
              // style={{ height: "420px" }}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    Data Transfer Stats
                  </h3>
                  <button
                    onClick={() => setShowTransferModal(true)}
                    className="px-3 py-1.5 bg-[#5DE992] text-white rounded text-sm hover:opacity-95"
                  >
                    View Details
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-lg p-4 bg-indigo-50 ">
                    <div className="text-2xl font-semibold text-indigo-700">
                      4
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Total Transfers
                    </div>
                  </div>
                  <div className="rounded-lg p-4 bg-pink-50 ">
                    <div className="text-2xl font-semibold text-pink-700">
                      2
                    </div>
                    <div className="text-xs text-gray-500 mt-1">High Risk</div>
                  </div>
                </div>
              </div>
              {/* Recent Transfers */}
              <div className="mt-5 border-t border-gray-200 dark:border-gray-700 pt-4 flex-1 overflow-y-auto">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Recent Transfers
                </h4>
                <div className="space-y-2 pr-1">
                  {recentTransfers.map((t) => (
                    <div
                      key={t.id}
                      className="flex justify-between items-center text-sm border-b dark:border-gray-700 border-gray-100 pb-2"
                    >
                      <div className="truncate max-w-[50%] dark:text-gray-200 text-gray-800">
                        {t.region}
                      </div>
                      <div className="text-xs text-gray-500">{t.dataType}</div>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          t.risk === "High"
                            ? "bg-red-100 text-red-700"
                            : t.risk === "Medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {t.risk}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="rounded-2xl p-6 shadow-sm border border-[#828282] dark:border-gray-700 bg-white dark:bg-gray-800"
        >
          <h3 className="text-lg font-semibold mb-6  dark:text-white text-gray-900">
            <span>Recent Activities</span>
          </h3>

          {/* Table Header */}
          <div className="grid grid-cols-5 gap-4 pb-3 mb-3 border-b text-sm font-medium dark:border-gray-700 dark:text-gray-400 border-gray-200 text-gray-600">
            <div>Activity</div>
            <div>Date</div>
            <div>Time</div>
            <div>Type</div>
            <div>Performed By</div>
          </div>

          {/* Table Rows */}
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <div
                key={activity.id}
                className="grid grid-cols-5 gap-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <div className="text-sm dark:text-gray-300 text-gray-900">
                  {activity.activity}
                </div>
                <div className="text-sm dark:text-gray-400 text-gray-600">
                  {activity.date}
                </div>
                <div className="text-sm dark:text-gray-400 text-gray-600">
                  {activity.time}
                </div>
                <div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {activity.type}
                  </span>
                </div>
                <div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {activity.performedBy}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <Modal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        title="Data Transfer Details"
        size="xl"
      >
        <TransferDetailsModal />
      </Modal>
    </>
  );
}
