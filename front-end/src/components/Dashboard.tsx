import { useEffect, useState } from "react"
import { buttonVariants } from "./ui/button"
import { Link, useParams } from "react-router-dom"
import { ScrollArea, ScrollBar } from "./ui/scroll-area"
import { cn } from "@/lib/utils"
import AddPaperDialog from "./addPaperDialog"
import { DatePicker } from "./DatePicker"
import { statusEmoji } from "./formattingFunctions"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Newspaper } from "lucide-react"
import { RadialChart } from "./RadialChart"
import { Paper } from "./Paper"


const getDateFormatted = (date: Date | undefined) => {
    if (date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    return '';
}

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
        getPapers()
    }, [date])

    return (
        <div className="w-full h-screen grid grid-rows-12 grid-cols-12 p-5 gap-3">

            <DatePicker className={"col-span-4 overflow-hidden"} date={date} setNewDate={(newDate: Date) => setDate(newDate)} />
            <div className=" col-span-5"></div>


            <RadialChart date={date} dateStr={dateStr} paperData={papers}></RadialChart>








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
                            <AddPaperDialog />
                        </div>
                        <ScrollBar />
                    </ScrollArea>
                </CardContent>
            </Card>

        </div >
    )
}
