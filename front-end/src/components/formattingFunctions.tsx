export function statusEmoji(productionStatus: string) {
    if (productionStatus == "notStarted") return "🔴"
    else if (productionStatus == "inProduction") return "🟠"
    else if (productionStatus == "done") return "🟢"
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