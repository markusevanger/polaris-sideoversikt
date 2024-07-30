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






router.get("/:date", async (req, res) => {
    try {
        const dateString = req.params.date;
        const date = new Date(dateString);
        const dayOfWeek = (date.getDay() + 6) % 7;

        console.log("Getting newspapers from: " + dateString + " " + dayOfWeek);

        const collection = db.collection("papers");

        // Query papers that include the specific day in their pattern
        let papers = await collection.find({ pattern: dayOfWeek }).toArray();

        if (papers.length === 0) {
            res.status(404).send("No papers found for the specified date.");
            return;
        }

        // Update each paper to ensure the date entry in releases
        await Promise.all(papers.map(async (paper) => {
            // Ensure releases is an object
            if (!paper.releases || typeof paper.releases !== 'object' || Array.isArray(paper.releases)) {
                paper.releases = {};
            }

            // Check if the requested date exists in releases
            if (!paper.releases[dateString]) {
                // Add the requested date with default status if it doesn't exist
                paper.releases[dateString] = { hidden: false, pages: {} };

                // Initialize pages with default status
                for (let page = 0; page < paper.defaultPages; page++) {
                    paper.releases[dateString].pages[page] = "notStarted";
                }

                // Update the paper in the database
                await collection.updateOne(
                    { _id: paper._id }, // Use _id to ensure the correct document is updated
                    { $set: { releases: paper.releases } }
                );
            } else {
                for (let page = 0; page < paper.defaultPages; page++) {
                    if (!paper.releases[dateString].pages[page]) {
                        paper.releases[dateString].pages[page] = "notStarted";
                    }
                }

                // Update the paper in the database if any pages were added
                await collection.updateOne(
                    { _id: paper._id }, // Use _id to ensure the correct document is updated
                    { $set: { releases: paper.releases } }
                );
            }
        }));

        // Return the papers with updated releases
        papers = await collection.find({ pattern: dayOfWeek }).toArray(); // Refetch to include updated releases
        res.status(200).json(papers);

    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});







// Get paper at specific date.
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

        // Initialize the release object for the specified date if it doesn't exist
        if (!releases[dateString]) {
            releases[dateString] = { hidden: false, pages: {} };

            for (let page = 0; page < paper.defaultPages; page++) {
                releases[dateString].pages[page] = "notStarted";

            }
        }



        filteredReleases[dateString] = releases[dateString];

        // Update the paper in the database
        await collection.updateOne(
            { nameLowerCase: paperName },
            { $set: { [`releases.${dateString}`]: releases[dateString] } }
        );

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
    return name.toLowerCase().replace(/\s+/g, '-');
}

// Add new newspaper 
router.post("/", async (req, res) => {
    try {

        if (!req.body.name || !req.body.pattern || !req.body.deadline || !req.body.pages) {
            return res.status(400).send("Missing required fields");
        }

        let newPaper = {
            name: req.body.name,
            nameLowerCase: createLinkFriendlyName(req.body.name),
            pattern: req.body.pattern,
            info: req.body.info,
            deadline: req.body.deadline,
            defaultPages: req.body.pages
        }
        let collection = await db.collection("papers")
        let result = await collection.insertOne(newPaper)
        res.status(201).send(result)



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











// Define the allowed status values
const allowedStatuses = ["notStarted", "inProduction", "done"];

router.patch("/:paperName/:date", async (req, res) => {
    try {
        const paperName = req.params.paperName;
        const dateString = req.params.date;
        const date = new Date(dateString);
        const { status, page, isHidden } = req.body;

        // Check for valid date format
        if (isNaN(date.getTime())) {
            return res.status(400).send("Invalid date format " + dateString + " expected /YYYY-MM-DD");
        }

        const collection = db.collection("papers");

        // Find the paper by name
        const paper = await collection.findOne({ nameLowerCase: paperName.toLowerCase() });

        if (!paper) {
            return res.status(404).send("Paper not found");
        }

        // Ensure the releases object exists and has an entry for the date
        const releases = paper.releases || {};
        if (!releases[dateString]) {
            releases[dateString] = { hidden: false, pages: {} };
        }

        // Update the hidden status if provided
        if (typeof isHidden === 'boolean') {
            releases[dateString].hidden = isHidden;
        }

        // Validate and update the page status if provided
        if (status && page !== undefined) {
            // Validate status
            if (!allowedStatuses.includes(status)) {
                return res.status(400).send("Invalid status. Allowed values are: " + allowedStatuses.join(", "));
            }

            releases[dateString].pages[page] = status;
        }

        // Update the paper in the database
        await collection.updateOne(
            { _id: new ObjectId(paper._id) },
            { $set: { [`releases.${dateString}`]: releases[dateString] } }
        );

        // Return the updated paper info
        const updatedPaper = await collection.findOne({ _id: new ObjectId(paper._id) });
        res.status(200).json(updatedPaper);

    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});



router.patch("/:paperName/:date/update", async (req, res) => {
    try {
        const paperName = req.params.paperName;
        const dateString = req.params.date;
        const date = new Date(dateString);
        const { status, pageCount } = req.body;

        // Check for valid date format
        if (isNaN(date.getTime())) {
            return res.status(400).send("Invalid date format " + dateString + " expected YYYY-MM-DD");
        }

        const collection = db.collection("papers");

        // Find the paper by name
        const paper = await collection.findOne({ nameLowerCase: paperName.toLowerCase() });

        if (!paper) {
            return res.status(404).send("Paper not found");
        }

        // Ensure the releases object exists and has an entry for the date
        const releases = paper.releases || {};
        if (!releases[dateString]) {
            releases[dateString] = { hidden: false, pages: {} };
        }

        // Update all pages to the new status if provided
        if (status) {
            if (!allowedStatuses.includes(status)) {
                return res.status(400).send("Invalid status. Allowed values are: " + allowedStatuses.join(", "));
            }
            for (let page in releases[dateString].pages) {
                releases[dateString].pages[page] = status;
            }
        }

        // Add or remove pages based on pageCount
        if (pageCount !== undefined) {
            const currentPageCount = Object.keys(releases[dateString].pages).length;
            if (pageCount > currentPageCount) {
                // Add new pages
                for (let i = currentPageCount + 1; i < pageCount; i++) {
                    releases[dateString].pages[i] = status || "notStarted";
                }
            } else if (pageCount < currentPageCount) {
                // Remove excess pages
                for (let i = currentPageCount; i >= pageCount; i--) {
                    delete releases[dateString].pages[i];
                }
            }
        }

        // Update the paper in the database
        await collection.updateOne(
            { _id: new ObjectId(paper._id) },
            { $set: { [`releases.${dateString}`]: releases[dateString] } }
        );

        // Return the updated paper info
        const updatedPaper = await collection.findOne({ _id: new ObjectId(paper._id) });
        res.status(200).json(updatedPaper);

    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});





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