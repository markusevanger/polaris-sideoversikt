import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie } from "recharts"

export default function RadialChart(props: { done: number, inProduction: number, notStarted: number }) {
  const chartConfig = {
    amountDone: {
      label: "Amount Done",
      color: "#84cc16",
    },
    amountInProduction: {
      label: "Amount In Production",
      color: "#fbbf24",
    },
    amountNotStarted: {
      label: "Amount Not Started",
      color: "#ef4444",
    },
  }
  const chartData = [
    { label: "Ferdig", value: props.done, fill: "var(--color-amountDone)" },
    { label: "I Produksjon", value: props.inProduction, fill: "var(--color-amountInProduction)" },
    { label: "Ikke startet", value: props.notStarted, fill: "var(--color-amountNotStarted)" },
  ]
  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-[250px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
    >
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Pie data={chartData} dataKey="value" label nameKey="label" />
      </PieChart>

    </ChartContainer>
  )
}