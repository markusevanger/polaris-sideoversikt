import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import AddPaperDialog from "./addPaperDialog";
import { DatePicker } from "./DatePicker";
import {
    amountOfPapers,
    getDateFormatted,
    getDayFromIndex,
    getDonePercentage,
    getMonthFromIndex,
    getPaperStatus,
} from "./formattingFunctions";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "./ui/card";
import RadialChart from "./RadialChart";
import { PageStatus, Paper } from "./Paper";
import { Skeleton } from "./ui/skeleton";
import { BigNumberCard } from "./BigNumberCard";
import {
    Newspaper,
    PieChart,
    LayoutDashboard,
    Activity,
    Eye,
    EyeOff,
} from "lucide-react";
import { Badge } from "./ui/badge";
import ToggleDarkModeButton from "./ToggleDarkModeButton";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import FeedbackDialog from "./feedbackDialog";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";

const URL = "https://api.markusevanger.no/polaris/papers";

export default function Dashboard() {
    const params = useParams();
    const dateStr = params.date?.toString();
    const initialDate = dateStr ? new Date(dateStr) : new Date();

    const [papers, setPapers] = useState<Paper[]>([]);
    const [date, setDate] = useState<Date>(initialDate);
    const [lastUpdated, setLastUpdated] = useState<Date | undefined>(undefined);
    const [showHiddenPapers, setShowHiddenPapers] = useState(false);

    async function fetchPapers() {
        try {
            const response = await fetch(`${URL}/${getDateFormatted(date)}`);
            if (!response.ok) {
                console.log("No papers found");
                setPapers([]);
                return;
            }
            const papers: Paper[] = await response.json();
            setPapers(papers);
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Failed to fetch papers:", error);
        }
    }

    useEffect(() => {
        setPapers([]);
        fetchPapers();
    }, [date]);

    const statusOrder: { [key in PageStatus]: number } = {
        notStarted: 0,
        inProduction: 1,
        done: 2,
    };

    const handleSetHidden = async (
        isHidden: boolean,
        paperName: string,
        dateStr: string
    ) => {
        try {
            const url = `${URL}/${paperName}/${dateStr}`;
            const response = await fetch(url, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ isHidden })
            });
    
            if (!response.ok) {
                throw new Error(`Error updating hidden status: ${response.statusText}`);
            }
    
            const updatedPaper = await response.json();
            setPapers((prevPapers) =>
                prevPapers.map((paper) =>
                    paper.nameLowerCase === paperName.toLowerCase() ? updatedPaper : paper
                )
            );
            console.log("Hidden status updated successfully");
        } catch (error) {
            console.error("Failed to update hidden status", error);
        }
    };
    
    return (
        <div className="w-full h-screen flex justify-center">
            <div className="w-full mt-3 max-w-[1000px] h-screen flex flex-col p-5 gap-3 items-center">
                <div className="w-full">
                    <div className="flex gap-3">
                        <h1 className="text-lg font-bold flex gap-2 p-0 m-0">
                            <LayoutDashboard />
                            Sideoversikt
                        </h1>
                        <Badge variant={"secondary"} className="text-sm font-mono flex gap-2 flex-wrap text-wrap">
                            <Activity className="h-4 w-auto" />
                            {lastUpdated ? `${String(lastUpdated.getHours()).padStart(2, '0')}:${String(lastUpdated.getMinutes()).padStart(2, '0')}:${String(lastUpdated.getSeconds()).padStart(2, '0')}` : "Laster..."}
                        </Badge>
                    </div>
                </div>
                <div className="flex gap-1 justify-between w-full row-start-2">
                    <DatePicker date={date} setNewDate={(newDate: Date) => setDate(newDate)} />

                    <div className="flex gap-1">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <FeedbackDialog />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Skriv tilbakemelding</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <ToggleDarkModeButton />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Endre tema</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
                <div className="grid gap-3 w-full">
                    <div className="grid grid-rows-3 gap-3">
                        <Card className="row-span-2 w-full">
                            <CardHeader className="pb-0">
                                <CardTitle className="flex gap-2">
                                    <PieChart /> Oversikt
                                </CardTitle>
                                <CardDescription>
                                    {`${getDayFromIndex((date.getDay() + 6) % 7)} ${date.getDate()}.${getMonthFromIndex(date.getMonth())}.${date.getFullYear()}`}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                {papers.length > 0 ? (
                                    <RadialChart
                                        notStarted={amountOfPapers("notStarted", papers, getDateFormatted(date!!))}
                                        inProduction={amountOfPapers("inProduction", papers, getDateFormatted(date!!))}
                                        done={amountOfPapers("done", papers, getDateFormatted(date!!))}

                                    />
                                ) : (
                                    <Skeleton className="w-full h-full rounded-lg p-5" />
                                )}
                            </CardContent>
                        </Card>
                        <div className="grid gap-3 row-start-1 grid-cols-3">
                            <BigNumberCard
                                number={amountOfPapers("done", papers, getDateFormatted(date))}
                                title="🟢 Ferdig"
                            ></BigNumberCard>
                            <BigNumberCard
                                number={amountOfPapers("inProduction", papers, getDateFormatted(date))}
                                title="🟠 I Produksjon"
                            ></BigNumberCard>
                            <BigNumberCard
                                number={amountOfPapers("notStarted", papers, getDateFormatted(date))}
                                title="🔴 Ikke startet"
                            ></BigNumberCard>
                        </div>
                    </div>
                    <Card className="">
                        <CardHeader>
                            <div className="flex justify-between">
                                <CardTitle className="flex gap-2">
                                    <Newspaper /> Aviser
                                </CardTitle>
                                <div className="flex gap-1 justify-center items-center">
                                    <p className="text-sm font-mono">Vis gjemte aviser</p>
                                    <Checkbox onCheckedChange={(value: boolean) => setShowHiddenPapers(value)}></Checkbox>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="">
                                {papers.length === 0 ? (
                                    <p className="text-xs text-mono">Ingen aviser hentet</p>
                                ) : (
                                    papers.sort((a: Paper, b: Paper) => {
                                        const currentDate = getDateFormatted(date);

                                        // Get the status of each paper using the new format
                                        const statusA = getPaperStatus(a, currentDate);
                                        const statusB = getPaperStatus(b, currentDate);

                                        // Handle cases where one or both statuses might be null
                                        if (statusA === null && statusB === null) return 0;
                                        if (statusA === null) return 1;
                                        if (statusB === null) return -1;

                                        // Compare statuses based on their defined order
                                        return (statusOrder[statusA] ?? -1) - (statusOrder[statusB] ?? -1);
                                    })
                                        .map((paper: Paper, index: number) => {
                                            const release = paper.releases ? paper.releases[getDateFormatted(date)] : undefined;

                                            if (!showHiddenPapers && release && release.hidden) { // Stop from displaying hidden papers.
                                                return null;
                                            }

                                            return (
                                                <div key={index} className="flex justify-between mb-1 border items-center rounded-md p-2">
                                                    <div className="flex gap-2">

                                                        <Badge className="w-full">
                                                            {getDonePercentage(paper, dateStr!!).toFixed()} %
                                                        </Badge>

                                                    <Link className="w-full justify-start flex items-center gap-2" to={`/${paper.nameLowerCase}/${getDateFormatted(date)}`}>
                                                        {paper.name}
                                                    </Link>
                                                        
                                                    </div>

                                                    <div className="flex gap-1">
                                                        <Button variant={"outline"} size={"icon"} onClick={() => { handleSetHidden(!release?.hidden, paper.nameLowerCase, getDateFormatted(date)) }}>
                                                            {release?.hidden ? <EyeOff /> : <Eye />}
                                                        </Button>
                                                        <Badge variant={"secondary"} className="">
                                                            <p className="font-mono text-xs text-muted-foreground">{paper.deadline}</p>
                                                        </Badge>
                                                    </div>
                                                </div>
                                            );
                                        })
                                )}
                                <div className="flex w-full flex-col items-center my-3 gap-2">
                                    <p className="text-xs font-mono text-center">Antall aviser: {papers.length}</p>
                                    <AddPaperDialog getPapers={fetchPapers} />
                                </div>
                                <ScrollBar />
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
