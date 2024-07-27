import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, Info } from "lucide-react";
import { getMonthFromIndex, iconStyle, statusEmoji } from "./formattingFunctions";

import {
    Card,
    CardContent,
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

interface Paper {
    _id: string;
    name: string;
    nameLowerCase: string;
    releases: { [key: string]: any };
    deadline: string;
    info: string;
    productionStatus?: string;
}

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

                updatePaperState({
                    _id: paperData._id,
                    name: paperData.name,
                    nameLowerCase: paperData.nameLowerCase,
                    info: paperData.info,
                    deadline: paperData.deadline,
                    releases: paperData.releases[date] || {},
                });
                console.log(`Hentet avis: ${paper.name}`);
            } catch (error) {
                console.error("Error fetching paper data:", error);
            }
        }

        getGeneralPaperInfo();
    }, [name, date]);

    const updateProductionStatus = async (newStatus: "notStarted" | "inProduction" | "done") => {
        try {
            const response = await fetch(`${URL}papers/${name}/${date}/${newStatus}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`Production status updated successfully: ${JSON.stringify(data)}`);
                updatePaperState({ productionStatus: newStatus });
            } else {
                const error = await response.text();
                console.log(`Error updating production status: ${error}`);
            }
        } catch (error) {
            console.log(`Error updating production status: ${error}`);
        }
    };

    const statusText = paper.releases?.productionStatus ? getStatusText(paper.releases.productionStatus) : "";

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
                                    <Select
                                        onValueChange={(value: "notStarted" | "inProduction" | "done") => {
                                            updateProductionStatus(value);
                                        }}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder={` ${statusEmoji(paper.releases?.productionStatus)} ${statusText} `} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="notStarted">🔴 Ikke Begynt</SelectItem>
                                            <SelectItem value="inProduction">🟠 I Produksjon</SelectItem>
                                            <SelectItem value="done">🟢 Ferdig</SelectItem>
                                        </SelectContent>
                                    </Select>
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
                            <div className="h-full w-full flex justify-center items-center">🚧🏗️</div>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    ) : (
        "Laster"
    );
}

function getStatusText(status: string): string {
    if (status === "notStarted") return "Ikke begynt";
    else if (status === "inProduction") return "I produksjon";
    else if (status === "done") return "Ferdig";
    else return status;
}
