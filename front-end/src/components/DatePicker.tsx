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
import { getDayFromIndex } from "./formattingFunctions"

export function DatePicker(props: {date:Date | undefined, setNewDate:(newDate: Date | undefined) => void}) {
    
    const date = props.date 
    const setNewDate = props.setNewDate

    return (

        
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ?  `${getDayFromIndex(date.getDay())} ${date.getDate()}.${date.getMonth()}.${date.getFullYear()}` : <span>Velg en dato</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className=" w-auto p-2">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setNewDate}
                />
            </PopoverContent>
        </Popover>
    )
}