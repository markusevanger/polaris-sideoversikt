
import {
    Label,
    PolarGrid,
    PolarRadiusAxis,
    RadialBar,
    RadialBarChart,
} from "recharts"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"
import { Paper } from "./Paper"
import { Skeleton } from "./ui/skeleton"




const chartData = [
    { browser: "chrome", visitors: 4, fill: "var(--color-safari)" },
]

function calculateSectorDegrees(value: number, total: number): number {
    if (total === 0) {
        throw new Error("Total cannot be zero");
    }
    return (value / total) * 360;
}

const chartConfig = {
    visitors: {
        label: "Visitors",
    },
    safari: {
        label: "Safari",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig

export function RadialChart(props: { paperData: Paper[], dateStr: string, date: Date }) {

    const paperData = props.paperData
    const dateStr = props.dateStr
    // const date = props.date

    const amountOfPapersDone = () => {
        const amountDone = paperData.filter((paper: Paper) => {
            // Check if paper.releases and paper.releases[dateStr] are defined before accessing productionStatus
            const release = paper.releases[dateStr];
            return release && release.productionStatus === "done";
        });
        return amountDone.length;
    }

    const totalLength = () => {
        if (paperData.length > 0) return paperData.length
        else return amountOfPapersDone() + 1
    }

    return (

        paperData[0].releases[dateStr] ?

            <div className="flex overflow-hidden h-full">

                <ChartContainer
                    config={chartConfig}
                    className="w-full"
                >
                    <RadialBarChart
                        data={chartData}
                        startAngle={0}
                        endAngle={calculateSectorDegrees(amountOfPapersDone(), totalLength())}
                        innerRadius={80}
                        outerRadius={120}
                    >
                        <PolarGrid
                            gridType="circle"
                            radialLines={false}
                            stroke="none"
                            className="first:fill-muted last:fill-background"
                            polarRadius={[86, 74]}
                        />
                        <RadialBar dataKey="visitors" background cornerRadius={10} />
                        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    className="fill-foreground text-4xl font-bold"
                                                >
                                                    {amountOfPapersDone()}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="fill-muted-foreground"
                                                >
                                                    Aviser ferdigstilt
                                                </tspan>
                                            </text>
                                        )
                                    }
                                }}
                            />
                        </PolarRadiusAxis>
                    </RadialBarChart>
                </ChartContainer>

            </div>
            :

            <Skeleton></Skeleton>
    )
}
