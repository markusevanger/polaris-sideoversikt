import { useEffect, useState } from "react"
import { buttonVariants } from "./ui/button"
import { Link } from "react-router-dom"
import { ScrollArea, ScrollBar } from "./ui/scroll-area"
import { cn } from "@/lib/utils"
import AddPaperDialog from "./addPaperDialog"
import { Paper } from "./Paper"
import { DatePicker } from "./DatePicker"
import { statusEmoji } from "./formattingFunctions"



export const URL = "https://api.markusevanger.no/polaris/papers"

export default function Dashboard() {

    const [papers, setPapers] = useState([])
    const [date, setDate] = useState<Date | undefined>(new Date())

    async function getPapers() {
        const response = await fetch(URL)
        if (!response.ok) {
            const message = `Error occured: ${response.statusText}`
            console.error(message)
            return
        }
        const papers = await response.json()
        setPapers(papers)
        console.log(`Antall aviser i repsons: ${papers.length}`)

    }
    useEffect(() => {
        getPapers()
    }, [papers.length])

    return (
        <>
            <div className="w-full h-screen">
                <div className="grid grid-cols-5 w-full">

                    {/* Main Left content */}
                    <div className=" col-span-4">

                        <div>
                        </div>

                    </div>

                    {/* Right content */}
                    <div className="bg-gray-200 p-2 h-screen">

                        <DatePicker date={date} setNewDate={((newDate: Date | undefined) => setDate(newDate))}></DatePicker>


                        <ScrollArea className="rounded-md border p-2 h-full pb-10 flex justify-end">
                            <h2 className="text-sm">Aviser  </h2>
                            {
                                papers.map((paper: Paper, index: number) => {
                                    return (
                                        <Link key={index} className={cn(buttonVariants({ variant: "outline" }), "w-full mt-1")} to={`/${paper.nameLowerCase}`}> {statusEmoji(paper.productionStatus)} {paper.name}</Link>
                                    )
                                })
                            }

                            <div className="flex w-full flex-col items-center my-3 gap-2">
                                <p className="text-xs font-mono text-center">Antall aviser: {papers.length}</p>
                                <AddPaperDialog />
                            </div>

                            <ScrollBar />
                        </ScrollArea>

                    </div>
                </div>


            </div>
        </>

    )
}