import express from "express"
import cors from "cors"
import papers from "./routes/paper.js"
import dates from "./routes/dates.js"

const PORT = process.env.PORT || 5050
const app = express()

app.use(cors())
app.use(express.json())
app.use("/papers", papers)
app.use("/dates", dates)

// Starting server:
app.listen(PORT, () => {
    console.log(`✅ Server listening on port ${PORT}`)
})