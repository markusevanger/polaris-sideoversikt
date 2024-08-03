import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button, buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";
import { Check, ChevronLeft, Files, Info, OctagonX, PieChart, RefreshCcw, RefreshCw } from "lucide-react";
import { countPagesWithStatus, getMonthFromIndex, getPaperStatus, getStatusText, statusEmoji } from "./formattingFunctions";
import debounce from 'lodash.debounce';


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
        pattern: [],
        defaultPages: ""
    });


    type TextValues = {
        [key: string]: string;
    };

    const [textValues, setTextValues] = useState<TextValues>({});
    const [syncedStatus, setSyncedStatus] = useState<"error" | "loading" | "done">("loading")


    const [pageAmount, setPageAmount] = useState(0)



    const dateObj = new Date(date!!);

    const updatePaperState = (newState: Partial<Paper>) => {
        setPaper((prevState) => ({
            ...prevState,
            ...newState,
        }));
    };

    const handleTextChange = (pageNumber: number, newValue: string) => {
        setTextValues((prevValues) => ({
            ...prevValues,
            [pageNumber]: newValue,
        }));
        setSyncedStatus("loading");
        debouncedUpdatePageStatus(pageNumber, newValue);
    };


    const debouncedUpdatePageStatus = useRef(
        debounce(async (pageNumber: number, newValue: string) => {
            try {
                await updatePageStatus(pageNumber, undefined, newValue);
                setSyncedStatus('done');
            } catch (error) {
                setSyncedStatus('error');
                console.error('Failed to update page:', error);
            }
        }, 500)
    ).current;



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
            setSyncedStatus("done")
            console.log(`Hentet avis: ${paperData.name}`);
        } catch (error) {
            console.error("Error fetching paper data:", error);
        }
    }
    useEffect(() => {
        getGeneralPaperInfo();
    }, [name, date]);

    const updatePageStatus = async (pageNumber: number, newStatus?: PageStatus, newText?: string) => {
        if (!date || !name) return;

        try {
            const response = await fetch(`${URL}papers/${name}/${date}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    status: newStatus,
                    text: newText,
                    page: pageNumber
                }),
            });

            if (response.ok) {
                const updatedPaper: Paper = await response.json();
                setPaper(updatedPaper);
                console.log(`Page status and text updated successfully for page ${pageNumber}`);
                setSyncedStatus("done");
            } else {
                const error = await response.text();
                console.log(`Error updating page status and text: ${error}`);
                setSyncedStatus("error");
            }
        } catch (error) {
            console.log(`Error updating page status and text: ${error}`);
            setSyncedStatus("error");
        }
    };



    const updatePaperDetails = async (options: { status?: PageStatus; pageCount?: number; isHidden?: boolean; xmlDone?: boolean }) => {
        if (!date || !name) return;

        try {
            const response = await fetch(`${URL}papers/${name}/${date}`, {
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
                if (options.isHidden !== undefined) {
                    console.log(`Hidden status updated to ${options.isHidden}`);
                }
                if (options.xmlDone !== undefined) {
                    console.log(`XML done status updated to ${options.xmlDone}`);
                }
                setSyncedStatus("done");
            } else {
                const error = await response.text();
                console.log(`Error updating paper details: ${error}`);
                setSyncedStatus("error");
            }
        } catch (error) {
            console.log(`Error updating paper details: ${error}`);
            setSyncedStatus("error");
        }
    };


    return paper ? (
        <>
            <div className="w-full flex justify-center ">
                <div className="w-full p-5 flex flex-col gap-5 max-w-[1500px]">



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
                            <div className="flex gap-1">
                                <AddPaperDialog paper={paper} getPapers={getGeneralPaperInfo} ></AddPaperDialog>
                                <DeleteDialog paper={paper}></DeleteDialog>
                            </div>
                        </div>
                    </div>



                    <div className="">
                        <Card className="">
                            <CardTitle className="flex gap-2"> <PieChart></PieChart> Status</CardTitle>
                            <CardContent className="h-full">



                                {
                                    date && paper.releases[date!!] ?
                                        <RadialChart

                                            notStarted={countPagesWithStatus(paper.releases[date!!].pages, "notStarted")}
                                            inProduction={countPagesWithStatus(paper.releases[date!!].pages, "inProduction")}
                                            done={countPagesWithStatus(paper.releases[date!!].pages, "done")}

                                            readyForProduction={countPagesWithStatus(paper.releases[date!!].pages, "readyForProduction")}
                                            productionDone={countPagesWithStatus(paper.releases[date!!].pages, "productionDone")}

                                        >
                                        </RadialChart> : <></>

                                }




                            </CardContent>
                        </Card>

                        <div className="">
                            <Card className="p-3 row-span-2 col-span-2">
                                <CardTitle className="flex gap-2">
                                    <Info ></Info>
                                    Info
                                </CardTitle>
                                <CardContent className="">{paper.info || "Ingen info oppgitt."}</CardContent>
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
                                        <SelectItem value="notStarted"><div className="flex gap-1 items-center">{statusEmoji("notStarted")} {getStatusText("notStarted")}</div></SelectItem>
                                        <SelectItem value="readyForProduction"><div className="flex gap-1 items-center">{statusEmoji("readyForProduction")}  {getStatusText("readyForProduction")}</div></SelectItem>
                                        <SelectItem value="inProduction"><div className="flex gap-1 items-center">{statusEmoji("inProduction")}  {getStatusText("inProduction")}</div></SelectItem>
                                        <SelectItem value="productionDone"><div className="flex gap-1 items-center">{statusEmoji("productionDone")}  {getStatusText("productionDone")}</div></SelectItem>
                                        <SelectItem value="done"><div className="flex gap-1 items-center">{statusEmoji("done")} {getStatusText("done")}</div> </SelectItem>
                                    </SelectContent>
                                </Select>
                            </Card>


                            <Card className="p-3">
                                <Label>XML Status:</Label>
                                <Select
                                    value={getPaperStatus(paper, date!!)!!}
                                    onValueChange={(value: PageStatus) => updatePaperDetails({ status: value })}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={statusEmoji(getPaperStatus(paper, date!!)!!)} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="notStarted"><div className="flex gap-1 items-center">{statusEmoji("notStarted")} Ikke ferdig </div></SelectItem>
                                        <SelectItem value="done"><div className="flex gap-1 items-center">{statusEmoji("done")} Ferdig </div></SelectItem>
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







                        <Card className="">
                            <CardHeader >
                                <div className="flex justify-between">


                                    <CardTitle className="flex gap-2"><Files />Sider</CardTitle>
                                    <div className="">
                                        {syncedStatus == "done" ? <Check /> : syncedStatus == "loading" ? <RefreshCw className="animate-spin" /> : <OctagonX />}
                                    </div>
                                </div>
                            </CardHeader>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3 ">
                                {paper.releases[date!!] ? (
                                    Object.entries(paper.releases[date!!].pages).map(([pageNumber, page]) => (
                                        <div
                                            key={pageNumber}
                                            className={`w-full border rounded-sm p-3 gap-5 flex justify-between items-center `}
                                        >
                                            <span className="font-mono font-bold">{parseInt(pageNumber) + 1}</span>


                                            <Input
                                                className="w-auto max-w-[240px] border-0"
                                                value={textValues[pageNumber] ?? page.text}
                                                onChange={(e) => handleTextChange(parseInt(pageNumber), e.target.value)}
                                            />


                                            <Select
                                                value={page.productionStatus}
                                                onValueChange={(value: PageStatus) => updatePageStatus(parseInt(pageNumber), value)}
                                            >
                                                <SelectTrigger className="">
                                                    <SelectValue placeholder={statusEmoji(page.productionStatus)} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="notStarted"><div className="flex gap-1 items-center">{statusEmoji("notStarted")} {getStatusText("notStarted")}</div></SelectItem>
                                                    <SelectItem value="readyForProduction"><div className="flex gap-1 items-center">{statusEmoji("readyForProduction")}  {getStatusText("readyForProduction")}</div></SelectItem>
                                                    <SelectItem value="inProduction"><div className="flex gap-1 items-center">{statusEmoji("inProduction")}  {getStatusText("inProduction")}</div></SelectItem>
                                                    <SelectItem value="productionDone"><div className="flex gap-1 items-center">{statusEmoji("productionDone")}  {getStatusText("productionDone")}</div></SelectItem>
                                                    <SelectItem value="done"><div className="flex gap-1 items-center">{statusEmoji("done")} {getStatusText("done")}</div> </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    ))

                                ) : (
                                    <div>Ingen sider tilgjengelig</div>
                                )}
                            </div>
                        </Card>
                    </div>
                    <div className="w-full flex justify-center">
                        <Badge variant={"secondary"} className="w-fit">
                            Du har nådd bunnen :)
                        </Badge>
                    </div>


                </div>

            </div >
        </>
    ) : (
        "Laster"
    );
}