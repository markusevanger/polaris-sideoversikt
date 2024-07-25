"use client"

import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { getDateFormatted, getDayFromIndex } from "./formattingFunctions"
import { useNavigate } from "react-router-dom"

export function DatePicker(props: { date: Date, setNewDate: (newDate: Date) => void }) {

    const date = props.date
    const setNewDate = props.setNewDate
    const navigate = useNavigate()


    const handleUpdateDate = (newDate: Date | undefined) => {
        const formatted = getDateFormatted(newDate)
        if (newDate) {
            setNewDate(newDate)
        }
        navigate(`/${formatted}`)
    }

    return (


        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "text-center font-normal",
                        !date && "text-muted-foreground", 
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? `${getDayFromIndex((date.getDay() + 6) % 7)} ${date.getDate()}.${date.getMonth()+1}.${date.getFullYear()}` : <span>Velg en dato</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className=" w-auto p-2">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleUpdateDate}
                    required={true}
                />
            </PopoverContent>
        </Popover>
    )
}