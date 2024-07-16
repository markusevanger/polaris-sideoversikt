import { release } from "os"
import { useEffect, useState } from "react"
import { Button, buttonVariants } from "./ui/button"
import { Link } from "react-router-dom"
import { ScrollArea, ScrollBar } from "./ui/scroll-area"
import { cn } from "@/lib/utils"


export default function Dashboard(){

    const URL = "https://api.markusevanger.no/polaris/papers"
    
    const [papers, setPapers] =  useState([])

    useEffect(() => {
        async function getPapers(){
            const response = await fetch(URL)
            if (!response.ok) {
                const message = `Error occured: ${response.statusText}`
                console.error(message)
                return
            }
            const papers = await response.json()
            setPapers(papers)
        }
        getPapers()
        console.log(`Antall aviser i repsons: ${papers.length}`)
        return
    }, [papers.length])



    // Add or update
    async function onSubmit(e:any){
        e.preventDefault()
        const paper = { name:"Bømlo Nytt", nameLowerCase: "bomlo-nytt", releaseDates: 0}
        try {
            const response = await fetch(URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(paper)
            })
        } catch(err){
            console.error(err)
        }
    }

    

    return(
        <>
        <div className="w-full h-screen">


          

            <div className="grid grid-cols-5 w-full">
                

                {/* Main Left content */ }
                <div className=" col-span-4">
                    <Button variant={"default"} className="w-20" onClick={(e) => onSubmit(e)}> + </Button>
                </div>

                {/* Right content */ }
                <div className="bg-gray-200 p-2 h-screen">
                        <h2 className="">Aviser</h2>
                        <ScrollArea className="rounded-md border p-2 h-full pb-10 ">
                            {
                            papers.map((paper) => {
                                return(
                                    <Link className={cn(buttonVariants({ variant: "outline" }), "w-full mt-1")} to={`/${paper.nameLowerCase}`}> {paper.name}</Link>
                                )
                            })
                        }
                        <p className="text-xs font-mono text-center">Antall aviser: {papers.length}</p>
                        <ScrollBar/>
                        </ScrollArea>
  

                    
                    
                </div>

            </div>
        
        
        
        </div>
    
        </>
        
    )
}