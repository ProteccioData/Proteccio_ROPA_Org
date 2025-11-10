import React, { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

const chartData = {
  labels: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  datasets: [
    {
      label: "Assessments",
      data: [186, 305, 237, 73, 209, 214, 186, 305, 237, 73, 209, 214],
      borderColor: "#10B981",
      backgroundColor: "#10B981",
      borderWidth: 2,
      tension: 0.4,
      pointRadius: 0,
    },
    {
      label: "LIA",
      data: [87, 163, 142, 195, 118, 231, 87, 163, 142, 195, 118, 231],
      borderColor: "#F97316",
      backgroundColor: "#F97316",
      borderWidth: 2,
      borderDash: [6, 6],
      tension: 0.4,
      pointRadius: 0,
    },
    {
      label: "DPIA",
      data: [74, 24, 104, 124, 14, 34, 74, 24, 104, 124, 14, 34],
      borderColor: "#8B5CF6",
      backgroundColor: "#8B5CF6",
      borderWidth: 2,
      borderDash: [4, 6],
      tension: 0.4,
      pointRadius: 0,
    },
    {
      label: "TIA",
      data: [204, 24, 74, 94, 24, 204, 204, 24, 74, 94, 24, 204],
      borderColor: "#FF00FF",
      backgroundColor: "#FF00FF",
      borderWidth: 2,
      borderDash: [2, 6],
      tension: 0.4,
      pointRadius: 0,
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false, // fixed height behavior
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      mode: "index",
      intersect: false,
      backgroundColor: "rgba(17, 24, 39, 0.8)",
      titleColor: "#fff",
      bodyColor: "#fff",
      borderWidth: 0,
      padding: 8,
    },
  },
  interaction: {
    mode: "nearest",
    axis: "x",
    intersect: false,
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: "#9CA3AF",
        font: { size: 12 },
      },
    },
    y: {
      grid: {
        color: "rgba(156,163,175,0.1)",
        borderDash: [4, 4],
      },
      ticks: {
        color: "#9CA3AF",
        font: { size: 12 },
      },
    },
  },
  elements: {
    line: {
      fill: false,
    },
  },
};

export function DottedMultiLineChart() {
  const chartRef = useRef(null);

  useEffect(() => {
    const chart = chartRef.current;
    if (chart) {
      chart.update();
    }
  }, []);

  return (
    <div className="w-full h-[220px]">
      <Line ref={chartRef} data={chartData} options={chartOptions} />
    </div>
  );
}
