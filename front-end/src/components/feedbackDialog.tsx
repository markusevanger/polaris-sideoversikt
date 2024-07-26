
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




export default function FeedbackDialog() {

    const [isOpen, setOpen] = useState(false)
    const [feedback, setFeedback] = useState("")

    const URL = "https://api.markusevanger.no/polaris/papers"
    const handleSubmit = async () => {
        

        
        
        
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
                        <Textarea value={feedback} onChange={(e) => { setFeedback(e.target.value) }} className="min-h-[200px]" placeholder="Bra jobba markus :)"/>
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

