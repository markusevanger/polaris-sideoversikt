import { useEffect, useState } from "react"
import { buttonVariants } from "./ui/button"
import { Link, useParams } from "react-router-dom"
import { ScrollArea, ScrollBar } from "./ui/scroll-area"
import { cn } from "@/lib/utils"
import AddPaperDialog from "./addPaperDialog"
import { DatePicker } from "./DatePicker"
import { getDateFormatted, getMonthFromIndex, statusEmoji } from "./formattingFunctions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Newspaper } from "lucide-react"
import { RadialChart } from "./RadialChart"
import { Paper } from "./Paper"
import { Skeleton } from "./ui/skeleton"



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
    }

    useEffect(() => {
        setPapers([])
        getPapers()
    }, [date])

    return (
        <div className="w-full h-screen grid grid-rows-12 grid-cols-12 p-5 gap-3">

            <DatePicker className={"col-span-4 overflow-hidden"} date={date} setNewDate={(newDate: Date) => setDate(newDate)} />
            <div className=" col-span-5"></div>

            <Card className="row-start-2 col-start-1 col-end-10 row-span-5">
                <CardHeader className="pb-0">
                    <CardTitle>Oversikt</CardTitle>
                    <CardDescription>{date.getDate()}. {getMonthFromIndex(date.getMonth())} {date.getFullYear()}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                    {papers.length > 0 ? (
                        <RadialChart date={date} dateStr={dateStr} paperData={papers} />
                    ) : (
                        <Skeleton className="w-full h-full rounded-lg p-5" />
                    )}
                </CardContent>

            </Card>







            <Card className="row-span-full col-end-13 col-span-3 ">
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
                                        <Link key={index} className={cn(buttonVariants({ variant: "outline" }), "w-full mt-1 justify-start")} to={`/${paper.nameLowerCase}/${getDateFormatted(date)}`}>
                                            {release ? statusEmoji(release.productionStatus) : '❓'} {paper.name}
                                        </Link>
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

        </div >
    )
}
