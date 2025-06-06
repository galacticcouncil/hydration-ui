import { useContext } from "react"

import { AppDataContext } from "@/hooks/app-data-provider/useAppDataProvider"

export const useMoneyMarketData = () => useContext(AppDataContext)
