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
import RiskGauge from "../ui/RiskGauge";
import {
  getAllDataTransfers,
  getAssessmentTrend,
  getComplianceScore,
  getDashboardActivity,
  getDashboardSummary,
  getDataMappingStats,
  getDataTransferStats,
  getRecentReports,
  getRiskOverview,
  getRopaStats,
  getUpcomingAudits,
} from "../../services/DashboardService";
import { useAuth } from "../../context/AuthContext";
import { getAssessments } from "../../services/AssessmentService";

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
  const [summary, setSummary] = useState(null);
  const [activityList, setActivityList] = useState([]);
  const { user } = useAuth();
  const [assessmentTrend, setAssessmentTrend] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [riskOverview, setRiskOverview] = useState(null);
  const [upcomingAudits, setUpcomingAudits] = useState([]);
  const [auditSummary, setAuditSummary] = useState(null);
  const [dataMappingStats, setDataMappingStats] = useState(null);
  const [dataMapping, setDataMapping] = useState(null);
  const [transferStats, setTransferStats] = useState(null);
  const [recentTransfers, setRecentTransfers] = useState([]);
  const [recentReports, setRecentReports] = useState([]);

  const [ropaPieData, setRopaPieData] = useState([]);

  const [animateNumbers, setAnimateNumbers] = useState({
    ropa: 0,
    assessments: 0,
    transfers: 0,
    compliance: 0,
    risk: 0,
    dataMappings: 0,
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

  // const recentReports = [
  //   {
  //     id: 1,
  //     name: "RoPA Overview Q3",
  //     date: "14 Oct 2025",
  //     type: "RoPA",
  //     status: "Completed",
  //   },
  //   {
  //     id: 2,
  //     name: "Assessment Metrics",
  //     date: "10 Oct 2025",
  //     type: "Assessment",
  //     status: "In Progress",
  //   },
  //   {
  //     id: 3,
  //     name: "DPIA Report",
  //     date: "07 Oct 2025",
  //     type: "DPIA",
  //     status: "Completed",
  //   },
  //   {
  //     id: 4,
  //     name: "Risk Exposure Summary",
  //     date: "03 Oct 2025",
  //     type: "Risk",
  //     status: "Pending",
  //   },
  //   {
  //     id: 5,
  //     name: "Transfer Insights",
  //     date: "29 Sep 2025",
  //     type: "Transfer",
  //     status: "Completed",
  //   },
  // ];

  // const recentTransfers = [
  //   {
  //     id: 1,
  //     region: "EU → US",
  //     dataType: "Customer Data",
  //     risk: "Low",
  //     date: "15 Oct",
  //   },
  //   {
  //     id: 2,
  //     region: "IN → UK",
  //     dataType: "Employee Data",
  //     risk: "Medium",
  //     date: "12 Oct",
  //   },
  //   {
  //     id: 3,
  //     region: "SG → FR",
  //     dataType: "Analytics Logs",
  //     risk: "High",
  //     date: "09 Oct",
  //   },
  //   {
  //     id: 4,
  //     region: "US → DE",
  //     dataType: "Vendor Info",
  //     risk: "Low",
  //     date: "06 Oct",
  //   },
  //   {
  //     id: 5,
  //     region: "IN → EU",
  //     dataType: "Marketing Data",
  //     risk: "Medium",
  //     date: "02 Oct",
  //   },
  // ];

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

  const transformActivities = (list) =>
    list.map((item) => {
      const dateObj = new Date(item.createdAt);

      return {
        activity: item.message,
        date: dateObj.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
        time: dateObj.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        type: item.type.toUpperCase(),
        performedBy: item.email,
      };
    });

  // const upcomingAudits = [
  //   {
  //     id: 1,
  //     dept: "LIA Review",
  //     date: "20 Oct",
  //     team: "Privacy team",
  //     status: "Scheduled",
  //   },
  //   {
  //     id: 2,
  //     dept: "DPIA Renewal",
  //     date: "02 Nov",
  //     team: "Legal",
  //     status: "Pending",
  //   },
  //   {
  //     id: 3,
  //     dept: "Security Audit",
  //     date: "10 Nov",
  //     team: "IT Security",
  //     status: "In Review",
  //   },
  // ];

  // Compliance small bar data
  const ropaStages = {
    Infovoyage: summary?.complianceBreakdown?.infovoyage?.count || 0,
    CheckSync: summary?.complianceBreakdown?.checksync?.count || 0,
    Beam: summary?.complianceBreakdown?.beam?.count || 0,
  };

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

  const startNumberAnimation = (data) => {
    const animate = (key, target) => {
      let current = 0;
      const step = Math.max(1, Math.floor(target / 40));

      const interval = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        setAnimateNumbers((prev) => ({ ...prev, [key]: current }));
      }, 16);
    };

    animate("ropa", data.stats.totalRopas);
    animate("assessments", data.stats.myReports);
    animate(
      "transfers",
      Object.values(data.ropasByCategory).reduce((a, b) => a + b, 0)
    );
    animate("compliance", data.stats.completionAverage);
    animate("risk", data.risk || 0);
    animate("dataMappings", data.dataMappings);
  };

  // useEffect(() => {
  //   setMounted(true);

  //   const animateNumber = (target, key, duration = 1500) => {
  //     const step = Math.max(1, Math.floor(target / (duration / 16)));
  //     let cur = 0;
  //     const t = setInterval(() => {
  //       cur += step;
  //       if (cur >= target) {
  //         cur = target;
  //         clearInterval(t);
  //       }
  //       setAnimateNumbers((prev) => ({ ...prev, [key]: 19 }));
  //     }, 16);
  //     return t;
  //   };

  //   const timers = [];
  //   timers.push(
  //     setTimeout(() => timers.push(animateNumber(246, "ropa", 1200)), 200)
  //   );
  //   timers.push(
  //     setTimeout(() => timers.push(animateNumber(18, "assessments", 900)), 350)
  //   );
  //   timers.push(
  //     setTimeout(() => timers.push(animateNumber(52, "transfers", 1000)), 450)
  //   );
  //   timers.push(
  //     setTimeout(() => timers.push(animateNumber(55, "compliance", 1000)), 550)
  //   );
  //   timers.push(
  //     setTimeout(() => timers.push(animateNumber(78, "risk", 1200)), 650)
  //   );

  //   return () => {
  //     timers.forEach((t) => clearTimeout(t));
  //   };
  // }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      const res = await getAssessments();

      const years = new Set();

      res.data.assessments.forEach((a) => {
        if (a.createdAt) {
          years.add(new Date(a.createdAt).getFullYear());
        }
      });

      const sortedYears = Array.from(years).sort((a, b) => b - a);

      setAvailableYears(sortedYears);
      setSelectedYear(sortedYears[0]); // latest year
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    setMounted(true);

    const fetchData = async () => {
      try {
        const summaryRes = await getDashboardSummary();
        const activityRes = await getDashboardActivity();
        const ropaStatsRes = await getRopaStats();
        // const assessTrendRes = await getAssessmentTrend();
        // setAssessmentTrend(assessTrendRes.data.graphData);
        const riskRes = await getRiskOverview();

        const risk = riskRes.data.summary;

        try {
          const reportsRes = await getRecentReports();
          setRecentReports(reportsRes.data.reports || []);
        } catch (err) {
          console.warn("Failed fetching recent reports:", err);
        }

        const auditRes = await getUpcomingAudits(30, 20);

        setUpcomingAudits(auditRes.data.upcomingAudits || []);
        setAuditSummary(auditRes.data.summary || {});

        const dataMapRes = await getDataMappingStats();
        const dataMap = dataMapRes.data.summary;

        const radarData = dataMapRes.data
          ? Object.entries(dataMapRes.data.byCategory).map(([key, value]) => ({
              label: key,
              value,
            }))
          : [];

        setDataMapping(radarData);

        setDataMappingStats(dataMap); // Create state for details

        const compRes = await getComplianceScore();
        const complianceScore = compRes.data?.complianceScore || {};
        const breakdown = complianceScore.stage_breakdown || {};
        const compliancePercent = complianceScore.compliance_percentage || 0;

        setSummary((prev) => ({
          ...summaryRes.data,
          complianceBreakdown: breakdown,
        }));

        setRiskOverview(risk);

        try {
          const transferRes = await getDataTransferStats();
          setTransferStats(transferRes.data);

          const allTransfers = await getAllDataTransfers({ limit: 5, page: 1 });
          setRecentTransfers(allTransfers.data.transfers || []);
        } catch (err) {
          console.warn("Transfer stats failed:", err.response?.status);
          setTransferStats({ summary: { total: 0 }, byRiskLevel: {} });
        }

        setActivityList(transformActivities(activityRes.data.activities));
        const formattedPieData = ropaStatsRes.data.byCategory.map(
          (item, index) => ({
            Stage: item.category, // recharts label
            RoPA: item.count, // value
            fill: `var(--color-chart-${index + 1})`,
          })
        );

        setRopaPieData(formattedPieData);

        startNumberAnimation({
          ...summaryRes.data,
          dataMappings: dataMap.total,
          stats: {
            ...summaryRes.data.stats,
            completionAverage: compliancePercent,
            risk: Math.round(risk.averageRiskScore),
          },
        });
      } catch (err) {
        console.error("Dashboard load error", err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedYear) return;

    const loadTrend = async () => {
      try {
        const res = await getAssessmentTrend("yearly", selectedYear);

        let graph = res.data.graphData;

        // filter using selectedMonth (1–12)
        if (selectedMonth !== null) {
          graph = graph.filter((item) => item.month === selectedMonth);
        }

        setTrendData(graph);
        setSummaryData(res.data.summary);
      } catch (err) {
        console.error("Trend load error", err);
      }
    };

    loadTrend();
  }, [selectedYear, selectedMonth]);

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

  const getRopaThisMonthText = (stats) => {
    if (!stats) return "";

    const diff = stats.ropasThisMonth - stats.ropasLastMonth;

    if (diff > 0) return `+${diff} this month`;
    if (diff < 0) return `${diff} this month`; // diff is negative automatically
    return "No change this month";
  };

  const getAssessmentChangeText = () => {
    if (!trendData || trendData.length === 0) return "";

    if (selectedMonth === null) {
      const total = trendData.reduce((sum, m) => sum + (m.total || 0), 0);
      return `+${total} this year`;
    }

    const current =
      trendData.find((m) => m.month === selectedMonth)?.total || 0;
    const previous =
      trendData.find((m) => m.month === selectedMonth - 1)?.total || 0;

    const diff = current - previous;

    if (diff > 0) return `+${diff} this month`;
    if (diff < 0) return `${diff} this month`; // negative
    return "No change this month";
  };

  const getAssessmentNumbers = () => {
    if (!summaryData || !trendData) return { total: 0, changeText: "" };

    const total = summaryData.total || 0;

    if (selectedMonth === null) {
      const yearlyTotal = trendData.reduce((sum, m) => sum + (m.total || 0), 0);
      return {
        total,
        changeText: `+${yearlyTotal} this year`,
      };
    }

    const curr = trendData.find((m) => m.month === selectedMonth)?.total || 0;
    const prev =
      trendData.find((m) => m.month === selectedMonth - 1)?.total || 0;

    const diff = curr - prev;

    let changeText = "";
    if (diff > 0) changeText = `+${diff} this month`;
    else if (diff < 0) changeText = `${diff} this month`;
    else changeText = "No change this month";

    return { total, changeText };
  };

  const thisWeek = dataMappingStats?.recentActivity?.created_last_30_days || 0;

  // Stroke dash handling for radial gauge
  // Using a 100-length circumference shorthand so strokeDasharray can be percentage based
  const radialStroke = (percent) =>
    `${Math.max(0, Math.min(100, percent))} ${
      100 - Math.max(0, Math.min(100, percent))
    }`;

  if (!summary) {
    return <div className="p-6 text-center">Loading Dashboard...</div>;
  }

  return (
    <>
      <div className="space-y-8">
        {/* TOP ROW: 3 cards across */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-[1fr]  gap-4">
          {/* RoPA Donut */}
          <div className="flex flex-col gap-4">
            <motion.div
              initial="hidden"
              animate="show"
              variants={cardAnim}
              custom={0}
              className={`rounded-2xl p-5 shadow-sm transition-all hover:shadow-lg duration-300 border border-[#828282] dark:bg-gray-800 bg-white flex flex-col justify-center h-full`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-md font-medium text-gray-700 dark:text-gray-200">
                    Total RoPA Records
                  </p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <h2 className="text-4xl font-extrabold text-[#5DE992] dark:text-[#5DE992]">
                      {summary.stats.totalRopas || animateNumbers.ropa}
                    </h2>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                    {getRopaThisMonthText(summary?.stats)}
                  </p>
                </div>
                <div className="w-48 h-48">
                  <RoundedPieChart data={ropaPieData} />
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
              className="rounded-2xl p-4 shadow-sm transition-all hover:shadow-lg duration-300 border border-[#828282] dark:bg-gray-800 bg-white flex flex-col justify-between h-full"
              // style={{ height: "420px" }} // equal column height
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">
                    RoPA Compliance
                  </h3>
                  <div className="mt-3">
                    <div className="text-3xl font-extrabold text-[#1F6B3B]">
                      {/* {animateNumbers.compliance}% */}
                      {animateNumbers.compliance}%
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-300 mt-1">
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
              <div className="bg-white dark:bg-gray-800 border border-[#828282] dark:border-gray-600 rounded-xl shadow-sm p-3 md:p-4 transition-all duration-300 hover:shadow-lg h-full min-h-[40%]">
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
                      {summary.stats.myReports || 0}
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
                      {summary.stats.reportsThisMonth | 0}
                    </div>
                  </div>
                </div>

                {/* Recent Reports List */}
                <div className="mb-3 md:mb-4">
                  <h4 className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 md:mb-3">
                    Recent Reports
                  </h4>
                  <div className="space-y-1 min-h-32 md:space-y-2 max-h-32 md:max-h-240px overflow-y-auto">
                    {recentReports.length === 0 ? (
                      <div className="text-xs text-gray-500 text-center py-4">
                        No recent reports
                      </div>
                    ) : (
                      recentReports.map((report) => (
                        <div
                          key={report.id}
                          className="flex items-center justify-between p-1 md:p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                              {report.name}
                            </div>

                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {new Date(report.createdAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}{" "}
                              • {report.category.replace(/_/g, " ")}
                            </div>
                          </div>

                          <Download
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadReport(report.id);
                            }}
                            className="w-3 h-3 md:w-4 md:h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0 ml-1"
                          />
                        </div>
                      ))
                    )}
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
              className={`rounded-2xl p-5 shadow-sm transition-all hover:shadow-lg duration-300 border border-[#828282] dark:bg-gray-800 bg-white flex flex-col h-full max-w-full overflow-hidden`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-md font-medium text-gray-700 dark:text-gray-200">
                    Assessments
                  </p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <h2 className="text-4xl font-extrabold text-[#5DE992]">
                      {getAssessmentNumbers().total}
                    </h2>

                    <p className="text-sm text-gray-500 dark:text-gray-300">
                      {getAssessmentChangeText()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    className="text-xs px-2 py-1 rounded border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 dark:text-gray-300"
                    value={selectedMonth ?? "all"}
                    onChange={(e) =>
                      setSelectedMonth(
                        e.target.value === "all"
                          ? null
                          : parseInt(e.target.value)
                      )
                    }
                  >
                    <option value={"all"}>All</option>
                    {[
                      "Jan",
                      "Feb",
                      "Mar",
                      "Apr",
                      "May",
                      "Jun",
                      "Jul",
                      "Aug",
                      "Sep",
                      "Oct",
                      "Nov",
                      "Dec",
                    ].map((m, i) => (
                      <option value={i + 1} key={i}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <select
                    className="text-xs px-2 py-1 rounded border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 dark:text-gray-300"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  >
                    {availableYears.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className=" flex-1 overflow-hidden">
                <div className="w-full max-h-[220px] overflow-hidden">
                  <DottedMultiLineChart
                    data={trendData || assessmentTrend || []}
                  />
                </div>
              </div>
            </motion.div>

            <div className="flex flex-col gap-4">
              {/* Risk Overview (Speedometer style) */}
              <motion.div
                initial="hidden"
                animate="show"
                variants={cardAnim}
                custom={4}
                className="rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 border border-[#828282] dark:border-[#333] bg-white dark:bg-gray-800 flex flex-col items-center justify-center h-full"
              >
                <div className="w-full">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                    Risk Overview
                  </h3>

                  <div className="flex justify-between items-center gap-6 pb-4">
                    {/* SVG radial gauge */}
                    {/* SVG radial gauge (0–25 range, fixed fill behavior) */}
                    <div className="relative flex items-center justify-center w-28 h-28">
                      <svg viewBox="0 0 36 36" className="w-28 h-28">
                        <defs>
                          {/* Gradient for smooth category transition */}
                          <linearGradient id="gaugeGrad" x1="0%" x2="100%">
                            <stop offset="0%" stopColor="#10B981" /> {/* Low */}
                            <stop offset="25%" stopColor="#FACC15" />{" "}
                            {/* Medium */}
                            <stop offset="50%" stopColor="#FB923C" />{" "}
                            {/* High */}
                            <stop offset="75%" stopColor="#F97316" />{" "}
                            {/* Very High */}
                            <stop offset="100%" stopColor="#EF4444" />{" "}
                            {/* Critical */}
                          </linearGradient>
                        </defs>

                        {/* Background track */}
                        <path
                          d="M18 2.0845
         a 15.9155 15.9155 0 0 1 0 31.831
         a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#eef2f6"
                          strokeWidth="2.6"
                          strokeLinecap="round"
                        />

                        {/* Foreground arc */}
                        {/* Foreground arc (fills fully at 25) */}
                        <path
                          d="M18 2.0845
     a 15.9155 15.9155 0 0 1 0 31.831
     a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="url(#gaugeGrad)"
                          strokeWidth="2.6"
                          strokeLinecap="round"
                          strokeDasharray="100"
                          strokeDashoffset={
                            100 - (animateNumbers.risk / 25) * 100
                          }
                          style={{
                            transition:
                              "stroke-dashoffset 0.9s ease, stroke 0.6s ease",
                          }}
                        />
                      </svg>

                      {/* Center label */}
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          {
                            (animateNumbers.risk = Math.round(
                              riskOverview.averageRiskScore
                            ))
                          }
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            /25
                          </span>
                        </span>
                        <span className="text-[10px] uppercase text-gray-500 dark:text-gray-400 tracking-wide">
                          Risk Score
                        </span>
                      </div>
                    </div>

                    {/* Right side: Risk Categories */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {/* Low Risk */}
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-6 bg-green-50 text-green-700 rounded flex items-center justify-center font-semibold">
                          {riskOverview?.riskDistribution?.Low || 0}
                        </div>
                        <span className="font-medium text-gray-700 dark:text-gray-200">
                          Low Risk
                        </span>
                      </div>

                      {/* Medium Risk */}
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-6 bg-yellow-50 text-yellow-700 rounded flex items-center justify-center font-semibold">
                          {riskOverview?.riskDistribution?.Medium || 0}
                        </div>
                        <span className="font-medium text-gray-700 dark:text-gray-200">
                          Medium Risk
                        </span>
                      </div>

                      {/* High Risk */}
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-6 bg-orange-50 text-orange-700 rounded flex items-center justify-center font-semibold">
                          {riskOverview?.riskDistribution?.High || 0}
                        </div>
                        <span className="font-medium text-gray-700 dark:text-gray-200">
                          High Risk
                        </span>
                      </div>

                      {/* Very High */}
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-6 bg-red-50 text-red-700 rounded flex items-center justify-center font-semibold">
                          {riskOverview?.riskDistribution?.["Very High"] || 0}
                        </div>
                        <span className="font-medium text-gray-700 dark:text-gray-200">
                          Very High
                        </span>
                      </div>

                      {/* Critical */}
                      <div className="flex items-center gap-3 col-span-2">
                        <div className="w-8 h-6 bg-red-100 text-red-800 rounded flex items-center justify-center font-semibold">
                          {riskOverview?.riskDistribution?.Critical || 0}
                        </div>
                        <span className="font-medium text-gray-700 dark:text-gray-200">
                          Critical
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Upcoming Audits (bottom half) */}
              <motion.div
                initial="hidden"
                animate="show"
                variants={cardAnim}
                custom={5}
                className="rounded-2xl p-4 shadow-sm transition-all hover:shadow-lg duration-300 border border-[#828282] dark:bg-gray-800 bg-white h-full min-h-[260px]"
                // style={{ flex: 1, minHeight: 0 }}
              >
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-3">
                  Upcoming Audits
                </h3>
                <div className="space-y-3">
                  {upcomingAudits.length === 0 && (
                    <div className=" text-gray-500 dark:text-gray-400 text-lg text-center">
                      No upcoming audits in the next{" "}
                      {auditSummary?.days_ahead || 30} days.
                    </div>
                  )}

                  {upcomingAudits.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {a.entity_type === "ROPA" ? a.name : a.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {a.entity_type} • {a.type || a.category}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 flex flex-col justify-between items-end gap-1">
                        <div>
                          {new Date(a.next_review_date).toLocaleDateString(
                            "en-IN"
                          )}
                        </div>

                        <div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              a.days_until_review <= 7
                                ? "bg-red-100 text-red-700"
                                : a.days_until_review <= 15
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {a.days_until_review} days
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Data Mapping */}
          <div className="flex flex-col gap-4 ">
            <motion.div
              initial="hidden"
              animate="show"
              variants={cardAnim}
              custom={2}
              className={`rounded-2xl p-5 shadow-sm transition-all hover:shadow-lg duration-300 border border-[#828282] dark:bg-gray-800 bg-white flex flex-col items-center h-full justify-between`}
            >
              <div className="w-full flex flex-col">
                <div className="flex w-full justify-between items-start mb-4">
                  <p className="text-md font-medium text-gray-700 dark:text-gray-300">
                    Data Mapping
                  </p>
                  <div className="flex flex-col">
                    <h2 className="text-4xl text-right font-extrabold text-gray-900 dark:text-white">
                      {animateNumbers.dataMappings}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      + {thisWeek} this month
                    </p>
                  </div>
                </div>
                <div className="w-full h-full min-h-48">
                  {Array.isArray(dataMapping) && dataMapping.length > 0 && (
                    <GlowingStrokeRadarChart data={dataMapping} />
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              animate="show"
              variants={cardAnim}
              custom={6}
              className="rounded-2xl p-4 shadow-sm transition-all hover:shadow-lg duration-300 border border-[#828282] dark:bg-gray-800 bg-white flex flex-col justify-between h-full"
              // style={{ height: "420px" }}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    Data Transfer Stats
                  </h3>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-lg p-4 bg-indigo-50 ">
                    <div className="text-2xl font-semibold text-indigo-700">
                      {transferStats?.summary?.total || 0}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Total Transfers
                    </div>
                  </div>
                  <div className="rounded-lg p-4 bg-pink-50 ">
                    <div className="text-2xl font-semibold text-pink-700">
                      {transferStats?.byRiskLevel?.High || 0}
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
                {recentTransfers ? (
                  <div className=" text-gray-500 dark:text-gray-400 text-lg text-center">
                    No Recent Transfers
                  </div>
                ) : (
                  <div className="space-y-2 pr-1">
                    {recentTransfers.map((t) => (
                      <div
                        key={t.transfer_id}
                        className="flex justify-between items-center text-sm border-b dark:border-gray-700 border-gray-100 pb-2"
                      >
                        <div className="truncate max-w-[50%] dark:text-gray-200 text-gray-800">
                          {t.region}
                        </div>
                        <div className="text-xs text-gray-500">
                          {t.transfer_type}
                        </div>
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            t.risk === "High"
                              ? "bg-red-100 text-red-700"
                              : t.risk === "Medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {t.risk_level || "Unassessed"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
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
            {activityList.map((activity, index) => (
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

      {/* <Modal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        title="Data Transfer Details"
        size="xl"
      >
        <TransferDetailsModal />
      </Modal> */}
    </>
  );
}
