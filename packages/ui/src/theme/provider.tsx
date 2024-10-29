import { ThemeProvider as EmotionThemeProvider } from "@emotion/react"
import React, { createContext, useContext, useState } from "react"

import { GlobalStyles } from "@/styles"
import { ThemeName, themes } from "@/theme"

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
const defaultTheme: ThemeName = prefersDark ? "dark" : "light"

const ThemeContext = createContext<{
  theme: ThemeName
  setTheme: (theme: ThemeName) => void
}>({
  theme: defaultTheme,
  setTheme: () => {},
})

type ThemeProviderProps = {
  children: React.ReactNode
}

export function useTheme() {
  return useContext(ThemeContext)
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeName>(defaultTheme)

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <EmotionThemeProvider theme={themes[theme]}>
        <GlobalStyles />
        {children}
      </EmotionThemeProvider>
    </ThemeContext.Provider>
  )
}
