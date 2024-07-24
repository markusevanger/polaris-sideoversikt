import express from "express";
import db from "../db/connection.js";
import { ObjectId } from "mongodb";




const router = express.Router()


/* 

Data should look like this:
    {
        name: Agderposten,
        releases: [
            2024-07-23 : {
                productionStatus: inProduction
            },
            2024-07-24 : {
                productionStatus: notStarted
            }
        
        ]
    },


*/
// Get all papers
router.get("/", async (req, res) => {
    let collection = await db.collection("papers")
    let results = await collection.find({}).toArray();
    res.send(results).status(200);
})


// Get all papers releasing on single date. 
router.get("/:date", async (req, res) => {
    try {
        const dateString = req.params.date;
        const date = new Date(dateString);
        const dayOfWeek = (date.getDay() + 6) % 7;

        console.log("Getting newspapers from: " + dateString + " " + dayOfWeek);

        const collection = db.collection("papers");

        // Query papers that include the specific day in their pattern
        let result = await collection.find({ pattern: dayOfWeek }).toArray();

        // Update each paper if the date is not in releases
        await Promise.all(result.map(async (paper) => {
            if (!paper.releases || typeof paper.releases !== 'object' || Array.isArray(paper.releases)) {
                paper.releases = {};
            }

            if (!(dateString in paper.releases)) {
                paper.releases[dateString] = { productionStatus: "notStarted" };

                await collection.updateOne(
                    { _id: paper._id }, // Use _id to ensure correct document is updated
                    { $set: { [`releases.${dateString}`]: { productionStatus: "notStarted" } } }
                );
            }
        }));

        if (!result) {
            res.status(404).send("Not Found");
        } else {
            res.status(200).json(result);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});


router.get("/:paperName/:date", async (req, res) => {
    try {
        const paperName = req.params.paperName;
        const dateString = req.params.date;
        const date = new Date(dateString);

        // Check for valid date format
        if (isNaN(date.getTime())) {
            return res.status(400).send("Invalid date format " + dateString + " expected /YYYY-MM-DD");
        }

        const collection = db.collection("papers");

        // Find the paper by name
        const paper = await collection.findOne({ nameLowerCase: paperName });

        if (!paper) {
            return res.status(404).send("Paper not found");
        }

        // Filter the releases to only include the entry for the specified date
        const releases = paper.releases || {};
        const filteredReleases = {};

        if (releases[dateString]) {
            filteredReleases[dateString] = releases[dateString];
        } else {
            // Add the date with "notStarted" status if it doesn't exist
            filteredReleases[dateString] = { productionStatus: "notStarted" };

            // Update the paper in the database
            await collection.updateOne(
                { nameLowerCase: paperName },
                { $set: { [`releases.${dateString}`]: { productionStatus: "notStarted" } } }
            );
        }

        // Return the paper info with the filtered releases
        res.status(200).json({
            ...paper,
            releases: filteredReleases
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});


// Get all data for single paper
router.get("/:nameLowerCase", async (req, res) => {
    let collection = await db.collection("papers")
    let query = { nameLowerCase: req.params.nameLowerCase }
    let result = await collection.findOne(query)

    if (!result) res.send("Not Found").status(404)
    else res.send(result).status(200)
})


function createLinkFriendlyName(name) {
    return name.toLowerCase().replace(" ", "-")
}



// Add new newspaper 
router.post("/", async (req, res) => {
    try {
        let newPaper = {
            name: req.body.name,
            nameLowerCase: createLinkFriendlyName(req.body.name),
            pattern: req.body.pattern,
            info: req.body.info,
            deadline: req.body.deadline,
        }
        let collection = await db.collection("papers")
        let result = await collection.insertOne(newPaper)
        res.send(result).status(204)
    } catch (err) {
        console.error(err)
        res.status(500).send("Error adding paper")
    }
})


// Update Paper by Id
router.patch("/:id", async (req, res) => {
    try {
        const query = { _id: new ObjectId(req.params.id) }
        const updates = {
            $set: {
                name: req.body.name,
                productionStatus: req.body.productionStatus,
                pattern: req.body.pattern
            }
        }
        let collection = await db.collection("papers")
        let result = await collection.updateOne(query, updates)
        res.send(result).status(200)
    } catch (err) {
        console.error(err)
        res.status(500).send("Error updating paper")
    }
})




// Delete Paper by Id
router.delete("/:id", async (req, res) => {
    try {

        const query = { _id: new ObjectId(req.params.id) }

        const collection = await db.collection("papers")
        let result = await collection.deleteOne(query)
        res.send(result).status(200)
    } catch (err) {
        console.error(err)
        res.status(500).send(`Error deleting paper: ${err}`)
    }
})

export default router;