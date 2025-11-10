import React, { useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Download,
  FilePlus,
  Bell,
  Link as LinkIcon,
  Eye,
  Pencil,
  Trash2,
  Archive,
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Customized,
} from "recharts";
import AddActionItemModal from "../modules/AddActionItem";

const BRAND = "#5DEE92";

// ---------- Mock data ----------
function mockActionItems(count = 200) {
  const statuses = ["Open", "In Progress", "Completed", "Overdue"];
  const likelihoodOptions = [1, 2, 3, 4, 5];
  const impactOptions = [1, 2, 3, 4, 5];
  const deps = ["Procurement", "Frontend", "Payments", "Legal", "Customer Ops"];
  return Array.from({ length: count }).map((_, i) => {
    const likelihood =
      likelihoodOptions[Math.floor(Math.random() * likelihoodOptions.length)];
    const impact =
      impactOptions[Math.floor(Math.random() * impactOptions.length)];
    const riskScore = likelihood * impact;
    const riskCategory = categorizeRisk(riskScore);
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const daysOffset = Math.floor(Math.random() * 20) - 10; // some past/future
    const due = new Date(
      Date.now() + daysOffset * 24 * 3600 * 1000
    ).toISOString();
    return {
      id: `AIT-${1000 + i}`,
      title: `Action item ${i + 1} — Improve data flow in ${
        deps[i % deps.length]
      }`,
      assignedTo: i % 3 === 0 ? "team_alpha" : `user_${i % 6}`,
      assignedToName: i % 3 === 0 ? "Team Alpha" : `User ${i % 6}`,
      department: deps[i % deps.length],
      dueDate: due,
      status,
      likelihood,
      impact,
      riskScore,
      riskCategory,
      linked: { ropa: Math.random() > 0.6, assessment: Math.random() > 0.6 },
      evidenceCollected: Math.random() > 0.6,
      createdDate: new Date(
        Date.now() - Math.random() * 1000 * 3600 * 24 * 30
      ).toISOString(),
    };
  });
}

function categorizeRisk(score) {
  if (score <= 5) return "Low";
  if (score <= 10) return "Medium";
  if (score <= 15) return "High";
  if (score <= 20) return "Very High";
  return "Critical";
}

// ---------- Utilities ----------
function formatDate(iso) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString();
  } catch (e) {
    return iso;
  }
}

