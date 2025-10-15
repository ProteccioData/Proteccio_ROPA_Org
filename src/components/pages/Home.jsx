import React, { useState, useEffect, useRef } from "react";
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
import { motion } from "framer-motion"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);



const Home = () => {
  const [mounted, setMounted] = useState(false);

  // Animation states
  const [animateNumbers, setAnimateNumbers] = useState({
    ropa: 0,
    assessments: 0,
    transfers: 0,
    compliance: 0,
  });

  // Simulate number counting animation
  useEffect(() => {
    setMounted(true);

    const animateNumber = (target, key, duration = 2000) => {
      const start = 0;
      const increment = target / (duration / 16);
      let current = start;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setAnimateNumbers((prev) => ({
          ...prev,
          [key]: Math.floor(current),
        }));
      }, 16);
    };

    const timeout = setTimeout(() => {
      animateNumber(246, "ropa", 1500);
      animateNumber(18, "assessments", 1000);
      animateNumber(52, "transfers", 1200);
      animateNumber(95, "compliance", 1800);
    }, 300);

    return () => clearTimeout(timeout);
  }, []);

  // Card animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    }),
  };

  const chartData = [
    { label: "InfoVoyage", value: 200, color: "#10B981" },
    { label: "CheckSync", value: 275, color: "#F97316" },
    { label: "Beam", value: 90, color: "#8B5CF6" },
    { label: "OffDurf", value: 187, color: "#1E40AF" },
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
      activity: "DPIA Completed",
      date: "2025-04-01",
      time: "13:01",
      type: "DPIA",
      performedBy: "Admin",
    },
    {
      id: 3,
      activity: "DPIA Completed",
      date: "2025-04-01",
      time: "13:01",
      type: "DPIA",
      performedBy: "Admin",
    },
  ];
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
  const [ropaStatus] = useState(55);
  const ropaStages = { Infovoyage: 350, CheckSync: 450, Beam: 200 };
  const ropaData = {
    labels: [""],
    datasets: [
      {
        label: ">90%",
        data: [ropaStages.Infovoyage],
        backgroundColor: "#10b981",
        borderRadius: { topLeft: 15, bottomLeft: 15 },
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
        borderRadius: { topRight: 15, bottomRight: 15 },
      },
    ],
  };

  const [showTransferModal, setShowTransferModal] = useState(false);

  return (
    <>
      {/* <div className={` min-h-screen transition-colors duration-300 ${theme === "dark" ? 'bg-gray-900' : 'bg-gray-50'}`}> */}
      {/* Top Row Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {/* Total RoPA Records */}
        <div
          className={`
            rounded-2xl p-6 shadow-sm border border-[#828282] transition duration-300 hover:shadow-md hover:-translate-y-1 flex flex-col
          dark:bg-gray-800 bg-white
            transform ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }
          `}
          style={{ transitionDelay: "100ms" }}
        >
          <div className="flex flex-col lg:flex-row lg:gap-8 lg:justify-between lg:items-center mb-4">
            <div className="flex-1">
              <p
                className={`text-md font-medium dark:text-gray-400 text-gray-600
                `}
              >
                Total RoPA Records
              </p>
              <div className="flex items-baseline gap-2 mt-2">
                <h2
                  className={`text-4xl font-bold dark:text-white text-[#5DE992] transition-all duration-1000`}
                >
                  {animateNumbers.ropa}
                </h2>
              </div>
              <p className="text-sm text-gray-500 mt-1">+ 12 This month</p>
            </div>

            {/* Donut Chart */}
            <div className="w-full lg:w-56 h-auto mt-4 lg:mt-0">
              <RoundedPieChart data={chartData} />
            </div>
          </div>
          {/* Legend */}
          <div className="">
            <div className="flex flex-wrap justify-around gap-2 text-xs">
              {chartData.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 transform transition-all duration-500`}
                  style={{ transitionDelay: `${1600 + index * 100}ms` }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="dark:text-gray-300 text-gray-600">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Assessments */}
        <div
          className={`
            rounded-2xl p-6 shadow-sm border transition-all duration-500 hover:shadow-md hover:-translate-y-1
            dark:bg-gray-800 border-gray-700
                bg-white overflow-hidden"
            transform ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }
          `}
          style={{ transitionDelay: "200ms" }}
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
            <div className="flex-1">
              <p
                className={`text-sm font-medium dark:text-gray-400 text-gray-600
                `}
              >
                Assessments
              </p>
              <div className="flex items-center gap-2 mt-2">
                <h2
                  className={`text-4xl font-bold text-green-500 transition-all duration-1000`}
                >
                  {animateNumbers.assessments}
                </h2>
                <p className="text-sm text-gray-500">+ 12 This month</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                className={`text-xs px-2 py-1 rounded border dark:bg-gray-700 border-gray-600 text-black dark:text-gray-200 bg-white border-gray-300"
                `}
              >
                <option>Monthly</option>
              </select>
              <select
                className={`text-xs px-2 py-1 rounded border dark:bg-gray-700 border-gray-600 text-black dark:text-gray-200 bg-white `}
              >
                <option>2025</option>
              </select>
            </div>
          </div>

          {/* Bar Chart */}

          <div className="relative w-full h-[220px] md:h-[240px] lg:h-[260px] overflow-hidden">
            <DottedMultiLineChart />
          </div>
        </div>

        {/* Data Transfers */}
        <div
          className={`
            rounded-2xl flex flex-col gap-4 items-center p-6 shadow-sm border transition-all duration-500 hover:shadow-md hover:-translate-y-1 dark:bg-gray-800 border-gray-700 bg-white transform ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }
          `}
          style={{ transitionDelay: "300ms" }}
        >
          <div className="flex items-center gap-24">
            <p
              className={`text-lg font-medium dark:text-gray-400 text-gray-600`}
            >
              Data Mapping
            </p>
            <div className="flex items-center gap-4 mt-2">
              <h2
                className={`text-4xl font-bold dark:text-white text-gray-900 transition-all duration-1000`}
              >
                {animateNumbers.transfers}
              </h2>
              <p className="text-sm text-gray-500">+ 8 This Week</p>
            </div>
          </div>
          <div className="w-96">
            <GlowingStrokeRadarChart />
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Compliance Score */}
        <div className="bg-white dark:bg-gray-800 border border-[#828282] dark:border-gray-600 rounded-xl shadow-sm p-4 transition-all duration-300 hover:shadow-lg flex flex-col gap-4">
          <div className="flex flex-row justify-between pb-3">
            <div className="flex flex-col">
              <h3 className="text-gray-700 dark:text-gray-300 text-lg font-medium mb-2">
                Compliance Info
              </h3>
              <div className="text-3xl font-bold text-[#1F6B3B] mb-2">
                {ropaStatus}%
              </div>
            </div>
            <div className="flex flex-col">
              <div className="text-right text-sm text-gray-700 dark:text-gray-300 mb-1">
                No. of Reports
              </div>
              <div className="space-y-1 mb-2">
                <div className="flex items-center gap-1 text-xs">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-gray-700 dark:text-gray-300 text-xs">
                    &gt; 90%
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                  <span className="text-gray-700 dark:text-gray-300 text-xs">
                    60% - 90%
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-gray-700 dark:text-gray-300 text-xs">
                    &lt; 60%
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full mt-5 h-6">
            <Bar data={ropaData} options={ropaOptions} />
          </div>
        </div>
        {/* Data Transfer Map */}
        {/* <div
          className={`
            rounded-2xl p-6 shadow-sm border transition-all duration-500 hover:shadow-md hover:-translate-y-1 col-span-2 dark:bg-gray-800 border-gray-700 bg-white 
            transform ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }
          `}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className={`text-lg font-semibold dark:text-white text-gray-900
              `}
            >
              Data Transfer Map
            </h3>
            <button
              className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700`}
            >
              <MoreHorizontal
                className={`w-4 h-4 dark:text-gray-400 text-gray-600`}
              />
            </button>
            
          </div>

        </div> */}
        <div className="rounded-2xl p-6 shadow-sm border transition-all duration-500 hover:shadow-md hover:-translate-y-1 col-span-2 dark:bg-gray-800 border-gray-700 bg-white transform">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold dark:text-white text-gray-900">
              Data Transfer Stats
            </h3>
            <button
              className="px-3 py-1.5 text-sm bg-[#5DE992] hover:bg-[#5DE992]/70 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
              onClick={() => setShowTransferModal(!showTransferModal)}
            >
              <span>View Details</span>
            </button>
          </div>

          <div className="h-auto">
            <NetworkDiagram />
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div
        className={`
          rounded-2xl p-6 shadow-sm border transition-all duration-500
          dark:bg-gray-800 dark:border-gray-700 bg-white border-gray-200
          transform ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }
        `}
      >
        <h3
          className={`text-lg font-semibold mb-6 dark:text-white text-gray-900`}
        >
          Recent Activities
        </h3>

        {/* Table Header */}
        <div
          className={`grid grid-cols-5 gap-4 pb-3 mb-3 border-b text-sm font-medium dark:border-gray-700 dark:text-gray-400 border-gray-200 text-gray-600`}
        >
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
              className={`
                grid grid-cols-5 gap-4 py-3 rounded-lg transition-all duration-500 hover:bg-gray-50 dark:hover:bg-gray-700
                transform ${
                  mounted
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-4"
                }
              `}
              style={{ transitionDelay: `${1800 + index * 100}ms` }}
            >
              <div className={`text-sm dark:text-gray-300 text-gray-900`}>
                {activity.activity}
              </div>
              <div className={`text-sm dark:text-gray-400 text-gray-600`}>
                {activity.date}
              </div>
              <div className={`text-sm dark:text-gray-400 text-gray-600`}>
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
      </div>
      <Modal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        title="Data Transfer Details"
        size="xl"
      >
        <TransferDetailsModal />
      </Modal>
      {/* </div> */}
    </>
  );
};

export default Home;
