import { RxMoon, RxSun } from "react-icons/rx";

import { useTheme } from "@/components/theme-provider";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <button
      type="button"
      className="w-full cursor-pointer"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? (
        <div className="flex items-center gap-2 w-full">
          <RxSun className="w-[1.2rem] h-[1.2rem] rotate-90 dark:rotate-0 scale-0 dark:scale-100 transition-transform duration-500 ease-in-out" />
          <span>Light</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 w-full">
          <RxMoon className="w-[1.2rem] h-[1.2rem] rotate-0 light:rotate-90 scale-100 light:scale-0 transition-transform duration-500 ease-in-out" />
          <span>Dark</span>
        </div>
      )}
      <span className="sr-only">Switch Theme</span>
    </button>
  );
}
