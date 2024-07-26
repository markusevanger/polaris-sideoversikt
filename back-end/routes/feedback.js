import express from "express";
import db from "../db/connection.js";



const router = express.Router()



// Get all feedback
router.get("/", async (req, res) => {
    let collection = await db.collection("feedback")
    let results = await collection.find({}).toArray();
    res.send(results).status(200);
})

// Add new feedback 
router.post("/", async (req, res) => {
    try {
        let collection = await db.collection("feedback")
        let result = await collection.insertOne({ feedback: req.body.feedback })
        res.status(201).send(result)

    } catch (err) {
        console.error(err)
        res.status(500).send("Error adding feedback")
    }
})


export default router;