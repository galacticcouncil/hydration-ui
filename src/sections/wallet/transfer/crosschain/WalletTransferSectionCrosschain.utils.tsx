import { ReactComponent as Wormhole } from "assets/icons/crosschains/Wormhole.svg"
import { ReactNode } from "react"

export const CROSSCHAINS: Array<{
  icon: ReactNode
  guide?: ReactNode
  name: string
  type: "ingoing" | "outgoing" | "both"
  url: string
}> = [
  {
    icon: <Wormhole />,
    name: "Wormhole",
    type: "both",
    url: "https://www.portalbridge.com/#/transfer",
  },
]
