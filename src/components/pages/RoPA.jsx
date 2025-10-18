import React, { useRef, useState } from "react";
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

// Register chart.js components
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

// Chart Data
const chartData = {
  labels: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"],
  datasets: [
    {
      label: "RoPA Count",
      data: [12, 20, 15, 25, 18, 30, 22, 28, 26, 32],
      borderColor: "#5de992",
      backgroundColor: "rgba(93, 233, 146, 0.2)",
      tension: 0.4,
      fill: true,
    },
  ],
};

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

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

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
                <div className="text-4xl font-bold text-[#5de992] mb-4">254</div>
              </div>
              <div className="flex flex-col gap-4">
                <span className="text-sm text-gray-500 text-right">
                  +12 This month
                </span>
                <div className="flex space-x-2 mb-2 items-center">
                  <select className="px-2 py-1 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                    <option>Jan</option>
                  </select>
                  <select className="px-2 py-1 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                    <option>2025</option>
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
                value: 54,
                color: "bg-[#5de992] text-black",
              },
              {
                title: "CheckSync",
                value: 20,
                color: "bg-white dark:bg-gray-800",
              },
              { title: "Beam", value: 16, color: "bg-white dark:bg-gray-800" },
              {
                title: "OffDoff",
                value: 7,
                color: "bg-gray-200 dark:bg-gray-700",
              },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                custom={i + 1}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                }}
                className={`${card.color} rounded-xl p-4 shadow-lg flex flex-col gap-4 justify-center transition-all duration-300`}
              >
                <h2 className="text-xl font-medium">{card.title}</h2>
                <div className="text-4xl font-bold">{card.value}</div>
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
