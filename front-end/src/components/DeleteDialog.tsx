


/*
import { Dialog, DialogTitle, DialogContent, DialogDescription, DialogHeader, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"
import { Trash2 } from "lucide-react"
import { Paper } from "./Paper"
import { useNavigate } from "react-router-dom"




export function DeleteDialog(props: { paper: Paper }) {

    const navigate = useNavigate()


    // This method will delete a record
    async function deleteRecord() {

        console.log(`${URL}/${paper._id}`)

        const result = await fetch(`${URL}/${paper._id}`, {
            method: "DELETE",
        });
        if (result.ok) {
            navigate("/")
        } else {
            console.log(result.statusText)
        }
    }

    const paper = props.paper

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size={"icon"}><Trash2></Trash2></Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Er du sikker på at du vil slette {paper.name}?</DialogTitle>
                    <DialogDescription>
                        Dette vil slette den fra alle dager. Kun gjør dette vis du vet hva du gjør!
                    </DialogDescription>
                </DialogHeader>
                <div className="flex gap 2 w-full">
                    <Button onClick={() => { deleteRecord() }} className="w-full bg-red-600 gap-1"> <Trash2 className="w-4"></Trash2> Slett {paper.name}</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}


*/