import { useSearch } from "@tanstack/react-router"
import { FC } from "react"

import { PortfolioDepositsSection } from "./PortfolioDepositsSection"

export const PortfolioDepositsPage: FC = () => {
  const { depositStatus } = useSearch({ from: "/portfolio/deposits" })
  return (
    <PortfolioDepositsSection
      filter={depositStatus}
      filterTo="/portfolio/deposits"
    />
  )
}
