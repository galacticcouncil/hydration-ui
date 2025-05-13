import React, { useContext } from "react"

type FormatterFn = (
  value: number | bigint | string | null | undefined,
  opts?: Record<string, number | string>,
) => string

export interface AppFormattersProvidersContextType {
  formatNumber: FormatterFn
  formatCurrency: FormatterFn
  formatPercent: FormatterFn
}

const AppFormattersProvidersContext =
  React.createContext<AppFormattersProvidersContextType>(
    {} as AppFormattersProvidersContextType,
  )

export const AppFormattersProviders: React.FC<{
  formatNumber: FormatterFn
  formatCurrency: FormatterFn
  formatPercent: FormatterFn
  children?: React.ReactNode
}> = ({ formatNumber, formatCurrency, formatPercent, children }) => {
  return (
    <AppFormattersProvidersContext.Provider
      value={{
        formatNumber,
        formatCurrency,
        formatPercent,
      }}
    >
      {children}
    </AppFormattersProvidersContext.Provider>
  )
}

export const useAppFormatters = () => useContext(AppFormattersProvidersContext)
