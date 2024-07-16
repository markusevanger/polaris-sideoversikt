import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"





export default function Details(){

    const URL = "https://api.markusevanger.no/polaris/papers"
    const params = useParams()
    const [paper, setPaper] = useState("undefined")

    useEffect(() => {
        async function getPaper(){
            const name = params.name?.toString() || undefined
            const response = await fetch(URL + "/" + name)
            if (!response.ok) {
                const message = `Error occured: ${response.statusText}`
                console.error(message)
                return
            }
            const paper = await response.json()
            setPaper(paper)
        }
        getPaper()
        console.log(`Hentet avis: ${paper.name}`)
        return
    }, [paper])



    return(
        <h1>Details</h1>
    )
}