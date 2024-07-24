import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { buttonVariants } from "./ui/button"
import { cn } from "@/lib/utils"
import { ChevronLeft, Info } from "lucide-react"
import { getMonthFromIndex, iconStyle, statusEmoji } from "./formattingFunctions"

import {
    Card,
    CardContent,
    CardDescription,
    CardTitle,
} from "@/components/ui/card"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { DeleteDialog } from "./DeleteDialog"
import { Badge } from "./ui/badge"



export default function Details() {

    const URL = "https://api.markusevanger.no/polaris/"
    const params = useParams()
    const [paper, setPaper] = useState({
        _id: "",
        name: "",
        nameLowerCase: "",
        info: "",
        deadline: "",

        releases: {},
        date: ""

    })

    const [date, setDate] = useState(new Date())

    const updatePaperState = (newState: any) => {
        setPaper((prevState: any) => ({
            ...prevState,
            ...newState
        }));
    };

    useEffect(() => {

        async function getGeneralPaperInfo() {
            const response = await fetch(`${URL}papers/${name}/${date}`)
            if (!response.ok) {
                const message = `Error occured: ${response.statusText}`
                console.error(message)
                return
            }
            const paperData = await response.json()
            console.log(paperData)

            updatePaperState({
                _id: paperData._id,
                name: paperData.name,
                nameLowerCase: paperData.nameLowerCase,
                info: paperData.info,
                deadline: paperData.deadline,
                releases: paperData.releases,
                date: date
            })

        }

        const name = params.name?.toString() || undefined
        const date = params.date?.toString() || undefined

        setDate(new Date(date!!))

        getGeneralPaperInfo()
        console.log(`Hentet avis: ${paper.name}`)
        return
    }, [])

    const updateProductionStatus = async (newStatus: "notStarted" | "inProduction" | "done") => {
        try {
            const response = await fetch(`${URL}${paper.date}/${paper.nameLowerCase}/${newStatus}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`Production status updated successfully: ${JSON.stringify(data)}`);
                updatePaperState({ productionStatus: newStatus })
            } else {
                const error = await response.text();
                console.log(`Error updating production status: ${error}`);
            }
        } catch (error) {
            console.log(`Error updating production status: ${error}`);
        }
    }


    return (

        <>

            <div className="h-screen w-full p-5 flex flex-col">

                <div className="flex flex-col gap-2 ">
                    <div className="flex justify-between">
                        <Link to={"/"} className={cn(buttonVariants({ variant: "outline" }), "max-w-40")}> <ChevronLeft /> Til Dashbord</Link>
                        {/*<DeleteDialog paper={paper}></DeleteDialog>*/}
                    </div>

                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-bold">{paper.name}</h1>
                        <div className="flex gap-1">
                            <Badge>{date.getDate()}. {getMonthFromIndex(date.getMonth())} {date.getFullYear()}</Badge>
                            <p className="text- text-foreground" >Trykkfrist: {paper.deadline}</p>
                        </div>

                    </div>


                </div>

                <div className="grid grid-cols-4 grid-rows-4 p-3 h-full gap-4">

                    <Card className="h-full p-3 col-span-2">
                        <CardTitle className="text-sm">Status</CardTitle>
                        <CardContent className="h-full">
                            <div className="flex h-full justify-center items-center">
                                <Select onValueChange={(value: "notStarted" | "inProduction" | "done") => { updateProductionStatus(value) }}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder={` ${statusEmoji("notStarted")} ${getStatusText("notStarted")} `} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="notStarted">🔴 Ikke Begynt</SelectItem>
                                        <SelectItem value="inProduction">🟠 I Produksjon</SelectItem>
                                        <SelectItem value="done">🟢 Ferdig</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="h-full p-3 col-span-2">
                        <CardTitle className="flex w-full"><Info className={iconStyle}></Info></CardTitle>
                        <CardContent className="text-xs">{paper.info || "Ingen info oppgitt."}</CardContent>
                    </Card>

                </div>





            </div>

        </>


    )
}


function getStatusText(status: string): string {

    if (status == "notStarted") return "Ikke begynt"
    else if (status == "inProduction") return "I produksjon"
    else if (status == "done") return "Ferdig"
    else return "Status er ikke definert (noe gikk galt)"
}