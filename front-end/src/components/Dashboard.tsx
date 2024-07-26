import { useEffect, useState } from "react"
import { Button, buttonVariants } from "./ui/button"
import { Link, useParams } from "react-router-dom"
import { ScrollArea, ScrollBar } from "./ui/scroll-area"
import { cn } from "@/lib/utils"
import AddPaperDialog from "./addPaperDialog"
import { DatePicker } from "./DatePicker"
import { amountOfPapers, getDateFormatted, getDayFromIndex, getMonthFromIndex, statusEmoji } from "./formattingFunctions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"

import RadialChart from "./RadialChart"
import { Paper } from "./Paper"
import { Skeleton } from "./ui/skeleton"
import { BigNumberCard } from "./BigNumberCard"


import { Newspaper, PieChart, LayoutDashboard, Activity, MessageSquareMore } from "lucide-react"
import { Badge } from "./ui/badge"
import ToggleDarkModeButton from "./ToggleDarkModeButton"

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import FeedbackDialog from "./feedbackDialog"


const URL = "https://api.markusevanger.no/polaris/papers"

export default function Dashboard() {
    const params = useParams()
    let dateStr = params.date?.toString() || undefined

    let selectedDate = new Date()
    if (dateStr) {
        selectedDate = new Date(dateStr)
    } else {
        dateStr = getDateFormatted(selectedDate)
    }

    const [papers, setPapers] = useState<Paper[]>([])
    const [date, setDate] = useState<Date>(selectedDate)
    const [lastUpdated, setLastUpdated] = useState<Date>()


    async function getPapers() {
        const response = await fetch(`${URL}/${getDateFormatted(date)}`)
        if (!response.ok) {
            if (response.status) {
                console.log("No papers found")
                setPapers([])
                return
            }
            const message = `Error occured: ${response.statusText}`
            console.error(message)
            return
        }
        const papers: Paper[] = await response.json()
        setPapers(papers)
        setLastUpdated(new Date())
    }

    useEffect(() => {
        setPapers([])
        getPapers()
    }, [date])

    return (
        <div className="w-full flex justify-center ">


            <div className="mt-5 w-full max-w-[1500px] h-screen flex flex-col p-5 gap-3 items-center justify-center">
                <div className="w-full">
                    <div className="flex gap-3">
                        <h1 className="text-lg font-bold flex gap-2 p-0 m-0"><LayoutDashboard />Sideoversikt</h1>

                        <Badge variant={"secondary"} className="text-sm font-mono flex gap-2 flex-wrap text-wrap">

                            <Activity className="h-4 w-auto" />
                            {
                                lastUpdated ? `${lastUpdated.getHours()}:${lastUpdated.getMinutes()}:${lastUpdated.getSeconds()}` : "Laster..."
                            }
                        </Badge>

                    </div>



                </div>

                <TooltipProvider>
                    <div className="flex gap-1 justify-between  w-full row-start-2">
                        <Tooltip>
                            <TooltipTrigger>
                                <DatePicker date={date} setNewDate={(newDate: Date) => setDate(newDate)} />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Endre dato for oversikt</p>
                            </TooltipContent>

                        </Tooltip>
                        <div className="flex gap-1">

                            <Tooltip>
                                <TooltipTrigger>
                                    <FeedbackDialog />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Skriv tilbakemelding</p>
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger><ToggleDarkModeButton />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Endre tema</p>
                                </TooltipContent>
                            </Tooltip>


                        </div>

                    </div>
                </TooltipProvider>


                <div className="grid gap-3 w-full">

                    <div className="grid grid-rows-3 gap-3">
                        <Card className="row-span-2 w-full">
                            <CardHeader className=" pb-0">
                                <CardTitle className="flex gap-2"> <PieChart /> Oversikt</CardTitle>
                                <CardDescription>{`${getDayFromIndex((date.getDay() + 6) % 7)} ${date.getDate()}.${getMonthFromIndex(date.getMonth())}.${date.getFullYear()}`}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                {papers.length > 0 ? (
                                    <RadialChart date={date} dateStr={dateStr} paperData={papers} />
                                ) : (
                                    <Skeleton className="w-full h-full rounded-lg p-5" />
                                )}
                            </CardContent>
                        </Card>
                        <div className="grid gap-3 row-start-1 grid-cols-3">
                            <BigNumberCard number={amountOfPapers("done", papers, dateStr)} title="🟢 Ferdig"></BigNumberCard>
                            <BigNumberCard number={amountOfPapers("inProduction", papers, dateStr)} title="🟠 I Produksjon"></BigNumberCard>
                            <BigNumberCard number={amountOfPapers("notStarted", papers, dateStr)} title="🔴 Ikke startet"></BigNumberCard>
                        </div>

                    </div>
                    <Card className="">
                        <CardHeader>
                            <CardTitle className="flex gap-2">
                                <Newspaper></Newspaper> Aviser
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="">
                                {
                                    papers.length === 0 ?
                                        <p className="text-xs text-mono">Ingen aviser hentet</p> :


                                        papers.map((paper: Paper, index: number) => {
                                            const release = paper.releases[getDateFormatted(date)];

                                            return (
                                                <div key={index} className={cn(buttonVariants({ variant: "outline" }), "flex justify-between mb-1 items-center")}>
                                                    <Link className={"w-full justify-start"} to={`/${paper.nameLowerCase}/${getDateFormatted(date)}`}>
                                                        {release ? statusEmoji(release.productionStatus) : '❓'} {paper.name}
                                                    </Link>
                                                    <Badge variant={"secondary"}>
                                                        <p className="font-mono text-xs text-muted-foreground">{paper.deadline}</p>
                                                    </Badge>

                                                </div>

                                            )
                                        })
                                }
                                <div className="flex w-full flex-col items-center my-3 gap-2">
                                    <p className="text-xs font-mono text-center">Antall aviser: {papers.length}</p>
                                    <AddPaperDialog getPapers={getPapers} />
                                </div>
                                <ScrollBar />
                            </ScrollArea>
                        </CardContent>
                    </Card>

                </div>

            </div >
        </div >
    )
}
