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
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import * as XLSX from "xlsx";
import {
  Document as DocxDocument,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
} from "docx";
import {
  getReports,
  generateReport,
  scheduleReport,
  downloadReport,
  deleteReport,
} from "../../services/ReportService";
import { useToast } from "../ui/ToastProvider";
import ConfirmationModal from "../ui/ConfirmationModal";
import { useTranslation } from "react-i18next";
import { addTranslationNamespace } from "../../i18n/config";

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString() : "—";

const safeArray = (value) => (Array.isArray(value) ? value : []);

const getFilenameFromDisposition = (contentDisposition, fallback) => {
  if (!contentDisposition) return fallback;
  const match = contentDisposition.match(/filename="(.+)"/);
  return match ? match[1] : fallback;
};

const toFilename = (value = "report") =>
  value.toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "") ||
  "report";

const reportPdfStyles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#f8fafc",
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    color: "#0f172a",
    fontWeight: 700,
  },
  subtitle: {
    fontSize: 10,
    color: "#475569",
    marginTop: 4,
  },
  metaRow: {
    flexDirection: "row",
    marginBottom: 14,
  },
  metaCard: {
    flex: 1,
    backgroundColor: "#eef2ff",
    padding: 10,
    borderRadius: 8,
    borderColor: "#e2e8f0",
    borderWidth: 1,
  },
  metaCardSpacer: {
    marginRight: 10,
  },
  metaLabel: {
    fontSize: 9,
    color: "#475569",
  },
  metaValue: {
    fontSize: 12,
    color: "#111827",
    fontWeight: 700,
    marginTop: 2,
  },
  section: {
    marginTop: 6,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    color: "#0f172a",
    fontWeight: 700,
  },
  sectionHint: {
    fontSize: 9,
    color: "#64748b",
    marginTop: 2,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderColor: "#e2e8f0",
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "#0f172a",
  },
  cardSub: {
    fontSize: 9,
    color: "#475569",
    marginTop: 2,
  },
  pill: {
    backgroundColor: "#e2e8f0",
    color: "#0f172a",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    fontSize: 8,
    fontWeight: 700,
  },
  fieldRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  fieldLabel: {
    width: 110,
    color: "#475569",
    fontWeight: 600,
  },
  fieldValue: {
    flex: 1,
    color: "#0f172a",
  },
  tagList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  tag: {
    backgroundColor: "#dcfce7",
    color: "#166534",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 999,
    fontSize: 8,
    fontWeight: 600,
    marginRight: 4,
    marginBottom: 4,
  },
  smallPill: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 999,
    fontSize: 8,
    fontWeight: 600,
    marginRight: 4,
    marginBottom: 4,
  },
});

