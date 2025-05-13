import { Button } from "@galacticcouncil/ui/components"
import { Link } from "@tanstack/react-router"
import { FC, ReactNode } from "react"

import { OtcOffersType, Route } from "@/routes/_trade/trade.otc"

type Props = {
  readonly offers: OtcOffersType
  readonly children: ReactNode
}

export const OrderFilter: FC<Props> = ({ children, offers }) => {
  const { offers: selectedOffers } = Route.useSearch()
  const isSelected = offers === selectedOffers

  return (
    <Button
      outline={!isSelected}
      variant={isSelected ? "secondary" : "tertiary"}
      height={38}
      asChild
    >
      <Link to="/trade/otc" search={{ offers }}>
        {children}
      </Link>
    </Button>
  )
}
