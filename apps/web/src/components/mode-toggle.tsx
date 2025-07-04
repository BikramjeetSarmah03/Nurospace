import { RxMoon, RxSun } from "react-icons/rx";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      className="bg-background mr-2 rounded-md w-8 h-8"
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <RxSun className="w-[1.2rem] h-[1.2rem] rotate-90 dark:rotate-0 scale-0 dark:scale-100 transition-transform duration-500 ease-in-out" />
      <RxMoon className="absolute w-[1.2rem] h-[1.2rem] rotate-0 dark:-rotate-90 scale-100 dark:scale-0 transition-transform duration-500 ease-in-out" />
      <span className="sr-only">Switch Theme</span>
    </Button>
  );
}
