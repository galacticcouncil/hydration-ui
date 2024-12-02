import { ThemeProvider as ThemeUIProvider } from "@theme-ui/core"
import React, { createContext, useContext } from "react"
import { create } from "zustand"
import { persist } from "zustand/middleware"

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

type ThemeStore = {
  theme: ThemeName
  setTheme: (theme: ThemeName) => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: defaultTheme,
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "theme",
      version: 0,
    },
  ),
)

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { theme, setTheme } = useThemeStore()
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
