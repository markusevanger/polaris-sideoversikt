import { useEffect, useState } from "react"
import { buttonVariants } from "./ui/button"
import { Link } from "react-router-dom"
import { ScrollArea, ScrollBar } from "./ui/scroll-area"
import { cn } from "@/lib/utils"
import AddPaperDialog from "./addPaperDialog"
import { DatePicker } from "./DatePicker"
import { statusEmoji } from "./formattingFunctions"


const getDateFormatted = (date: Date) => {
    if (date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    return;
}
const URL = "https://api.markusevanger.no/polaris/papers"
export default function Dashboard() {

    const [papers, setPapers] = useState([])
    const [date, setDate] = useState<Date | undefined>(new Date())



    async function getPapers() {
        const response = await fetch(`${URL}/${getDateFormatted(date!!)}`)
        if (!response.ok) {
            const message = `Error occured: ${response.statusText}`
            console.error(message)
            return
        }
        const papers = await response.json()
        console.log(papers)
        setPapers(papers)
    }
    useEffect(() => {
        getPapers()
    }, [date])

    return (
        <>
            <div className="w-full h-screen">
                <div className="grid grid-cols-4 w-full">

                    {/* Main Left content */}
                    <div className=" col-span-3">

                        <div className="p-1">

                            <DatePicker date={date} setNewDate={((newDate: Date | undefined) => setDate(newDate))}></DatePicker>

                        </div>

                    </div>

                    {/* Right content */}
                    <div className="bg-gray-200 p-2 h-screen col-span-*">



                        <ScrollArea className="rounded-md border p-2 h-full pb-10 flex justify-end">
                            {

                                papers.length === 0 ?

                                    <p className="text-sm">Ingen aviser hentet. </p>

                                    :


                                    papers.map((paper: any, index: number) => {
                                        return (
                                            <Link key={index} className={cn(buttonVariants({ variant: "outline" }), "w-full mt-1")} to={`/${paper.nameLowerCase}/${getDateFormatted(date!!)}`}> {statusEmoji(paper.productionStatus)} {paper.name}</Link>
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