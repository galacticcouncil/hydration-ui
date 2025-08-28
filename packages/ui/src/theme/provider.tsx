import {
  Theme as ThemeUITheme,
  ThemeProvider as ThemeUIProvider,
  ThemeUIContextValue,
  useThemeUI as useThemeUIHook,
} from "@theme-ui/core"
import { get } from "@theme-ui/css"
import React, { createContext, useContext } from "react"
import { create } from "zustand"
import { persist } from "zustand/middleware"

import { GlobalStyles } from "@/styles"
import { ThemeName, ThemeProps, themes, ThemeToken } from "@/theme"

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

interface ExactContextValue extends Omit<ThemeUIContextValue, "theme"> {
  theme: ThemeProps
}

export const useThemeUI = useThemeUIHook as unknown as () => ExactContextValue
export function useTheme() {
  const { theme: themeProps } = useThemeUI()
  const themeContext = useContext(ThemeContext)
  return {
    themeProps,
    getToken: (path: ThemeToken) => get(themeProps, path),
    ...themeContext,
  }
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

useThemeStore.subscribe(() => {
  const { theme } = useThemeStore.getState()
  const html = window.document.documentElement
  html.classList.remove("light", "dark")
  html.classList.add(theme)
  html.style.colorScheme = theme
})

const getCurrentTheme = (theme: ThemeName) =>
  themes[theme] as unknown as ThemeUITheme

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { theme, setTheme } = useThemeStore()

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <ThemeUIProvider theme={getCurrentTheme(theme)}>
        <GlobalStyles />
        {children}
      </ThemeUIProvider>
    </ThemeContext.Provider>
  )
}
