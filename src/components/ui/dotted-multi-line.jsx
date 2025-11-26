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

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
);


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

export function DottedMultiLineChart({ data }) {
  const chartRef = useRef(null);
  if (!data || data.length === 0)
    return (
      <div className="w-full h-[220px] flex items-center justify-center text-gray-400">
        No data
      </div>
    );

  const labels = data.map((d) => d.label);

  const chartData = {
    labels,
    datasets: [
      {
        label: "LIA",
        data: data.map((d) => d.LIA || 0),
        borderColor: "#10B981",
        backgroundColor: "#10B981",
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
      },
      {
        label: "DPIA",
        data: data.map((d) => d.DPIA || 0),
        borderColor: "#F97316",
        backgroundColor: "#F97316",
        borderWidth: 2,
        borderDash: [6, 6],
        tension: 0.4,
        pointRadius: 0,
      },
      {
        label: "TIA",
        data: data.map((d) => d.TIA || 0),
        borderColor: "#8B5CF6",
        backgroundColor: "#8B5CF6",
        borderWidth: 2,
        borderDash: [4, 6],
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

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
