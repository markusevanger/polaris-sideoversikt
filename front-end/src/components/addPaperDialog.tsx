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
import { CirclePlus, Settings } from "lucide-react"
import { useState, useEffect } from "react"
import { Textarea } from "./ui/textarea"
import { getDayFromIndex } from "./formattingFunctions"
import { Paper } from "./Paper"

interface AddPaperDialogProps {
    getPapers?: () => void;
    paper?: Paper;
}

export default function AddPaperDialog({ getPapers, paper }: AddPaperDialogProps) {
    const [paperName, setPaperName] = useState(paper ? paper.name : "");
    const [info, setInfo] = useState(paper ? paper.info : "");
    const [deadline, setDeadline] = useState(paper ? paper.deadline : "15:30");
    const [isOpen, setOpen] = useState(false);
    const [defaultPages, setDefaultPages] = useState(paper ? paper.defaultPages : "24");
    const [weekdays, setWeekdays] = useState<number[]>(paper && paper.pattern ? paper.pattern : []);

    useEffect(() => {
        if (paper) {
            setPaperName(paper.name);
            setInfo(paper.info);
            setDeadline(paper.deadline);
            setDefaultPages(paper.defaultPages);
            setWeekdays(paper.pattern);
        }
    }, [paper]);

    const handleCheckWeekday = (checked: boolean, day: number) => {
        setWeekdays((prevWeekdays) =>
            checked ? [...prevWeekdays, day] : prevWeekdays.filter((value) => value !== day)
        );
    };

    const URL = "https://api.markusevanger.no/polaris/papers";
    const handleSubmit = async () => {


        if (!(weekdays.length > 0)){
            return
        }

        const avis = { name: paperName, pattern: weekdays, info: info, deadline: deadline, defaultPages: defaultPages }; // Removed deadline from the request body
        const method = paper ? "PATCH" : "POST";
        const endpoint = paper ? `${URL}/${paper._id}` : URL;

        try {
            const response = await fetch(endpoint, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(avis),
            });

            if (!response.ok) {
                throw new Error(`HTTP Error! Status ${response.status}`);
            }

            console.log(response.status + ": " + response.statusText);
            if (getPapers) {
                getPapers();
            }
            setOpen(false);
        } catch (err) {
            console.log("A problem occurred: " + err);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => setOpen(open)}>
            <DialogTrigger className={buttonVariants({ variant: "outline", size: "icon" })}>
                {paper ? <Settings className="" /> : <CirclePlus className="" />}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>📰 {paper ? "Rediger Avis" : "Legg til Avis"}</DialogTitle>
                    <DialogDescription>{paper ? "Her redigerer du avisen" : "Her legger du inn nye aviser"}</DialogDescription>
                    <div className="flex flex-col p-2 gap-3 mt">
                        <div className="flex flex-col gap-1 border rounded-md p-2">
                            <Label>Avis navn</Label>
                            <Input placeholder="Agderposten" value={paperName} onChange={(e) => setPaperName(e.target.value)} />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-col gap-1 border rounded-md p-2">
                                    <Label>Hvilke dager går avisen ut?</Label>
                                    {Array.from({ length: 7 }, (_, index) => (
                                        <div key={index} className="w-full justify-start p-1">
                                            <Checkbox
                                                id={index.toString()}
                                                checked={weekdays.includes(index)}
                                                onCheckedChange={(value: boolean) => handleCheckWeekday(value, index)}
                                            />
                                            {getDayFromIndex(index)}
                                        </div>
                                    ))}
                                </div>

                                <div className="border p-2 rounded-md">
                                    <Label>Hvor mange sider er avisen som regel?</Label>
                                    <Input value={defaultPages} onChange={(e) => setDefaultPages(e.target.value)} type="number" />
                                </div>
                            </div>

                            <div className="grid gap-3 grid-rows-3">
                                <div className="border rounded-md p-2">
                                    <Label>Hva er deadline?</Label>
                                    <Input value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                                </div>
                                <div className="border rounded-md p-2 row-span-2 flex gap-2 flex-col">
                                    <Label>Beskrivelse og info</Label>
                                    <div className="h-full">
                                        <Textarea
                                            className="min-h-full text-sm"
                                            value={info}
                                            onChange={(e) => setInfo(e.target.value)}
                                            placeholder="Deadline er 15:00 på fredager ..."
                                        />
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
                            <Button onClick={handleSubmit}>{paper ? "Oppdater" : "Legg til"}</Button>
                        </div>
                    </DialogFooter>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}
