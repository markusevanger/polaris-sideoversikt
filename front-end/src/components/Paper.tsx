
import { ObjectId } from "mongodb";

export class Paper{
    _id: ObjectId;
    name: string;
    nameLowerCase: string;
    productionStatus: string;
    releaseDates: number

    constructor(_id:ObjectId, name:string, nameLowerCase:string, productionStatus:string, releaseDates:number) {
        this._id = _id;
        this.name = name;
        this.nameLowerCase = nameLowerCase;
        this.productionStatus = productionStatus; // notStarted, inProduction, done
        this.releaseDates = releaseDates
      }

}