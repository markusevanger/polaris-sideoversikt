import { isDark, useTheme } from "@/components/theme-provider.tsx";
import { Moon, Sun } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";


export default function ToggleDarkModeButton() {

    const initialIcon = (): JSX.Element => {
        return isDark() ? <Sun /> : <Moon />;
    };
    const [icon, setIcon] = useState(initialIcon())
    const toggleTheme = () => {
        console.log("dark: " + isDark())
        if (isDark()) {
            setTheme("light");
            setIcon(<Moon />)
        } else {
            setTheme("dark");
            setIcon(<Sun />)
        }


    }
    const { setTheme } = useTheme()

    return (
        <Button variant={"outline"} size={"icon"} onClick={toggleTheme}>{icon}</Button>
    )
}