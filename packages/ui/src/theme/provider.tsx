import {
  Theme as ThemeUITheme,
  ThemeProvider as ThemeUIProvider,
  ThemeUIContextValue,
  useThemeUI as useThemeUIHook,
} from "@theme-ui/core"
import { get } from "@theme-ui/css"
import React, { createContext, useContext, useEffect, useMemo } from "react"
import { create } from "zustand"
import { persist } from "zustand/middleware"

import { GlobalStyles } from "@/styles"
import {
  ThemeName,
  ThemePreference,
  ThemeProps,
  themes,
  ThemeToken,
} from "@/theme"

const getSystemTheme = (): ThemeName => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

const ThemeContext = createContext<{
  theme: ThemeName
  themePreference: ThemePreference
  setThemePreference: (theme: ThemePreference) => void
}>({
  theme: getSystemTheme(),
  themePreference: "system",
  setThemePreference: () => {},
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
  themePreference: ThemePreference
  setThemePreference: (theme: ThemePreference) => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      themePreference: "system",
      setThemePreference: (themePreference) => set({ themePreference }),
    }),
    {
      name: "theme",
      version: 1,
    },
  ),
)

const applyTheme = (theme: ThemeName) => {
  const html = window.document.documentElement
  html.classList.remove("light", "dark")
  html.classList.add(theme)
  html.style.colorScheme = theme
}

useThemeStore.subscribe((state) => {
  const { themePreference } = state
  const theme =
    themePreference === "system" ? getSystemTheme() : themePreference
  applyTheme(theme)
})

const getCurrentTheme = (theme: ThemeName) =>
  themes[theme] as unknown as ThemeUITheme

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { themePreference, setThemePreference } = useThemeStore()
  const [systemTheme, setSystemTheme] =
    React.useState<ThemeName>(getSystemTheme)

  const resolvedTheme = useMemo(() => {
    return themePreference === "system" ? systemTheme : themePreference
  }, [themePreference, systemTheme])

  useEffect(() => {
    applyTheme(resolvedTheme)
  }, [resolvedTheme])

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const handleChange = () => {
      const newTheme = getSystemTheme()
      setSystemTheme(newTheme)
      if (themePreference === "system") {
        applyTheme(newTheme)
      }
    }

    setSystemTheme(getSystemTheme())

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [themePreference])

  return (
    <ThemeContext.Provider
      value={{ theme: resolvedTheme, themePreference, setThemePreference }}
    >
      <ThemeUIProvider theme={getCurrentTheme(resolvedTheme)}>
        <GlobalStyles />
        {children}
      </ThemeUIProvider>
    </ThemeContext.Provider>
  )
}
