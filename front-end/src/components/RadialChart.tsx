import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { CircleSlash } from "lucide-react"
import { PieChart, Pie } from "recharts"
import { colorFromStatus } from "./formattingFunctions"

export default function RadialChart(props: { done: number, inProduction: number, notStarted: number, readyForProduction: number, productionDone: number }) {
  const chartConfig = {
    amountDone: {
      label: "Amount Done",
      color: colorFromStatus("done"),
    },
    amountInProduction: {
      label: "Amount In Production",
      color: colorFromStatus("inProduction"),
    },
    amountNotStarted: {
      label: "Amount Not Started",
      color: colorFromStatus("notStarted"),
    },
    amountReady: {
      label: "Amount Ready for Production",
      color: colorFromStatus("readyForProduction"),
    },
    amountProductionDone: {
      label: "Amount production done",
      color: colorFromStatus("productionDone"),
    },
  }
  const chartData = [
    { label: "Ferdig", value: props.done, fill: "var(--color-amountDone)" },
    { label: "I Produksjon", value: props.inProduction, fill: "var(--color-amountInProduction)" },
    { label: "Ikke startet", value: props.notStarted, fill: "var(--color-amountNotStarted)" },
    { label: "Klar for produksjon", value: props.readyForProduction, fill: "var(--color-amountReady)" },
    { label: "Produksjon ferdig", value: props.productionDone, fill: "var(--color-amountProductionDone)" },
  ]
  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-[250px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
    >

      {
        props.done > 0 || props.inProduction > 0 || props.notStarted > 0 || props.readyForProduction > 0 || props.productionDone > 0 ?
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="value" label nameKey="label" />
          </PieChart>

          :

          <div className="w-full h-full flex flex-col gap-1 justify-center items-center">
            <CircleSlash></CircleSlash>
            <p>Ingen data å vise</p>
          </div>
      }


    </ChartContainer>
  )
}