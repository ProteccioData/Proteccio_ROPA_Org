import { LabelList, Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./chart";

export const description = "A pie chart with a label list";

const chartData = [
  { Stage: "infovoyage", RoPA: 275, fill: "var(--color-chart-1)" },
  { Stage: "checksync", RoPA: 200, fill: "var(--color-chart-2)" },
  { Stage: "beam", RoPA: 187, fill: "var(--color-chart-3)" },
  { Stage: "offdoff", RoPA: 173, fill: "var(--color-chart-4)" },
];

const chartConfig = {
  RoPA: {
    label: "RoPA",
  },
  infovoyage: {
    label: "InfoVoyage",
    color: "var(--chart-1)",
  },
  checksync: {
    label: "CheckSync",
    color: "var(--chart-2)",
  },
  beam: {
    label: "Beam",
    color: "var(--chart-3)",
  },
  offdoff: {
    label: "OffDoff",
    color: "var(--chart-3)",
  },
};

export function RoundedPieChart() {
  return (
    <ChartContainer
      config={chartConfig}
      className="[&_.recharts-text]:fill-background mx-auto aspect-square max-h-[250px]"
    >
      <PieChart>
        <ChartTooltip
          content={<ChartTooltipContent nameKey="Stage" />}
        />
        <Pie
          data={chartData}
          innerRadius={30}
          dataKey="RoPA"
          nameKey="Stage"
          radius={10}
          cornerRadius={8}
          paddingAngle={4}
        >
          <LabelList
            dataKey="RoPA"
            stroke="none"
            fontSize={12}
            fontWeight={500}
            fill="currentColor"
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}
