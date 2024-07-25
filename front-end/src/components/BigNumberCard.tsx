import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"




export function BigNumberCard(props: {number:number, title:string} ){
    const number = props.number
    const title = props.title


    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-md text-muted-foreground">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <h3 className="text-center text-4xl font-bold"> {number}</h3>
            </CardContent>
        </Card>
    )
}