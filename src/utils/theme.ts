export function applyTheme(theme: "light" | "dark" | "system") {
  const root = document.documentElement;

  root.classList.remove("light", "dark");

  if (theme === "system") {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.add(isDark ? "dark" : "light");
  } else {
    root.classList.add(theme);
  }
}
