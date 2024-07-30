import { PageStatus, Paper } from "./Paper"

export function statusEmoji(productionStatus: string) {
    if (productionStatus == "notStarted") return "🔴"
    else if (productionStatus == "inProduction") return "🟠"
    else if (productionStatus == "done") return "🟢"
    else return ""
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

export const iconStyle = "w-[16px]"


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

    if (pageStatuses.every(pageStatus => pageStatus === "done")) {
        return "done";
    } else if (pageStatuses.some(pageStatus => pageStatus === "inProduction")) {
        return "inProduction";
    } else if (pageStatuses.every(pageStatus => pageStatus === "notStarted")) {
        return "notStarted";
    }

    return null;
};

// Function to count the number of papers in each status
export const amountOfPapers = (status: PageStatus, paperData: Paper[], dateFormatted: string): number => {
    return paperData.filter((paper: Paper) => {
        const paperStatus = getPaperStatus(paper, dateFormatted);
        return paperStatus === status;
    }).length;
};