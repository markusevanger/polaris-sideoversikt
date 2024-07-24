

"use client"

import {
    Label,
    PolarGrid,
    PolarRadiusAxis,
    RadialBar,
    RadialBarChart,
} from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"
import { Paper } from "./Paper"
import { getMonthFromIndex } from "./formattingFunctions"



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
    const date = props.date

    const amountOfPapersDone = () => {
        const amountDone = paperData.filter((paper: Paper) => paper.releases[dateStr].productionStatus === "done")
        console.log(paperData)
        return amountDone.length
    }

    const totalLength = () => {
        if (paperData.length > 0) return paperData.length
        else return amountOfPapersDone() + 1
    }

    return (
        <Card className="row-start-2 col-span-3 row-span-4">
            <CardHeader className="pb-0">
                <CardTitle>Oversikt</CardTitle>
                <CardDescription>{date.getDate()}. {getMonthFromIndex(date.getMonth())} {date.getFullYear()}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square"
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
            </CardContent>
        </Card>
    )
}
