import { useEffect, useState } from "react"
import { Card, CardContent } from "./ui/card"


interface Feedback {
    ObjectId: number,
    feedback: string,
    time: Date
}

export default function Feedback() {

    const [feedbacks, setFeedback] = useState<Feedback[]>([])

    async function getFeedback() {
        const response = await fetch("https://api.markusevanger.no/polaris/feedback")
        if (!response.ok) {
            if (response.status) {
                console.log("No papers found")
                setFeedback([])
                return
            }
            const message = `Error occured: ${response.statusText}`
            console.error(message)
            return
        }
        const feedback: Feedback[] = await response.json()
        setFeedback(feedback)

    }

    useEffect(() => {
        getFeedback()
    }, [])


    return (

        <div className="h-screen w-full flex justify-center">


            <div className="w-full max-w-[800px] p-5">
                <h1 className="text-lg font-bold">Feedback</h1>

                <div className="mt-5 h-full">
                    {
                        feedbacks.map((feedback: Feedback) => {
                            return (
                                <Card>
                                    <CardContent className="flex flex-col">
                                        {feedback.time.getDate()}
                                        {feedback.feedback}
                                    </CardContent>
                                </Card>
                            )
                        })
                    }

                </div>


            </div>

        </div>
    )
}