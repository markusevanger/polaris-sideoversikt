import express from "express";
import db from "../db/connection.js";
import { ObjectId } from "mongodb";


const router = express.Router()

// Get all papers
router.get("/", async (req, res) => {
    let collection = await db.collection("papers")
    let results = await collection.find({}).toArray();
    res.send(results).status(200);
})

// Get single paper
router.get("/:nameLowerCase", async (req, res) => {
    let collection = await db.collection("papers")
    let query = {nameLowerCase: req.params.nameLowerCase}
    let result = await collection.findOne(query)

    if (!result) res.send("Not Found").status(404)
    else res.send(result).status(200)
})



function createLinkFriendlyName(name){
    return name.toLowerCase().replace(" ", "-")
}

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

router.patch("/:id", async (req, res) => {
    try {
        const query = { _id: new ObjectId(req.params.id)}
        const updates = {
            $set : {
                name: req.body.name,
                productionStatus: req.body.productionStatus,
                releaseDates: req.body.releaseDates
            }
        }
        let collection = await db.collection("papers")
        let result = await collection.updateOne(query, updates)
        res.send(result).status(200)
    } catch (err){
        console.error(err)
        res.status(500).send("Error updating paper")
    }
})

router.delete("/:id", async ( req, res) => {
    try {

        const query = { _id : new ObjectId(req.params.id) }

        const collection = db.collections("papers")
        let result = await collection.deleteOne(query)
        res.send(result).status(200)
    } catch (err) {
        console.error(err)
        res.status(500).send(`Error deleting paper: ${res.statusMessage}`)
    }
})

export default router;