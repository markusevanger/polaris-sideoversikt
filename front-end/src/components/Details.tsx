import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { buttonVariants } from "./ui/button"
import { cn } from "@/lib/utils"
import { ChevronLeft } from "lucide-react"
import { statusEmoji } from "./formattingFunctions"

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

    const URL = "https://api.markusevanger.no/polaris/"
    const params = useParams()
    const [paper, setPaper] = useState({
        _id: "",
        name: "",
        nameLowerCase: "",
        info: "",
        deadline: "",
        releaseDates: [],

        productionStatus: "",
        date: ""

    })

    const updatePaperState = (newState: any) => {
        setPaper((prevState: any) => ({
            ...prevState,
            ...newState
        }));
    };

    useEffect(() => {

        async function getGeneralPaperInfo() {
            const response = await fetch(`${URL}papers/${name}`)
            if (!response.ok) {
                const message = `Error occured: ${response.statusText}`
                console.error(message)
                return
            }
            const paperData = await response.json()

            updatePaperState({
                _id: paperData._id,
                name: paperData.name,
                nameLowerCase: paperData.nameLowerCase,
                info: paperData.info,
                deadline: paperData.deadline,
                releaseDates: paperData.releaseDates,
                date: date
            })

        }
        async function getPaperdataForDate() {
            const response = await fetch(`${URL}dates/${name}/${date}`)
            if (!response.ok) {
                const message = `Error occured: ${response.statusText}`
                console.error(message)
                return
            }
            const datePaperData = await response.json()
            updatePaperState(
                {
                    productionStatus: datePaperData.productionStatus
                }
            )

        }

        const name = params.name?.toString() || undefined
        const date = params.date?.toString() || undefined

        getGeneralPaperInfo()
        getPaperdataForDate()
        console.log(`Hentet avis: ${paper.name}`)
        return
    }, [])

    const updateProductionStatus = async (newStatus: "notStarted" | "inProduction" | "done") => {
        try {
            const response = await fetch(`${URL}/dates/${paper.date}/${paper.nameLowerCase}/${newStatus}`, {
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
                    {
                        /*
                        <div className="flex justify-between">
                            <Link to={"/"} className={cn(buttonVariants({ variant: "outline" }), "max-w-40")}> <ChevronLeft /> Til Dashbord</Link>
                            <DeleteDialog paper={paper}></DeleteDialog>
                        </div>
                        */

                    }


                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-bold">{paper.name}</h1>
                        <p className="text-sm text-foreground" >Trykkfrist: {paper.deadline}</p>

                    </div>


                </div>

                <div className="h-full w-full flex flex-col gap-5 justify-center items-center">
                    <Select onValueChange={(value: "notStarted" | "inProduction" | "done") => { updateProductionStatus(value) }}>
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
                            <CardTitle className="text-sm text-muted-foreground "> Info </CardTitle>
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