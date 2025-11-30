import { useState, useEffect } from "react";
import {
  Users,
  Download,
  Clock,
  X,
  Filter,
  Trash2,
  Plus,
  PlusCircle,
} from "lucide-react";
import {
  getReports,
  generateReport,
  scheduleReport,
  downloadReport,
  deleteReport,
} from "../../services/ReportService";
import { useToast } from "../ui/ToastProvider";
import ConfirmationModal from "../ui/ConfirmationModal";

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
  const [isScheduleDownloadOpen, setIsScheduleDownloadOpen] = useState(false);
  const [isScheduleReportOpen, setIsScheduleReportOpen] = useState(false);
  const [selectedReportFormat, setSelectedReportFormat] = useState({});
  const [form, setForm] = useState({
    reportType: "",
    name: "",
    description: "",
    frequency: "daily",
    date: "",
    format: "pdf",
    dateFrom: "",
    dateTo: "",
  });

  const [stats, setStats] = useState({
    generated: 0,
    scheduled: 0,
    pending: 0,
  });
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState({
    search: "",
    type: "",
    format: "",
    status: "",
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    id: null,
    loading: false,
  });

  const { addToast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedStats(
        statsData.map((stat) => ({ ...stat, animatedValue: stat.value }))
      );
    }, 300);

    return () => clearTimeout(timer);
  }, [stats]);

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

  const handleDelete = (id) => {
    setDeleteModal({
      open: true,
      id,
      loading: false,
    });
  };

  const confirmDelete = async () => {
    try {
      setDeleteModal((d) => ({ ...d, loading: true }));

      await deleteReport(deleteModal.id);

      addToast("success", "Report deleted");
      setDeleteModal({ open: false, id: null, loading: false });
      fetchReports();
    } catch (err) {
      addToast("error", "Failed to delete report");
      setDeleteModal({ open: false, id: null, loading: false });
    }
  };

  const handleCreateReport = async () => {
    try {
      await generateReport({
        report_type: form.reportType,
        name: form.name || undefined,
        description: form.description || undefined,
        format: form.format,
        parameters: {
          date_from: form.dateFrom || undefined,
          date_to: form.dateTo || undefined,
        },
      });

      addToast("success", "Report created");
      await fetchReports();
      setIsScheduleReportOpen(false);
    } catch (err) {
      addToast("error", "Failed to create report");
    }
  };

  const statsData = [
    {
      label: "Reports Generated",
      value: stats.generated,
      color: "bg-[#5DEE92]",
      textColor: "text-black",
    },
    {
      label: "Scheduled",
      value: stats.scheduled,
      color: "bg-gray-200 dark:bg-gray-800",
      textColor: "text-gray-700 dark:text-gray-300",
    },
    {
      label: "Pending",
      value: stats.pending,
      color: "bg-gray-200 dark:bg-gray-800",
      textColor: "text-gray-700 dark:text-gray-300",
    },
  ];

  const [animatedStats, setAnimatedStats] = useState(
    statsData.map((stat) => ({ ...stat, animatedValue: 0 }))
  );
  const handleSubmit = async (e) => {
    e.preventDefault();
    await scheduleReport({
      report_type: form.reportType,
      frequency: form.frequency,
      scheduled_at: form.date ? new Date(form.date).toISOString() : undefined,
      format: form.format,
      parameters: {},
    });
    await fetchReports();
    setIsScheduleDownloadOpen(false);
    // setIsScheduleReportOpen(false);
  };

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const fetchReports = async () => {
    try {
      const res = await getReports({
        page: 1,
        limit: 50,
        search: filter.search,
        type: filter.type,
        format: filter.format,
        status: filter.status,
      });

      const { reports } = res.data;
      setReports(reports);

      const generated = reports.filter((r) => r.status === "completed").length;
      const scheduled = reports.filter(
        (r) => r.frequency !== "one_time"
      ).length;
      const pending = reports.filter((r) => r.status !== "completed").length;

      setStats({ generated, scheduled, pending });
    } catch (err) {
      addToast("error", "Failed to load reports");
    }
  };

  const handleDownload = async (id, selectedFormat) => {
    try {
      const res = await downloadReport(id);

      // Detect MIME from server response
      const mimeType =
        res.headers["content-type"] || "application/octet-stream";

      // Convert string → Blob
      const blob = new Blob([res.data], { type: mimeType });

      // Determine file extension (backend format wins)
      const contentDisposition = res.headers["content-disposition"];
      let filename = "report.json";

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) filename = match[1];
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();

      addToast("success", "Report downloaded");
    } catch (err) {
      console.error(err);
      addToast("error", "Download failed");
    }
  };

  return (
    <div className="p-6 min-h-screen">
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
          <PlusCircle size={20} />
          New Report
        </button>
        <button
          onClick={() => setIsScheduleDownloadOpen(true)}
          className="col-span-1 flex items-center justify-center gap-2 bg-[#5DEE92] text-black px-4 py-4 rounded-lg text-xl font-medium hover:bg-green-500 transition cursor-pointer"
        >
          <Clock size={20} />
          Schedule Report Download
        </button>
        <button
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center justify-center gap-2 bg-[#5DEE92] text-black px-4 py-2 rounded-lg text-xl font-medium hover:bg-green-500 transition"
        >
          <Filter size={20} />
          Filter
        </button>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report, index) => (
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
                  {report.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {report.description || "No Description"}
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
                  {report.generated_at
                    ? report.generated_at.split("T")[0]
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  File Size:
                </span>
                <span className="text-gray-900 dark:text-gray-100 font-medium">
                  {report.file_size
                    ? `${(report.file_size / 1024).toFixed(1)} KB`
                    : "—"}
                </span>
              </div>
            </div>

            {/* Download Section */}
            <div className="flex items-center gap-2">
              <select
                value={
                  selectedReportFormat[report.id] || report.format || "pdf"
                }
                onChange={(e) =>
                  setSelectedReportFormat((prev) => ({
                    ...prev,
                    [report.id]: e.target.value,
                  }))
                }
                className="border border-gray-300 rounded-lg px-2 py-2 text-sm dark:bg-gray-700 dark:text-white"
              >
                <option value="pdf">PDF</option>
                <option value="docx">DOCX</option>
                <option value="csv">CSV</option>
                <option value="xlsx">XLSX</option>
              </select>
              <button
                className="flex-1 bg-green-400 hover:bg-green-500 text-black font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-105 active:scale-95"
                onClick={() =>
                  handleDownload(
                    report.id,
                    selectedReportFormat[report.id] || report.format
                  )
                }
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={() => handleDelete(report.id)}
                className="text-red-500 hover:text-red-700 text-sm underline ml-auto cursor-pointer"
              >
                <Trash2 />
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

                <select
                  value={form.reportType}
                  onChange={(e) =>
                    setForm({ ...form, reportType: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 focus:border-green-400"
                >
                  <option value="">Select report type</option>
                  <option value="full_ropa">Full ROPA</option>
                  <option value="departmental_summary">
                    Departmental Summary
                  </option>
                  <option value="third_party_sharing">
                    Third Party Sharing
                  </option>
                  <option value="data_categories">Data Categories</option>
                  <option value="legal_basis">Legal Basis</option>
                  <option value="risk_impact">Risk Impact</option>
                  <option value="change_history">Change History</option>
                  <option value="custom">Custom Report</option>
                </select>
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
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
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

            <h2 className="text-xl font-semibold mb-4">Generate New Report</h2>

            <form onSubmit={handleCreateReport} className="space-y-4">
              {/* Report Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                  Report Name
                </label>
                <input
                  type="text"
                  placeholder="Enter report name"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
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

              <select
                value={form.reportType}
                onChange={(e) =>
                  setForm({ ...form, reportType: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 focus:border-green-400"
              >
                <option value="">Select report type</option>
                <option value="full_ropa">Full ROPA</option>
                <option value="departmental_summary">
                  Departmental Summary
                </option>
                <option value="third_party_sharing">Third Party Sharing</option>
                <option value="data_categories">Data Categories</option>
                <option value="legal_basis">Legal Basis</option>
                <option value="risk_impact">Risk Impact</option>
                <option value="change_history">Change History</option>
                <option value="custom">Custom Report</option>
              </select>

              {/* Report Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                  Report Format
                </label>
                <select
                  onChange={(e) => setForm({ ...form, format: e.target.value })}
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

      {isFilterOpen && (
        <>
          {/* BACKDROP */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={() => setIsFilterOpen(false)}
          />

          {/* SLIDE PANEL */}
          <div
            className="fixed right-0 top-0 h-full w-[350px] bg-white dark:bg-gray-900 shadow-xl z-50
      animate-[slideIn_0.25s_ease-out] p-6 overflow-y-auto"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Filter size={18} /> Filters
              </h2>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>

            {/* BODY */}
            <div className="space-y-5">
              {/* Search */}
              <div>
                <label className="text-sm font-medium block">Search</label>
                <input
                  className="w-full mt-1 border rounded-lg px-3 py-2 text-sm
            bg-gray-50 dark:bg-gray-800 dark:text-gray-200"
                  value={filter.search}
                  onChange={(e) =>
                    setFilter({ ...filter, search: e.target.value })
                  }
                  placeholder="Search reports..."
                />
              </div>

              {/* Report Type */}
              <div>
                <label className="text-sm font-medium block">Report Type</label>
                <select
                  value={filter.type}
                  onChange={(e) =>
                    setFilter({ ...filter, type: e.target.value })
                  }
                  className="w-full mt-1 border rounded-lg px-3 py-2 text-sm
            bg-gray-50 dark:bg-gray-800 dark:text-gray-200"
                >
                  <option value="">All</option>
                  <option value="full_ropa">Full ROPA</option>
                  <option value="departmental_summary">
                    Departmental Summary
                  </option>
                  <option value="third_party_sharing">
                    Third Party Sharing
                  </option>
                  <option value="data_categories">Data Categories</option>
                  <option value="legal_basis">Legal Basis</option>
                  <option value="risk_impact">Risk Impact</option>
                  <option value="change_history">Change History</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              {/* Format */}
              <div>
                <label className="text-sm font-medium block">Format</label>
                <select
                  value={filter.format}
                  onChange={(e) =>
                    setFilter({ ...filter, format: e.target.value })
                  }
                  className="w-full mt-1 border rounded-lg px-3 py-2 text-sm
            bg-gray-50 dark:bg-gray-800 dark:text-gray-200"
                >
                  <option value="">All</option>
                  <option value="pdf">PDF</option>
                  <option value="docx">DOCX</option>
                  <option value="csv">CSV</option>
                  <option value="xlsx">XLSX</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="text-sm font-medium block">Status</label>
                <select
                  value={filter.status}
                  onChange={(e) =>
                    setFilter({ ...filter, status: e.target.value })
                  }
                  className="w-full mt-1 border rounded-lg px-3 py-2 text-sm
            bg-gray-50 dark:bg-gray-800 dark:text-gray-200"
                >
                  <option value="">All</option>
                  <option value="pending">Pending</option>
                  <option value="generating">Generating</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              {/* APPLY BUTTON */}
              <button
                onClick={() => setIsFilterOpen(false)}
                className="w-full bg-[#5DEE92] text-black py-3 rounded-lg font-medium
          hover:bg-green-500 transition cursor-pointer"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </>
      )}

      <ConfirmationModal
        isOpen={deleteModal.open}
        onClose={() =>
          setDeleteModal({ open: false, id: null, loading: false })
        }
        onConfirm={confirmDelete}
        title="Delete Report"
        message="Are you sure you want to delete this report? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        confirmColor="red"
        isLoading={deleteModal.loading}
      />

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
