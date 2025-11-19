import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Expand } from "lucide-react"; // fullscreen icon
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import RoPARecords from "../modules/RoPATable";
import { getRopaStats } from "../../services/DashboardService";

// Register chart.js components
ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

// Chart Options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { mode: "index", intersect: false },
  },
  scales: {
    x: { grid: { display: false } },
    y: { beginAtZero: true },
  },
};

// Animation variants for staggered entrance
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5, ease: "easeOut" },
  }),
};

const RoPA = () => {
  const chartRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [stats, setStats] = useState(null);
  const [year, setYear] = useState("2025");
  const [month, setMonth] = useState("");
  const [chartData, setChartData] = useState(null);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getRopaStats();
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const params = {};
        if (year) params.year = year;
        if (month) params.month = month;

        const res = await getRopaStats(params);

        const data = {
          ...res.data,
          byMonth: res.data.byMonth || [5, 3, 2, 6, 4, 1, 0, 2, 4, 5, 3, 2],
          byDay: res.data.byDay || [1, 3, 2, 4, 1, 0],
        };

        setStats(data);
        buildChartData(data);
      } catch (err) {
        console.error("Failed to fetch chart", err);
      }
    };

    fetchChartData();
  }, [year, month]);

  const buildChartData = (stats) => {
    if (!month) {
      // YEAR VIEW (12 months)
      setChartData({
        labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
        datasets: [
          {
            label: "RoPA per Month",
            data: stats.byMonth || [],
            borderColor: "#5de992",
            backgroundColor: "rgba(93, 233, 146, 0.25)",
            tension: 0.4,
            fill: true,
          },
        ],
      });
    } else {
      // MONTH VIEW (Daily)
      setChartData({
        labels: ["1", "5", "10", "15", "20", "25", "30"],
        datasets: [
          {
            label: `RoPA in ${month}/${year}`,
            data: stats.byDay || [],
            borderColor: "#5de992",
            backgroundColor: "rgba(93, 233, 146, 0.25)",
            tension: 0.4,
            fill: true,
          },
        ],
      });
    }
  };

  if (!stats || !chartData) return <div className="p-10">Loading...</div>;

  // const { total, byCategory, thisMonth, lastMonth } = stats;

  const getRopaThisMonthText = (stats) => {
    if (!stats) return "";

    const diff = stats.thisMonth - stats.lastMonth;

    if (diff > 0) return `+${diff} This month`;
    if (diff < 0) return `${diff} This month`; // diff is negative automatically
    return "No change this month";
  };

  const cat = (c) => stats.byCategory.find((x) => x.category === c)?.count || 0;

  return (
    <div>
      <div className="min-h-screen  dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-500">
        {/* Top Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {/* Left Chart Card */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className={`col-span-2 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300 ${
              isFullscreen
                ? "fixed inset-0 z-50 flex flex-col p-6 bg-white dark:bg-gray-900"
                : ""
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex flex-col gap-4">
                <h2 className="font-medium">Total RoPA</h2>
                <div className="text-4xl font-bold text-[#5de992] mb-4">
                  {stats.total}
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <span className="text-sm text-gray-500 text-right">
                  {getRopaThisMonthText(stats)}
                </span>
                <div className="flex space-x-2 mb-2 items-center">
                  <select
                    className="px-2 py-1 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  >
                    <option>2025</option>
                    <option>2024</option>
                  </select>
                  <select
                    className="px-2 py-1 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                  >
                    <option value="">All Months</option>
                    <option value="01">Jan</option>
                    <option value="02">Feb</option>
                    <option value="03">Mar</option>
                    <option value="04">Apr</option>
                    <option value="05">May</option>
                    <option value="06">Jun</option>
                    <option value="07">Jul</option>
                    <option value="08">Aug</option>
                    <option value="09">Sep</option>
                    <option value="10">Oct</option>
                    <option value="11">Nov</option>
                    <option value="12">Dec</option>
                  </select>
                  {/* Fullscreen Toggle Button */}
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 rounded-lg border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Expand size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 w-full h-[160px] md:h-[300px] lg:h-[240px]">
              <Line ref={chartRef} data={chartData} options={chartOptions} />
            </div>

            {/* Exit Fullscreen Button */}
            {isFullscreen && (
              <button
                onClick={toggleFullscreen}
                className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-lg shadow-lg hover:bg-red-600"
              >
                Exit Fullscreen
              </button>
            )}
          </motion.div>

          {/* Right Side Cards */}
          <div className="col-span-2 grid grid-cols-2 gap-4">
            {[
              {
                title: "Infovoyage",
                value: cat("InfoVoyage"),
                color: "bg-[#5de992] text-black",
              },
              {
                title: "CheckSync",
                value: cat("CheckSync"),
                color: "bg-white dark:bg-gray-800",
              },
              {
                title: "Beam",
                value: cat("Beam"),
                color: "bg-white dark:bg-gray-800",
              },
              {
                title: "OffDoff",
                value: cat("OffDoff"),
                color: "bg-gray-200 dark:bg-gray-700",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                custom={i + 1}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                }}
                className={`${item.color} rounded-xl p-4 shadow-lg flex flex-col gap-4 justify-center transition-all duration-300`}
              >
                <h2 className="text-xl font-medium">{item.title}</h2>
                <div className="text-4xl font-bold">{item.value}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Records Table */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          custom={5}
        >
          <RoPARecords />
        </motion.div>
      </div>
    </div>
  );
};

export default RoPA;
