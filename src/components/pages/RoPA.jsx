import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { getRopaRiskHeatmap, getRopaStats } from "../../services/RopaService";
import {
  CartesianGrid,
  ComposedChart,
  Customized,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { getRopaGraphData } from "../../services/RopaService";
import { addTranslationNamespace } from "../../i18n/config";
import { useTranslation } from "react-i18next";

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

function chooseHeatColor(impact, likelihood) {
  const score = impact * likelihood;
  if (score <= 5) return "#2ecc71";
  if (score <= 10) return "#9be89b";
  if (score <= 15) return "#f1c40f";
  if (score <= 20) return "#f39c12";
  return "#e74c3c";
}

const RoPA = ({ initialItems = null }) => {
  const chartRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [stats, setStats] = useState(null);
  const [year, setYear] = useState("2025");
  const [month, setMonth] = useState("");
  const [chartData, setChartData] = useState(null);
  const [cellFilter, setCellFilter] = useState(null);
  const [items, setItems] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);

  useEffect(() => {
    addTranslationNamespace("en", "pages", "RoPA");
    addTranslationNamespace("hindi", "pages", "RoPA");
    addTranslationNamespace("sanskrit", "pages", "RoPA");
    addTranslationNamespace("telugu", "pages", "RoPA");
  }, [])

  const { t } = useTranslation("pages", { keyPrefix: "RoPA" })

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getRopaStats({
          view: month ? "byDay" : "byMonth",
          year,
          month,
        });
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };
    fetchStats();
  }, [year, month]);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const params = {};
        if (year) params.year = year;
        if (month) params.month = month;

        const res = await getRopaGraphData({
          view: month ? "byDay" : "byMonth",
          year,
          month,
        });

        const graph = res.data.graphData;

        const uniqueYears = Array.from(new Set(graph.map((g) => g.year))).sort(
          (a, b) => b - a
        );

        setAvailableYears(uniqueYears);

        // Auto-select the latest year if not chosen
        if (!year) {
          setYear(uniqueYears[0]);
        }

        const labels = graph.map((g) => g.label);
        const values = graph.map((g) => g.total);

        setChartData({
          labels,
          datasets: [
            {
              label: "Total RoPA",
              data: values,
              borderColor: "#5de992",
              backgroundColor: "rgba(93, 233, 146, 0.25)",
              fill: true,
              tension: 0.4,
            },
          ],
        });
      } catch (err) {
        console.error("Failed to fetch chart", err);
      }
    };

    fetchChartData();
  }, [year, month]);

  useEffect(() => {
    async function loadHeatmap() {
      try {
        const res = await getRopaRiskHeatmap();
        const backendMatrix = res.data.heatmap.matrix; // 5x5

        function transformBackendMatrix(matrix) {
          const fixed = Array.from({ length: 5 }, () =>
            Array.from({ length: 5 }, () => [])
          );

          for (let l = 0; l < 5; l++) {
            for (let i = 0; i < 5; i++) {
              const cell = matrix[l][i];

              const likelihood = l + 1;
              const impact = i + 1;

              const row = 5 - impact; // invert impact axis
              const col = likelihood - 1;

              fixed[row][col] = cell;
            }
          }

          return fixed;
        }

        const correctedMatrix = transformBackendMatrix(backendMatrix);

        // STEP 2 — Convert corrected matrix → FE items
        const parsedItems = [];

        for (let row = 0; row < 5; row++) {
          for (let col = 0; col < 5; col++) {
            const cellItems = correctedMatrix[row][col];

            cellItems.forEach((item) => {
              parsedItems.push({
                id: item.id,
                ropa_id: item.ropa_id,
                name: item.name,
                category: item.category,
                flow_stage: item.flow_stage,
                status: item.status,
                riskScore: item.risk_score,
                riskCategory: item.risk_category,

                // FIX: convert back to axis coords for FE grid
                likelihood: col + 1,
                impact: 5 - row,
              });
            });
          }
        }

        setItems(parsedItems);
      } catch (err) {
        console.error("Failed to load heatmap", err);
      }
    }

    loadHeatmap();
  }, []);

  // const buildChartData = (stats) => {
  //   if (!month) {
  //     // YEAR VIEW (12 months)
  //     setChartData({
  //       labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
  //       datasets: [
  //         {
  //           label: "RoPA per Month",
  //           data: stats.byMonth || [],
  //           borderColor: "#5de992",
  //           backgroundColor: "rgba(93, 233, 146, 0.25)",
  //           tension: 0.4,
  //           fill: true,
  //         },
  //       ],
  //     });
  //   } else {
  //     // MONTH VIEW (Daily)
  //     setChartData({
  //       labels: ["1", "5", "10", "15", "20", "25", "30"],
  //       datasets: [
  //         {
  //           label: `RoPA in ${month}/${year}`,
  //           data: stats.byDay || [],
  //           borderColor: "#5de992",
  //           backgroundColor: "rgba(93, 233, 146, 0.25)",
  //           tension: 0.4,
  //           fill: true,
  //         },
  //       ],
  //     });
  //   }
  // };

  if (!stats || !chartData) return <div className="p-10">{t("loading")}...</div>;

  // const { total, byCategory, thisMonth, lastMonth } = stats;

  const getRopaThisMonthText = (stats) => {
    if (!stats) return "";

    const diff = stats.thisMonth - stats.lastMonth;

    if (diff > 0) return `+${diff} ${t("this_month")}`;
    if (diff < 0) return `${diff} ${t("this_month")}`; // diff is negative automatically
    return "No change this month";
  };

  const cat = (c) => stats.byCategory.find((x) => x.category === c)?.count || 0;

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
        const col = Math.max(1, Math.min(5, it.likelihood)) - 1;
        const row = 5 - Math.max(1, Math.min(5, it.impact)); // invert Y so 5 is top

        grid[row][col].count += 1;
        grid[row][col].sumLikelihood += it.likelihood;
        grid[row][col].sumImpact += it.impact;
        grid[row][col].items.push(it);
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
        // compute true axis values
        const trueLikelihood = cIdx + 1; // left -> right
        const trueImpact = 5 - rIdx; // bottom -> top

        const rect = evt.currentTarget.getBoundingClientRect();
        setTooltip({
          x: rect.left + rect.width / 2,
          y: rect.top - 8,
          likelihood: trueLikelihood,
          impact: trueImpact,
          count: cell.count,
          sumLikelihood: cell.sumLikelihood,
          sumImpact: cell.sumImpact,
          items: cell.items,
        });
      };

      const onLeave = () => setTooltip(null);

      const handleKeyDown = (e, rIdx, cIdx, cell) => {
        if (e.key === "Enter") {
          const trueLikelihood = cIdx + 1;
          const trueImpact = 5 - rIdx;
          onCellClick({
            likelihood: trueLikelihood,
            impact: trueImpact,
            items: cell.items,
          });
        }
      };

      return (
        <g>
          {/* Likelihood axis (X-axis bottom) */}
          {[1, 2, 3, 4, 5].map((i) => (
            <text
              key={`x-${i}`}
              x={margin.left + (i - 0.5) * cellW}
              y={chartHeight - 4}
              textAnchor="middle"
              fill="#6B7280"
              style={{ fontSize: 12 }}
            >
              {i}
            </text>
          ))}

          {/* Impact axis (Y-axis left), bottom → top */}
          {[1, 2, 3, 4, 5].map((i) => (
            <text
              key={`y-${i}`}
              x={margin.left - 12}
              y={margin.top + (5 - i + 0.5) * cellH}
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
              const norm =
                maxCount <= 1 ? 1 : Math.min(1, cell.count / maxCount);

              // true axis mapping
              const trueLikelihood = cIdx + 1; // left → right
              const trueImpact = 5 - rIdx; // bottom → top

              // color based on true coords
              const color = chooseHeatColor(trueLikelihood, trueImpact);
              const scale = 0.9 + 0.1 * norm;

              return (
                <g
                  key={`cell-${rIdx}-${cIdx}`}
                  transform={`translate(${x + (w * (1 - scale)) / 2}, ${y + (h * (1 - scale)) / 2
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
                    onMouseEnter={(e) => onHover(e, rIdx, cIdx, cell)}
                    onMouseLeave={onLeave}
                    onClick={() =>
                      onCellClick({
                        likelihood: trueLikelihood,
                        impact: trueImpact,
                        items: cell.items,
                      })
                    }
                    tabIndex={0}
                    role="button"
                    aria-label={`Likelihood ${trueLikelihood} Impact ${trueImpact}, ${cell.count} items`}
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
          {t("risk_heatmap")}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t("click_a_cell")}
        </p>

        <div className="mt-4" style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={[]}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <CartesianGrid horizontal={false} vertical={false} />
              <XAxis dataKey="likelihood" type="number" domain={[1, 5]} hide />
              <YAxis dataKey="impact" type="number" domain={[1, 5]} hide />
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
                L {tooltip.likelihood} • I {tooltip.impact}
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

  return (
    <div>
      <div className="min-h-screen  dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-500">
        {/* ROW 1 — Four Cards in a Single Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            {
              title: `${t("infovoyage")}`,
              value: cat("InfoVoyage"),
              color: "bg-[#5de992] text-black",
            },
            {
              title: `${t("checksync")}`,
              value: cat("CheckSync"),
              color: "bg-white dark:bg-gray-800",
            },
            {
              title: `${t("beam")}`,
              value: cat("Beam"),
              color: "bg-white dark:bg-gray-800",
            },
            {
              title: `${t("offdoff")}`,
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

        {/* Top Stats: Chart & Heatmap */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {/* LEFT: Total RoPA Chart */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className={`col-span-2 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 ${isFullscreen
              ? "fixed inset-0 z-50 flex flex-col p-6 bg-white dark:bg-gray-900"
              : ""
              }`}
          >
            {/* --- your chart card stays exactly the same --- */}
            {/* COPY your existing chart card content here */}
            <div className="flex justify-between items-center mb-2">
              {" "}
              <div className="flex flex-col gap-4">
                {" "}
                <h2 className="font-medium">{t("total_ropa")}</h2>{" "}
                <div className="text-4xl font-bold text-[#5de992] mb-4">
                  {" "}
                  {stats.total}{" "}
                </div>{" "}
              </div>{" "}
              <div className="flex flex-col gap-4">
                {" "}
                <span className="text-sm text-gray-500 text-right">
                  {" "}
                  {getRopaThisMonthText(stats)}{" "}
                </span>{" "}
                <div className="flex space-x-2 mb-2 items-center">
                  {" "}
                  <select
                    className="px-2 py-1 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  >
                    {" "}
                    {availableYears.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>{" "}
                  <select
                    className="px-2 py-1 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                  >
                    {" "}
                    <option value="">{t("all_months")}</option>{" "}
                    <option value="01">{t("jan")}</option>{" "}
                    <option value="02">{t("feb")}</option>{" "}
                    <option value="03">{t("mar")}</option>{" "}
                    <option value="04">{t("apr")}</option>{" "}
                    <option value="05">{t("may")}</option>{" "}
                    <option value="06">{t("jun")}</option>{" "}
                    <option value="07">{t("jul")}</option>{" "}
                    <option value="08">{t("aug")}</option>{" "}
                    <option value="09">{t("sep")}</option>{" "}
                    <option value="10">{t("oct")}</option>{" "}
                    <option value="11">{t("nov")}</option>{" "}
                    <option value="12">{t("dec")}</option>{" "}
                  </select>{" "}
                  {/* Fullscreen Toggle Button */}{" "}
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 rounded-lg border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {" "}
                    <Expand size={18} />{" "}
                  </button>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
            <div className="flex-1 w-full h-[160px] md:h-[300px] lg:h-[240px]">
              {" "}
              <Line
                ref={chartRef}
                data={chartData}
                options={chartOptions}
              />{" "}
            </div>{" "}
            {/* Exit Fullscreen Button */}{" "}
            {isFullscreen && (
              <button
                onClick={toggleFullscreen}
                className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-lg shadow-lg hover:bg-red-600"
              >
                {" "}
                Exit Fullscreen{" "}
              </button>
            )}
          </motion.div>

          {/* RIGHT: Heatmap replacing old 4 cards */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="col-span-2 dark:bg-gray-800 transition-all duration-300"
          >
            <div className="flex justify-end">
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

            <RechartsHeatmap items={items} />
          </motion.div>


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
