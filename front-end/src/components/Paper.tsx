export interface Paper {
  name: string;
  nameLowerCase: string;
  deadline:string,
  info:string
  releases: { [date: string]: {productionStatus : "notStarted" | "inProduction" | "done"} };
}