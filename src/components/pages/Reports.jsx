import { useState, useEffect } from "react";
import { Users, Download, Clock, X, Filter } from "lucide-react";

const statsData = [
  {
    label: "Reports Generated",
    value: 24,
    color: "bg-[#5DEE92]",
    textColor: "text-black",
  },
  {
    label: "Scheduled",
    value: 13,
    color: "bg-gray-200 dark:bg-gray-800 dark:border-gray-600",
    textColor: "text-gray-700 dark:text-gray-300",
  },
  {
    label: "Pending",
    value: 3,
    color: "bg-gray-200 dark:bg-gray-800 dark:border-gray-600",
    textColor: "text-gray-700 text-gray-700 dark:text-gray-300",
  },
];

const reportsData = [
  {
    title: "User Activity Report",
    description: "Detailed Analysis of user engagement and activity patterns",
    lastGenerated: "2025-01-14",
    fileSize: "2.4 MB",
  },
  {
    title: "System Health Report",
    description: "Server uptime and infrastructure performance overview",
    lastGenerated: "2025-01-10",
    fileSize: "1.8 MB",
  },
];

export default function ReportsPage() {
  const [animatedStats, setAnimatedStats] = useState(
    statsData.map((stat) => ({ ...stat, animatedValue: 0 }))
  );
  const [isScheduleDownloadOpen, setIsScheduleDownloadOpen] = useState(false);
  const [isScheduleReportOpen, setIsScheduleReportOpen] = useState(false);
  const [selectedReportFormat, setSelectedReportFormat] = useState({});
  const [form, setForm] = useState({
    reportType: "",
    frequency: "daily",
    date: "",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedStats(
        statsData.map((stat) => ({ ...stat, animatedValue: stat.value }))
      );
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const AnimatedCounter = ({ value, duration = 1000 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      let start = 0;
      const increment = value / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }, [value, duration]);

    return count;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Schedule Submitted:", form);
    setIsScheduleDownloadOpen(false);
    setIsScheduleReportOpen(false);
  };

  return (
    <div className="p-6 min-h-screen" >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {animatedStats.map((stat, index) => (
          <div
            key={index}
            className={`${stat.color} ${stat.textColor} text-center p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 animate-fade-in`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="text-3xl font-bold mb-1">
              <AnimatedCounter value={stat.animatedValue} />
            </div>
            <div className="text-sm font-medium opacity-90">{stat.label}</div>
          </div>
        ))}
        <button
          onClick={() => setIsScheduleReportOpen(true)}
          className="col-span-1 flex items-center justify-center gap-2 bg-[#5DEE92] text-black px-4 py-4 rounded-lg text-xl font-medium hover:bg-green-500 transition cursor-pointer"
        >
          <Clock size={20} />
          Schedule Report
        </button>
        <button
          onClick={() => setIsScheduleDownloadOpen(true)}
          className="col-span-1 flex items-center justify-center gap-2 bg-[#5DEE92] text-black px-4 py-4 rounded-lg text-xl font-medium hover:bg-green-500 transition cursor-pointer"
        >
          <Clock size={20} />
          Schedule Report Download
        </button>
        <button className="flex items-center justify-center gap-2 bg-[#5DEE92] text-black px-4 py-2 rounded-lg text-xl font-medium hover:bg-green-500 transition">
          <Filter size={20} />
          Filter
        </button>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportsData.map((report, index) => (
          <div
            key={index}
            className="bg-[#F4F4F4] dark:bg-gray-800 dark:border-gray-600 rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-slide-up"
            style={{ animationDelay: `${(index + 3) * 100}ms` }}
          >
            {/* Header with Icon */}
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {report.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {report.description}
                </p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Last Generated:
                </span>
                <span className="text-gray-900 dark:text-gray-100 font-medium">
                  {report.lastGenerated}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  File Size:
                </span>
                <span className="text-gray-900 dark:text-gray-100 font-medium">
                  {report.fileSize}
                </span>
              </div>
            </div>

            {/* Download Section */}
            <div className="flex items-center gap-2">
              <select
                value={selectedReportFormat[report.title] || "pdf"}
                onChange={(e) =>
                  setSelectedReportFormat((prev) => ({
                    ...prev,
                    [report.title]: e.target.value,
                  }))
                }
                className="border border-gray-300 rounded-lg px-2 py-2 text-sm dark:bg-gray-700 dark:text-white"
              >
                <option value="pdf">PDF</option>
                <option value="docx">DOCX</option>
                <option value="csv">CSV</option>
                <option value="xlsx">XLSX</option>
              </select>
              <button className="flex-1 bg-green-400 hover:bg-green-500 text-black font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-105 active:scale-95">
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Schedule Report Download */}
      {isScheduleDownloadOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[0.5px] flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 dark:text-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            {/* Close */}
            <button
              onClick={() => setIsScheduleDownloadOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 cursor-pointer"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-semibold mb-4">
              Schedule Report Download
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Report Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                  Report Type
                </label>
                <input
                  type="text"
                  placeholder="Enter report name"
                  value={form.reportType}
                  onChange={(e) =>
                    setForm({ ...form, reportType: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 focus:border-green-400"
                />
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                  Frequency
                </label>
                <select
                  value={form.frequency}
                  onChange={(e) =>
                    setForm({ ...form, frequency: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 focus:border-green-400"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 focus:border-green-400"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-[#5DEE92] hover:bg-green-500 text-black font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
              >
                <Clock size={18} />
                Confirm Schedule
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Schedule Report */}
      {isScheduleReportOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[0.5px] flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 dark:text-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            {/* Close */}
            <button
              onClick={() => setIsScheduleReportOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 cursor-pointer"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-semibold mb-4">Schedule Report</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Report Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                  Report Name
                </label>
                <input
                  type="text"
                  placeholder="Enter report name"
                  value={form.reportType}
                  onChange={(e) =>
                    setForm({ ...form, reportType: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 focus:border-green-400"
                />
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                  Frequency
                </label>
                <select
                  value={form.frequency}
                  onChange={(e) =>
                    setForm({ ...form, frequency: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 focus:border-green-400"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 focus:border-green-400"
                />
              </div>

              {/* Report Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                  Report Format
                </label>
                <select
                  onChange={(e) =>
                    setForm({ ...form, format: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 focus:border-green-400"
                >
                  <option value="pdf">PDF</option>
                  <option value="docx">DOCX</option>
                  <option value="csv">CSV</option>
                  <option value="xlsx">XLSX</option>
                </select>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-[#5DEE92] hover:bg-green-500 text-black font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
              >
                <Clock size={18} />
                Confirm Schedule
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
