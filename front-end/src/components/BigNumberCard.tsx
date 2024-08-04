import { getStatusText, statusEmoji } from "./formattingFunctions"
import { PageStatus } from "./Paper"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"




export function BigNumberCard(props: {number:number, title:PageStatus} ){
    const number = props.number
    const title = getStatusText(props.title)


    return (
        <Card>
            <CardHeader>
                <CardTitle className=" flex gap-1 items-center text-md text-muted-foreground">
                    {statusEmoji(props.title)}{title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <h3 className="text-center text-4xl font-bold text-nowrap"> {number}</h3>
            </CardContent>
        </Card>
    )
}