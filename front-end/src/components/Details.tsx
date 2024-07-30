import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button, buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";
import { Check, ChevronLeft, Files, Info, PieChart } from "lucide-react";
import { countPagesWithStatus, getMonthFromIndex, getPaperStatus, statusEmoji } from "./formattingFunctions";

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
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import RadialChart from "./RadialChart";
import AddPaperDialog from "./addPaperDialog";


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
        pattern: []
    });


    const [pageAmount, setPageAmount] = useState(0)

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
                setPageAmount(Object.keys(paperData.releases[date!!].pages).length)
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


    const updatePaperDetails = async (options: { status?: PageStatus; pageCount?: number }) => {
        if (!date || !name) return;

        try {
            const response = await fetch(`${URL}papers/${name}/${date}/update`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(options),
            });

            if (response.ok) {
                const updatedPaper: Paper = await response.json();
                setPaper(updatedPaper);

                if (options.status) {
                    console.log(`All pages status updated successfully to ${options.status}`);
                }
                if (options.pageCount !== undefined) {
                    console.log(`Page count updated to ${options.pageCount}`);
                }
            } else {
                const error = await response.text();
                console.log(`Error updating paper details: ${error}`);
            }
        } catch (error) {
            console.log(`Error updating paper details: ${error}`);
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
                                <AddPaperDialog paper={paper}></AddPaperDialog>
                                <DeleteDialog paper={paper}></DeleteDialog>
                            </div>
                        </div>
                    </div>



                    <div className="grid grid-cols-8 grid-rows-8 h-full gap-4">
                        <Card className="h-full p-3 lg:col-span-4 col-span-full row-span-2">
                            <CardTitle className="flex gap-2"> <PieChart></PieChart> Status</CardTitle>
                            <CardContent className="h-full">

                                <RadialChart
                                    notStarted={countPagesWithStatus(paper, date!!, "notStarted")}
                                    inProduction={countPagesWithStatus(paper, date!!, "inProduction")}
                                    done={countPagesWithStatus(paper, date!!, "done")}
                                >
                                </RadialChart>

                            </CardContent>
                        </Card>

                        <div className="h-full lg:col-span-4 row-span-2 grid grid-cols-2 grid-rows-3 gap-3 col-span-full">
                            <Card className="p-3 row-span-2 col-span-2">
                                <CardTitle className="flex gap-2">
                                    <Info ></Info>
                                    Info
                                </CardTitle>
                                <CardContent className="text-xs">{paper.info || "Ingen info oppgitt."}</CardContent>
                            </Card>


                            <Card className="p-3">
                                <Label>Endre status for hele avis:</Label>
                                <Select
                                    value={getPaperStatus(paper, date!!)!!}
                                    onValueChange={(value: PageStatus) => updatePaperDetails({ status: value })}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={statusEmoji(getPaperStatus(paper, date!!)!!)} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="notStarted">🔴 Ikke startet</SelectItem>
                                        <SelectItem value="inProduction">🟠 I Produksjon</SelectItem>
                                        <SelectItem value="done">🟢 Ferdig</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Card>


                            <Card className="p-3">
                                <div className="flex flex-col">
                                    <div>
                                        <Label>Sidetall: </Label>
                                        <div className="flex gap-1">
                                            <Input type="number" value={pageAmount} onChange={(value) => setPageAmount(parseInt(value.target.value))}></Input>
                                            <Button size={"icon"} variant={"secondary"} onClick={() => updatePaperDetails({ pageCount: pageAmount })}><Check></Check></Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>







                        <Card className="col-span-8 h-fit mb-4">
                            <CardHeader className="">
                                <CardTitle className="flex gap-2"><Files />Sider</CardTitle>
                            </CardHeader>

                            <div className="grid grid-cols-2 gap-2 p-3">
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
                            </div>
                        </Card>
                    </div>
                </div>
            </div >
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