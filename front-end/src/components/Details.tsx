import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, Info } from "lucide-react";
import { getMonthFromIndex, iconStyle, statusEmoji } from "./formattingFunctions";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { Badge } from "./ui/badge";
import { DeleteDialog } from "./DeleteDialog";
import { PageStatus, Paper } from "./Paper";
import { ScrollArea } from "@radix-ui/react-scroll-area";


export default function Details() {
    const URL = "https://api.markusevanger.no/polaris/";
    const params = useParams();

    const name = params.name?.toString() || undefined;
    const date = params.date?.toString() || undefined;

    const [paper, setPaper] = useState<Paper>({
        _id: "",
        name: "",
        nameLowerCase: "",
        releases: {},
        deadline: "",
        info: "",
    });

    const dateObj = new Date(date!!);

    const updatePaperState = (newState: Partial<Paper>) => {
        setPaper((prevState) => ({
            ...prevState,
            ...newState,
        }));
    };

    useEffect(() => {
        async function getGeneralPaperInfo() {
            if (!name || !date) return;

            try {
                const response = await fetch(`${URL}papers/${name}/${date}`);
                if (!response.ok) {
                    const message = `Error occurred: ${response.statusText}`;
                    console.error(message);
                    return;
                }
                const paperData = await response.json();
                console.log(paperData);

                updatePaperState(paperData);
                console.log(`Hentet avis: ${paperData.name}`);
            } catch (error) {
                console.error("Error fetching paper data:", error);
            }
        }

        getGeneralPaperInfo();
    }, [name, date]);

    const updatePageStatus = async (pageNumber: number, newStatus: PageStatus, isHidden?: boolean) => {
        if (!date || !name) return;

        try {
            const response = await fetch(`${URL}papers/${name}/${date}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    status: newStatus,
                    page: pageNumber,
                    isHidden: isHidden
                }),
            });

            if (response.ok) {
                const updatedPaper: Paper = await response.json();
                setPaper(updatedPaper);
                console.log(`Page status updated successfully for page ${pageNumber}`);
            } else {
                const error = await response.text();
                console.log(`Error updating page status: ${error}`);
            }
        } catch (error) {
            console.log(`Error updating page status: ${error}`);
        }
    };

    return paper ? (
        <>
            <div className="w-full flex justify-center ">
                <div className="h-screen w-full p-5 flex flex-col gap-5 max-w-[1500px]">
                    <div className="flex flex-col gap-2 ">
                        <div className="flex justify-between">
                            <Link to={`/${date}`} className={cn(buttonVariants({ variant: "outline" }), "max-w-40")}>
                                <ChevronLeft /> Til Dashbord
                            </Link>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="flex flex-col gap-2">
                                <h1 className="text-2xl font-bold">{paper.name}</h1>
                                <div className="flex gap-1">
                                    <Badge>{dateObj.getDate()}. {getMonthFromIndex(dateObj.getMonth())} {dateObj.getFullYear()}</Badge>
                                    <p className="text- text-foreground">Trykkfrist: {paper.deadline}</p>
                                </div>
                            </div>
                            <div className="">
                                <DeleteDialog paper={paper}></DeleteDialog>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 grid-rows-4 h-full gap-4">
                        <Card className="h-full p-3 col-span-2">
                            <CardTitle className="text-sm">Status</CardTitle>
                            <CardContent className="h-full">
                                <div className="flex h-full justify-center items-center">

                                </div>
                            </CardContent>
                        </Card>

                        <Card className="h-full p-3 col-span-2">
                            <CardTitle className="flex w-full">
                                <Info className={iconStyle}></Info>
                            </CardTitle>
                            <CardContent className="text-xs">{paper.info || "Ingen info oppgitt."}</CardContent>
                        </Card>

                        <Card className="col-span-4 row-span-3">
                            <CardHeader><CardTitle>Sider</CardTitle></CardHeader>
                            <ScrollArea className="gap-4 p-3 grid grid-cols-2 h-full">


                                {paper.releases[date!!] ? (
                                    Object.entries(paper.releases[date!!].pages).map(([pageNumber, status]) => (
                                        <div
                                            key={pageNumber}
                                            className={`w-full border rounded-sm p-3 flex justify-between items-center`}
                                        >
                                            <span className="font-mono font-bold">{parseInt(pageNumber) + 1}</span>
                                            <Select
                                                value={status}
                                                onValueChange={(value: PageStatus) => updatePageStatus(parseInt(pageNumber), value)}
                                            >
                                                <SelectTrigger className="w-fit">
                                                    <SelectValue placeholder={statusEmoji(status)} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="notStarted">🔴</SelectItem>
                                                    <SelectItem value="inProduction">🟠</SelectItem>
                                                    <SelectItem value="done">🟢</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    ))

                                ) : (
                                    <div>No pages available for this date.</div>
                                )}


                            </ScrollArea>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    ) : (
        "Laster"
    );
}

function getStatusText(status: PageStatus): string {
    if (status === "notStarted") return "Ikke begynt";
    else if (status === "inProduction") return "I produksjon";
    else if (status === "done") return "Ferdig";
    else return status;
}