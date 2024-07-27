export interface Paper {
  _id:string
  name: string;
  nameLowerCase: string;
  deadline:string,
  info:string
  releases: { [date: string]: {productionStatus : "notStarted" | "inProduction" | "done"} };
}