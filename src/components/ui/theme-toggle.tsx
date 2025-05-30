import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "./button";
import { useState, useEffect } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by only rendering after component is mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    console.log("Theme changed to:", newTheme);
  };

  if (!mounted) {
    return <Button variant="ghost" size="icon" className="w-7 h-7 opacity-0" />;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`
        w-7 h-7 rounded-full flex items-center justify-center
        ${theme === 'light' 
          ? 'bg-zinc-200 text-zinc-900 hover:bg-zinc-300' 
          : 'bg-zinc-800 text-white hover:bg-zinc-700 border border-white/10'}
      `}
      onClick={toggleTheme}
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4 transition-all" />
      ) : (
        <Sun className="h-4 w-4 transition-all" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
} 