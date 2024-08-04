import { Page, PageStatus, Paper } from "./Paper";

export function colorFromStatus(productionStatus: PageStatus): string {
    const colors = {
        notStarted: "#ef4444",
        readyForProduction: "#22d3ee",
        inProduction: "#fbbf24",
        productionDone: "#9333ea",
        done: "#84cc16",
    };
    return colors[productionStatus] || "";
}

export function statusEmoji(productionStatus: PageStatus | "blank") {
    const color = productionStatus === "blank" ? "#FFFFFF" : colorFromStatus(productionStatus as PageStatus);
    return color ? <div className="rounded-full w-4 h-4" style={{ backgroundColor: color }}></div> : "";
}

export function getDayFromIndex(day: number) {
    const days = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"];
    return days[day] || "";
}

export function getMonthFromIndex(month: number): string {
    const months = ["januar", "februar", "mars", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "desember"];
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

export const getPaperStatus = (paper: Paper, dateFormatted: string): PageStatus | null => {
    const release = paper.releases[dateFormatted];
    if (!release || release.hidden) return null;

    const pageStatuses = Object.values(release.pages || {});

    if (pageStatuses.every(page => page.productionStatus === "done")) {
        return "done";
    } else if (pageStatuses.every(page => page.productionStatus === "notStarted")) {
        return "notStarted";
    } else if (pageStatuses.every(page => page.productionStatus === "readyForProduction")) {
        return "readyForProduction";
    } else if (pageStatuses.every(page => page.productionStatus === "productionDone")) {
        return "productionDone";
    } else {
        return "inProduction";
    }
};

export const amountOfPapers = (status: PageStatus, paperData: Paper[], dateFormatted: string): number => {
    return paperData.filter((paper: Paper) => getPaperStatus(paper, dateFormatted) === status).length;
};

export const countPagesWithStatus = (pages: { [page: number]: Page }, status: PageStatus): number => {
    return Object.values(pages || {}).filter(page => page.productionStatus === status).length;
};

export const getDonePercentage = (paper: Paper, dateFormatted: string): number => {
    const release = paper.releases[dateFormatted];

    if (!release || release.hidden) return 0; // No release or hidden, return 0%

    const pages = release.pages || {};
    const totalPages = Object.keys(pages).length;

    if (totalPages === 0) return 0; // No pages, return 0%

    // Count the number of "done" pages
    const donePages = Object.values(pages).filter(pageStatus => pageStatus.productionStatus === "done").length;

    // Calculate the percentage
    return (donePages / totalPages) * 100;
};

export function getStatusText(status: PageStatus): string {
    const statusText = {
        notStarted: "Ikke begynt",
        inProduction: "I produksjon",
        done: "Ferdig",
        productionDone: "Produksjon ferdig",
        readyForProduction: "Klar",
    };
    return statusText[status] || status;
}