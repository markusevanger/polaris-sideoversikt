import express from 'express';
import db from '../db/connection.js';

const router = express.Router();

// Utility function to validate date format (YYYY-MM-DD)
const isValidDateFormat = (dateString) => /^\d{4}-\d{2}-\d{2}$/.test(dateString);

// Helper function to get transformed day index (Monday is 0, Sunday is 6)
const getTransformedDayIndex = (date) => (date.getDay() + 6) % 7;

// Get single date with all papers (formatted like: /2024-07-23) <-- ISO 8601
router.get('/:date', async (req, res) => {
    const requestedDate = req.params.date;

    if (!isValidDateFormat(requestedDate)) {
        return res.status(400).send(`Not a valid date ${requestedDate}. Must be of format YYYY-MM-DD`);
    }

    try {
        const date = new Date(requestedDate);
        const dayIndex = getTransformedDayIndex(date);
        const collection = db.collection('dates');
        const paperCollection = db.collection('papers');

        let result = await collection.findOne({ dateFormatted: requestedDate });

        if (result) {
            return res.status(200).json(result);
        }

        console.log(`Trying to find papers releasing on day: ${dayIndex}`);
        const papers = await paperCollection.find({ releaseDates: dayIndex }).toArray();
        const papersData = papers.map(paper => ({
            [paper.nameLowerCase]: {
                name: paper.name,
                nameLowerCase: paper.nameLowerCase,
                productionStatus: 'notStarted',
            },
        }));

        const dateSchema = {
            dateFormatted: requestedDate,
            date: date.getDate(),
            month: date.getMonth() + 1,
            year: date.getFullYear(),
            dayIndex,
            papers: papersData,
        };

        const insertResult = await collection.insertOne(dateSchema);

        if (insertResult.acknowledged) {
            result = await collection.findOne({ dateFormatted: requestedDate });
            return res.status(201).json(result);
        } else {
            return res.status(500).send('Failed to insert date schema');
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send('Error retrieving or adding date');
    }
});

router.patch("/:date/:paperName/:newStatus", async (res, req) => {
    const requestedDate = req.params.date
    const requestedPaper = req.params.paperName
    const requestedStatus = req.params.newStatus



    if (!isValidDateFormat(requestedDate)) {
        return res.status(400).send(`Not a valid date ${requestedDate}. Must be of format YYYY-MM-DD`);
    }
    if (!productionStatus) {
        return res.status(400).send('Production status is required');
    }

    try {
        const collection = db.collection('dates');

        const result = await collection.updateOne(
            { dateFormatted: requestedDate, [`papers.${requestedPaper}`]: { $exists: true } }, // Match the document
            { $set: { [`papers.$.${requestedPaper}.productionStatus`]: requestedStatus } } // Update the productionStatus field
        );

        if (result.modifiedCount === 0) {
            return res.status(404).send('No document or paper found to update');
        }
        res.send(result).status(200)

    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating paper status');
    }




})

export default router;