import React, { useState, useEffect, useRef } from "react";
import { MoreHorizontal, ChevronDown } from "lucide-react";
import useTheme from "../hooks/useTheme";
import { RoundedPieChart } from "../ui/rounded-pie-chart";

const Home = () => {
  const [mounted, setMounted] = useState(false);
  const chartRef = useRef(null);
  const progressRef = useRef(null);
  const cardsRef = useRef([]);
  const activitiesRef = useRef(null);
  const { theme } = useTheme();

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

  const barData = [
    { month: "Jan", value: 35 },
    { month: "Feb", value: 45 },
    { month: "Mar", value: 30 },
    { month: "Apr", value: 50 },
    { month: "May", value: 40 },
    { month: "Jun", value: 45 },
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

  return (
    <>
      {/* <div className={` min-h-screen transition-colors duration-300 ${theme === "dark" ? 'bg-gray-900' : 'bg-gray-50'}`}> */}
      {/* Top Row Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Total RoPA Records */}
        <div
          className={`
            rounded-2xl p-6 shadow-sm border border-[#828282] transition-all duration-500 hover:shadow-md hover:-translate-y-1
            ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }
            transform ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }
          `}
          style={{ transitionDelay: "100ms" }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p
                className={`text-sm font-medium ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Total RoPA Records
              </p>
              <div className="flex items-baseline gap-2 mt-2">
                <h2
                  className={`text-4xl font-bold ${
                    theme === "dark" ? "text-white" : "text-[#5DE992]"
                  } transition-all duration-1000`}
                >
                  {animateNumbers.ropa}
                </h2>
              </div>
              <p className="text-sm text-gray-500 mt-1">+ 12 This month</p>
            </div>

            {/* Donut Chart */}
            <div className="w-48 h-auto">
              <RoundedPieChart data={chartData} />
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-2 text-xs">
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
                <span
                  className={
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Assessments */}
        <div
          className={`
            rounded-2xl p-6 shadow-sm border transition-all duration-500 hover:shadow-md hover:-translate-y-1
            ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }
            transform ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }
          `}
          style={{ transitionDelay: "200ms" }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p
                className={`text-sm font-medium ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
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
                className={`text-xs px-2 py-1 rounded border ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-300"
                    : "bg-white border-gray-300"
                }`}
              >
                <option>Jan</option>
              </select>
              <select
                className={`text-xs px-2 py-1 rounded border ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-300"
                    : "bg-white border-gray-300"
                }`}
              >
                <option>2025</option>
              </select>
              <button
                className={`p-1 rounded hover:bg-gray-100 ${
                  theme === "dark" ? "hover:bg-gray-700" : ""
                }`}
              >
                <MoreHorizontal
                  className={`w-4 h-4 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end justify-between h-24 gap-1">
            {barData.map((bar, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className="w-full flex items-end h-16">
                  <div
                    className="w-full bg-green-500 rounded-t transition-all duration-1000 ease-out"
                    style={{
                      height: mounted ? `${bar.value}%` : "0%",
                      transitionDelay: `${1000 + index * 100}ms`,
                    }}
                  />
                </div>
                <span
                  className={`text-xs mt-1 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {bar.month}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Data Transfers */}
        <div
          className={`
            rounded-2xl p-6 shadow-sm border transition-all duration-500 hover:shadow-md hover:-translate-y-1
            ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }
            transform ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }
          `}
          style={{ transitionDelay: "300ms" }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p
                className={`text-sm font-medium ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Data Transfers
              </p>
              <div className="flex items-center gap-2 mt-2">
                <h2
                  className={`text-4xl font-bold ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  } transition-all duration-1000`}
                >
                  {animateNumbers.transfers}
                </h2>
                <p className="text-sm text-gray-500">+ 8 This Week</p>
              </div>
            </div>
          </div>

          {/* Area Chart Placeholder */}
          <div className="h-24 relative">
            <svg className="w-full h-full" viewBox="0 0 200 60">
              <defs>
                <linearGradient
                  id="areaGradient"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#F97316" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M10,45 Q50,25 90,35 T170,20 L170,55 L10,55 Z"
                fill="url(#areaGradient)"
                className="transition-all duration-1500 ease-out"
                style={{
                  opacity: mounted ? 1 : 0,
                  transitionDelay: "1200ms",
                }}
              />
              <path
                d="M10,45 Q50,25 90,35 T170,20"
                fill="none"
                stroke="#F97316"
                strokeWidth="2"
                className="transition-all duration-1500 ease-out"
                style={{
                  strokeDasharray: "300",
                  strokeDashoffset: mounted ? "0" : "300",
                  transitionDelay: "1000ms",
                }}
              />
            </svg>

            {/* Month labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-400 px-2">
              {["January", "February", "March", "April", "May", "June"].map(
                (month, index) => (
                  <span
                    key={index}
                    className={`transform transition-all duration-500`}
                    style={{ transitionDelay: `${1400 + index * 50}ms` }}
                  >
                    {month.slice(0, 3)}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Compliance Score */}
        <div
          className={`
            rounded-2xl p-6 shadow-sm border transition-all duration-500 hover:shadow-md hover:-translate-y-1
            ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }
            transform ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }
          `}
          style={{ transitionDelay: "400ms" }}
        >
          <h3
            className={`text-lg font-semibold mb-2 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Compliance Score
          </h3>
          <div className="flex items-baseline gap-2 mb-2">
            <h2
              className={`text-4xl font-bold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              } transition-all duration-1000`}
            >
              {animateNumbers.compliance}%
            </h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">+ 2% improved</p>

          {/* Progress Bar */}
          <div
            className={`w-full h-3 rounded-full mb-4 ${
              theme === "dark" ? "bg-gray-700" : "bg-gray-200"
            }`}
          >
            <div
              className="h-3 rounded-full transition-all duration-1500 ease-out"
              style={{
                width: mounted ? "95%" : "0%",
                background:
                  "linear-gradient(to right, #10B981 0%, #10B981 70%, #F59E0B 70%, #F59E0B 85%, #EF4444 85%, #EF4444 100%)",
                transitionDelay: "1500ms",
              }}
            />
          </div>

          {/* Legend */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span
                  className={
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }
                >
                  {"> 90 %"}
                </span>
              </div>
              <span
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                No. of Reports
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span
                className={theme === "dark" ? "text-gray-300" : "text-gray-600"}
              >
                60 % - 90 %
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span
                className={theme === "dark" ? "text-gray-300" : "text-gray-600"}
              >
                {"< 60 %"}
              </span>
            </div>
          </div>
        </div>

        {/* Data Transfer Map */}
        <div
          className={`
            rounded-2xl p-6 shadow-sm border transition-all duration-500 hover:shadow-md hover:-translate-y-1
            ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }
            transform ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }
          `}
          style={{ transitionDelay: "500ms" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className={`text-lg font-semibold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Data Transfer Map
            </h3>
            <button
              className={`p-1 rounded hover:bg-gray-100 ${
                theme === "dark" ? "hover:bg-gray-700" : ""
              }`}
            >
              <MoreHorizontal
                className={`w-4 h-4 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              />
            </button>
          </div>
          <div
            className={`w-full h-32 rounded-lg flex items-center justify-center ${
              theme === "dark" ? "bg-gray-700" : "bg-gray-200"
            }`}
          >
            <span
              className={`text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Map Placeholder
            </span>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div
        className={`
          rounded-2xl p-6 shadow-sm border transition-all duration-500
          ${
            theme === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }
          transform ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }
        `}
        style={{ transitionDelay: "600ms" }}
      >
        <h3
          className={`text-lg font-semibold mb-6 ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          Recent Activities
        </h3>

        {/* Table Header */}
        <div
          className={`grid grid-cols-5 gap-4 pb-3 mb-3 border-b text-sm font-medium ${
            theme === "dark"
              ? "border-gray-700 text-gray-400"
              : "border-gray-200 text-gray-600"
          }`}
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
                grid grid-cols-5 gap-4 py-3 rounded-lg transition-all duration-500 hover:bg-gray-50
                ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-50"}
                transform ${
                  mounted
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-4"
                }
              `}
              style={{ transitionDelay: `${1800 + index * 100}ms` }}
            >
              <div
                className={`text-sm ${
                  theme === "dark" ? "text-gray-300" : "text-gray-900"
                }`}
              >
                {activity.activity}
              </div>
              <div
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {activity.date}
              </div>
              <div
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
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
      {/* </div> */}
    </>
  );
};

export default Home;
