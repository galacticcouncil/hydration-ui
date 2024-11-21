import { ThemeProvider as ThemeUIProvider } from "@theme-ui/core"
import React, { createContext, useContext, useState } from "react"

import { GlobalStyles } from "@/styles"
import { ThemeName, ThemeProps, themes } from "@/theme"

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
const defaultTheme: ThemeName = prefersDark ? "dark" : "light"

const ThemeContext = createContext<{
  theme: ThemeName
  setTheme: (theme: ThemeName) => void
  themeProps: ThemeProps
}>({
  theme: defaultTheme,
  setTheme: () => {},
  themeProps: {} as ThemeProps,
})

type ThemeProviderProps = {
  children: React.ReactNode
}

export function useTheme() {
  return useContext(ThemeContext)
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeName>(defaultTheme)
  const currentTheme = themes[theme]

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, themeProps: currentTheme }}
    >
      <ThemeUIProvider theme={currentTheme}>
        <GlobalStyles />
        {children}
      </ThemeUIProvider>
    </ThemeContext.Provider>
  )
}
