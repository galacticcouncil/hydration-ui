import React, { useContext, useMemo } from "react"

import { FormatterFn, ReserveFormatterFn } from "@/types"

export type AppFormattersProvidersContextType = {
  formatReserve: ReserveFormatterFn
  formatNumber: FormatterFn
  formatCurrency: FormatterFn
  formatPercent: FormatterFn
}

const AppFormattersProvidersContext =
  React.createContext<AppFormattersProvidersContextType>(
    {} as AppFormattersProvidersContextType,
  )

export const AppFormattersProvider: React.FC<
  AppFormattersProvidersContextType & {
    children?: React.ReactNode
  }
> = ({
  formatReserve,
  formatNumber,
  formatCurrency,
  formatPercent,
  children,
}) => {
  const value = useMemo(
    () => ({ formatReserve, formatNumber, formatCurrency, formatPercent }),
    [formatReserve, formatNumber, formatCurrency, formatPercent],
  )

  return (
    <AppFormattersProvidersContext.Provider value={value}>
      {children}
    </AppFormattersProvidersContext.Provider>
  )
}

export const useAppFormatters = () => useContext(AppFormattersProvidersContext)
