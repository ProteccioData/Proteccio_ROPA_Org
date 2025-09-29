import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./chart";

const chartData = [
  { month: "Personal Identity", DataTransfer: 186 },
  { month: "Financial Data", DataTransfer: 305 },
  { month: "Health Records", DataTransfer: 237 },
  { month: "Location Data", DataTransfer: 273 },
];

const chartConfig = {
  DataTransfer: {
    label: "Data Transfer",
    color: "var(--chart-1)",
  },
};

export function GlowingStrokeRadarChart() {
  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto max-h-[250px]"
    >
      <RadarChart data={chartData}>
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <PolarAngleAxis dataKey="month" />
        <PolarGrid strokeDasharray="3 3" />
        <Radar
          stroke="var(--color-chart-1)"
          dataKey="DataTransfer"
          fill="none"
          filter="url(#stroke-line-glow)"
        />
        <defs>
          <filter
            id="stroke-line-glow"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
      </RadarChart>
    </ChartContainer>
  );
}
