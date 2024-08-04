export type PageStatus = "notStarted" | "readyForProduction" | "inProduction" | "productionDone" | "done";



export interface Page {
    productionStatus: PageStatus,
    text:string,

}

export interface Release {
    hidden?: boolean;
    pages: { [page: number]: Page };
    xmlDone:boolean
}

export interface Paper {
    _id: string;
    name: string;
    nameLowerCase: string;
    deadline: string;
    info: string;
    pattern:number[];
    useXML:boolean;
    releases: { [date: string]: Release };
    defaultPages:string
}
