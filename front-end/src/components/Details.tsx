import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Paper } from "./Paper"





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
            <h1>{paper.name}</h1>
            <p> {paper.productionStatus}</p>

        </>


    )
}