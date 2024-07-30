export type ProductionStatus = "notStarted" | "inProduction" | "done";

export interface Release {
    productionStatus: ProductionStatus;
    hidden?: boolean;
}

export interface Paper {
    _id: string;
    name: string;
    nameLowerCase: string;
    deadline: string;
    info: string;
    releases: { [date: string]: Release };
}