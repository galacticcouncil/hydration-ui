import { Button, ButtonProps } from "@galacticcouncil/ui/components"
import { Link } from "@tanstack/react-router"
import { FC } from "react"

import { OtcOffersType, Route } from "@/routes/_trade/trade.otc"

type Props = ButtonProps & { readonly offers: OtcOffersType }

export const OrderFilter: FC<Props> = ({ children, offers, ...props }) => {
  const { offers: selectedOffers } = Route.useSearch()
  const isSelected = offers === selectedOffers

  return (
    <Link to="/trade/otc" search={{ offers }}>
      <Button
        outline={!isSelected}
        variant={isSelected ? "secondary" : "tertiary"}
        height={38}
        {...props}
      >
        {children}
      </Button>
    </Link>
  )
}
