export interface Paper {
  name: string;
  nameLowerCase: string;
  releases: { [date: string]: {productionStatus : "notStarted" | "inProduction" | "done"} };
}