
import express from "express";
import db from "../db/connection.js";

const router = express.Router()

// Utility function to validate date format (YYYY-MM-DD)
const isValidDateFormat = (dateString) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(dateString);
};


// Get single date (formatted like: /2024-07-23) <-- ISO 8601
router.get("/:date", async (req, res) => {

    const requestedDate = req.params.date

    if (!isValidDateFormat(requestedDate)) {
        res.status(404).send(`Not a valid date ${requestedDate}. Must be of format YYYY-MM-DD`)
    }

    let collection = await db.collection("dates")
    let paperCollection = await db.collection("papers")
    let query = { dateFormatted: req.params.date }
    let result = await collection.findOne(query)

    if (result) {
        res.send(result).status(200)
    }
    const date = new Date(requestedDate)
    const dayIndex = date.getDay()
    const papers = paperCollection.find({ releaseDates: dayIndex })


// Date has never been accessed, create new. 
if (!result) {
    try {
        let dateSchema = {
            dateFormatted: requestedDate,

            date: date.getDate(),
            month: date.getMonth(),
            year: date.getFullYear(),
            dayIndex: dayIndex,
            papers: papers


        }
        // console.log(`Trying to add paper to ${requestedDate}. \n Data: \n  ${JSON.stringify(dateSchema)}`)
        result = await collection.insertOne(dateSchema)
    } catch (err) {
        console.error(err)
        res.status(500).send("Error adding paper")
    }
}
})

export default router