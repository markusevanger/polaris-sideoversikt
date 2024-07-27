import { useEffect, useState } from "react"
import { Card, CardContent } from "./ui/card"
import { LayoutDashboard, MessageSquareHeart } from "lucide-react"
import { Badge } from "./ui/badge"
import { buttonVariants } from "./ui/button"
import { Link } from "react-router-dom"


interface Feedback {
    ObjectId: number,
    feedback: string,
    time: string
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

                <Link className={buttonVariants({variant: "outline"})} to="/">
                    <LayoutDashboard className="w-5 mr-2"/> Sideoversikt
                </Link>
 
                <h1 className="text-lg font-bold">Feedback</h1>

                <div className="mt-5 h-full flex flex-col gap-4">
                    {
                        feedbacks.map((feedback: Feedback, index: number) => {
                            return (
                                <Card key={index}>
                                    <CardContent className="p-3 pb-4 flex flex-col h-full">
                                        <div className="flex w-full justify-between ">
                                            <MessageSquareHeart></MessageSquareHeart>
                                            <Badge variant={"secondary"}>
                                                <p className="text-sm text-muted-foreground font-mono">{feedback.time}</p>
                                            </Badge>
                                        </div>

                                        <div>

                                        </div>
                                        <p>{feedback.feedback}</p>
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