const buildReportPdf = async (payload = {}) => {
  const records = safeArray(payload.records);

  const doc = (
    <Document>
      <Page size="A4" style={reportPdfStyles.page} wrap>
        <View style={reportPdfStyles.header}>
          <Text style={reportPdfStyles.title}>
            {payload.title || "Report"}
          </Text>
          <Text style={reportPdfStyles.subtitle}>
            Generated {formatDate(payload.generated_at)} ·{" "}
            {records.length} records
          </Text>
        </View>

        <View style={reportPdfStyles.metaRow}>
          <View style={[reportPdfStyles.metaCard, reportPdfStyles.metaCardSpacer]}>
            <Text style={reportPdfStyles.metaLabel}>Total Records</Text>
            <Text style={reportPdfStyles.metaValue}>
              {payload.total_records ?? records.length}
            </Text>
          </View>
          <View style={reportPdfStyles.metaCard}>
            <Text style={reportPdfStyles.metaLabel}>Report ID</Text>
            <Text style={reportPdfStyles.metaValue}>
              {payload.id || "—"}
            </Text>
          </View>
        </View>

        <View style={reportPdfStyles.section}>
          <Text style={reportPdfStyles.sectionTitle}>Overview</Text>
          <Text style={reportPdfStyles.sectionHint}>
            Snapshot of processing activities and their risk profile.
          </Text>
        </View>

        {records.map((record, idx) => (
          <View key={record.id || idx} style={reportPdfStyles.card} wrap={false}>
            <View style={reportPdfStyles.cardHeader}>
              <View>
                <Text style={reportPdfStyles.cardTitle}>
                  {record.name || "Untitled Activity"}
                </Text>
                <Text style={reportPdfStyles.cardSub}>
                  {record.description || "No description provided"}
                </Text>
              </View>
              <Text style={reportPdfStyles.pill}>
                {record.status ? record.status.toUpperCase() : "N/A"}
              </Text>
            </View>

            <View style={reportPdfStyles.fieldRow}>
              <Text style={reportPdfStyles.fieldLabel}>ROPA ID</Text>
              <Text style={reportPdfStyles.fieldValue}>
                {record.ropa_id || "—"}
              </Text>
            </View>

            <View style={reportPdfStyles.fieldRow}>
              <Text style={reportPdfStyles.fieldLabel}>Category</Text>
              <Text style={reportPdfStyles.fieldValue}>
                {record.category || "—"}
              </Text>
            </View>

            <View style={reportPdfStyles.fieldRow}>
              <Text style={reportPdfStyles.fieldLabel}>Flow Stage</Text>
              <Text style={reportPdfStyles.fieldValue}>
                {record.flow_stage || "—"}
              </Text>
            </View>

            <View style={reportPdfStyles.fieldRow}>
              <Text style={reportPdfStyles.fieldLabel}>Completion</Text>
              <Text style={reportPdfStyles.fieldValue}>
                {record.completion_percentage != null
                  ? `${record.completion_percentage}%`
                  : "—"}
              </Text>
            </View>

            <View style={reportPdfStyles.fieldRow}>
              <Text style={reportPdfStyles.fieldLabel}>Risk</Text>
              <Text style={reportPdfStyles.fieldValue}>
                {record.risk_category
                  ? `${record.risk_category} (${record.risk_score ?? "—"})`
                  : record.risk_score ?? "—"}
              </Text>
            </View>

            <View style={reportPdfStyles.fieldRow}>
              <Text style={reportPdfStyles.fieldLabel}>Retention</Text>
              <Text style={reportPdfStyles.fieldValue}>
                {record.retention_period || "—"}
              </Text>
            </View>

            <View style={reportPdfStyles.fieldRow}>
              <Text style={reportPdfStyles.fieldLabel}>Legal Basis</Text>
              <View style={reportPdfStyles.fieldValue}>
                <View style={reportPdfStyles.tagList}>
                  {safeArray(record.legal_basis).length ? (
                    safeArray(record.legal_basis).map((item, i) => (
                      <Text key={`legal-${i}`} style={reportPdfStyles.tag}>
                        {item}
                      </Text>
                    ))
                  ) : (
                    <Text style={reportPdfStyles.fieldValue}>—</Text>
                  )}
                </View>
              </View>
            </View>

            <View style={reportPdfStyles.fieldRow}>
              <Text style={reportPdfStyles.fieldLabel}>Purposes</Text>
              <View style={reportPdfStyles.fieldValue}>
                <View style={reportPdfStyles.tagList}>
                  {safeArray(record.processing_purposes).length ? (
                    safeArray(record.processing_purposes).map((item, i) => (
                      <Text key={`purpose-${i}`} style={reportPdfStyles.tag}>
                        {item}
                      </Text>
                    ))
                  ) : (
                    <Text style={reportPdfStyles.fieldValue}>—</Text>
                  )}
                </View>
              </View>
            </View>

            <View style={reportPdfStyles.fieldRow}>
              <Text style={reportPdfStyles.fieldLabel}>Data Categories</Text>
              <View style={reportPdfStyles.fieldValue}>
                <View style={reportPdfStyles.tagList}>
                  {safeArray(record.data_categories).length ? (
                    safeArray(record.data_categories).map((item, i) => (
                      <Text key={`data-${i}`} style={reportPdfStyles.tag}>
                        {item}
                      </Text>
                    ))
                  ) : (
                    <Text style={reportPdfStyles.fieldValue}>—</Text>
                  )}
                </View>
              </View>
            </View>

            <View style={reportPdfStyles.fieldRow}>
              <Text style={reportPdfStyles.fieldLabel}>Data Subjects</Text>
              <View style={reportPdfStyles.fieldValue}>
                <View style={reportPdfStyles.tagList}>
                  {safeArray(record.data_subjects).length ? (
                    safeArray(record.data_subjects).map((item, i) => (
                      <Text key={`subject-${i}`} style={reportPdfStyles.tag}>
                        {item}
                      </Text>
                    ))
                  ) : (
                    <Text style={reportPdfStyles.fieldValue}>—</Text>
                  )}
                </View>
              </View>
            </View>

            <View style={reportPdfStyles.fieldRow}>
              <Text style={reportPdfStyles.fieldLabel}>Security Measures</Text>
              <View style={reportPdfStyles.fieldValue}>
                <View style={reportPdfStyles.tagList}>
                  {safeArray(record.security_measures).length ? (
                    safeArray(record.security_measures).map((item, i) => (
                      <Text key={`sec-${i}`} style={reportPdfStyles.smallPill}>
                        {item}
                      </Text>
                    ))
                  ) : (
                    <Text style={reportPdfStyles.fieldValue}>—</Text>
                  )}
                </View>
              </View>
            </View>
          </View>
        ))}
      </Page>
    </Document>
  );

  const blob = await pdf(doc).toBlob();
  return {
    blob,
    filename: `${toFilename(payload.title || "report")}.pdf`,
  };
};

