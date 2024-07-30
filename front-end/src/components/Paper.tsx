export type PageStatus = "notStarted" | "inProduction" | "done";

export interface Release {
    hidden?: boolean;
    pages: { [page: number]: PageStatus };
}

export interface Paper {
    _id: string;
    name: string;
    nameLowerCase: string;
    deadline: string;
    info: string;
    releases: { [date: string]: Release };
}
