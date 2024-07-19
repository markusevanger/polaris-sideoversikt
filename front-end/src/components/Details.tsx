import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { Paper } from "./Paper"
import { buttonVariants } from "./ui/button"
import { cn } from "@/lib/utils"
import { ChevronLeft } from "lucide-react"
import { statusEmoji } from "./Dashboard"

import {
    Card,
    CardContent,

    CardHeader,
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



export default function Details() {

    const URL = "https://api.markusevanger.no/polaris/papers"
    const params = useParams()
    const [paper, setPaper] = useState(new Paper(undefined, "loading", "", "notStarted", 0, "", ""))

    useEffect(() => {
        async function getPaper() {
            const name = params.name.toString() || undefined
            const response = await fetch(URL + "/" + name)
            if (!response.ok) {
                const message = `Error occured: ${response.statusText}`
                console.error(message)
                return
            }
            const paperData = await response.json()

            setPaper(
                new Paper(
                    paperData._id,
                    paperData.name,
                    paperData.nameLowerCase,
                    paperData.productionStatus,
                    paperData.releaseNumber,
                    paperData.info,
                    paperData.deadline
                )
            )

        }
        getPaper()
        console.log(`Hentet avis: ${paper.name}`)
        return
    }, [])

    const updatePaper = async (newPaper:Paper) => {
        const response = await fetch(`${URL}/${paper._id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newPaper),
        });

        if (!response.ok) {
            const message = `Error occured: ${response.statusText}`
            console.error(message)
            return
        } else {
            console.log(newPaper)
            setPaper(newPaper)
        }
    }

    const statusChange = async (newStatus: "notStarted" | "inProduction" | "done") => {
        console.log("changing status to: " + newStatus)
        const newPaper = paper
        newPaper.productionStatus = newStatus
        updatePaper(newPaper)
    }

    return (

        <>

            <div className="h-screen w-full p-5 flex flex-col">

                <div className="flex flex-col gap-2 ">
                    <div className="flex justify-between">
                        <Link to={"/"} className={cn(buttonVariants({ variant: "outline" }), "max-w-40")}> <ChevronLeft /> Til Dashbord</Link>
                        <DeleteDialog paper={paper}></DeleteDialog>
                    </div>

                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-bold">{paper.name}</h1>
                        <p className="text-sm text-foreground" >Trykkfrist: {paper.deadline}</p>

                    </div>


                </div>

                <div className="h-full w-full flex flex-col gap-5 justify-center items-center">
                    <Select onValueChange={(value: "notStarted" | "inProduction" | "done") => { statusChange(value) }}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={` ${statusEmoji(paper.productionStatus)} ${getStatusText(paper.productionStatus)} `} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="notStarted">🔴 Ikke Begynt</SelectItem>
                            <SelectItem value="inProduction">🟠 I Produksjon</SelectItem>
                            <SelectItem value="done">🟢 Ferdig</SelectItem>
                        </SelectContent>
                    </Select>

                    <Card className="max-w-40">
                        <CardHeader>
                            <CardTitle> Info </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>{paper.info}</p>
                        </CardContent>
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