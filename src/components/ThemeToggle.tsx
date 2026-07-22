import { useThemeStore } from "../store/themeStore";

export function ThemeToggle() {
  const { theme, toggle } = useThemeStore();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="rounded-full p-2 text-neutral-500 hover:bg-sand-200 dark:text-neutral-400 dark:hover:bg-neutral-800"
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}