// Flatten record for spreadsheet formats (CSV/XLSX)
const flattenRecord = (record) => {
  const flatten = (obj, prefix = "") => {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}_${key}` : key;
      if (value === null || value === undefined) {
        result[newKey] = "";
      } else if (Array.isArray(value)) {
        result[newKey] = value.length > 0 ? value.join("; ") : "";
      } else if (typeof value === "object" && value !== null) {
        // Handle nested objects (e.g., creator)
        if (value.full_name || value.email) {
          result[`${newKey}_name`] = value.full_name || "";
          result[`${newKey}_email`] = value.email || "";
        } else {
          Object.assign(result, flatten(value, newKey));
        }
      } else {
        result[newKey] = String(value);
      }
    }
    return result;
  };
  return flatten(record);
};

// Build CSV from JSON payload
const buildReportCsv = (payload = {}) => {
  const records = safeArray(payload.records);
  if (records.length === 0) {
    const csv = `Report: ${payload.title || "Report"}\nGenerated: ${formatDate(payload.generated_at)}\nTotal Records: ${payload.total_records || 0}\n\nNo records found.`;
    return {
      blob: new Blob([csv], { type: "text/csv;charset=utf-8;" }),
      filename: `${toFilename(payload.title || "report")}.csv`,
    };
  }

  const flattened = records.map(flattenRecord);
  const headers = Object.keys(flattened[0]);
  
  const csvRows = [
    `Report: ${payload.title || "Report"}`,
    `Generated: ${formatDate(payload.generated_at)}`,
    `Total Records: ${payload.total_records || records.length}`,
    "",
    headers.join(","),
    ...flattened.map((row) =>
      headers
        .map((h) => {
          const val = row[h] || "";
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          if (val.includes(",") || val.includes('"') || val.includes("\n")) {
            return `"${String(val).replace(/"/g, '""')}"`;
          }
          return val;
        })
        .join(",")
    ),
  ];

  const csv = csvRows.join("\n");
  return {
    blob: new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    filename: `${toFilename(payload.title || "report")}.csv`,
  };
};

