import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { Paper } from "./Paper"
import { Button, buttonVariants } from "./ui/button"
import { cn } from "@/lib/utils"
import { ChevronLeft } from "lucide-react"
import { statusEmoji } from "./Dashboard"




export default function Details() {

    const URL = "https://api.markusevanger.no/polaris/papers"
    const params = useParams()
    const [paper, setPaper] = useState(new Paper(undefined, "loading", "", "", 0))

    useEffect(() => {
        async function getPaper() {
            const name = params.name.toString() || undefined
            console.log(name)
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
                    paperData.releaseNumber
                )
            )

        }
        getPaper()
        console.log(`Hentet avis: ${paper.name}`)
        return
    }, [])



    return (

        <>

            <div className="h-screen w-full p-5 flex flex-col">

                <div className="flex gap-2">
                    <Link to={"/"} className={cn(buttonVariants({ variant: "outline" }))}> <ChevronLeft /> Til Dashbord</Link>
                    <h1 className="text-2xl font-bold">{paper.name}</h1>

                </div>

                <div className="h-full w-full flex justify-center items-center">
                    <p> {statusEmoji(paper.productionStatus)} {getStatusText(paper.productionStatus)}</p>
                </div>



            </div>

        </>


    )
}


function getStatusText(status:string) : string {
    
    if (status == "notStarted") return "Ikke begynt"
    else if (status == "inProduction") return "I produksjon"
    else if (status == "done") return "Ferdig"
    else return "Status er ikke definert (noe gikk galt)"
}