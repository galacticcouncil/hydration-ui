import { lazy } from "react"
import { SMobileNavBar } from "./MobileNavBar.styled"
import { useMatchRoute } from "@tanstack/react-location"
import { LINKS } from "utils/navigation"

const MobileNavBarContent = lazy(async () => ({
  default: (await import("./MobileNavBarContent")).MobileNavBarContent,
}))

export const MobileNavBar = () => {
  const matchRoute = useMatchRoute()

  const isSubmitTransactionPath = matchRoute({ to: LINKS.submitTransaction })

  if (isSubmitTransactionPath) return null

  return (
    <SMobileNavBar>
      <MobileNavBarContent />
    </SMobileNavBar>
  )
}
