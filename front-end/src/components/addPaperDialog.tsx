
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
import { useState } from "react"
import { Textarea } from "./ui/textarea"
import { getDayFromIndex } from "./formattingFunctions"





export default function AddPaperDialog() {
    const [paperName, setPaperName] = useState("")
    const [info, setInfo] = useState("")
    const [deadline, setDeadline] = useState("15:30")
    const [isOpen, setOpen] = useState(false)

    let weekdays: number[] = [];

    const handleCheckWeekday = (checked:boolean, day:number) => {
        if (checked){
            if (!weekdays.includes(day)){
                weekdays.push(day)
            }
        } else {
            weekdays = weekdays.filter((values) => values != day)
        }
        console.log(weekdays)

    }
    const URL = "https://api.markusevanger.no/polaris/papers"
    const handleSubmit = async () => {
        const avis = { name: paperName, pattern: weekdays, info:info, deadline:deadline  }
        try {
            const response = await fetch(URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(avis)
            })

            if (!response.ok) {
                //throw new Error(`HTTP Error! Status ${response.status}`)
            }

            console.log(response.status + ": " + response.statusText)
            setOpen(false)

            // give feedback here
        }
        catch (err) {
            //console.log("A problem occcured: " + error)
        } finally {
            
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open ) => {setOpen(open)}}>
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
                            <Input placeholder="Agderposten" value={paperName} onChange={(e) => { setPaperName(e.target.value) }}></Input>
                        </div>

                        <div className="grid grid-cols-2 gap-3">

                            <div className="flex flex-col gap-1 border rounded-md p-2 bg-slate-200">
                                <Label>Hvilke dager går avisen ut?</Label>
                                {
                                    
                                    Array.from({ length: 7 }, (_, index) => index).map((_, index: number) => {
                                        return (
                                            <div key={index} className="w-full justify-start p-1">
                                                <Checkbox id={index.toString()} onCheckedChange={(value: boolean) => handleCheckWeekday(value, index)} /> {getDayFromIndex(index)}
                                            </div>
                                        )
                                    })
                                }


                            </div>

                            <div className="grid gap-3 grid-rows-3">
                                <div className="border rounded-md p-2 bg-slate-200">
                                    <Label>Hva er deadline?</Label>
                                    <Input value={deadline} onChange={(e) => {setDeadline(e.target.value)}}></Input>
                                </div>
                                <div className="border rounded-md p-2 row-span-2 bg-slate-200 flex gap-2 flex-col">
                                    <Label>Beskrivelse og info</Label>
                                    <div className="h-full">
                                        <Textarea className=" min-h-full text-sm" value={info} onChange={(e) => {setInfo(e.target.value)}} placeholder="Deadline er 15:00 på fredager ..." />

                                    </div>
                                </div>



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
                            <Button onClick={() => handleSubmit()}> Legg til</Button>
                        </div>
                    </DialogFooter>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

