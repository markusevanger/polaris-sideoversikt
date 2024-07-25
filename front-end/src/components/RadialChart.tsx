import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie } from "recharts"
import { Paper } from "./Paper";
import { amountOfPapers } from "./formattingFunctions";

export default function RadialChart(props : {date:Date, dateStr:string, paperData:Paper[]} ) {


    //const date = props.date
    const dateStr = props.dateStr
    const paperData = props.paperData




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
    { label: "Ferdig", value: amountOfPapers("done", paperData, dateStr), fill: "var(--color-amountDone)" },
    { label: "I Produksjon", value: amountOfPapers("inProduction", paperData, dateStr), fill: "var(--color-amountInProduction)" },
    { label: "Ikke startet", value: amountOfPapers("notStarted", paperData, dateStr), fill: "var(--color-amountNotStarted)" },
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