// Build XLSX from JSON payload
const buildReportXlsx = (payload = {}) => {
  const records = safeArray(payload.records);
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Summary sheet
  const summaryData = [
    ["Report", payload.title || "Report"],
    ["Generated", formatDate(payload.generated_at)],
    ["Total Records", payload.total_records || records.length],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");
  
  // Data sheet
  if (records.length > 0) {
    const flattened = records.map(flattenRecord);
    const wsData = XLSX.utils.json_to_sheet(flattened);
    XLSX.utils.book_append_sheet(wb, wsData, "Records");
  }
  
  // Generate buffer
  const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  return {
    blob: new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    filename: `${toFilename(payload.title || "report")}.xlsx`,
  };
};

// Build DOCX from JSON payload
const buildReportDocx = async (payload = {}) => {
  const records = safeArray(payload.records);
  
  const children = [
    new Paragraph({
      text: payload.title || "Report",
      heading: HeadingLevel.TITLE,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Generated: ${formatDate(payload.generated_at)}`,
          size: 22,
        }),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Total Records: ${payload.total_records || records.length}`,
          size: 22,
        }),
      ],
      spacing: { after: 400 },
    }),
  ];

  if (records.length === 0) {
    children.push(
      new Paragraph({
        text: "No records found.",
        spacing: { after: 200 },
      })
    );
  } else {
    records.forEach((record, idx) => {
      // Record header
      children.push(
        new Paragraph({
          text: `${idx + 1}. ${record.name || "Untitled Activity"}`,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 100 },
        })
      );

      if (record.description) {
        children.push(
          new Paragraph({
            text: record.description,
            spacing: { after: 200 },
          })
        );
      }

      // Create table for record data
      const tableRows = [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph("Field")],
              width: { size: 30, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph("Value")],
              width: { size: 70, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
      ];

      const addRow = (label, value) => {
        if (value !== null && value !== undefined && value !== "") {
          const displayValue = Array.isArray(value)
            ? value.join(", ")
            : String(value);
          tableRows.push(
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph(label)],
                }),
                new TableCell({
                  children: [new Paragraph(displayValue)],
                }),
              ],
            })
          );
        }
      };

      addRow("ROPA ID", record.ropa_id);
      addRow("Status", record.status);
      addRow("Category", record.category);
      addRow("Flow Stage", record.flow_stage);
      addRow("Completion", record.completion_percentage ? `${record.completion_percentage}%` : null);
      addRow("Risk Category", record.risk_category);
      addRow("Risk Score", record.risk_score);
      addRow("Retention Period", record.retention_period);
      addRow("Legal Basis", record.legal_basis);
      addRow("Processing Purposes", record.processing_purposes);
      addRow("Data Categories", record.data_categories);
      addRow("Data Subjects", record.data_subjects);
      addRow("Security Measures", record.security_measures);
      if (record.creator) {
        addRow("Created By", `${record.creator.full_name || ""} (${record.creator.email || ""})`);
      }

      children.push(
        new Table({
          rows: tableRows,
          width: { size: 100, type: WidthType.PERCENTAGE },
        })
      );

      children.push(
        new Paragraph({
          spacing: { after: 400 },
        })
      );
    });
  }

  const doc = new DocxDocument({
    sections: [
      {
        children,
      },
    ],
  });

  const buffer = await Packer.toBlob(doc);
  return {
    blob: buffer,
    filename: `${toFilename(payload.title || "report")}.docx`,
  };
};

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
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([
      addTranslationNamespace("en" , "pages" , "Reports"),
      addTranslationNamespace("hindi" , "pages" , "Reports"),
      addTranslationNamespace("sanskrit" , "pages" , "Reports"),
      addTranslationNamespace("telugu" , "pages" , "Reports"),
    ]).then(() => setReady(true))
  }, [])

  const { t } = useTranslation("pages" , {keyPrefix:"Reports"})

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
      label: `${t("reports_generated")}`,
      value: stats.generated,
      color: "bg-[#5DEE92]",
      textColor: "text-black",
    },
    {
      label: `${t("scheduled")}`,
      value: stats.scheduled,
      color: "bg-gray-200 dark:bg-gray-800",
      textColor: "text-gray-700 dark:text-gray-300",
    },
    {
      label: `${t("pending")}`,
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

  const triggerDownload = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDownload = async (id, selectedFormat) => {
    try {
      // Backend returns JSON for all formats, so we fetch JSON and convert client-side
      const res = await downloadReport(id, {
        format: selectedFormat,
        responseType: "json",
      });

      const payload = res.data;
      let blob, filename;

      switch (selectedFormat) {
        case "pdf":
          const pdfResult = await buildReportPdf(payload);
          blob = pdfResult.blob;
          filename = pdfResult.filename;
          break;
        case "csv":
          const csvResult = buildReportCsv(payload);
          blob = csvResult.blob;
          filename = csvResult.filename;
          break;
        case "xlsx":
          const xlsxResult = buildReportXlsx(payload);
          blob = xlsxResult.blob;
          filename = xlsxResult.filename;
          break;
        case "docx":
          const docxResult = await buildReportDocx(payload);
          blob = docxResult.blob;
          filename = docxResult.filename;
          break;
        default:
          // Fallback: try to download as blob if format not recognized
          const fallbackRes = await downloadReport(id, {
            format: selectedFormat,
            responseType: "blob",
          });
          const mimeType =
            fallbackRes.headers["content-type"] || "application/octet-stream";
          blob = new Blob([fallbackRes.data], { type: mimeType });
          filename =
            getFilenameFromDisposition(
              fallbackRes.headers["content-disposition"],
              `report.${selectedFormat || "bin"}`
            ) || `report.${selectedFormat || "bin"}`;
      }

      triggerDownload(blob, filename);
      addToast("success", `${selectedFormat.toUpperCase()} report downloaded`);
    } catch (err) {
      console.error(err);
      addToast("error", "Download failed");
    }
  };

  if (!ready) return <div> Loading.... </div>

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
          {t("new_report")}
        </button>
        <button
          onClick={() => setIsScheduleDownloadOpen(true)}
          className="col-span-1 flex items-center justify-center gap-2 bg-[#5DEE92] text-black px-4 py-4 rounded-lg text-xl font-medium hover:bg-green-500 transition cursor-pointer"
        >
          <Clock size={20} />
          {t("schedule_report_download")}
        </button>
        <button
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center justify-center gap-2 bg-[#5DEE92] text-black px-4 py-2 rounded-lg text-xl font-medium hover:bg-green-500 transition"
        >
          <Filter size={20} />
          {t("filter")}
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
                  {t("last_generated")}
                </span>
                <span className="text-gray-900 dark:text-gray-100 font-medium">
                  {report.generated_at
                    ? report.generated_at.split("T")[0]
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  {t("file_size")}
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
                {t("download")}
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
              {t("schedule_report_download")}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Report Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                  {t("report_type")}
                </label>

                <select
                  value={form.reportType}
                  onChange={(e) =>
                    setForm({ ...form, reportType: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 focus:border-green-400"
                >
                  <option value="">{t("select_report_type")}</option>
                  <option value="full_ropa">{t("full_ropa")}</option>
                  <option value="departmental_summary">
                    {t("departmental_summary")}
                  </option>
                  <option value="third_party_sharing">
                    {t("third_party_sharing")}
                  </option>
                  <option value="data_categories">{t("data_categories")}</option>
                  <option value="legal_basis">{t("legal_basis")}</option>
                  <option value="risk_impact">{t("risk_impact")}</option>
                  <option value="change_history">{t("change_history")}</option>
                  <option value="custom">{t("custom_report")}</option>
                </select>
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                  {t("frequency")}
                </label>
                <select
                  value={form.frequency}
                  onChange={(e) =>
                    setForm({ ...form, frequency: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 focus:border-green-400"
                >
                  <option value="daily">{t("daily")}</option>
                  <option value="weekly">{t("weekly")}</option>
                  <option value="monthly">{t("monthly")}</option>
                  <option value="quarterly">{t("quarterly")}</option>
                  <option value="yearly">{t("yearly")}</option>
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                  {t("start_date")}
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
                {t("confirm_schedule")}
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

            <h2 className="text-xl font-semibold mb-4">{t("generate_new_report")}</h2>

            <form onSubmit={handleCreateReport} className="space-y-4">
              {/* Report Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                  {t("report_name")}
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
                  {t("frequency")}
                </label>
                <select
                  value={form.frequency}
                  onChange={(e) =>
                    setForm({ ...form, frequency: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 focus:border-green-400"
                >
                  <option value="daily">{t("daily")}</option>
                  <option value="weekly">{t("weekly")}</option>
                  <option value="monthly">{t("monthly")}</option>
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                  {t("start_date")}
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
                <option value="">{t("select_report_type")}</option>
                <option value="full_ropa">{t("full_ropa")}</option>
                  <option value="departmental_summary">
                    {t("departmental_summary")}
                  </option>
                  <option value="third_party_sharing">
                    {t("third_party_sharing")}
                  </option>
                  <option value="data_categories">{t("data_categories")}</option>
                  <option value="legal_basis">{t("legal_basis")}</option>
                  <option value="risk_impact">{t("risk_impact")}</option>
                  <option value="change_history">{t("change_history")}</option>
                  <option value="custom">{t("custom_report")}</option>
              </select>

              {/* Report Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                  {t("report_type")}
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
                {t("confirm_schedule")}
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
                <Filter size={18} /> {t("filters")}
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
                <label className="text-sm font-medium block">{t("search")}</label>
                <input
                  className="w-full mt-1 border rounded-lg px-3 py-2 text-sm
            bg-gray-50 dark:bg-gray-800 dark:text-gray-200"
                  value={filter.search}
                  onChange={(e) =>
                    setFilter({ ...filter, search: e.target.value })
                  }
                  placeholder={t("search_reports")}
                />
              </div>

              {/* Report Type */}
              <div>
                <label className="text-sm font-medium block">{t("report_type")}</label>
                <select
                  value={filter.type}
                  onChange={(e) =>
                    setFilter({ ...filter, type: e.target.value })
                  }
                  className="w-full mt-1 border rounded-lg px-3 py-2 text-sm
            bg-gray-50 dark:bg-gray-800 dark:text-gray-200"
                >
                  <option value="">{t("all")}</option>
                  <option value="full_ropa">{t("full_ropa")}</option>
                  <option value="departmental_summary">
                    {t("departmental_summary")}
                  </option>
                  <option value="third_party_sharing">
                    {t("third_party_sharing")}
                  </option>
                  <option value="data_categories">{t("data_categories")}</option>
                  <option value="legal_basis">{t("legal_basis")}</option>
                  <option value="risk_impact">{t("risk_impact")}</option>
                  <option value="change_history">{t("change_history")}</option>
                  <option value="custom">{t("custom_report")}</option>
                </select>
              </div>

              {/* Format */}
              <div>
                <label className="text-sm font-medium block">{t("format")}</label>
                <select
                  value={filter.format}
                  onChange={(e) =>
                    setFilter({ ...filter, format: e.target.value })
                  }
                  className="w-full mt-1 border rounded-lg px-3 py-2 text-sm
            bg-gray-50 dark:bg-gray-800 dark:text-gray-200"
                >
                  <option value="">{t("all")}</option>
                  <option value="pdf">PDF</option>
                  <option value="docx">DOCX</option>
                  <option value="csv">CSV</option>
                  <option value="xlsx">XLSX</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="text-sm font-medium block">{t("status")}</label>
                <select
                  value={filter.status}
                  onChange={(e) =>
                    setFilter({ ...filter, status: e.target.value })
                  }
                  className="w-full mt-1 border rounded-lg px-3 py-2 text-sm
            bg-gray-50 dark:bg-gray-800 dark:text-gray-200"
                >
                  <option value="">{t("all")}</option>
                  <option value="pending">{t("pending")}</option>
                  <option value="generating">{t("generating")}</option>
                  <option value="completed">{t("completed")}</option>
                  <option value="failed">{t("failed")}</option>
                </select>
              </div>

              {/* APPLY BUTTON */}
              <button
                onClick={() => setIsFilterOpen(false)}
                className="w-full bg-[#5DEE92] text-black py-3 rounded-lg font-medium
          hover:bg-green-500 transition cursor-pointer"
              >
                {t("apply_filters")}
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
