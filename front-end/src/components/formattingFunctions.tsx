import { Page, PageStatus, Paper } from "./Paper"





export function colorFromStatus(productionStatus: PageStatus): string {
    if (productionStatus == "notStarted") return "#ef4444"
    else if (productionStatus == "readyForProduction") return "#22d3ee"
    else if (productionStatus == "inProduction") return "#fbbf24"
    else if (productionStatus == "productionDone") return "#9333ea"
    else if (productionStatus == "done") return "#84cc16"
    else return ""
}

export function statusEmoji(productionStatus: PageStatus | "blank") {
    const color = productionStatus === "blank" ? "#FFFFFF" : colorFromStatus(productionStatus as PageStatus);
    return color ? <div className="rounded-full w-4 h-4" style={{ backgroundColor: color }}></div> : "";
}


export function getDayFromIndex(day: number) {
    const days: Record<number, string> = {
        0: "Mandag",
        1: "Tirsdag",
        2: "Onsdag",
        3: "Torsdag",
        4: "Fredag",
        5: "Lørdag",
        6: "Søndag"
    }
    return days[day]
}


export function getMonthFromIndex(month: number): string {
    const months: Record<number, string> = {
        0: "januar",
        1: "februar",
        2: "mars",
        3: "april",
        4: "mai",
        5: "juni",
        6: "juli",
        7: "august",
        8: "september",
        9: "oktober",
        10: "november",
        11: "desember"
    };
    return months[month] || "Not a month";
}


export const getDateFormatted = (date: Date | undefined) => {
    if (date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    return '';
}



// Function to determine the status of a single newspaper
export const getPaperStatus = (paper: Paper, dateFormatted: string): PageStatus | null => {
    const release = paper.releases[dateFormatted];
    if (!release || release.hidden) return null;

    const pages = release.pages || {};
    const pageStatuses = Object.values(pages);

    if (pageStatuses.every(page => page.productionStatus === "done")) {
        return "done";
    } else if (pageStatuses.every(page => page.productionStatus === "notStarted")) {
        return "notStarted";
    } else if (pageStatuses.every(page => page.productionStatus === "readyForProduction")) {
        return "readyForProduction";
    } else if (pageStatuses.every(page => page.productionStatus === "productionDone")) {
        return "productionDone";
    }


    else {
        return "inProduction"
    }
};

// Function to count the number of papers in each status
export const amountOfPapers = (status: PageStatus, paperData: Paper[], dateFormatted: string): number => {
    return paperData.filter((paper: Paper) => {
        const paperStatus = getPaperStatus(paper, dateFormatted);
        return paperStatus === status;
    }).length;
};


// Function to count the number of pages with a specific status in a single paper
export const countPagesWithStatus = (pages: { [page: number]: Page }, status: PageStatus): number => {

    if (!pages) return 0

    const pageStatuses = Object.values(pages);

    // Count pages with the specified status
    return pageStatuses.filter(pageStatus => pageStatus.productionStatus === status).length;
};



// Function to calculate the percentage of "done" pages for a single paper
export const getDonePercentage = (paper: Paper, dateFormatted: string): number => {
    const release = paper.releases[dateFormatted];

    if (!release || release.hidden) return 0; // No release or hidden, return 0%

    const pages = release.pages || {};
    const totalPages = Object.keys(pages).length;

    if (totalPages === 0) return 0; // No pages, return 0%

    // Count the number of "done" pages
    const donePages = Object.values(pages).filter(pageStatus => pageStatus.productionStatus === "done").length;

    // Calculate the percentage
    const donePercentage = (donePages / totalPages) * 100;

    return donePercentage;
};


export function getStatusText(status: PageStatus): string {
    if (status === "notStarted") return "Ikke begynt";
    else if (status === "inProduction") return "I produksjon";
    else if (status === "done") return "Ferdig";
    else if (status === "productionDone") return "Produksjon ferdig"
    else if (status === "readyForProduction") return "Klar"
    else return status;
}