function exportCSV(rows, filename = "action_items.csv") {
  const headers = Object.keys(rows[0] || {});
  const csv = [headers.join(",")]
    .concat(
      rows.map((r) => headers.map((h) => JSON.stringify(r[h] || "")).join(","))
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------- Small UI pieces ----------
function SummaryCard({ title, value, accent, icon }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="flex-1 min-w-[160px] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 shadow hover:shadow-lg transition"
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${accent}22 0%, ${accent}11 100%)`,
          }}
        >
          {icon}
        </div>
        <div className="flex-1">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {title}
          </div>
          <div className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
            {value}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function chooseHeatColor(impact, likelihood) {
  const score = impact * likelihood;
  if (score <= 5) return "#2ecc71";
  if (score <= 10) return "#9be89b";
  if (score <= 15) return "#f1c40f";
  if (score <= 20) return "#f39c12";
  return "#e74c3c";
}

function getCategoryColor(k) {
  switch (k) {
    case "Low":
      return "#2ecc71";
    case "Medium":
      return "#9be89b";
    case "High":
      return "#f1c40f";
    case "Very High":
      return "#f39c12";
    default:
      return "#e74c3c";
  }
}

function RechartsHeatmap({ items, onCellClick }) {
  const aggregated = useMemo(() => {
    const grid = Array.from({ length: 5 }, () =>
      Array.from({ length: 5 }, () => ({
        count: 0,
        sumLikelihood: 0,
        sumImpact: 0,
        items: [],
      }))
    );
    items.forEach((it) => {
      const r = Math.max(1, Math.min(5, it.likelihood)) - 1;
      const c = Math.max(1, Math.min(5, it.impact)) - 1;
      grid[r][c].count += 1;
      grid[r][c].sumLikelihood += it.likelihood;
      grid[r][c].sumImpact += it.impact;
      grid[r][c].items.push(it);
    });
    return grid;
  }, [items]);

  const maxCount = useMemo(() => {
    let m = 1;
    aggregated.forEach((row) =>
      row.forEach((cell) => (m = Math.max(m, cell.count)))
    );
    return m;
  }, [aggregated]);

  // tooltip state
  const [tooltip, setTooltip] = useState(null);

  // Customized renderer uses chart width/height to compute cell positions
  const CustomizedGrid = (props) => {
    const { width, height } = props;
    const margin = { top: 32, right: 12, bottom: 28, left: 36 };
    const chartWidth = Math.max(200, width);
    const chartHeight = Math.max(180, height);
    const gridWidth = chartWidth - margin.left - margin.right;
    const gridHeight = chartHeight - margin.top - margin.bottom;
    const cols = 5;
    const rows = 5;
    const cellW = gridWidth / cols;
    const cellH = gridHeight / rows;
    const pad = 8;

    const onHover = (evt, rIdx, cIdx, cell) => {
      const rect = evt.currentTarget.getBoundingClientRect();
      setTooltip({
        x: rect.left + rect.width / 2,
        y: rect.top - 8,
        r: rIdx + 1,
        c: cIdx + 1,
        ...cell,
      });
    };

    const onLeave = () => setTooltip(null);

    const handleKeyDown = (e, rIdx, cIdx, cell) => {
      if (e.key === "Enter")
        onCellClick({
          likelihood: rIdx + 1,
          impact: cIdx + 1,
          items: cell.items,
        });
    };

    return (
      <g>
        {/* Axis labels (top) */}
        {[1, 2, 3, 4, 5].map((i) => (
          <text
            key={`x-${i}`}
            x={margin.left + (i - 0.5) * cellW}
            y={margin.top - 12}
            textAnchor="middle"
            fill="#6B7280"
            style={{ fontSize: 12 }}
          >
            {i}
          </text>
        ))}

        {/* Row labels (left) */}
        {[1, 2, 3, 4, 5].map((i) => (
          <text
            key={`y-${i}`}
            x={margin.left - 12}
            y={margin.top + (i - 0.5) * cellH + 4}
            textAnchor="end"
            fill="#6B7280"
            style={{ fontSize: 12 }}
          >
            {i}
          </text>
        ))}

        {/* Cells */}
        {aggregated.map((row, rIdx) =>
          row.map((cell, cIdx) => {
            const x = margin.left + cIdx * cellW + pad / 2;
            const y = margin.top + rIdx * cellH + pad / 2;
            const w = cellW - pad;
            const h = cellH - pad;
            const norm = maxCount <= 1 ? 1 : Math.min(1, cell.count / maxCount);
            const color = chooseHeatColor(cIdx + 1, rIdx + 1);
            const scale = 0.9 + 0.1 * norm;

            return (
              <g
                key={`cell-${rIdx}-${cIdx}`}
                transform={`translate(${x + (w * (1 - scale)) / 2}, ${
                  y + (h * (1 - scale)) / 2
                }) scale(${scale})`}
              >
                <rect
                  x={0}
                  y={0}
                  rx={10}
                  width={w}
                  height={h}
                  fill={cell.count === 0 ? "#F3F4F6" : color}
                  stroke={cell.count === 0 ? "transparent" : "#ffffff22"}
                  style={{
                    cursor: "pointer",
                    transition: "transform 0.12s ease",
                  }}
                  onMouseEnter={(e) => onHover(e, rIdx, cIdx, { ...cell })}
                  onMouseLeave={onLeave}
                  onClick={() =>
                    onCellClick({
                      likelihood: rIdx + 1,
                      impact: cIdx + 1,
                      items: cell.items,
                    })
                  }
                  tabIndex={0}
                  role="button"
                  aria-label={`Likelihood ${rIdx + 1} Impact ${cIdx + 1}, ${
                    cell.count
                  } items`}
                  onKeyDown={(e) => handleKeyDown(e, rIdx, cIdx, cell)}
                />
                <text
                  x={w / 2}
                  y={h / 2 + 4}
                  textAnchor="middle"
                  fill={cell.count === 0 ? "#9CA3AF" : "#111827"}
                  style={{ fontSize: 12, fontWeight: 700 }}
                >
                  {cell.count}
                </text>
              </g>
            );
          })
        )}
      </g>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 shadow"
    >
      <h4 className="font-semibold text-gray-900 dark:text-white">
        Risk Heatmap
      </h4>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Click a cell to filter the task table. Likelihood (rows) × Impact (cols)
      </p>

      <div className="mt-4" style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={[]}
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          >
            <CartesianGrid horizontal={false} vertical={false} />
            <XAxis dataKey="impact" type="number" domain={[1, 5]} hide />
            <YAxis dataKey="likelihood" type="number" domain={[1, 5]} hide />
            <Customized component={<CustomizedGrid />} />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Tooltip DOM */}
        {tooltip && (
          <div
            className="pointer-events-none fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-2 text-xs shadow"
            style={{
              left: tooltip.x + 12,
              top: tooltip.y - 6,
              transform: "translate(-50%, -100%)",
              minWidth: 160,
              maxWidth: 320,
            }}
          >
            <div className="text-xs text-gray-500 dark:text-gray-300">
              L {tooltip.r} • I {tooltip.c}
            </div>
            <div className="font-semibold text-sm text-gray-900 dark:text-white mt-1">
              {tooltip.count} item{tooltip.count !== 1 ? "s" : ""}
            </div>
            {tooltip.count > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                Avg L: {(tooltip.sumLikelihood / tooltip.count).toFixed(2)} •
                Avg I: {(tooltip.sumImpact / tooltip.count).toFixed(2)}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function RiskDistribution({ items }) {
  const counts = { Low: 0, Medium: 0, High: 0, "Very High": 0, Critical: 0 };
  items.forEach((i) => counts[i.riskCategory]++);
  const total = Math.max(1, items.length);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 shadow">
      <h4 className="font-semibold text-gray-900 dark:text-white">
        Risk Distribution
      </h4>
      <div className="mt-3 space-y-3">
        {Object.entries(counts).map(([k, v]) => {
          const pct = Math.round((v / total) * 100);
          return (
            <div key={k} className="flex items-center gap-3">
              <div className="w-20 text-sm text-gray-600 dark:text-gray-300">
                {k}
              </div>
              <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 rounded-full"
                  style={{ width: `${pct}%`, background: getCategoryColor(k) }}
                />
              </div>
              <div className="w-10 text-right text-sm text-gray-600 dark:text-gray-300">
                {v}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Table row ----------
function TaskRow({ item, onOpen }) {
  const riskColor = chooseHeatColor(item.impact, item.likelihood);
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
      <td className="px-3 py-2 text-sm font-mono">{item.id}</td>
      <td className="px-3 py-2 text-sm">{item.title}</td>
      <td className="px-3 py-2 text-sm">{item.assignedToName}</td>
      <td className="px-3 py-2 text-sm">{formatDate(item.dueDate)}</td>
      <td className="px-3 py-2 text-sm">{item.status}</td>
      <td className="px-3 py-2 text-sm">
        <span
          className="px-2 py-1 rounded-full text-xs"
          style={{ background: riskColor, color: "#000" }}
        >
          {item.riskCategory} ({item.riskScore})
        </span>
      </td>
      <td className="px-3 py-2 text-sm">
        <div className="flex items-center gap-2">
          <button
            title="View"
            onClick={() => onOpen(item)}
            className={` hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer`}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            title="Edit"
            className={`} hover:text-blue-500 cursor-pointer`}
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            title="Linked Items"
            className={` hover:text-[#5DEE92] cursor-pointer`}
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button
            title="Delete"
            className={` hover:text-red-500 cursor-pointer`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            title="Archive"
            className={` hover:text-gray-500 cursor-pointer`}
          >
            <Archive className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ---------- Main Dashboard ----------
export default function ActionDashboard({
  initialItems = null,
  departments = null,
}) {
  const [items, setItems] = useState(initialItems || mockActionItems(200));
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [linkedFilter, setLinkedFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 8;
  const [open, setOpen] = useState(false);

  function handleCreate(newItem) {
    // newItem contains all fields including auto-generated id & createdDate
    // push to server or update state
    console.log("Created", newItem);
    setOpen(false);
  }

  const currentUser = { id: "user_1", name: "Alice Admin", department: "Legal", role: "Org Admin" };

  const [cellFilter, setCellFilter] = useState(null);

  const filtered = useMemo(() => {
    let arr = items;
    if (cellFilter && cellFilter.items) {
      const ids = new Set(cellFilter.items.map((it) => it.id));
      arr = arr.filter((it) => ids.has(it.id));
    }

    return arr.filter((it) => {
      if (
        search &&
        !`${it.title} ${it.assignedToName} ${it.id}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
        return false;
      if (deptFilter !== "All" && it.department !== deptFilter) return false;
      if (statusFilter !== "All" && it.status !== statusFilter) return false;
      if (riskFilter !== "All" && it.riskCategory !== riskFilter) return false;
      if (linkedFilter === "RoPA" && !it.linked.ropa) return false;
      if (linkedFilter === "Assessment" && !it.linked.assessment) return false;
      if (dateFrom && new Date(it.dueDate) < new Date(dateFrom)) return false;
      if (dateTo && new Date(it.dueDate) > new Date(dateTo)) return false;
      return true;
    });
  }, [
    items,
    search,
    deptFilter,
    statusFilter,
    riskFilter,
    linkedFilter,
    dateFrom,
    dateTo,
    cellFilter,
  ]);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  const summary = useMemo(() => {
    const total = items.length;
    const openOverdue = items.filter(
      (i) => i.status === "Open" || i.status === "Overdue"
    ).length;
    const highRisk = items.filter((i) =>
      ["High", "Very High", "Critical"].includes(i.riskCategory)
    ).length;
    const linkedCount = items.filter(
      (i) => i.linked.ropa || i.linked.assessment
    ).length;
    const evidence = items.filter((i) => i.evidenceCollected).length;
    return { total, openOverdue, highRisk, linkedCount, evidence };
  }, [items]);

  function handleOpen(item) {
    alert(`Open action item ${item.id} (placeholder)`);
  }

  // function handleCreate() {
  //   alert("Open Create Action Item panel (placeholder)");
  // }

  function handleExport() {
    exportCSV(
      items.map((i) => ({
        id: i.id,
        title: i.title,
        assignedTo: i.assignedToName,
        status: i.status,
        risk: i.riskCategory,
        dueDate: i.dueDate,
      }))
    );
  }

  function handleUploadEvidence(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    alert(`Upload placeholder: ${file.name}`);
  }

  const departmentsList =
    departments || Array.from(new Set(items.map((i) => i.department)));

  const handleHeatCellClick = useCallback(
    ({ likelihood, impact, items: cellItems }) => {
      setCellFilter((prev) => {
        if (prev && prev.likelihood === likelihood && prev.impact === impact)
          return null;
        return { likelihood, impact, items: cellItems };
      });
      setPage(1);
    },
    []
  );

  const clearDrill = () => setCellFilter(null);

  return (
    <div className="transition-colors duration-300">
      <div className="mx-auto p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Action Item Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Overview, heatmap, and task list for privacy action items
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-[#828282] dark:border-gray-400 rounded-lg px-3 py-2 shadow-sm">
              <Search className="h-4 w-4 text-gray-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search action items..."
                className="bg-transparent outline-none text-sm w-60 text-gray-700 dark:text-gray-200"
              />
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#5DEE92] text-black rounded-md shadow hover:opacity-95 transition"
              >
                <Plus className="h-4 w-4" /> Create
              </button>
              <AddActionItemModal
                isOpen={open}
                onClose={() => setOpen(false)}
                onCreate={handleCreate}
                currentUser={currentUser}
                departments={["Legal","Frontend","Payments","Procurement","Customer Ops"]}
                users={[{ id: "user_1", name: "Alice Admin" }, { id: "user_2", name: "Bob Reviewer" }]}
              />
              <div className="relative">
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 border border-[#828282] rounded-md bg-white dark:text-white dark:bg-gray-800"
                >
                  <Download className="h-4 w-4" /> Export
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap gap-3 items-center dark:text-white">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 dark:text-gray-400">
              From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-md border px-2 py-1 bg-white dark:bg-gray-800 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 dark:text-gray-400">
              To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-md border px-2 py-1 bg-white dark:bg-gray-800 text-sm"
            />
          </div>
          <div>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="rounded-md border px-2 py-1 bg-white dark:bg-gray-800 text-sm"
            >
              <option value="All">All Departments</option>
              {departmentsList.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="rounded-md border px-2 py-1 bg-white dark:bg-gray-800 text-sm"
            >
              <option value="All">All Risk Levels</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Very High">Very High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border px-2 py-1 bg-white dark:bg-gray-800 text-sm"
            >
              <option value="All">All Statuses</option>
              <option>Open</option>
              <option>In Progress</option>
              <option>Completed</option>
              <option>Overdue</option>
            </select>
          </div>
          <div>
            <select
              value={linkedFilter}
              onChange={(e) => setLinkedFilter(e.target.value)}
              className="rounded-md border px-2 py-1 bg-white dark:bg-gray-800 text-sm"
            >
              <option value="All">All Linked</option>
              <option value="RoPA">RoPA</option>
              <option value="Assessment">Assessment</option>
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
          <SummaryCard
            title="Total Action Items"
            value={summary.total}
            accent={BRAND}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect width="18" height="18" rx="4" fill={BRAND} />
              </svg>
            }
          />
          <SummaryCard
            title="Open / Overdue"
            value={summary.openOverdue}
            accent="#f39c12"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="9" cy="9" r="7" fill="#f39c12" />
              </svg>
            }
          />
          <SummaryCard
            title="High Risk"
            value={summary.highRisk}
            accent="#e74c3c"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L15 8H9L12 2Z" fill="#e74c3c" />
              </svg>
            }
          />
          <SummaryCard
            title="Linked to RoPA/Assess"
            value={summary.linkedCount}
            accent="#6c63ff"
            icon={<LinkIcon className="h-4 w-4 text-[#6c63ff]" />}
          />
          <SummaryCard
            title="Evidence Collected"
            value={summary.evidence}
            accent="#38b36c"
            icon={<FilePlus className="h-4 w-4 text-[#38b36c]" />}
          />
        </div>

        {/* Middle: Recharts heatmap + risk distribution */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div className="flex justify-end mb-3">
              {cellFilter ? (
                <div className="flex items-center gap-2">
                  <div className="text-xs text-gray-500 dark:text-gray-300">
                    Drill: L {cellFilter.likelihood} • I {cellFilter.impact} •{" "}
                    {cellFilter.items.length} items
                  </div>
                  <button
                    onClick={clearDrill}
                    className="px-2 py-1 rounded-md border border-[#828282] dark:text-white cursor-pointer text-xs"
                  >
                    Clear
                  </button>
                </div>
              ) : null}
            </div>

            <RechartsHeatmap items={items} onCellClick={handleHeatCellClick} />
          </div>

          <div className="lg:col-span-1">
            <RiskDistribution items={items} />

            <div className="mt-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 shadow">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Notifications & Alerts
              </h4>
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 p-2 rounded-md bg-yellow-50 dark:bg-yellow-900/10">
                  <Bell className="h-5 w-5 text-yellow-600" />
                  <div className="text-sm text-gray-700 dark:text-gray-200">
                    3 overdue tasks. <button className="underline">View</button>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-md bg-red-50 dark:bg-red-900/10">
                  <Bell className="h-5 w-5 text-red-600" />
                  <div className="text-sm text-gray-700 dark:text-gray-200">
                    2 critical risk items — escalation suggested.
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-md bg-green-50 dark:bg-green-900/10">
                  <FilePlus className="h-5 w-5 text-[#1a7f4d]" />
                  <div className="text-sm text-gray-700 dark:text-gray-200">
                    5 items have evidence pending upload.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Task table */}
        <div className="mt-6 bg-white dark:text-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 shadow">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Task Status
            </h3>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500 dark:text-gray-400">
                Page
              </label>
              <select
                value={page}
                onChange={(e) => setPage(Number(e.target.value))}
                className="rounded-md border px-2 py-1 bg-white dark:bg-gray-800 text-sm"
              >
                {Array.from({ length: pages }).map((_, idx) => (
                  <option key={idx} value={idx + 1}>
                    {idx + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                  <th className="px-3 py-2">Action Item ID</th>
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Assigned To</th>
                  <th className="px-3 py-2">Due Date</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Risk Level</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {pageItems.map((it) => (
                  <TaskRow key={it.id} item={it} onOpen={handleOpen} />
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Showing {(page - 1) * perPage + 1} -{" "}
              {Math.min(page * perPage, total)} of {total} results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                className="px-3 py-2 rounded-md border"
              >
                Prev
              </button>
              <button
                onClick={() => setPage(Math.min(pages, page + 1))}
                className="px-3 py-2 rounded-md border"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
