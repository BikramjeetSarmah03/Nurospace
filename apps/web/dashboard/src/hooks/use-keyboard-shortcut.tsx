import { useEffect } from "react";

type Modifier = "ctrl" | "shift" | "alt" | "meta";
type Key = string;

export interface UseKeyboardShortcutArgs {
  shortcuts: (Modifier | Key)[][]; // multiple combos e.g. [["ctrl","k"], ["meta","k"]]
  onKeyPressed: () => void;
}

export function useKeyboardShortcut({
  shortcuts,
  onKeyPressed,
}: UseKeyboardShortcutArgs) {
  useEffect(() => {
    function keyDownHandler(e: KeyboardEvent) {
      const pressed = new Set<Modifier | Key>();

      if (e.ctrlKey) pressed.add("ctrl");
      if (e.shiftKey) pressed.add("shift");
      if (e.altKey) pressed.add("alt");
      if (e.metaKey) pressed.add("meta");

      pressed.add(e.key.length === 1 ? e.key.toLowerCase() : e.key);

      const normalizedPressed = new Set([...pressed]);

      for (const shortcut of shortcuts) {
        const expected = new Set(
          shortcut.map((k) => (k.length === 1 ? k.toLowerCase() : k)),
        );

        if (
          normalizedPressed.size === expected.size &&
          [...expected].every((k) => normalizedPressed.has(k))
        ) {
          e.preventDefault();
          onKeyPressed();
          break;
        }
      }
    }

    document.addEventListener("keydown", keyDownHandler);
    return () => document.removeEventListener("keydown", keyDownHandler);
  }, [shortcuts, onKeyPressed]);
}
