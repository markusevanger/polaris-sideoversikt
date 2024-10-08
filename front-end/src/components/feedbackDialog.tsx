
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
import { MessageSquareHeart } from "lucide-react"
import { useState } from "react"
import { Textarea } from "./ui/textarea"
import { useToast } from "./ui/use-toast"




export default function FeedbackDialog() {

    const [isOpen, setOpen] = useState(false)
    const [feedback, setFeedback] = useState("")

    const { toast } = useToast()

    const handleSubmit = async () => {
        try {
            const response = await fetch("https://api.markusevanger.no/polaris/feedback", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({feedback : feedback})
            })

            if (!response.ok) {
                //throw new Error(`HTTP Error! Status ${response.status}`)
            }

            console.log(response.status + ": " + response.statusText)
            setOpen(false)
            setFeedback("")
            toast({
                title: "❤️ Takk for tilbakemelding",
                description: "Tilbakemelding er nå sendt!",
            })
        }
        catch (err) {
            console.log("A problem occcured: " + err)
        }


        setOpen(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { setOpen(open) }}>
            <DialogTrigger className={buttonVariants({ variant: "outline" })}>
                <MessageSquareHeart className="" />
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex gap-1 items-center"><MessageSquareHeart className="" /> Skriv tilbakemelding</DialogTitle>
                    <DialogDescription>Skriv hva enn du tenker om produktet her! All tilbakemelding blir lest av utvikler!</DialogDescription>
                    <div>
                        <Textarea value={feedback} onChange={(e) => { setFeedback(e.target.value) }} className="min-h-[200px] max-h-[600px]" placeholder="Bra jobba markus :)" />
                    </div>


                    <DialogFooter className="p-2">
                        <div className="flex justify-between w-full">
                            <DialogClose asChild>
                                <Button type="button" variant="ghost">
                                    Lukk
                                </Button>
                            </DialogClose>
                            <Button onClick={() => handleSubmit()}> Send</Button>
                        </div>
                    </DialogFooter>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

