import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Download, FilePlus, Bell, Link as LinkIcon } from "lucide-react";

// PrivacyActionDashboard.jsx
// Single-file prototype for the Privacy Action Item Dashboard
// - Tailwind CSS utility classes
// - Framer Motion animations
// - Mock data + client-side filtering/pagination
// - Risk heatmap (grid), risk distribution (bars), summary cards, task table
// - Export CSV + upload evidence placeholders

// DESIGN NOTES:
// - Brand color: #5DEE92 (used as accent)
// - Dark mode support: uses `.dark` class on documentElement
// - Gen-Z friendly: rounded cards, soft shadows, subtle micro-interactions

/* Usage:
  <PrivacyActionDashboard currentUser={...} departments={[...]} />
  This is a visual prototype; wire to real APIs for production.
*/

const BRAND = "#5DEE92";

// ---------- Mock data ----------
function mockActionItems(count = 28) {
  const statuses = ["Open", "In Progress", "Completed", "Overdue"];
  const likelihoodOptions = [1, 2, 3, 4, 5];
  const impactOptions = [1, 2, 3, 4, 5];
  const deps = ["Procurement", "Frontend", "Payments", "Legal", "Customer Ops"];
  return Array.from({ length: count }).map((_, i) => {
    const likelihood = likelihoodOptions[Math.floor(Math.random() * likelihoodOptions.length)];
    const impact = impactOptions[Math.floor(Math.random() * impactOptions.length)];
    const riskScore = likelihood * impact;
    const riskCategory = categorizeRisk(riskScore);
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const daysOffset = Math.floor(Math.random() * 20) - 10; // some past/future
    const due = new Date(Date.now() + daysOffset * 24 * 3600 * 1000).toISOString();
    return {
      id: `AI-${1000 + i}`,
      title: `Action item ${i + 1} — Improve data flow in ${deps[i % deps.length]}`,
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
      createdDate: new Date(Date.now() - Math.random() * 1000 * 3600 * 24 * 30).toISOString(),
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
    .concat(rows.map((r) => headers.map((h) => JSON.stringify(r[h] || "")).join(",")))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------- Components ----------
function FilterPill({ children }) {
  return <div className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-sm">{children}</div>;
}

function SummaryCard({ title, value, accent, icon }) {
  return (
    <motion.div whileHover={{ y: -6 }} className="flex-1 min-w-[160px] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 shadow hover:shadow-lg transition">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${accent}22 0%, ${accent}11 100%)` }}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="text-xs text-gray-500 dark:text-gray-400">{title}</div>
          <div className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{value}</div>
        </div>
      </div>
    </motion.div>
  );
}

function HeatMap({ items }) {
  // build a 5x5 grid of likelihood x impact counts
  const grid = Array.from({ length: 5 }, () => Array(5).fill(0));
  items.forEach((it) => {
    const r = Math.max(1, Math.min(5, it.likelihood)) - 1;
    const c = Math.max(1, Math.min(5, it.impact)) - 1;
    grid[r][c] += 1;
  });

  const max = Math.max(...grid.flat(), 1);

  const cellColor = (count) => {
    if (count === 0) return "bg-gray-100 dark:bg-gray-700/40";
    const intensity = Math.min(1, count / max);
    // color from green->yellow->orange->red based on position; we'll use count to mod
    return `opacity-90`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 shadow">
      <h4 className="font-semibold text-gray-900 dark:text-white">Risk Heatmap</h4>
      <p className="text-xs text-gray-500 dark:text-gray-400">Likelihood (rows) × Impact (cols)</p>

      <div className="mt-4 grid grid-cols-6 gap-2 items-center">
        <div className="col-span-1 text-xs text-gray-500 dark:text-gray-400">L / I</div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="text-center text-xs text-gray-500 dark:text-gray-400">{i}</div>
        ))}

        {grid.map((row, rIdx) => (
          <React.Fragment key={rIdx}>
            <div className="text-xs text-gray-500 dark:text-gray-400">{rIdx + 1}</div>
            {row.map((count, cIdx) => {
              const color = chooseHeatColor(cIdx + 1, rIdx + 1); // based on impact, likelihood
              const scale = Math.min(1, count / max) || 0.05;
              return (
                <div key={cIdx} className="p-2">
                  <div className={`w-full h-10 rounded-lg flex items-center justify-center text-xs font-medium ${count === 0 ? 'text-gray-400' : 'text-white'}`} style={{ background: color, transform: `scale(${0.9 + scale * 0.2})` }}>{count}</div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function chooseHeatColor(impact, likelihood) {
  // impact 1..5, likelihood 1..5 -> choose color scale
  const score = impact * likelihood;
  if (score <= 5) return "#2ecc71"; // bright green
  if (score <= 10) return "#9be89b"; // light green
  if (score <= 15) return "#f1c40f"; // yellow
  if (score <= 20) return "#f39c12"; // orange
  return "#e74c3c"; // red
}

function RiskDistribution({ items }) {
  const counts = { Low: 0, Medium: 0, High: 0, "Very High": 0, Critical: 0 };
  items.forEach((i) => counts[i.riskCategory]++);
  const total = Math.max(1, items.length);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 shadow">
      <h4 className="font-semibold text-gray-900 dark:text-white">Risk Distribution</h4>
      <div className="mt-3 space-y-3">
        {Object.entries(counts).map(([k, v]) => {
          const pct = Math.round((v / total) * 100);
          return (
            <div key={k} className="flex items-center gap-3">
              <div className="w-20 text-sm text-gray-600 dark:text-gray-300">{k}</div>
              <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div className="h-3 rounded-full" style={{ width: `${pct}%`, background: getCategoryColor(k) }} />
              </div>
              <div className="w-10 text-right text-sm text-gray-600 dark:text-gray-300">{v}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
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

function TaskRow({ item, onOpen }) {
  const riskColor = chooseHeatColor(item.impact, item.likelihood);
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
      <td className="px-3 py-2 text-sm font-mono">{item.id}</td>
      <td className="px-3 py-2 text-sm">{item.title}</td>
      <td className="px-3 py-2 text-sm">{item.assignedToName}</td>
      <td className="px-3 py-2 text-sm">{formatDate(item.dueDate)}</td>
      <td className="px-3 py-2 text-sm">{item.status}</td>
      <td className="px-3 py-2 text-sm"><span className="px-2 py-1 rounded-full text-xs" style={{ background: riskColor, color: '#fff' }}>{item.riskCategory} ({item.riskScore})</span></td>
      <td className="px-3 py-2 text-sm">{item.linked.ropa ? <span className="text-xs text-[#1a7f4d]">RoPA</span> : "-"} {item.linked.assessment ? <span className="ml-2 text-xs text-[#1a7f4d]">Assessment</span> : ""}</td>
      <td className="px-3 py-2 text-sm">{item.evidenceCollected ? "Collected" : "Pending"}</td>
      <td className="px-3 py-2 text-sm">
        <div className="flex gap-2">
          <button onClick={() => onOpen(item)} className="px-2 py-1 rounded-md border text-sm">Open</button>
          <button className="px-2 py-1 rounded-md border text-sm">Edit</button>
        </div>
      </td>
    </tr>
  );
}

// ---------- Main Dashboard ----------
export default function ActionDashboard({ initialItems = null, departments = null }) {
  const [items, setItems] = useState(initialItems || mockActionItems(28));
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [linkedFilter, setLinkedFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 8;

  useEffect(() => {
    // placeholder to sync dark mode class based on user's preference stored elsewhere
    // document.documentElement.classList.toggle('dark', true);
  }, []);

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (search && !(`${it.title} ${it.assignedToName} ${it.id}`.toLowerCase().includes(search.toLowerCase()))) return false;
      if (deptFilter !== "All" && it.department !== deptFilter) return false;
      if (statusFilter !== "All" && it.status !== statusFilter) return false;
      if (riskFilter !== "All" && it.riskCategory !== riskFilter) return false;
      if (linkedFilter === "RoPA" && !it.linked.ropa) return false;
      if (linkedFilter === "Assessment" && !it.linked.assessment) return false;
      if (dateFrom && new Date(it.dueDate) < new Date(dateFrom)) return false;
      if (dateTo && new Date(it.dueDate) > new Date(dateTo)) return false;
      return true;
    });
  }, [items, search, deptFilter, statusFilter, riskFilter, linkedFilter, dateFrom, dateTo]);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  const summary = useMemo(() => {
    const total = items.length;
    const openOverdue = items.filter((i) => i.status === "Open" || i.status === "Overdue").length;
    const highRisk = items.filter((i) => ["High", "Very High", "Critical"].includes(i.riskCategory)).length;
    const linkedCount = items.filter((i) => i.linked.ropa || i.linked.assessment).length;
    const evidence = items.filter((i) => i.evidenceCollected).length;
    return { total, openOverdue, highRisk, linkedCount, evidence };
  }, [items]);

  function handleOpen(item) {
    alert(`Open action item ${item.id} (placeholder)`);
  }

  function handleCreate() {
    alert("Open Create Action Item panel (placeholder)");
  }

  function handleExport() {
    exportCSV(items.map((i) => ({ id: i.id, title: i.title, assignedTo: i.assignedToName, status: i.status, risk: i.riskCategory, dueDate: i.dueDate })));
  }

  function handleUploadEvidence(e) {
    // e is input event
    const file = e.target.files?.[0];
    if (!file) return;
    alert(`Upload placeholder: ${file.name}`);
  }

  const departmentsList = departments || Array.from(new Set(items.map((i) => i.department)));

  return (
    <div className="transition-colors duration-300">
      <div className="mx-auto p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Action Item Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Overview, heatmap, and task list for privacy action items</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-full px-3 py-1 shadow-sm">
              <Search className="h-4 w-4 text-gray-500" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search action items..." className="bg-transparent outline-none text-sm w-60 text-gray-700 dark:text-gray-200" />
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2 bg-[#5DEE92] text-white rounded-md shadow hover:opacity-95 transition"><Plus className="h-4 w-4"/> Create</button>
              <div className="relative">
                <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 border rounded-md bg-white dark:bg-gray-800"><Download className="h-4 w-4"/> Export</button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 dark:text-gray-400">From</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="rounded-md border px-2 py-1 bg-white dark:bg-gray-800 text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 dark:text-gray-400">To</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="rounded-md border px-2 py-1 bg-white dark:bg-gray-800 text-sm" />
          </div>
          <div>
            <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="rounded-md border px-2 py-1 bg-white dark:bg-gray-800 text-sm">
              <option value="All">All Departments</option>
              {departmentsList.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} className="rounded-md border px-2 py-1 bg-white dark:bg-gray-800 text-sm">
              <option value="All">All Risk Levels</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Very High">Very High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
          <div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-md border px-2 py-1 bg-white dark:bg-gray-800 text-sm">
              <option value="All">All Statuses</option>
              <option>Open</option>
              <option>In Progress</option>
              <option>Completed</option>
              <option>Overdue</option>
            </select>
          </div>
          <div>
            <select value={linkedFilter} onChange={(e) => setLinkedFilter(e.target.value)} className="rounded-md border px-2 py-1 bg-white dark:bg-gray-800 text-sm">
              <option value="All">All Linked</option>
              <option value="RoPA">RoPA</option>
              <option value="Assessment">Assessment</option>
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
          <SummaryCard title="Total Action Items" value={summary.total} accent={BRAND} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect width="18" height="18" rx="4" fill={BRAND}/></svg>} />
          <SummaryCard title="Open / Overdue" value={summary.openOverdue} accent="#f39c12" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="9" r="7" fill="#f39c12"/></svg>} />
          <SummaryCard title="High Risk" value={summary.highRisk} accent="#e74c3c" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2L15 8H9L12 2Z" fill="#e74c3c"/></svg>} />
          <SummaryCard title="Linked to RoPA/Assess" value={summary.linkedCount} accent="#6c63ff" icon={<LinkIcon className="h-4 w-4 text-[#6c63ff]" />} />
          <SummaryCard title="Evidence Collected" value={summary.evidence} accent="#38b36c" icon={<FilePlus className="h-4 w-4 text-[#38b36c]" />} />
        </div>

        {/* Middle: heatmap + risk distribution */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <HeatMap items={items} />
          </div>
          <div className="lg:col-span-1">
            <RiskDistribution items={items} />

            <div className="mt-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 shadow">
              <h4 className="font-semibold text-gray-900 dark:text-white">Notifications & Alerts</h4>
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 p-2 rounded-md bg-yellow-50 dark:bg-yellow-900/10">
                  <Bell className="h-5 w-5 text-yellow-600" />
                  <div className="text-sm text-gray-700 dark:text-gray-200">3 overdue tasks. <button className="underline">View</button></div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-md bg-red-50 dark:bg-red-900/10">
                  <Bell className="h-5 w-5 text-red-600" />
                  <div className="text-sm text-gray-700 dark:text-gray-200">2 critical risk items — escalation suggested.</div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-md bg-green-50 dark:bg-green-900/10">
                  <FilePlus className="h-5 w-5 text-[#1a7f4d]" />
                  <div className="text-sm text-gray-700 dark:text-gray-200">5 items have evidence pending upload.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Task table */}
        <div className="mt-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 shadow">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">Task Status</h3>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500 dark:text-gray-400">Page</label>
              <select value={page} onChange={(e) => setPage(Number(e.target.value))} className="rounded-md border px-2 py-1 bg-white dark:bg-gray-800 text-sm">
                {Array.from({ length: pages }).map((_, idx) => <option key={idx} value={idx + 1}>{idx + 1}</option>)}
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
                  <th className="px-3 py-2">Linked Components</th>
                  <th className="px-3 py-2">Evidence Status</th>
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
            <div className="text-sm text-gray-600 dark:text-gray-300">Showing {(page - 1) * perPage + 1} - {Math.min(page * perPage, total)} of {total} results</div>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(Math.max(1, page - 1))} className="px-3 py-2 rounded-md border">Prev</button>
              <button onClick={() => setPage(Math.min(pages, page + 1))} className="px-3 py-2 rounded-md border">Next</button>
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="mt-6 flex flex-col md:flex-row gap-3">
          <div className="flex-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 shadow">
            <h4 className="font-semibold text-gray-900 dark:text-white">Quick Actions</h4>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button onClick={handleCreate} className="flex items-center gap-2 px-3 py-2 rounded-md bg-[#5DEE92] text-white"><Plus className="h-4 w-4"/> Create New Action Item</button>
              <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 rounded-md border"><Download className="h-4 w-4"/> Export Report</button>
              <label className="flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer">
                <FilePlus className="h-4 w-4"/> Upload Audit Evidence
                <input type="file" onChange={handleUploadEvidence} className="hidden" />
              </label>
              <button onClick={() => alert('View linked RoPA/Assessment (placeholder)')} className="flex items-center gap-2 px-3 py-2 rounded-md border"><LinkIcon className="h-4 w-4"/> View Linked RoPA / Assessment</button>
            </div>
          </div>

          <div className="w-80 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 shadow">
            <h4 className="font-semibold text-gray-900 dark:text-white">Alerts</h4>
            <div className="mt-3 space-y-2">
              <div className="p-2 rounded-md bg-yellow-50 dark:bg-yellow-900/10 text-sm">Some tasks are overdue. <button className="underline">Review</button></div>
              <div className="p-2 rounded-md bg-red-50 dark:bg-red-900/10 text-sm">Critical risk items require escalation.</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
