import express from "express";
import db from "../db/connection.js";
import { ObjectId } from "mongodb";

const router = express.Router();

/* 
Data should look like this:
{
    name: "Agderposten",
    nameLowerCase: "agderposten",
    pattern: [1, 3, 5],  // Example pattern for publication days (Monday, Wednesday, Friday)
    info: "Some information about the paper",
    deadline: "12:00 PM",
    defaultPages: 4,
    useXML: true
    releases: {
        "2024-07-23": {
            hidden: false,
            xmlDone: false,
            pages: {
                "0": {
                    productionStatus: "inProduction",
                    text: "Content of page 0"
                },
                "1": {
                    productionStatus: "notStarted",
                    text: "Content of page 1"
                },
                "2": {
                    productionStatus: "notStarted",
                    text: "Content of page 2"
                },
                "3": {
                    productionStatus: "notStarted",
                    text: "Content of page 3"
                }
            }
        },
        "2024-07-24": {
            hidden: false,
            xmlDone: false,
            pages: {
                "0": {
                    productionStatus: "notStarted",
                    text: ""
                }
            }
        }
    }
}
*/

// Get all papers
router.get("/", async (req, res) => {
    try {
        const collection = await db.collection("papers");
        const results = await collection.find({}).toArray();
        res.status(200).json(results);
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

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
                paper.releases[dateString] = { hidden: false, xmlDone: false, pages: {} };

                // Initialize pages with default status and empty text
                for (let page = 0; page < paper.defaultPages; page++) {
                    paper.releases[dateString].pages[page] = { productionStatus: "notStarted", text: "" };
                }

                // Update the paper in the database
                await collection.updateOne(
                    { _id: paper._id }, // Use _id to ensure the correct document is updated
                    { $set: { releases: paper.releases } }
                );
            } else {
                for (let page = 0; page < paper.defaultPages; page++) {
                    if (!paper.releases[dateString].pages[page]) {
                        paper.releases[dateString].pages[page] = { productionStatus: "notStarted", text: "" };
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
            releases[dateString] = { hidden: false, xmlDone: false, pages: {} };

            for (let page = 0; page < paper.defaultPages; page++) {
                releases[dateString].pages[page] = { productionStatus: "notStarted", text: "" };
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
    try {
        const collection = await db.collection("papers");
        const query = { nameLowerCase: req.params.nameLowerCase };
        const result = await collection.findOne(query);

        if (!result) res.status(404).send("Not Found");
        else res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

function createLinkFriendlyName(name) {
    return name.toLowerCase().replace(/\s+/g, '-');
}

// Add new newspaper 
router.post("/", async (req, res) => {
    try {
        if (!req.body.name || !req.body.pattern || !req.body.deadline || !req.body.defaultPages || !req.body.useXML) {
            return res.status(400).send("Missing required fields");
        }

        let newPaper = {
            name: req.body.name.trim(),
            nameLowerCase: createLinkFriendlyName(req.body.name.trim()),
            pattern: req.body.pattern,
            info: req.body.info,
            deadline: req.body.deadline,
            defaultPages: req.body.defaultPages,
            useXML: req.body.useXML,
            releases: {} // Initialize releases as an empty object
        };
        let collection = await db.collection("papers");
        let result = await collection.insertOne(newPaper);
        res.status(201).json(result);

    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding paper");
    }
});

// Update Paper by Id
router.patch("/:id", async (req, res) => {
    try {
        const query = { _id: new ObjectId(req.params.id) };
        const updates = {
            $set: {
                name: req.body.name,
                nameLowerCase: createLinkFriendlyName(req.body.name),
                pattern: req.body.pattern,
                info: req.body.info,
                defaultPages: req.body.defaultPages,
                deadline: req.body.deadline,
                useXML:req.body.useXML
            }
        };
        let collection = await db.collection("papers");
        let result = await collection.updateOne(query, updates);
        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating paper");
    }
});

const allowedStatuses = ["notStarted", "readyForProduction", "inProduction", "productionDone", "done"];

router.patch("/:paperName/:date", async (req, res) => {
    try {
        const paperName = req.params.paperName;
        const dateString = req.params.date;
        const date = new Date(dateString);
        const { status, page, isHidden, text, xmlDone, pageCount } = req.body;

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
            releases[dateString] = { hidden: false, xmlDone: false, pages: {} };
        }

        // Update the hidden status if provided
        if (typeof isHidden === 'boolean') {
            releases[dateString].hidden = isHidden;
        }

        // Update xmlDone status if provided
        if (typeof xmlDone === 'boolean') {
            releases[dateString].xmlDone = xmlDone;
        }

        // Validate and update the page status and text if provided
        if (page !== undefined) {
            if (status && !allowedStatuses.includes(status)) {
                return res.status(400).send("Invalid status. Allowed values are: " + allowedStatuses.join(", "));
            }

            releases[dateString].pages[page] = {
                productionStatus: status || releases[dateString].pages[page]?.productionStatus || "notStarted",
                text: text || releases[dateString].pages[page]?.text || ""
            };
        }

        // Update all pages to the new status if provided
        if (status && page === undefined) {
            if (!allowedStatuses.includes(status)) {
                return res.status(400).send("Invalid status. Allowed values are: " + allowedStatuses.join(", "));
            }
            for (let page in releases[dateString].pages) {
                releases[dateString].pages[page].productionStatus = status;
            }
        }

        // Add or remove pages based on pageCount
        if (pageCount !== undefined) {
            const currentPageCount = Object.keys(releases[dateString].pages).length;
            if (pageCount > currentPageCount) {
                // Add new pages
                for (let i = currentPageCount; i < pageCount; i++) {
                    releases[dateString].pages[i] = { productionStatus: status || "notStarted", text: "" };
                }
            } else if (pageCount < currentPageCount) {
                // Remove excess pages
                for (let i = currentPageCount - 1; i >= pageCount; i--) {
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
        const query = { _id: new ObjectId(req.params.id) };

        const collection = await db.collection("papers");
        const result = await collection.deleteOne(query);
        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send(`Error deleting paper: ${err}`);
    }
});

export default router;
