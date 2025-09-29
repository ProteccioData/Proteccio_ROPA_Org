import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartData = [
  { month: "January", Assessments: 186, LIA: 87, DPIA: 74, TIA: 204 },
  { month: "February", Assessments: 305, LIA: 163, DPIA: 24, TIA: 24 },
  { month: "March", Assessments: 237, LIA: 142, DPIA: 104, TIA: 74 },
  { month: "April", Assessments: 73, LIA: 195, DPIA: 124, TIA: 94 },
  { month: "May", Assessments: 209, LIA: 118, DPIA: 14, TIA: 24 },
  { month: "June", Assessments: 214, LIA: 231, DPIA: 34, TIA: 204 },
];

const chartConfig = {
  Assessments: {
    label: "Assessments",
    color: "var(--chart-1)",
  },
  LIA: {
    label: "LIA",
    color: "var(--chart-2)",
  },
  DPIA: {
    label: "DPIA",
    color: "var(--chart-3)",
  },
  TIA: {
    label: "TIA",
    color: "var(--chart-4)",
  },
};

export function DottedMultiLineChart() {
  return (
    <ChartContainer config={chartConfig}>
      <LineChart
        accessibilityLayer
        data={chartData}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Line
          dataKey="Assessments"
          type="linear"
          stroke="var(--color-chart-1)"
        />
        <Line
          dataKey="LIA"
          type="linear"
          stroke="var(--color-chart-2)"
          dot={false}
          strokeDasharray="4 4"
        />
        <Line
          dataKey="DPIA"
          type="linear"
          stroke="var(--color-chart-3)"
          dot={false}
          strokeDasharray="4 4"
        />
        <Line
          dataKey="TIA"
          type="linear"
          stroke="var(--color-chart-4)"
          dot={false}
          strokeDasharray="4 4"
        />
      </LineChart>
    </ChartContainer>
  );
}
