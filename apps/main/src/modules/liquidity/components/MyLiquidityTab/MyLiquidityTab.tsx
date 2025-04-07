import { Button } from "@galacticcouncil/ui/components"
import { Link } from "@tanstack/react-router"
import { prop } from "remeda"

import { useAccountData } from "@/states/account"

import { SBadge } from "./MyLiquidityTab.styled"

type MyLiquidityTabArgs = {
  to: string
  title: string
  active: boolean
}

export const MyLiquidityTab = ({ to, title, active }: MyLiquidityTabArgs) => {
  const positionsAmount = useAccountData(prop("positionsAmount"))

  // TODO: decide whether to hide or not
  //if (!positionsAmount) return null

  return (
    <Button
      sx={{ position: "relative" }}
      variant={active ? "secondary" : "tertiary"}
      asChild
    >
      <Link to={to}>
        {title}
        {positionsAmount && <SBadge>{positionsAmount}</SBadge>}
      </Link>
    </Button>
  )
}
