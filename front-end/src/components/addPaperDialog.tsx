
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button, buttonVariants } from "./ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "./ui/checkbox"
import { CirclePlus } from "lucide-react"
import { URL } from "./Dashboard"
import { useState } from "react"
import { error } from "console"
import { useNavigate } from "react-router-dom"





export default function AddPaperDialog() {
    const navigate = useNavigate()
    const [paperName, setPaperName] = useState("")

    type Weekdays = {
        [key: string]: boolean;
      };

    let weekdays:Weekdays = {'Mandag': false, 'Tirsdag': false, 'Onsdag' : false, 'Torsdag' : false, 'Fredag' : false, 'Lørdag' : false, 'Søndag' : false}


    const handleCheckWeekday = (newState:boolean, day:string) => {
        weekdays[day] = newState
    }

    const handleSubmit = async () => {
        const avis = {navn: paperName, releaseDays: weekdays} 
        try {
            const response = await fetch(URL, {
                method:"POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(avis)
            })

            if (!response.ok){
                //throw new Error(`HTTP Error! Status ${response.status}`)
            }

            // give feedback here
        }
        catch (err){
            //console.log("A problem occcured: " + error)
        } finally {
            navigate("/")
        }
    }

    return (
        <Dialog>
            <DialogTrigger className={buttonVariants({ variant: "outline" })}>
                <CirclePlus className="w-4" />
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>📰 Legg til Avis</DialogTitle>
                    <DialogDescription>Her legger du inn nye aviser</DialogDescription>
                    <div className="flex flex-col p-2 gap-3 mt">

                        <div className="flex flex-col gap-1 border rounded-md p-2 bg-slate-200">
                            <Label>Avis navn</Label>
                            <Input placeholder="Agderposten" value={paperName} onChange={(e) => {setPaperName(e.target.value)}}></Input>
                        </div>

                        <div>
                            
                            <div className="flex flex-col gap-1 border rounded-md p-2 bg-slate-200">
                            <Label>Hvilke dager går avisen ut?</Label>
                                {
                                    Object.keys(weekdays).map((day: string, index: number) => {
                                        return (
                                            <div key={index} className="w-full justify-start p-1">
                                                <Checkbox  id={index.toString()} onCheckedChange={(value:boolean) => handleCheckWeekday(value, day)} /> {day}
                                            </div>
                                        )
                                    })
                                }


                            </div>

                        </div>



                    </div>
                    <DialogFooter className="p-2">
                        <div className="flex justify-between w-full">
                            <DialogClose asChild>
                                <Button type="button" variant="ghost">
                                    Lukk
                                </Button>
                            </DialogClose>
                            <Button onClick={() => {console.log(Object.keys(weekdays).filter((day:string) => weekdays[day]))}}> Legg til</Button>
                        </div>
                    </DialogFooter>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

