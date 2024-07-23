
import express from "express";
import db from "../db/connection.js";
import { ObjectId } from "mongodb";
import Paper from './Paper.js';
import router from "./paper.js";


// Utility function to validate date format (YYYY-MM-DD)
const isValidDateFormat = (dateString) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(dateString);
  };


// Get single date (formatted like: /2024-07-23) <-- ISO 8601
router.get("/:date", async (req, res) => {

    const requestedDate = req.params.date

    if (!isValidDateFormat(requestedDate)){
        res.status(404).send(`Not a valid date ${requestedDate}. Must be of format YYYY-MM-DD`)
    }

    let collection = await db.collection("dates")
    let query = {dateFormatted: req.params.date}
    let result = await collection.findOne(query)

    if (result){
        res.send(result).status(200)
    }
    
    // Date has never been accessed, create new. 
    if (!result) {
        try {
            const date = new Date(requestedDate)
            let dateSchema = {
                dateFormatted: requestedDate,
                
                date: date.getDate(), 
                month: date.getMonth(),
                year: date.getFullYear(),
                dayIndex: date.getDay(),
    
                papers: Paper.find({ releaseDates: dayIndex })
                
            }
            result = collection.insertOne(dateSchema)
        } catch (err){
            console.error(err)
            res.status(500).send("Error adding paper")
        }

    }
})



// Add new newspaper 
router.post ("/", async (req, res) => {
    try {
        let newPaper = {
            name: req.body.name,
            nameLowerCase: createLinkFriendlyName(req.body.name),
            productionStatus: "notStarted", // notStarted, inProduction, done
            releaseDates: req.body.releaseDates,
            info:req.body.info,
            deadline:req.body.deadline
        }
        let collection = await db.collection("papers")
        let result = await collection.insertOne(newPaper)
        res.send(result).status(204)
    } catch (err) {
        console.error(err)
        res.status(500).send("Error adding paper")
    }
})

export default router