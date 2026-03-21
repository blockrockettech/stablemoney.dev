"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="size-8"
        disabled
        aria-label="Theme"
      >
        <Sun className="size-4" />
      </Button>
    )
  }

  const isDark = (theme === "system" ? resolvedTheme : theme) === "dark"

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="size-8"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  )
}
