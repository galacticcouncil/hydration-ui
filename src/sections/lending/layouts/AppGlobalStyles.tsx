import { useMediaQuery } from "@mui/material"
import { createTheme, ThemeProvider } from "@mui/material"
import { deepmerge } from "@mui/utils"
import React, { ReactNode, useEffect, useMemo, useState } from "react"

import {
  getDesignTokens,
  getThemedComponents,
} from "sections/lending/utils/theme"

export const ColorModeContext = React.createContext({
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  toggleColorMode: () => {},
})

type Mode = "light" | "dark"

/**
 * Main Layout component which wrapps around the whole app
 * @param param0
 * @returns
 */
export function AppGlobalStyles({ children }: { children: ReactNode }) {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)")
  const [mode, setMode] = useState<Mode>(prefersDarkMode ? "dark" : "light")
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === "light" ? "dark" : "light"
          localStorage.setItem("colorMode", newMode)
          return newMode
        })
      },
    }),
    [],
  )

  useEffect(() => {
    const initialMode = localStorage?.getItem("colorMode") as Mode
    if (initialMode) {
      setMode(initialMode)
    } else if (prefersDarkMode) {
      setMode("dark")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const theme = useMemo(() => {
    const themeCreate = createTheme(getDesignTokens(mode))
    return deepmerge(themeCreate, getThemedComponents(themeCreate))
  }, [mode])

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ColorModeContext.Provider>
  )
}
