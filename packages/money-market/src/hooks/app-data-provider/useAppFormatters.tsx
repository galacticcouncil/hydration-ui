import React, { useContext } from "react"

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
  return (
    <AppFormattersProvidersContext.Provider
      value={{
        formatReserve,
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
