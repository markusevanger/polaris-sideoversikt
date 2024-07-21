
import { ObjectId } from "mongodb";

export class Paper{
    _id: ObjectId | undefined;
    name: string;
    nameLowerCase: string;
    productionStatus: "notStarted" | "inProduction" | "done";
    releaseDates: number;
    info:string;
    deadline:string

    constructor(_id:ObjectId | undefined, name:string, nameLowerCase:string, productionStatus:"notStarted" | "inProduction" | "done", releaseDates:number, info:string, deadline:string) {
        this._id = _id;
        this.name = name;
        this.nameLowerCase = nameLowerCase;
        this.productionStatus = productionStatus; // notStarted, inProduction, done
        this.releaseDates = releaseDates
        this.info = info,
        this.deadline = deadline
      }

}